<template>
  <div class="flex flex-col gap-4 py-3 sm:py-5">
    
    <!-- Header with Search, Filters and Create Button -->
    <div class="px-3 sm:px-5">
      <div class="flex flex-col gap-4">
        <!-- Title and Create Button Row -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Group Management</h1>
          <button
            @click="openCreateModal"
            class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#235AA6] text-white rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            <Plus class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="hidden xs:inline">Create Group</span>
            <span class="xs:hidden">Create</span>
          </button>
        </div>
        
        <!-- Filters -->
        <GroupFilter
          v-model="filters"
          :groups="groups"
          :loading="loading"
          @refresh="loadGroups"
        />
      </div>
    </div>

    <!-- Groups Table -->
    <div class="mx-3 sm:mx-5">
      <div class="overflow-x-auto">
        <GroupTable
          :groups="pagedGroups"
          :loading="loading"
          @view="viewGroup"
          @edit="editGroup"
          @delete="deleteGroup"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div class="px-3 sm:px-5">
      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-items="filteredGroups.length"
        :page-size-options="[ 5, 10, 25, 50, 100]"
        item-label="groups"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- View Group Modal -->
    <ViewGroupModal
      :is-open="showViewModal"
      :group="selectedGroup"
      @close="closeViewModal"
      @student-removed="handleStudentRemoved"
    />

    <!-- Edit Group Modal -->
    <UpdateGroupModal
      :is-open="showEditModal"
      :group="selectedGroup"
      @close="closeEditModal"
      @update-group="handleUpdateGroup"
    />

    <!-- Create Group Modal -->
    <CreateNewGroupModal
      :is-open="showCreateModal"
      @close="closeCreateModal"
      @create-group="handleCreateGroup"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Pagination from "@/components/features/Pagination.vue";
import ViewGroupModal from "@/components/admins/GroupManagement/ViewGroupModal.vue";
import { GroupCRUD } from "@/stores/apis/GroupCRUD.js";
import { showNotification } from "@/lib/notifications.js";

import GroupTable from '@/components/admins/GroupManagement/GroupTable.vue';
import UpdateGroupModal from '@/components/admins/GroupManagement/UpdateGroupModal.vue';
import CreateNewGroupModal from '@/components/admins/GroupManagement/CreateNewGroupModal.vue';
import GroupFilter from '@/components/admins/GroupManagement/GroupFilter.vue';
import { useDepartment } from "@/stores/global/useDepartment.js";
import { useProgram } from "@/stores/global/useProgram.js";
import { useSection } from "@/stores/global/useSection.js";
import { Plus } from "lucide-vue-next";

// Composables for dynamic name resolution
const { getDepartmentById, getDepartmentByName } = useDepartment();
const { getProgramById, getProgramByName } = useProgram();
const { getSectionById, getSectionByName } = useSection();

// State
const filters = ref({
  search: "",
  academicYear: "",
  department: "",
  program: "",
  section: "",
  shift: ""
});
const currentPage = ref(1);
const pageSize = ref(10);
const groups = ref([]);
const loading = ref(false);

// Modal states
const showViewModal = ref(false);
const showEditModal = ref(false);
const showCreateModal = ref(false);
const selectedGroup = ref(null);

// Load groups data from API
const loadGroups = async () => {
  loading.value = true;
  try {
    const result = await GroupCRUD.getAllGroups();
    if (result.success) {
      // Store original groups for fallback
      const originalGroups = result.data;
      
      // Enhance groups with student count information using parallel requests
      const groupsWithStudentCount = await Promise.allSettled(
        originalGroups.map(async (group) => {
          try {
            // Fetch detailed group info to get student count
            const groupDetail = await GroupCRUD.getGroupById(group.id);
            if (groupDetail.success && groupDetail.data) {
              return {
                ...group,
                students: groupDetail.data.students || [],
                student_ids: groupDetail.data.student_ids || [],
                student_count: groupDetail.data.students ? groupDetail.data.students.length : 0
              };
            }
            return group;
          } catch (error) {
            console.warn(`Failed to fetch details for group ${group.id}:`, error);
            return group;
          }
        })
      );
      
      // Extract successful results and handle any failures
      const processedGroups = groupsWithStudentCount.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.warn(`Failed to process group ${index}:`, result.reason);
          // Return original group data from the initial API call
          return originalGroups[index] || {};
        }
      });
      
      groups.value = processedGroups;
      console.log("Groups loaded with student counts:", processedGroups);
    } else {
      console.error("Failed to load groups:", result.error);
      showNotification("Failed to load groups", 'error');
    }
  } catch (error) {
    console.error("Error loading groups:", error);
    showNotification("Error loading groups", 'error');
  } finally {
    loading.value = false;
  }
};

// Computed
const filteredGroups = computed(() => {
  let filtered = groups.value;

  if (filters.value.search?.trim()) {
    const query = filters.value.search.toLowerCase();
    filtered = filtered.filter((group) => {
      try {
        // Get resolved names for search with fallbacks
        const department = getDepartmentById(group.department_id) || getDepartmentById(group.dept_id);
        const program = getProgramById(group.program_id) || getProgramById(group.programme_id);
        const section = getSectionById(group.section_id) || getSectionById(group.sub_department_id);
        
        const departmentName = department?.department_name || group.department || group.department_name || '';
        const programName = program?.program_name || group.program || group.program_name || '';
        const sectionName = section?.name || group.section || group.section_name || '';
        
        return (
          group.name?.toLowerCase().includes(query) ||
          departmentName.toLowerCase().includes(query) ||
          programName.toLowerCase().includes(query) ||
          sectionName.toLowerCase().includes(query) ||
          group.academic_year?.toLowerCase().includes(query) ||
          group.shift?.toLowerCase().includes(query)
        );
      } catch (error) {
        console.warn('Error in search filter:', error);
        // Fallback to basic search if resolution fails
        return (
          group.name?.toLowerCase().includes(query) ||
          group.department?.toLowerCase().includes(query) ||
          group.program?.toLowerCase().includes(query) ||
          group.section?.toLowerCase().includes(query)
        );
      }
    });
  }

  if (filters.value.department) {
    filtered = filtered.filter((group) => {
      try {
        const department = getDepartmentById(group.department_id) || getDepartmentById(group.dept_id);
        const departmentName = department?.department_name || group.department || group.department_name;
        return departmentName === filters.value.department;
      } catch (error) {
        console.warn('Error in department filter:', error);
        return group.department === filters.value.department;
      }
    });
  }

  if (filters.value.program) {
    filtered = filtered.filter((group) => {
      try {
        const program = getProgramById(group.program_id) || getProgramById(group.programme_id);
        const programName = program?.program_name || group.program || group.program_name;
        return programName === filters.value.program;
      } catch (error) {
        console.warn('Error in program filter:', error);
        return group.program === filters.value.program;
      }
    });
  }

  if (filters.value.academicYear) {
    filtered = filtered.filter(
      (group) => group.academic_year === filters.value.academicYear
    );
  }

  if (filters.value.section) {
    filtered = filtered.filter((group) => {
      try {
        const section = getSectionById(group.section_id) || getSectionById(group.sub_department_id);
        const sectionName = section?.name || group.section || group.section_name;
        return sectionName === filters.value.section;
      } catch (error) {
        console.warn('Error in section filter:', error);
        return group.section === filters.value.section;
      }
    });
  }

  if (filters.value.shift) {
    filtered = filtered.filter(
      (group) => group.shift === filters.value.shift
    );
  }

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredGroups.value.length / pageSize.value);
});

const pagedGroups = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredGroups.value.slice(start, start + pageSize.value);
});

// Watch for changes in filtered data and reset to page 1
watch([filteredGroups, pageSize], () => {
  currentPage.value = 1;
});

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

const openCreateModal = () => {
  console.log("Open create group modal");
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
};

const handleCreateGroup = async (groupData) => {
  loading.value = true;
  try {
    console.log('Creating group with data:', groupData);
    const result = await GroupCRUD.createGroup(groupData);
    
    if (result.success) {
      // Refresh the groups list to show the new group
      await loadGroups();
      showNotification(`Group "${groupData.name}" created successfully`, 'success');
      closeCreateModal();
    } else {
      console.error("Failed to create group:", result.error);
      showNotification(result.message || "Failed to create group", 'error');
    }
  } catch (error) {
    console.error("Error creating group:", error);
    showNotification("Error creating group", 'error');
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  console.log("Open add group modal");
  // Redirect to create modal
  openCreateModal();
};

const viewGroup = (group) => {
  console.log("View group:", group);
  selectedGroup.value = group;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedGroup.value = null;
};

const handleStudentRemoved = async (data) => {
  try {
    // Refresh data from server to ensure accurate counts and student lists
    await loadGroups();
    showNotification(`${data.studentName} removed`, 'success');
  } catch (error) {
    console.error("Error refreshing groups after student removal:", error);
    showNotification("Student removed but failed to refresh data", 'error');
  }
};

const editGroup = (group) => {
  selectedGroup.value = { ...group, name: group?.name ?? group?.group_name ?? '' }; // ✅
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedGroup.value = null;
};

const handleUpdateGroup = async (updatedGroup) => {
  loading.value = true;
  try {
    const id = Number(updatedGroup?.id ?? selectedGroup.value?.id);
    if (!id) {
      showNotification('Missing group id', 'error');
      return;
    }

    const result = await GroupCRUD.updateGroup(id, updatedGroup);
    if (result.success) {
      // Refresh data from server instead of local manipulation
      await loadGroups();
      showNotification(`Group "${updatedGroup.name ?? updatedGroup.group_name}" updated successfully`, 'success');
      closeEditModal();
    } else {
      console.error("Failed to update group:", result.error);
      showNotification(result.message || "Failed to update group", 'error');
    }
  } catch (error) {
    console.error("Error updating group:", error);
    showNotification("Error updating group", 'error');
  } finally {
    loading.value = false;
  }
};

const manageStudents = (group) => {
  console.log("Manage students for group:", group);
  // TODO: Implement student management modal for the group
};

const deleteGroup = async (group) => {
  loading.value = true;
  try {
    const result = await GroupCRUD.deleteGroup(group.id);
    if (result.success) {
      // Refresh data from server instead of local manipulation
      await loadGroups();
      showNotification(`Group "${group.name}" deleted successfully`, 'success');
      console.log("Deleted group:", group);
    } else {
      console.error("Failed to delete group:", result.error);
      showNotification(result.message || "Failed to delete group", 'error');
    }
  } catch (error) {
    console.error("Error deleting group:", error);
    showNotification("Error deleting group", 'error');
  } finally {
    loading.value = false;
  }
};

// Pagination event handlers
const handlePageChange = (paginationData) => {
  console.log("Page changed:", paginationData);
};

const handlePageSizeChange = (paginationData) => {
  console.log("Page size changed:", paginationData);
};

onMounted(async () => {
  // Load groups data from API
  await loadGroups();
  console.log("Group Management loaded");
});
</script>
