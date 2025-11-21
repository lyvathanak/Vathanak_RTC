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
          placeholder="Search teachers..."
          class="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search class="w-4 h-4" />
        </span>
      </div>

      <!-- Button Section -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <!-- Selected count indicator -->
        <div v-if="selectedIds.length > 0" class="text-xs sm:text-sm text-gray-600 font-medium order-3 sm:order-1 text-center sm:text-left">
          {{ selectedIds.length }} teacher{{ selectedIds.length > 1 ? 's' : '' }} selected
        </div>

        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
          <!--Add teacher-->
          <button
            @click="openAdd"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#235AA6] text-white px-3 sm:px-4 py-2.5 hover:bg-blue-700 transition text-sm font-medium"
          >
            <Plus class="w-4 h-4" />
            Add Teacher
          </button>

          <!-- Export -->
          <button
            @click="exportCsv"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border bg-[#FF7700] border-gray-300 text-white px-3 sm:px-4 py-2.5 hover:bg-[#e66600] transition text-sm font-medium"
          >
            <Download class="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <TeacherFilterRole
      @update:filters="handleFiltersUpdate"
      @clear-filters="handleClearFilters"
    />

    <!-- Teacher Table -->
    <div class="overflow-x-auto px-3 sm:px-5">
      <div class="min-w-full">
        <TeacherTable
          :teachers="pagedRows"
          :selected-ids="selectedIds"
          :sort-field="currentSortField"
          :sort-direction="currentSortDirection"
          :columns="tableColumns"
          :loading="loading"
          :show-selection="true"
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
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total-items="filteredRows.length"
        :page-size-options="[10, 25, 50, 100]"
        item-label="teachers"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- Add Teacher Modal -->
    <AddTeacherModal
      :showAdd="showAddModal"
      @close="closeAddModal"
      @save="handleAddSave"
    />

    <!-- Edit Teacher Modal -->
    <EditTeacherModal
      v-model="showEditModal"
      :teacher="selectedTeacher"
      :departments="departmentOptions.map(d => d.department_name || d.name)"
      :positions="[
        'Lecturer',
        'Assistant Professor',
        'Associate Professor',
        'Professor',
        'Instructor',
      ]"
      @save="handleEditSave"
    />

    <!-- View Teacher Modal -->
    <ViewTeacherModal v-model="showViewModal" :teacher="viewTeacher" />
  </div>
</template>

<script setup>
import { Download, Plus, Search } from "lucide-vue-next";
import { ref, computed, watch, onMounted } from "vue";
import AddTeacherModal from "@/components/admins/TeacherManagement/AddTeacherModal.vue";
import EditTeacherModal from "@/components/admins/TeacherManagement/EditTeacherModal.vue";
import ViewTeacherModal from "@/components/admins/TeacherManagement/ViewTeacherModal.vue";
import TeacherFilterRole from "@/components/admins/TeacherManagement/TeacherFilterRole.vue";
import TeacherTable from "@/components/admins/TeacherManagement/TeacherTable.vue";
import Pagination from "@/components/features/Pagination.vue";
import { TeacherCRUD } from "@/stores/apis/TeacherCRUD.js";
import { useFilteredByDepartment, useProgramsFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";
import { showNotification } from "@/lib/notifications.js";

/** ------- Load teacher data from API ------- */
const rows = ref([]);
const loading = ref(false);

// 🎯 USE DYNAMIC DEPARTMENT AND PROGRAM DATA
const { 
  departments, 
  departmentOptions,
  loading: departmentsLoading 
} = useFilteredByDepartment({ immediate: true });

const { 
  rawList: allPrograms,
  loading: programsLoading
} = useProgramsFilteredByDepartment({ immediate: true });

// Create lookup maps for efficient department/program name resolution
const departmentLookup = computed(() => {
  const lookup = {};
  departments.value.forEach(dept => {
    lookup[dept.id] = dept.department_name || dept.name;
  });
  return lookup;
});

const programLookup = computed(() => {
  const lookup = {};
  allPrograms.value.forEach(program => {
    lookup[program.id] = program.program_name;
  });
  return lookup;
});

// Clear any potential localStorage issues
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('teachers');
    sessionStorage.removeItem('teachers');
  } catch (e) {
    console.warn('Could not clear storage:', e);
  }
}

onMounted(async () => {
  // Wait for department and program data to load first
  await Promise.all([
    new Promise(resolve => {
      const unwatch = watch([departmentsLoading, programsLoading], ([deptLoading, progLoading]) => {
        if (!deptLoading && !progLoading) {
          unwatch();
          resolve();
        }
      }, { immediate: true });
    })
  ]);
  
  // Then load teachers with proper department/program mapping
  await loadTeachers();
});

const loadTeachers = async () => {
  loading.value = true;
  try {
    console.log("🔍 Attempting to load teachers...");
    const result = await TeacherCRUD.getAllTeachers();
    console.log("📊 Teacher API result:", result);
    if (result.success) {
      // Transform the data to include department/program names
      const transformedTeachers = result.data.map(teacher => {
        // Map department_id to department name
        const departmentName = departmentLookup.value[teacher.department_id] || teacher.department || 'N/A';
        
        // Map program_id to program name (if available)
        const programName = programLookup.value[teacher.program_id] || teacher.program || 'N/A';
        
        return {
          ...teacher,
          department: departmentName,
          department_name: departmentName, // Also add as department_name for table slots
          program: programName,
          program_name: programName // Also add as program_name for table slots
        };
      });
      
      rows.value = transformedTeachers;
      console.log("✅ Teachers loaded successfully:", transformedTeachers.length, "teachers");
      
      // Debug: Log the first teacher to see what fields are available
      if (transformedTeachers.length > 0) {
        console.log("🔍 Sample transformed teacher data:", transformedTeachers[0]);
        console.log("🔍 Available fields:", Object.keys(transformedTeachers[0]));
        console.log("🔍 permanent_address:", transformedTeachers[0].permanent_address);
        console.log("🔍 address:", transformedTeachers[0].address);
        console.log("🔍 current_address:", transformedTeachers[0].current_address);
      }
    } else {
      console.error("❌ Failed to load teachers:", result.error);
    }
  } catch (error) {
    console.error("💥 Error loading teachers:", error);
  } finally {
    loading.value = false;
  }
};

/** ------- Search + Filters ------- */
const search = ref("");

// Add Teacher Modal state
const showAddModal = ref(false);

// Edit Teacher Modal state
const showEditModal = ref(false);
const selectedTeacher = ref(null);

// View Teacher Modal state
const showViewModal = ref(false);
const viewTeacher = ref(null);

const openAdd = () => {
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const handleAddSave = async (teacherData) => {
  try {
    const result = await TeacherCRUD.createTeacher(teacherData);
    if (result.success) {
      showNotification('Teacher created successfully!', 'success');
      // Reload teachers from server
      await loadTeachers();
    } else {
      console.error("Failed to create teacher:", result.error);
      showNotification(result.message || 'Failed to create teacher', 'error');
    }
  } catch (error) {
    console.error("Error creating teacher:", error);
    showNotification('Error creating teacher. Please try again.', 'error');
  }
  closeAddModal();
};

const openEdit = (teacher) => {
  selectedTeacher.value = teacher;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedTeacher.value = null;
};

const handleEditSave = async (updatedTeacher) => {
  console.log("🔄 handleEditSave received:", updatedTeacher);
  console.log("🔄 permanent_address in updatedTeacher:", updatedTeacher?.permanent_address);
  console.log("🔄 address in updatedTeacher:", updatedTeacher?.address);
  
  // The modal now handles the API call and notifications
  // We just need to refresh the data and close the modal
  await loadTeachers();
  closeEditModal();
};


const openView = (teacher) => {
  // Create teacher data for the view modal
  const teacherWithDetails = {
    ...teacher,
    photo_url: teacher.photo_url || "",
    hire_date: teacher.hire_date || new Date().toISOString().split("T")[0],
    experience_years: teacher.experience_years || 0,
    qualifications: teacher.qualifications || [],
    courses_taught: teacher.courses_taught || [],
  };

  viewTeacher.value = teacherWithDetails;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewTeacher.value = null;
};

// Filter handling
const FILTER_DEFAULTS = {
  academic_year: "All",
  program: "All",
  department: "All",
  origin: "All",
  gender: "All",
  grade: "All",
};

const filters = ref({ ...FILTER_DEFAULTS });

const handleFiltersUpdate = (query) => {
  // If teacher filter emits a clean object with only selected keys,
  // merge into defaults so missing keys stay as "All".
  if (!query || Object.keys(query).length === 0) {
    filters.value = { ...FILTER_DEFAULTS };
    return;
  }
  filters.value = {
    ...FILTER_DEFAULTS,
    ...filters.value, // keep anything already set
    ...query,         // clean keys: department_id, program_id, etc.
  };
};


const handleClearFilters = () => {
  search.value = "";
  filters.value = { ...FILTER_DEFAULTS };
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

// Sorting state
const currentSortField = ref("");
const currentSortDirection = ref("asc");

// Table event handlers
const handleRowSelect = (teacherId) => {
  if (selectedIds.value.includes(teacherId)) {
    selectedIds.value = selectedIds.value.filter((id) => id !== teacherId);
  } else {
    selectedIds.value.push(teacherId);
  }
};

const handleSelectAll = (ids) => {
  selectedIds.value = ids;
};

const handleSort = ({ field, direction }) => {
  currentSortField.value = field;
  currentSortDirection.value = direction;

  // Apply sorting to the data
  if (field && direction) {
    rows.value.sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      // Handle different data types
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }
};

/** ------- Filtering / Searching ------- */
const filteredRows = computed(() => {
  let list = rows.value;

  const q = search.value.trim().toLowerCase();
  
  if (q) {
    list = list.filter((r) => {
      // Safe property access with fallback to empty string
      const searchFields = [
        r.id_card || r.id || '',       // ID field
        r.khmer_name || '',            // Khmer name
        r.latin_name || '',            // Latin name
        r.email || '',                 // Email
        r.phone_number || '',          // Phone number
        r.department || '',            // Department
        r.program || '',               // Program
        r.section || ''                // Section
      ];
      
      return searchFields.some(field => 
        field.toString().toLowerCase().includes(q)
      );
    });
  }

  // by academic year if you have it on row
  if (filters.value.academic_year && filters.value.academic_year !== "All")
    list = list.filter((r) => r.academic_year === filters.value.academic_year);

  // by department/program **ID**
  if (filters.value.department_id)
    list = list.filter((r) => Number(r.department_id) === Number(filters.value.department_id));

  if (filters.value.program_id)
    list = list.filter((r) => Number(r.program_id) === Number(filters.value.program_id));

  // by gender/origin when present
  if (filters.value.gender && filters.value.gender !== "All")
    list = list.filter((r) => r.gender === filters.value.gender);

  if (filters.value.origin && filters.value.origin !== "All")
    list = list.filter((r) => r.origin === filters.value.origin);

  return list;
});

/** ------- Pagination ------- */
const page = ref(1);
const pageSize = ref(25);

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const result = filteredRows.value.slice(start, start + pageSize.value);
  
  return result;
});

watch([filteredRows, pageSize], () => {
  page.value = 1;
});

// Pagination event handlers
const handlePageChange = (paginationData) => {
  console.log("Page changed:", paginationData);
};

const handlePageSizeChange = (paginationData) => {
  console.log("Page size changed:", paginationData);
};

// Watch for department/program data changes and reload teachers
watch([departmentLookup, programLookup], () => {
  // Only reload if we have teacher data and the lookups have content
  if (rows.value.length > 0 && 
      Object.keys(departmentLookup.value).length > 0 && 
      Object.keys(programLookup.value).length > 0) {
    console.log("📊 Department/Program data updated, reloading teachers for proper mapping");
    loadTeachers();
  }
}, { deep: true });

/** ------- Actions ------- */
function view(row) {
  openView(row);
}
function edit(row) {
  openEdit(row);
}

const remove = async (row) => {
  try {
    const result = await TeacherCRUD.deleteTeacher(row.id);
    if (result.success) {
      showNotification('Teacher deleted successfully!', 'success');
      // Reload teachers from server
      await loadTeachers();
    } else {
      console.error("Failed to delete teacher:", result.error);
      showNotification(result.message || 'Failed to delete teacher', 'error');
    }
  } catch (error) {
    console.error("Error deleting teacher:", error);
    showNotification('Error deleting teacher. Please try again.', 'error');
  }
};

function exportCsv() {
  const header = [
    "ID Card",
    "Khmer Name",
    "Latin Name", 
    "Email",
    "Phone",
    "Department",
    "Program",
    "Status"
  ];
  const body = filteredRows.value.map((r) => [
    r.id_card || r.id,
    r.khmer_name || '',
    r.latin_name || '',
    r.email,
    r.phone_number || 'N/A',
    r.department || 'N/A',
    r.program || 'N/A',
    r.status || 'Active'
  ]);
  const csv = [header, ...body]
    .map((r) => r.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "teachers.csv";
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
  :deep(.teacher-table) {
    font-size: 14px;
  }
  
  /* Compact table cells */
  :deep(.teacher-table td),
  :deep(.teacher-table th) {
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
  :deep(.teacher-table) {
    font-size: 13px;
  }
  
  /* Reduce table cell padding */
  :deep(.teacher-table td),
  :deep(.teacher-table th) {
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
