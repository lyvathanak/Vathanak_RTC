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
          Add Students into New Group
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
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
                <ChevronDown class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
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
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
                <ChevronDown class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
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
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
                <ChevronDown class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
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
                class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
                  Semester {{ s.semester_number || s.semester_key || s.id }} - {{ s.start_date }}/{{ s.end_date }}
                </option>
              </select>
              <ChevronDown class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
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
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          <!-- Student Selection -->
          <div class="border-t border-gray-200 pt-4 sm:pt-6">
            <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
              Selected Students for this Group
            </h3>

            <!-- Students List -->
            <div class="border border-gray-200 rounded-lg max-h-48 sm:max-h-60 overflow-y-auto">
              <div class="p-3 border-b border-gray-200 bg-gray-50">
                <span class="text-xs sm:text-sm font-medium text-gray-700">
                  {{ props.students.length }} student{{ props.students.length !== 1 ? 's' : '' }} selected
                </span>
              </div>
              <div class="divide-y divide-gray-200">
                <div
                  v-for="student in props.students"
                  :key="student.id"
                  class="flex items-center gap-3 p-3"
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {{ student.latin_name || student.khmer_name || student.name || 'Unknown Student' }}
                    </p>
                    <p class="text-xs text-gray-500 break-words">
                      ID: {{ student.id_card || student.id }} | 
                      {{ getDepartmentName(student.department_id) || 'Unknown Dept' }} - 
                      {{ getSectionName(student.sub_department_id) || 'Unknown Section' }}
                    </p>
                  </div>
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
          @click="createGroupWithStudents"
          :disabled="!isFormValid || departmentsLoading || programsLoading || sectionsLoading"
          class="px-4 py-2 bg-[#235AA6] text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <div v-if="departmentsLoading || programsLoading || sectionsLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span v-if="departmentsLoading || programsLoading || sectionsLoading">
            Loading...
          </span>
          <span v-else>
            Create Group
          </span>
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
  students: {
    type: Array,
    default: () => [],
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

// Load data on component mount - FilterByDepartment handles this automatically
// onMounted(async () => {
//   try {
//     await Promise.all([
//       getAllDepartments(),
//       getAllPrograms(),
//       getAllSections()
//     ]);
//   } catch (error) {
//     console.error('Error loading data:', error);
//   }
// });

// Watch for department changes to reset dependent fields and update filters
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

// Helper functions
const getDepartmentName = (departmentId) => {
  const dept = departments.value.find(d => d.id === departmentId);
  return dept ? dept.department_name : null;
};

const getSectionName = (sectionId) => {
  const section = allSections.value.find(s => s.id === sectionId);
  return section ? section.name : null;
};

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
  
  errors.value = {};
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

const createGroupWithStudents = () => {
  if (!validateForm()) {
    return;
  }

  // Get the selected department and section IDs
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
    students: props.students, // Include the selected students with full objects
    // Use user_id for student IDs array, with fallback to id
    student_ids: props.students.map(s => s.user_id || s.id), 
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
  console.log('Student user IDs:', newGroup.student_ids);

  emit("create-group", newGroup);
  closeModal();
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
