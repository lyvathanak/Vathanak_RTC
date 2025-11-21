<template>
  <div class="flex flex-col gap-4">
    <!-- Search Bar -->
    <div class="relative max-w-md w-full">
      <input
        v-model="searchValue"
        type="text"
        placeholder="Search"
        class="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        @input="handleSearchChange"
      />
      <Search
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
      />
    </div>

    <!-- Filter Pills -->
    <div class="flex flex-wrap justify-between items-center gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Academic Year Filter -->
        <div class="relative">
          <button
            type="button"
            class="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
            @click="toggleDropdown('academic_year')"
          >
            <span class="text-sm font-medium">
              {{ selectedAcademicYear || 'Academic Year' }}
            </span>
            <ChevronDown 
              class="w-4 h-4 transition-transform duration-200" 
              :class="{ 'rotate-180': activeDropdown === 'academic_year' }" 
            />
          </button>
          
          <div
            v-if="activeDropdown === 'academic_year'"
            class="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <ul class="py-1 max-h-60 overflow-auto">
              <li>
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  @click="selectFilter('academic_year', '')"
                >
                  All Years
                </button>
              </li>
              <li v-for="year in academicYears" :key="year">
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  @click="selectFilter('academic_year', year)"
                >
                  {{ year }}
                </button>
              </li>
              <li v-if="academicYears.length === 0" class="px-3 py-2 text-sm text-gray-500 italic">
                No academic years available
              </li>
            </ul>
          </div>
        </div>

        <!-- Department Filter -->
        <div class="relative">
          <button
            type="button"
            class="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
            @click="toggleDropdown('department')"
          >
            <span class="text-sm font-medium">
              {{ selectedDepartment || 'Department' }}
            </span>
            <ChevronDown 
              class="w-4 h-4 transition-transform duration-200" 
              :class="{ 'rotate-180': activeDropdown === 'department' }" 
            />
          </button>
          
          <div
            v-if="activeDropdown === 'department'"
            class="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <ul class="py-1 max-h-60 overflow-auto">
              <li>
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  @click="selectFilter('department', '')"
                >
                  All Departments
                </button>
              </li>
              <li v-for="dept in departments" :key="dept">
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  @click="selectFilter('department', dept)"
                >
                  {{ dept }}
                </button>
              </li>
              <li v-if="departments.length === 0" class="px-3 py-2 text-sm text-gray-500 italic">
                {{ loading ? 'Loading departments...' : 'No departments available' }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Program Filter -->
        <div class="relative">
          <button
            type="button"
            class="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
            @click="toggleDropdown('program')"
          >
            <span class="text-sm font-medium">
              {{ selectedProgram || 'Program' }}
            </span>
            <ChevronDown 
              class="w-4 h-4 transition-transform duration-200" 
              :class="{ 'rotate-180': activeDropdown === 'program' }" 
            />
          </button>
          
          <div
            v-if="activeDropdown === 'program'"
            class="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <ul class="py-1 max-h-60 overflow-auto">
              <li>
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  @click="selectFilter('program', '')"
                >
                  All Programs
                </button>
              </li>
              <li v-for="program in programs" :key="program">
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  @click="selectFilter('program', program)"
                >
                  {{ program }}
                </button>
              </li>
              <li v-if="programs.length === 0" class="px-3 py-2 text-sm text-gray-500 italic">
                {{ selectedDepartment ? 'No programs for this department' : (loading ? 'Loading programs...' : 'No programs available') }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Section Filter -->
        <div class="relative">
          <button
            type="button"
            class="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
            @click="toggleDropdown('section')"
          >
            <span class="text-sm font-medium">
              {{ selectedSection || 'Section' }}
            </span>
            <ChevronDown 
              class="w-4 h-4 transition-transform duration-200" 
              :class="{ 'rotate-180': activeDropdown === 'section' }" 
            />
          </button>
          
          <div
            v-if="activeDropdown === 'section'"
            class="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <ul class="py-1 max-h-60 overflow-auto">
              <li>
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  @click="selectFilter('section', '')"
                >
                  All Sections
                </button>
              </li>
              <li v-for="section in sections" :key="section">
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  @click="selectFilter('section', section)"
                >
                  {{ section }}
                </button>
              </li>
              <li v-if="sections.length === 0" class="px-3 py-2 text-sm text-gray-500 italic">
                {{ loading ? 'Loading sections...' : 'No sections available' }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <button 
        @click="clearAllFilters" 
        class="ml-6 text-sm text-gray-600 hover:text-gray-900"
      >
        Clear
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { Search, ChevronDown } from "lucide-vue-next";
import { useDepartment } from "@/stores/global/useDepartment.js";
import { useSection } from "@/stores/global/useSection.js";
import { useProgram } from "@/stores/global/useProgram.js";

// Props
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Object,
    default: () => ({
      search: "",
      academicYear: "",
      department: "",
      program: "",
      section: "",
      shift: ""
    })
  },
  groups: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'refresh']);

// Composables
const { departmentNames, getAllDepartments } = useDepartment();
const { sectionNames, getAllSections } = useSection();
const { programNames, getAllPrograms } = useProgram();

// Local state
const activeDropdown = ref(null);
const searchValue = ref(props.modelValue.search || "");
const selectedAcademicYear = ref(props.modelValue.academicYear || "");
const selectedDepartment = ref(props.modelValue.department || "");
const selectedProgram = ref(props.modelValue.program || "");
const selectedSection = ref(props.modelValue.section || "");
const selectedShift = ref(props.modelValue.shift || "");

// Click outside handler to close dropdowns
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    activeDropdown.value = null;
  }
};

onMounted(async () => {
  await Promise.all([
    getAllDepartments(),
    getAllPrograms(),
    getAllSections()
  ]);
  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
});

// Cleanup event listener
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Dynamic filter options from API data
const departments = computed(() => departmentNames.value);

// Filter programs based on selected department
const programs = computed(() => {
  if (!selectedDepartment.value) {
    return programNames.value;
  }
  
  // Get programs for the selected department
  const { getProgramsByDepartmentName } = useProgram();
  const filteredPrograms = getProgramsByDepartmentName(selectedDepartment.value);
  return filteredPrograms.map(program => program.program_name);
});

// Filter sections based on selected department
const sections = computed(() => {
  if (!selectedDepartment.value) {
    return sectionNames.value;
  }
  
  // Get sections for the selected department
  const { getSectionsByDepartmentName } = useSection();
  const filteredSections = getSectionsByDepartmentName(selectedDepartment.value);
  return filteredSections.map(section => section.name);
});

// Extract unique values from groups data
const academicYears = computed(() => {
  const years = [...new Set(props.groups.map(group => group.academic_year).filter(Boolean))];
  return years.sort().reverse(); // Most recent first
});

const shifts = computed(() => {
  const shiftValues = [...new Set(props.groups.map(group => group.shift).filter(Boolean))];
  return shiftValues.sort();
});

// Computed for current filter values
const currentFilters = computed(() => ({
  search: searchValue.value,
  academicYear: selectedAcademicYear.value,
  department: selectedDepartment.value,
  program: selectedProgram.value,
  section: selectedSection.value,
  shift: selectedShift.value
}));

// Watch for changes and emit to parent
watch(currentFilters, (newFilters) => {
  emit('update:modelValue', newFilters);
}, { deep: true });

// Methods
const toggleDropdown = (key) => {
  activeDropdown.value = activeDropdown.value === key ? null : key;
};

const selectFilter = (type, value) => {
  switch (type) {
    case 'academic_year':
      selectedAcademicYear.value = value;
      break;
    case 'department':
      selectedDepartment.value = value;
      // Clear program and section when department changes
      if (selectedProgram.value) {
        selectedProgram.value = '';
      }
      if (selectedSection.value) {
        selectedSection.value = '';
      }
      break;
    case 'program':
      selectedProgram.value = value;
      break;
    case 'section':
      selectedSection.value = value;
      break;
    case 'shift':
      selectedShift.value = value;
      break;
  }
  activeDropdown.value = null;
};

const clearAllFilters = () => {
  selectedAcademicYear.value = "";
  selectedDepartment.value = "";
  selectedProgram.value = "";
  selectedSection.value = "";
  selectedShift.value = "";
  searchValue.value = "";
};

const handleSearchChange = () => {
  // Debounce could be added here if needed
};

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  searchValue.value = newValue.search || "";
  selectedAcademicYear.value = newValue.academicYear || "";
  selectedDepartment.value = newValue.department || "";
  selectedProgram.value = newValue.program || "";
  selectedSection.value = newValue.section || "";
  selectedShift.value = newValue.shift || "";
}, { deep: true });
</script>
