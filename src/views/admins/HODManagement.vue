<template>
  <div class="flex flex-col gap-4 py-3 sm:py-5">
    <!-- Top bar -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-3 sm:px-5"
    >
      <!-- Search -->
      <div class="relative w-full sm:max-w-md">
        <input
          v-model="search"
          type="text"
          placeholder="Search HODs..."
          class="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search class="w-4 h-4" />
        </span>
      </div>

      <!-- Button Section -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <!-- Add HOD -->
          <button
            @click="openAdd"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-[#235AA6] text-white rounded-lg hover:bg-[#1e4a94] transition-colors text-sm font-medium"
          >
            <Plus class="w-4 h-4" />
            Add HOD
          </button>
          
          <!-- Export -->
          <button
            @click="exportCsv"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 border bg-[#FF7700] text-white border-gray-300 rounded-lg hover:bg-[#e66600] transition-colors text-sm font-medium"
          >
            <Download class="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <HODFilter
      @update:filters="handleFiltersUpdate"
      @clear-filters="handleClearFilters"
    />

    <!-- HOD Table -->
    <div class="overflow-x-auto px-3 sm:px-5">
      <div class="min-w-full">
        <HODTable
          :hods="pagedRows"
          :loading="loading"
          :selected-ids="selectedIds"
          :columns="tableColumns"
          :sort-field="currentSortField"
          :sort-direction="currentSortDirection"
          @view="view"
          @edit="edit"
          @delete="remove"
          @select="handleRowSelect"
          @selectAll="handleSelectAll"
          @sort="handleSort"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div class="px-3 sm:px-5">
      <Pagination
        :current-page="page"
        :page-size="pageSize"
        :total-items="filteredRows.length"
        :total-pages="Math.ceil(filteredRows.length / pageSize)"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- Add HOD Modal -->
    <AddHODModal
      :show-add="showAddModal"
      @close="closeAddModal"
      @save="handleAddSave"
    />

    <!-- Edit HOD Modal -->
    <EditHODModal
      v-model="showEditModal"
      :hod="selectedHOD"
      @save="handleEditSave"
    />

    <!-- View HOD Modal -->
    <ViewHODModal
      v-model="showViewModal"
      :hod="viewHOD"
    />
  </div>
</template>

<script setup>
import { Download, Plus, Search } from "lucide-vue-next";
import { ref, computed, watch, onMounted } from "vue";
import AddHODModal from "@/components/admins/HeadOfDepartmentManagement/AddHODModal.vue";
import EditHODModal from "@/components/admins/HeadOfDepartmentManagement/EditHODModal.vue";
import ViewHODModal from "@/components/admins/HeadOfDepartmentManagement/ViewHODModal.vue";
import HODFilter from "@/components/admins/HeadOfDepartmentManagement/HODFilter.vue";
import HODTable from "@/components/admins/HeadOfDepartmentManagement/HODTable.vue";
import Pagination from "@/components/features/Pagination.vue";
import HODCRUD from "@/stores/apis/HeadOfDepartmentCRUD.js";
import { showNotification } from '@/lib/notifications.js';
import { useFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";

/** ------- Data ------- */
const rows = ref([]);        // raw from API
const loading = ref(false);

/** ------- Departments (for mapping id -> name) ------- */
const { departments, loading: deptsLoading } = useFilteredByDepartment({ immediate: true });

const deptMap = computed(() => {
  const m = {};
  (departments.value || []).forEach(d => {
    m[Number(d.id)] = d.department_name || d.name || "";
  });
  return m; // { 3: 'Nursing', ... }
});

/** ------- Load HOD data from API ------- */
onMounted(async () => {
  await loadHODs();
});

const loadHODs = async () => {
  loading.value = true;
  try {
    const result = await HODCRUD.getAllHODs();
    if (result.success) {
      rows.value = Array.isArray(result.data) ? result.data : [];
    } else {
      console.error("❌ Failed to load HODs:", result.message);
      showNotification('Failed to load HODs', 'error');
    }
  } catch (error) {
    console.error("💥 Error loading HODs:", error);
    showNotification('Error loading HODs', 'error');
  } finally {
    loading.value = false;
  }
};

/** ------- Row Normalization ------- */
function normalizeRow(u) {
  const department_id = Number(
    u.department_id ??
    u.user_detail?.department_id ??
    u.hod_detail?.department_id ??
    NaN
  );

  const department_name =
    u.department_name ||
    u.department?.name ||
    u.department?.department_name ||
    (typeof u.department === 'string' && u.department.trim() ? u.department : '') ||
    (Number.isFinite(department_id) ? deptMap.value[department_id] : "") ||
    "No Department Assigned";

  const phone_number = u.phone_number ?? u.phone ?? "";
  const id_card = u.id_card ?? u.employee_id ?? u.id ?? "";

  return {
    ...u,
    id: u.id ?? u.user_id ?? id_card,
    id_card,
    khmer_name: u.khmer_name ?? u.full_name ?? "",
    latin_name: u.latin_name ?? "",
    email: u.email ?? "",
    phone_number,
    // normalized department fields
    department_id: Number.isFinite(department_id) ? department_id : null,
    department_name,
    department: department_name, // keep a plain string for table display
  };
}

// normalize every time rows or deptMap changes
const normalizedRows = computed(() => rows.value.map(normalizeRow));

/** ------- Search + Filters ------- */
const search = ref("");

const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedHOD = ref(null);

const showViewModal = ref(false);
const viewHOD = ref(null);

// filters coming from HODFilter (may send clean ids)
const filters = ref({
  academic_year: "All",
  program: "All",
  department: "All",    // legacy string filter
  origin: "All",
  gender: "All",
  // clean form (if HODFilter emits it)
  department_id: null,
  program_id: null,
});

const openAdd = () => { showAddModal.value = true; };
const closeAddModal = () => { showAddModal.value = false; };

const handleAddSave = async (hodData) => {
  try {
    const result = await HODCRUD.createHOD(hodData);
    if (result.success) {
      showNotification('HOD created successfully', 'success');
      await loadHODs();
    } else {
      console.error("Failed to create HOD:", result.message);
      showNotification(result.message || 'Failed to create HOD', 'error');
    }
  } catch (error) {
    console.error("Error creating HOD:", error);
    showNotification('Error creating HOD', 'error');
  }
  closeAddModal();
};

const openEdit = (hod) => {
  selectedHOD.value = hod;
  showEditModal.value = true;
};
const closeEditModal = () => {
  showEditModal.value = false;
  selectedHOD.value = null;
};

const handleEditSave = async (updatedHOD) => {
  // The modal now handles the API call and notifications
  // We just need to refresh the data and close the modal
  await loadHODs();
  closeEditModal();
};

const openView = (hod) => {
  const hodWithDetails = {
    ...hod,
    photo_url: hod.photo_url || "",
    hire_date: hod.hire_date || hod.appointment_date || new Date().toISOString().split("T")[0],
    experience_years: hod.experience_years || 0,
    qualifications: hod.qualifications || [],
    responsibilities: hod.responsibilities || [],
    management_experience: hod.management_experience || "N/A",
    education_level: hod.education_level || hod.qualification || "N/A",
  };
  viewHOD.value = hodWithDetails;
  showViewModal.value = true;
};
const closeViewModal = () => {
  showViewModal.value = false;
  viewHOD.value = null;
};

const handleFiltersUpdate = (newFilters) => {
  // Accept clean ids or legacy strings
  filters.value = {
    ...filters.value,
    ...newFilters,
  };
};

const handleClearFilters = () => {
  search.value = "";
  filters.value = {
    academic_year: "All",
    program: "All",
    department: "All",
    origin: "All",
    gender: "All",
    department_id: null,
    program_id: null,
  };
};

/** ------- Selection ------- */
const selectedIds = ref([]);

// Table configuration with responsive columns
const tableColumns = ref([
  { key: "id_card", label: "ID", visible: true, sortable: true, width: "w-20 sm:w-24" },
  { key: "khmer_name", label: "Khmer Name", visible: true, sortable: true, width: "min-w-32 sm:min-w-40" },
  { key: "latin_name", label: "Latin Name", visible: true, sortable: true, width: "min-w-32 sm:min-w-40" },
  { key: "email", label: "Email", visible: true, sortable: true, width: "min-w-40 sm:min-w-48", hideOnMobile: true },
  { key: "phone_number", label: "Phone", visible: true, sortable: false, width: "min-w-28 sm:min-w-32", hideOnMobile: true },
  { key: "department", label: "Department", visible: true, sortable: true, width: "min-w-28 sm:min-w-36" },
]);

/** ------- Sorting ------- */
const currentSortField = ref("");
const currentSortDirection = ref("asc");

const handleSort = ({ field, direction }) => {
  currentSortField.value = field;
  currentSortDirection.value = direction;

  if (field && direction) {
    rows.value = [...rows.value].sort((a, b) => {
      // sort on normalized fields
      const A = normalizeRow(a);
      const B = normalizeRow(b);

      let aVal = A[field];
      let bVal = B[field];

      if (aVal == null) aVal = "";
      if (bVal == null) bVal = "";

      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();

      return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }
};

const handleRowSelect = (hodId) => {
  if (selectedIds.value.includes(hodId)) {
    selectedIds.value = selectedIds.value.filter((id) => id !== hodId);
  } else {
    selectedIds.value.push(hodId);
  }
};
const handleSelectAll = (ids) => { selectedIds.value = ids; };

/** ------- Filtering / Searching ------- */
const filteredRows = computed(() => {
  let list = normalizedRows.value;

  const q = search.value.trim().toLowerCase();
  if (q) {
    list = list.filter((r) =>
      (r.khmer_name || "").toLowerCase().includes(q) ||
      (r.latin_name || "").toLowerCase().includes(q) ||
      (r.full_name || "").toLowerCase().includes(q) ||
      (r.email || "").toLowerCase().includes(q) ||
      (r.phone_number || "").toLowerCase().includes(q) ||
      (r.department_name || "").toLowerCase().includes(q) ||
      (r.position || "").toLowerCase().includes(q) ||
      (r.employee_id || r.id_card || "").toLowerCase().includes(q)
    );
  }

  // Academic year / program (legacy string)
  if (filters.value.academic_year !== "All")
    list = list.filter((r) => r.academic_year === filters.value.academic_year);
  if (filters.value.program_id)
    list = list.filter((r) => Number(r.program_id) === Number(filters.value.program_id));
  else if (filters.value.program !== "All")
    list = list.filter((r) => r.program === filters.value.program);

  // Department (prefer id filter; fallback to name)
  if (filters.value.department_id)
    list = list.filter((r) => Number(r.department_id) === Number(filters.value.department_id));
  else if (filters.value.department !== "All")
    list = list.filter((r) => r.department_name === filters.value.department);

  if (filters.value.origin !== "All")
    list = list.filter((r) => r.origin === filters.value.origin);

  if (filters.value.gender !== "All") {
    list = list.filter((r) => {
      const g = r.gender === "M" ? "Male" : r.gender === "F" ? "Female" : r.gender;
      return g === filters.value.gender;
    });
  }

  return list;
});

/** ------- Pagination ------- */
const page = ref(1);
const pageSize = ref(25);

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

watch([filteredRows, pageSize], () => { page.value = 1; });

const handlePageChange = (p) => { page.value = p.currentPage; };
const handlePageSizeChange = (p) => { pageSize.value = p.pageSize; page.value = 1; };

/** ------- Actions ------- */
function view(row) { openView(row); }
function edit(row) { openEdit(row); }

const remove = async (row) => {
  try {
    const result = await HODCRUD.deleteHOD(row.id);
    if (result.success) {
      showNotification('HOD deleted successfully', 'success');
      await loadHODs();
    } else {
      console.error("Failed to delete HOD:", result.message);
      showNotification(result.message || 'Failed to delete HOD', 'error');
    }
  } catch (error) {
    console.error("Error deleting HOD:", error);
    showNotification('Error deleting HOD', 'error');
  }
};

/** ------- Export ------- */
function exportCsv() {
  const header = [
    "ID",
    "Khmer Name",
    "Latin Name",
    "Email",
    "Phone",
    "Department",
    "Position",
    "Program",
    "Origin",
    "Gender",
    "Status",
    "Experience Years",
    "Hire Date",
  ];
  const body = filteredRows.value.map((r) => [
    r.id_card || r.id || "",
    r.khmer_name || "",
    r.latin_name || "",
    r.email || "",
    r.phone_number || "",
    r.department_name || "",
    r.position || "",
    r.program || "",
    r.origin || "",
    r.gender || "",
    r.status || "",
    r.experience_years || "",
    r.hire_date || r.appointment_date || "",
  ]);
  const csv = [header, ...body]
    .map((row) => row.map((cell) => `"${cell ?? ""}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hods.csv";
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
/* Mobile-first responsive design */
@media (max-width: 640px) {
  /* Hide certain table columns on mobile */
  :deep(.table-email-column),
  :deep(.table-phone-column) {
    display: none;
  }
  
  /* Smaller table text on mobile */
  :deep(.hod-table) {
    font-size: 14px;
  }
  
  /* Compact table cells */
  :deep(.hod-table td),
  :deep(.hod-table th) {
    padding: 8px 4px;
  }
  
  /* Stack action buttons in table rows */
  :deep(.table-actions) {
    flex-direction: column;
    gap: 4px;
  }
  
  /* Smaller action buttons */
  :deep(.table-action-btn) {
    padding: 4px 8px;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  /* Medium tablet adjustments */
  :deep(.hod-table) {
    font-size: 13px;
  }
  
  /* Reduce table cell padding */
  :deep(.hod-table td),
  :deep(.hod-table th) {
    padding: 10px 6px;
  }
}

/* Responsive table wrapper */
.overflow-x-auto {
  /* Ensure horizontal scroll on small screens */
  -webkit-overflow-scrolling: touch;
}

/* Responsive modals */
@media (max-width: 640px) {
  :deep(.modal-content) {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  :deep(.modal-header) {
    padding: 16px;
  }
  
  :deep(.modal-body) {
    padding: 16px;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
  }
  
  :deep(.modal-footer) {
    padding: 16px;
    flex-direction: column;
    gap: 8px;
  }
  
  :deep(.modal-footer button) {
    width: 100%;
  }
}
</style>