<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden"
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200"
      >
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">
          Add Students into Existing Group
        </h2>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X class="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Group Selection -->
        <div class="mb-4 sm:mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select Group
          </label>
          <div class="relative">
            <select
              v-model="selectedGroup"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm sm:text-base"
              :disabled="loading"
              @change="loadGroupStudents"
            >
              <option value="" disabled selected>
                {{ loading ? 'Loading groups...' : 'Choose a group...' }}
              </option>
              <option
                v-for="group in availableGroups"
                :key="group.id"
                :value="group"
              >
                {{ group.name }} {{ group.department }} {{ group.section ? `(${group.section})` : '' }}
              </option>
            </select>
            <ChevronDown class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <!-- Selected Students List -->
        <div class="mb-4 sm:mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Selected Students to Add
          </label>
          <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <p class="text-sm text-gray-600 mb-2">
              {{ props.students.length }} student{{ props.students.length !== 1 ? 's' : '' }} will be added to the selected group
            </p>
            <div class="max-h-32 sm:max-h-40 overflow-y-auto">
              <div class="space-y-1">
                <div 
                  v-for="student in props.students" 
                  :key="student.id"
                  class="text-xs sm:text-sm text-gray-700 break-words"
                >
                  • {{ student.latin_name || student.khmer_name || student.name || 'Unknown Student' }} 
                  <span class="text-gray-500 block sm:inline">
                    (ID: {{ student.id_card || student.id }})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div
        class="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50"
      >
        <button
          @click="closeModal"
          class="px-4 py-2 border border-gray-300 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors text-sm sm:text-base"
        >
          Cancel
        </button>
        <button
          @click="addStudentsToGroup"
          :disabled="!selectedGroup || loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {{ loading ? 'Adding...' : 'Add to Group' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { X, ChevronDown } from "lucide-vue-next";
import { GroupCRUD } from "@/stores/apis/GroupCRUD.js";
import { showNotification } from "@/lib/notifications.js";

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  students: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["close", "add-students"]);

// State
const selectedGroup = ref("");
const availableGroups = ref([]);
const loading = ref(false);

// Load groups on component mount
onMounted(async () => {
  await loadGroups();
});

const loadGroups = async () => {
  loading.value = true;
  try {
    const result = await GroupCRUD.getAllGroups();
    if (result.success) {
      availableGroups.value = result.data;
    } else {
      console.error("Failed to load groups:", result.error);
    }
  } catch (error) {
    console.error("Error loading groups:", error);
  } finally {
    loading.value = false;
  }
};

// Methods
const closeModal = () => {
  emit("close");
  resetForm();
};

const resetForm = () => {
  selectedGroup.value = "";
};

const loadGroupStudents = () => {
  if (selectedGroup.value) {
    console.log("Loading students for group:", selectedGroup.value);
    // TODO: Load existing group students to show/hide already added students
  }
};

const addStudentsToGroup = async () => {
  if (selectedGroup.value && selectedGroup.value !== "" && props.students.length > 0) {
    loading.value = true;
    
    try {
      // Extract user IDs from the students array - check for user_id first, then id
      const studentUserIds = props.students.map(student => student.user_id || student.id).filter(id => id !== null && id !== undefined);
      
      console.log('Original students:', props.students);
      console.log('Extracted user IDs:', studentUserIds);
      
      if (studentUserIds.length === 0) {
        showNotification('No valid student IDs found', 'error');
        return;
      }
      
      // Call the GroupCRUD API to add students to the group
      const result = await GroupCRUD.addStudentsToGroup(selectedGroup.value.id, studentUserIds);
      
      if (result.success) {
        // Show success notification immediately
        showNotification(`${props.students.length} student${props.students.length !== 1 ? 's' : ''} added to ${selectedGroup.value.name} successfully`, 'success');
        
        // Emit success event with the updated group and students
        emit("add-students", {
          success: true,
          group: selectedGroup.value,
          students: props.students,
          message: `${props.students.length} student${props.students.length !== 1 ? 's' : ''} added to ${selectedGroup.value.name} successfully`
        });
        
        closeModal();
      } else {
        console.error("Failed to add students to group:", result.error);
        showNotification(result.message || "Failed to add students to group", 'error');
        emit("add-students", {
          success: false,
          error: result.error,
          message: result.message || "Failed to add students to group"
        });
      }
    } catch (error) {
      console.error("Error adding students to group:", error);
      showNotification("An error occurred while adding students to the group", 'error');
      emit("add-students", {
        success: false,
        error: error.message,
        message: "An error occurred while adding students to the group"
      });
    } finally {
      loading.value = false;
    }
  }
};

// Watch for modal open/close
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      loadGroups(); // Refresh groups when modal opens
    } else {
      resetForm();
    }
  }
);
</script>
