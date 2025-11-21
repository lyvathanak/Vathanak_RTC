<template>
  <div :class="['flex flex-col gap-4 py-5', locale === 'kh' ? 'khmer-text' : '']">
    <!-- Top bar -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 sm:px-5 gap-4">
      <!-- Search -->
      <div class="relative w-full max-w-md">
        <input
          v-model="search"
          type="text"
          :placeholder="t('search')"
          class="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search />
        </span>
      </div>

      <!-- Button Section -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
        <!-- Selected count indicator -->
        <div v-if="selectedIds.length > 0" class="text-sm text-gray-600 font-medium order-first sm:order-none">
          {{ selectedIds.length }} {{ t('student') }}<span v-if="selectedIds.length > 1">s</span> {{ t('selected') }}
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <!-- Group Management Buttons - Stack on mobile, inline on larger screens -->
          <div class="flex flex-col xs:flex-row gap-2 sm:gap-3">
            <!--Add student to new group-->
            <button
              @click="openAddToNewGroup"
              :disabled="selectedIds.length === 0"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#235AA6] text-white px-3 sm:px-4 py-2.5 text-sm sm:text-base transition disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus class="w-4 h-4 sm:w-5 sm:h-5" />
              <span class="hidden sm:inline">{{ t('add_new_group') }}</span>
              <span class="sm:hidden">New Group</span>
            </button>

            <!--Add student to existing group-->
            <button
              @click="openAddToExistingGroup"
              :disabled="selectedIds.length === 0"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#235AA6] text-white px-3 sm:px-4 py-2.5 text-sm sm:text-base transition disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus class="w-4 h-4 sm:w-5 sm:h-5" />
              <span class="hidden sm:inline">{{ t('add_existing_group') }}</span>
              <span class="sm:hidden">Add Group</span>
            </button>
          </div>

          <!-- Primary Actions - Stack on mobile, inline on larger screens -->
          <div class="flex flex-col xs:flex-row gap-2 sm:gap-3">
            <!--Add student-->
            <button
              @click="openAdd"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#235AA6] text-white px-3 sm:px-4 py-2.5 text-sm sm:text-base transition whitespace-nowrap"
            >
              <Plus class="w-4 h-4 sm:w-5 sm:h-5" />
              <span class="hidden sm:inline">{{ t('add_student') }}</span>
              <span class="sm:hidden">Add Student</span>
            </button>

            <!-- Export (uses ExcelForm component) -->
            <div>
              <ExcelForm :filteredRows="filteredRows" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div>
      <StudentFilterRole
        ref="filterComponent"
        @update:filters="handleFiltersUpdate"
        @clear-filters="handleClearFilters"
      />
    </div>

    <!-- Student Table -->
    <div class="overflow-x-auto px-5">
      <StudentTable
        :students="pagedRows"
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

    <!-- Pagination -->
    <div class="px-3 sm:px-5">
      <Pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total-items="filteredRows.length"
        :page-size-options="[ 5, 10, 25, 50, 100]"
        :item-label="t('students')"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- Add Student Modal -->
    <AddStudentModal
      :showAdd="showAddModal"
      :rows="rows"
      @close="closeAddModal"
      @save="handleAddSave"
    />

    <!-- Edit Student Modal -->
    <EditStudentModal
      v-model="showEditModal"
      :student="selectedStudent"
      :academic-years="['2022-2023', '2023-2024', '2024-2025']"
      :promotion-options="['Promoted', 'Repeat']"
      :degree-options="['Bachelor', 'Associate', 'Master']"
      :departments="['ITC', 'Business', 'Arts']"
      :branches="['Battambang', 'Phnom Penh']"
      @save="handleEditSave"
      @promote="handlePromoteStudent"
    />

    <!-- View Student Modal -->
    <ViewStudentModal v-model="showViewModal" :student="viewStudent" />

    <!-- Add Students to Existing Group Modal -->
    <AddToExistGroup
      :is-open="showAddToExistingGroupModal"
      :students="selectedStudents"
      @close="closeAddToExistingGroupModal"
      @add-students="handleAddStudentsToExistingGroup"
    />

    <!-- Add Students to New Group Modal -->
    <AddToNewGroup
      :is-open="showAddToNewGroupModal"
      :students="selectedStudents"
      @close="closeAddToNewGroupModal"
      @create-group="handleCreateNewGroupWithStudents"
    />
  </div>
</template>


<script setup>
import { Download, Plus, Search } from "lucide-vue-next";
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import AddStudentModal from "@/components/admins/StudentManagement/AddStudentModal.vue";
import EditStudentModal from "@/components/admins/StudentManagement/EditStudentModal.vue";
import ViewStudentModal from "@/components/admins/StudentManagement/ViewStudentModal.vue";
import StudentFilterRole from "@/components/admins/StudentManagement/StudentFilterRole.vue";
import StudentTable from "@/components/admins/StudentManagement/StudentTable.vue";
import Pagination from "@/components/features/Pagination.vue";
import AddToExistGroup from "@/components/admins/GroupManagement/AddToExistGroup.vue";
import AddToNewGroup from "@/components/admins/GroupManagement/AddToNewGroup.vue";
import ExcelForm from '@/components/features/ExcelForm.vue'
import { StudentCRUD } from "@/stores/apis/StudentCRUD.js";
import { GroupCRUD } from "@/stores/apis/GroupCRUD.js";
import { showNotification } from "@/lib/notifications.js";

const { t, locale } = useI18n();

/** ------- Load student data from API ------- */
const rows = ref([]);
const loading = ref(false);

// Filter component reference
const filterComponent = ref(null);

// Helper functions to get IDs from names for filtering
const getDepartmentIdByName = (departmentName) => {
  if (!filterComponent.value?.departments) return null;
  const dept = filterComponent.value.departments.find(d => d.department_name === departmentName);
  return dept ? dept.id : null;
};

const getSectionIdByName = (sectionName) => {
  if (!filterComponent.value?.sections) return null;
  const section = filterComponent.value.sections.find(s => (s.sub_department_name || s.name) === sectionName);
  return section ? section.id : null;
};

const getProgramIdByName = (programName) => {
  if (!filterComponent.value?.programs) return null;
  const program = filterComponent.value.programs.find(p => (p.program_name || p.name) === programName);
  return program ? program.id : null;
};

onMounted(async () => {
  await loadStudents();
});

const loadStudents = async () => {
  loading.value = true;
  try {
    const result = await StudentCRUD.getAllStudents();
    if (result.success) {
      rows.value = result.data;
    } else {
      console.error("Failed to load students:", result.error);
    }
  } catch (error) {
    console.error("Error loading students:", error);
  } finally {
    loading.value = false;
  }
};

/** ------- Search + Filters ------- */
const search = ref("");

// Add Student Modal state
const showAddModal = ref(false);

// Edit Student Modal state
const showEditModal = ref(false);
const selectedStudent = ref(null);

// View Student Modal state
const showViewModal = ref(false);
const viewStudent = ref(null);

// Add to Existing Group Modal state
const showAddToExistingGroupModal = ref(false);

// Add to New Group Modal state
const showAddToNewGroupModal = ref(false);

const openAdd = () => {
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

// Add to Existing Group Modal methods
const openAddToExistingGroup = () => {
  showAddToExistingGroupModal.value = true;
};

const closeAddToExistingGroupModal = () => {
  showAddToExistingGroupModal.value = false;
};

// Add to New Group Modal methods
const openAddToNewGroup = () => {
  showAddToNewGroupModal.value = true;
};

const closeAddToNewGroupModal = () => {
  showAddToNewGroupModal.value = false;
};

const handleAddSave = async (studentData) => {
  try {
    // The modal already created the student via the composable
    // Refresh the entire student list to ensure proper data synchronization
    await loadStudents();
    console.log("Student list refreshed successfully");
    showNotification("Student created successfully!", 'success');
  } catch (error) {
    console.error("Error refreshing student list:", error);
    showNotification("Error refreshing student list", 'error');
  }
  closeAddModal();
};

const openEdit = (student) => {
  selectedStudent.value = student;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedStudent.value = null;
};

const handleEditSave = async (updatedStudent) => {
  try {
    // Add better error handling and user feedback
    // Use user_id for update operations instead of id
    const result = await StudentCRUD.updateStudent(
      updatedStudent.user_id || updatedStudent.id,
      updatedStudent
    );
    if (result.success) {
      // Refresh the entire student list to ensure proper data synchronization
      await loadStudents();
      showNotification("Student updated successfully!", 'success');
      closeEditModal();
    } else {
      // Show error notification with specific error message
      const errorMessage = result.error?.message || 'Failed to update student. Please check all required fields.';
      showNotification(errorMessage, 'error');
      console.error("Failed to update student:", result.error);
      // Don't close modal on error so user can fix the issues
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred while updating the student.';
    showNotification(errorMessage, 'error');
    console.error("Error updating student:", error);
    // Don't close modal on error
  }
};

const handlePromoteStudent = async (promotionData) => {
  try {
    // Use user_id for patch operations instead of id
    const result = await StudentCRUD.patchStudent(promotionData.user_id || promotionData.id, {
      academic_year: promotionData.academic_year,
      promotion: promotionData.promotion,
    });
    if (result.success) {
      // Update local data
      const index = rows.value.findIndex((s) => s.id === promotionData.id);
      if (index !== -1) {
        rows.value[index] = result.data;
      }
      showNotification("Student promoted successfully!", 'success');
    } else {
      showNotification("Failed to promote student: " + (result.error?.message || 'Unknown error'), 'error');
      console.error("Failed to promote student:", result.error);
    }
  } catch (error) {
    showNotification("Error promoting student: " + (error.response?.data?.message || 'Unknown error'), 'error');
    console.error("Error promoting student:", error);
  }
  closeEditModal();
};

const openView = (student) => {
  // Create academic history data for the view modal
  const studentWithHistory = {
    ...student,
    address:
      student.current_address ||
      student.permanent_address ||
      "No address provided",
    sub_department: student.section || "N/A",
    photo_url: student.photo_url || "",
    academic_history: {
      "2022-2023": {
        gpa_year: 3.5,
        sem1: [
          { subject: "Mathematics", credit: 3, absence: 2, score: 85 },
          { subject: "Physics", credit: 4, absence: 1, score: 90 },
          { subject: "Chemistry", credit: 3, absence: 0, score: 88 },
        ],
        sem2: [
          { subject: "English", credit: 2, absence: 1, score: 92 },
          { subject: "Programming", credit: 4, absence: 0, score: 95 },
          { subject: "Database", credit: 3, absence: 1, score: 87 },
        ],
      },
      "2023-2024": {
        gpaYear: 3.7,
        sem1: [
          { subject: "Advanced Math", credit: 3, absence: 1, score: 88 },
          { subject: "Data Structures", credit: 4, absence: 0, score: 93 },
          { subject: "Networks", credit: 3, absence: 2, score: 85 },
        ],
        sem2: [
          { subject: "Web Development", credit: 4, absence: 0, score: 96 },
          { subject: "Software Engineering", credit: 3, absence: 1, score: 89 },
          { subject: "Mobile Development", credit: 3, absence: 0, score: 91 },
        ],
      },
    },
  };

  viewStudent.value = studentWithHistory;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewStudent.value = null;
};

// Filter handling
const filters = ref({
  academic_year: "All",
  department: "All",
  section: "All",
  origin: "All",
  gender: "All",
  promotion: "All",
  shift: "All",
  score_range: "All",
  pass_fail: "All",
});

const handleFiltersUpdate = (newFilters) => {
  filters.value = { ...newFilters };
};

const handleClearFilters = () => {
  search.value = "";
};

/** ------- Selection ------- */
const selectedIds = ref([]);

// Table configuration
const tableColumns = ref([
  { key: "id_card", label: "ID", visible: true, sortable: true },
  { key: "khmer_name", label: "Khmer Fullname", visible: true, sortable: true },
  { key: "latin_name", label: "Latin Fullname", visible: true, sortable: true },
  {
    key: "date_of_birth",
    label: "Date of Birth",
    visible: true,
    sortable: true,
  },
  { key: "gender", label: "Gender", visible: true, sortable: false },
  { key: "department_id", label: "Department", visible: true, sortable: true },
  { key: "sub_department_id", label: "Section", visible: true, sortable: true },
]);

// Sorting state
const currentSortField = ref("");
const currentSortDirection = ref("asc");

// Table event handlers
const handleRowSelect = (studentId) => {
  if (selectedIds.value.includes(studentId)) {
    selectedIds.value = selectedIds.value.filter((id) => id !== studentId);
  } else {
    selectedIds.value.push(studentId);
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
    list = list.filter(
      (r) =>
        r.id_card?.toLowerCase().includes(q) ||
        r.khmer_name?.toLowerCase().includes(q) ||
        r.first_name?.toLowerCase().includes(q) ||
        r.last_name?.toLowerCase().includes(q) ||
        r.latin_name?.toLowerCase().includes(q) ||
        r.department_id?.toString().toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q)
    );
  }

  // Apply all filters
  if (filters.value.academic_year !== "All")
    list = list.filter((r) => r.academic_year === filters.value.academic_year);
  
  if (filters.value.department !== "All") {
    const departmentId = getDepartmentIdByName(filters.value.department);
    if (departmentId !== null) {
      list = list.filter((r) => r.department_id === departmentId);
    }
  }
  
  if (filters.value.section !== "All") {
    const sectionId = getSectionIdByName(filters.value.section);
    if (sectionId !== null) {
      list = list.filter((r) => r.sub_department_id === sectionId);
    }
  }

  if (filters.value.program !== "All") {
    const programId = getProgramIdByName(filters.value.program);
    if (programId !== null) {
      list = list.filter((r) => r.program_id === programId);
    }
  }

  if (filters.value.origin !== "All")
    list = list.filter(
      (r) =>
        r.origin === filters.value.origin ||
        r.place_of_birth === filters.value.origin ||
        (r.current_address &&
          r.current_address.includes(filters.value.origin)) ||
        (r.permanent_address &&
          r.permanent_address.includes(filters.value.origin))
    );
  if (filters.value.gender !== "All")
    list = list.filter((r) => r.gender === filters.value.gender);
  if (filters.value.promotion !== "All")
    list = list.filter((r) => r.promotion === filters.value.promotion);

  return list;
});

/** ------- Pagination ------- */
const page = ref(1);
const pageSize = ref(25);

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

watch([filteredRows, pageSize], () => {
  page.value = 1;
});

// Selected students computed property
const selectedStudents = computed(() => {
  return rows.value.filter(student => selectedIds.value.includes(student.id));
});

// Pagination event handlers
const handlePageChange = (paginationData) => {
  // The page is already updated via v-model, but we can add additional logic here if needed
  console.log("Page changed:", paginationData);
};

const handlePageSizeChange = (paginationData) => {
  // The pageSize is already updated via v-model, but we can add additional logic here if needed
  console.log("Page size changed:", paginationData);
};

/** ------- Actions ------- */
function view(row) {
  openView(row);
}
function edit(row) {
  openEdit(row);
}

const remove = async (row) => {
  try {
    // Use user_id for deletion instead of id
    const result = await StudentCRUD.deleteStudent(row.user_id || row.id);
    if (result.success) {
      // Refresh the entire student list to ensure proper data synchronization
      await loadStudents();
      showNotification("Student deleted successfully!", 'success');
      console.log("Student deleted successfully");
    } else {
      console.error("Failed to delete student:", result.error);
      showNotification(result.message || 'Failed to delete student', 'error');
    }
  } catch (error) {
    console.error("Error deleting student:", error);
    showNotification('Error deleting student. Please try again.', 'error');
  }
};

// Group Management Event Handlers
const handleAddStudentsToExistingGroup = async (data) => {
  try {
    console.log("Handling add students to existing group event:", data);
    
    if (data.success) {
      console.log("Students added to group successfully");
      
      // Update local student data to reflect the group assignment
      await loadStudents(); // Reload students to get updated group information
      
      // Clear selection after successful operation
      selectedIds.value = [];
      
      // Don't show additional notification - AddToExistGroup already showed one
    } else {
      console.error("Failed to add students to group:", data.error);
      // Only show error notification if the modal didn't already show one
      if (data.message && !data.message.includes('already')) {
        showNotification(data.message || "Failed to add students to group. Please try again.", 'error');
      }
    }
  } catch (error) {
    console.error("Error handling add students to group event:", error);
    showNotification("An error occurred while processing the group assignment.", 'error');
  }
};

const handleCreateNewGroupWithStudents = async (groupData) => {
  try {
    console.log("Creating new group with students:", groupData);
    
    // Create the group with students using the GroupCRUD API
    const result = await GroupCRUD.createGroupWithStudents(groupData);
    
    if (result.success) {
      console.log("New group created successfully:", result.data);
      
      // Update local student data to reflect the group assignment
      await loadStudents(); // Reload students to get updated group information
      
      // Clear selection after successful operation
      selectedIds.value = [];
      
      // Show success message (you can implement a toast notification here)
      showNotification(`Group "${groupData.name}" created successfully with ${groupData.students.length} students!`, 'success');
    } else {
      console.error("Failed to create group:", result.error);
      showNotification("Failed to create group. Please try again.", 'error');
    }
  } catch (error) {
    console.error("Error creating new group:", error);
    showNotification("An error occurred while creating the group. Please try again.", 'error');
  }
};

// function exportCsv() {
//   const header = [
//     "ID",
//     "Khmer Fullname",
//     "Latin Fullname",
//     "DOB",
//     "Gender",
//     "Program",
//     "Department",
//     "Section",
//   ];
//   const body = filteredRows.value.map((r) => [
//     r.id_card || r.id,
//     r.khmer_name,
//     r.latin_name,
//     r.date_of_birth,
//     r.gender,
//     r.program_name || r.program_id,
//     r.department_name || r.department_id,
//     r.sub_department_id || r.section || "N/A",
//   ]);
//   const csv = [header, ...body]
//     .map((r) => r.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(","))
//     .join("\n");
//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "students.csv";
//   a.click();
//   URL.revokeObjectURL(url);
// }
</script>

<style scoped>
/* Enhanced responsive styles */
@media (max-width: 480px) {
  /* Extra small screens - phones */
  table {
    font-size: 11px;
  }
  
  .khmer-text {
    font-size: 13px;
  }
}

@media (max-width: 640px) {
  /* Small screens - larger phones */
  table {
    font-size: 12px;
  }
  
  .khmer-text {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  /* Medium screens - tablets */
  table {
    font-size: 13px;
  }
  
  .khmer-text {
    font-size: 15px;
  }
}

/* Custom breakpoint for xs screens */
@media (min-width: 475px) {
  .xs\:flex-row {
    flex-direction: row;
  }
}

/* Ensure buttons don't get too small on mobile */
button {
  min-height: 40px;
}

/* Better spacing for mobile */
@media (max-width: 640px) {
  .gap-4 {
    gap: 0.75rem;
  }
  
  .gap-3 {
    gap: 0.5rem;
  }
  
  .gap-2 {
    gap: 0.375rem;
  }
}

/* Responsive container adjustments */
@media (max-width: 1024px) {
  .lg\:flex-row {
    flex-direction: column;
  }
  
  .lg\:justify-between {
    justify-content: flex-start;
  }
  
  .lg\:w-auto {
    width: 100%;
  }
}

/* Better button text visibility on small screens */
@media (max-width: 640px) {
  .sm\:hidden {
    display: inline;
  }
  
  .hidden.sm\:inline {
    display: none;
  }
}

/* Table responsiveness */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
}

/* Better touch targets for mobile */
@media (max-width: 768px) {
  button {
    min-height: 44px;
    touch-action: manipulation;
  }
  
  input {
    min-height: 44px;
  }
}
</style>
