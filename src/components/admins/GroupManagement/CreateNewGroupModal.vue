<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
    @click.self="closeModal"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200"
      >
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">
          Create New Group
        </h2>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X class="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)]">
        <!-- Group Information Form -->
        <div class="space-y-4 sm:space-y-6">
          <!-- Group Basic Info -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Group Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="groupForm.name"
                type="text"
                placeholder="Enter group name"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">
                {{ errors.name }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Group Department <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="groupForm.department"
                  @change="onDepartmentChange"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  :class="{ 'border-red-500': errors.department }"
                  :disabled="departmentsLoading"
                >
                  <option value="">{{ departmentsLoading ? 'Loading departments...' : 'Select Department' }}</option>
                  <option 
                    v-for="department in departmentOptions" 
                    :key="department.id" 
                    :value="department.name"
                  >
                    {{ department.name }}
                  </option>
                </select>
                <ChevronDown class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
              <p v-if="errors.department" class="text-red-500 text-xs mt-1">
                {{ errors.department }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Group Program <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="groupForm.program"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  :class="{ 'border-red-500': errors.program }"
                  :disabled="programsLoading || !groupForm.department"
                >
                  <option value="">{{ programsLoading ? 'Loading programs...' : 'Select Program' }}</option>
                  <option 
                    v-for="program in filteredPrograms" 
                    :key="program.id" 
                    :value="program.program_name"
                  >
                    {{ program.program_name }}
                  </option>
                </select>
                <ChevronDown class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
              <p v-if="errors.program" class="text-red-500 text-xs mt-1">
                {{ errors.program }}
              </p>
              <p v-if="!groupForm.department" class="text-gray-500 text-xs mt-1">
                Please select a department first
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Group Section <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="groupForm.section"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  :class="{ 'border-red-500': errors.section }"
                  :disabled="sectionsLoading || !groupForm.department"
                >
                  <option value="">{{ sectionsLoading ? 'Loading sections...' : 'Select Section' }}</option>
                  <option 
                    v-for="section in filteredSections" 
                    :key="section.id" 
                    :value="section.name"
                  >
                    {{ section.name }}
                  </option>
                </select>
                <ChevronDown class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
              <p v-if="errors.section" class="text-red-500 text-xs mt-1">
                {{ errors.section }}
              </p>
              <p v-if="!groupForm.department" class="text-gray-500 text-xs mt-1">
                Please select a department first
              </p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Group Semester <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <select
                v-model.number="groupForm.semester"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                :class="{ 'border-red-500': errors.semester }"
                :disabled="loadingSemesters || !semesters.length"
              >
                <option value="">
                  {{ loadingSemesters ? 'Loading semesters...' : (semesters.length ? 'Select Semester' : 'No semesters available') }}
                </option>
                <option
                  v-for="s in semesters"
                  :key="s.id"
                  :value="s.id"
                >
                  {{ s.semester_key }} • {{ s.start_date }} → {{ s.end_date }}
                </option>
              </select>
              <ChevronDown class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            <p v-if="errors.semester" class="text-red-500 text-xs mt-1">
              {{ errors.semester }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Group Description
            </label>
            <textarea
              v-model="groupForm.description"
              rows="3"
              placeholder="Enter group description (optional)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          <!-- Info Note -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div class="flex items-start gap-2 sm:gap-3">
              <div class="text-blue-600 mt-1">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-medium text-blue-800 mb-1">
                  Creating Empty Group
                </h3>
                <p class="text-xs sm:text-sm text-blue-700">
                  This will create a new group without any students. You can add students to the group later through the Student Management interface.
                </p>
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
          class="px-4 py-2 border border-gray-300 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          @click="createGroup"
          :disabled="!isFormValid || isCreating"
          class="px-4 py-2 bg-[#235AA6] text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <span v-if="isCreating">Creating Group...</span>
          <span v-else>Create Group</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { X, ChevronDown } from "lucide-vue-next";
import { useFilteredByDepartment, useProgramsFilteredByDepartment, useSectionsFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";
import { getSemestersByProgram } from "@/stores/global/SemesterByProgram.js";

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["close", "create-group"]);

// Use FilterByDepartment composables
// Get departments for the dropdown
const { 
  departments, 
  departmentOptions,
  loading: departmentsLoading 
} = useFilteredByDepartment({ immediate: true });

// Get programs filtered by department
const { 
  selectedDepartmentId: selectedDepartmentIdForPrograms,
  filtered: programsFiltered, 
  rawList: allPrograms,
  loading: programsLoading,
  setDepartment: setProgramsDepartment
} = useProgramsFilteredByDepartment({ immediate: true });

// Get sections filtered by department  
const { 
  selectedDepartmentId: selectedDepartmentIdForSections,
  filtered: sectionsFiltered, 
  rawList: allSections,
  loading: sectionsLoading,
  setDepartment: setSectionsDepartment
} = useSectionsFilteredByDepartment({ immediate: true });

// State
const groupForm = ref({
  name: "",
  program: "",
  department: "",
  section: "",
  semester: "",
  description: "",
});

const semesters = ref([])
const loadingSemesters = ref(false)
const semestersError = ref("")
const isCreating = ref(false)

const errors = ref({});

// Computed properties for filtered options
const filteredPrograms = computed(() => {
  if (!groupForm.value.department) return allPrograms.value;
  return programsFiltered.value;
});

const filteredSections = computed(() => {
  if (!groupForm.value.department) return allSections.value;
  return sectionsFiltered.value;
});

const isFormValid = computed(() => {
  return (
    groupForm.value.name &&
    groupForm.value.program &&
    groupForm.value.department &&
    groupForm.value.section &&
    groupForm.value.semester
  );
});

// Watch for department changes to update filters
const onDepartmentChange = () => {
  if (!groupForm.value.department) return;
  
  // Find the selected department
  const selectedDept = departments.value.find(d => d.department_name === groupForm.value.department);
  if (!selectedDept) return;
  
  // Update filters for programs and sections
  setProgramsDepartment(selectedDept.id);
  setSectionsDepartment(selectedDept.id);
  
  // Reset dependent fields
  groupForm.value.program = "";
  groupForm.value.section = "";
  groupForm.value.semester = "";
  semesters.value = [];
};

// Watch for program changes to load semesters
watch(() => groupForm.value.program, async (newProg) => {
  groupForm.value.semester = ""
  semesters.value = []
  semestersError.value = ""

  if (!newProg) return
  const prog = allPrograms.value.find(p => p.program_name === newProg)
  if (!prog?.id) return

  loadingSemesters.value = true
  try {
    const list = await getSemestersByProgram(prog.id)
    semesters.value = Array.isArray(list) ? list : (list?.semesters || [])
  } catch (e) {
    semestersError.value = e?.message || "Failed to load semesters"
  } finally {
    loadingSemesters.value = false
  }
})

// Methods
const closeModal = () => {
  emit("close");
  resetForm();
};

const resetForm = () => {
  groupForm.value = {
    name: "",
    program: "",
    department: "",
    section: "",
    semester: "",
    description: "",
  };
  
  semesters.value = [];
  errors.value = {};
  isCreating.value = false;
};

const validateForm = () => {
  errors.value = {};

  if (!groupForm.value.name) {
    errors.value.name = "Group name is required";
  }

  if (!groupForm.value.program) {
    errors.value.program = "Program is required";
  }

  if (!groupForm.value.department) {
    errors.value.department = "Department is required";
  }

  if (!groupForm.value.section) {
    errors.value.section = "Section is required";
  }

  if (!groupForm.value.semester) {
    errors.value.semester = "Semester is required";
  }

  return Object.keys(errors.value).length === 0;
};

const createGroup = async () => {
  if (!validateForm()) {
    return;
  }

  isCreating.value = true;

  try {
    // Get the selected department, section, program and semester objects
    const selectedDepartment = departments.value.find(d => d.department_name === groupForm.value.department);
    const selectedSection = allSections.value.find(s => s.name === groupForm.value.section);
    const selectedProgram = allPrograms.value.find(p => p.program_name === groupForm.value.program);
    const selectedSemesterObj = semesters.value.find(
      s => String(s.id) === String(groupForm.value.semester)
    );

    const newGroup = {
      ...groupForm.value,
      // Add IDs for backend compatibility
      department_id: selectedDepartment?.id,
      section_id: selectedSection?.id,
      program_id: selectedProgram?.id,
      semester_id: selectedSemesterObj?.id ?? Number(groupForm.value.semester),
      academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1), // Auto-generate academic year
      created_at: new Date().toISOString(),
      status: "Active",
    };

    if (selectedSemesterObj) {
      newGroup.semester_key = selectedSemesterObj.semester_key;
      newGroup.semester_number = selectedSemesterObj.semester_number;
    }

    console.log('Creating group with data:', newGroup);
    console.log('Selected department:', selectedDepartment);
    console.log('Selected program:', selectedProgram);
    console.log('Selected section:', selectedSection);

    emit("create-group", newGroup);
    closeModal();
  } catch (error) {
    console.error('Error creating group:', error);
  } finally {
    isCreating.value = false;
  }
};

// Watch for modal open/close
watch(
  () => props.isOpen,
  (newValue) => {
    if (!newValue) {
      resetForm();
    }
  }
);
</script>
