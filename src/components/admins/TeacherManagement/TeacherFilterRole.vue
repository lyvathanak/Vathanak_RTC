<template>
  <Filter
    :key="filterKey"
    :filter-definitions="teacherFilterDefinitions"
    :initial-filters="initialTeacherFilters"
    clear-button-text="Clear"
    :auto-clear="true"
    @update:filters="handleFiltersUpdate"
    @clear-filters="handleClearFilters"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { computed, ref, watch } from "vue";
import Filter from "@/components/features/Filter.vue";
import provincesData from "@/db/CambodiaAdministrationArea/provinces.json";
import { useFilteredByDepartment, useProgramsFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";

/** Props */
const props = defineProps({
  filterDefs: {
    type: Array,
    default: () => []
  }
});

/** Emits */
const emit = defineEmits(["update:filters", "clear-filters", "filter-change"]);

/** 🎯 USE THE FilterByDepartment COMPOSABLES */
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

function getDeptIdByName(name) {
  const d = departmentOptions.value.find(x => (x.department_name || x.name) === name);
  return d?.id ?? null;
}

function getProgramIdByName(name) {
  // search both filtered and all, to be safe
  const p = programsFiltered.value.find(x => x.program_name === name)
        ?? allPrograms.value.find(x => x.program_name === name);
  return p?.id ?? null;
}


/** Reactive Data */
// Current filter values to track department changes
const currentFilters = ref({
  department: "All",
  program: "All"
});

// Loading state for all API data
const loadingData = computed(() => 
  departmentsLoading.value || programsLoading.value
);

// Filter key to force re-render when data loads
const filterKey = computed(() => {
  return `filter-${loadingData.value ? 'loading' : 'loaded'}-${departments.value.length}-${allPrograms.value.length}-${departmentFilterOptions.value.length}`;
});

/** Computed Properties */

// Generate origin options from provinces data
const originOptions = computed(() => [
  "All",
  ...provincesData.map((province) => province.name).sort(),
]);

const departmentFilterOptions = computed(() => {
  if (loadingData.value) return ["All", "Loading..."];
  return ["All", ...departmentOptions.value.map(d => (d.department_name || d.name))];
});

const programOptions = computed(() => {
  if (loadingData.value) return ["All", "Loading..."];
  const programsToShow = currentFilters.value.department !== "All" ? programsFiltered.value : allPrograms.value;
  return ["All", ...programsToShow.map(p => p.program_name)];
});

// Get current academic year as default
const getCurrentAcademicYear = () => {
  return "2024-2025";
};

// Teacher-specific filter definitions using dynamic data
const teacherFilterDefinitions = computed(() => {
  if (props.filterDefs.length > 0) return props.filterDefs;

  return [
    { key: "academic_year", label: "Academic Year", options: ["All", "2022-2023", "2023-2024", "2024-2025"] },
    { key: "department", label: "Department", options: departmentFilterOptions.value },
    { key: "origin",     label: "Origin",     options: originOptions.value },
    { key: "gender",     label: "Gender",     options: ["All", "Male", "Female"] },
  ];
});


// Initial filter values for teachers
const initialTeacherFilters = computed(() => ({
  academic_year: getCurrentAcademicYear(),
  department: "All", // value matches options.value
  program: "All",
  origin: "All",
  gender: "All",
}));

/** Event Handlers */
const handleFiltersUpdate = (filters) => {
  currentFilters.value = { ...filters };

  const clean = {};
  if (filters.academic_year && filters.academic_year !== "All") clean.academic_year = filters.academic_year;

  if (filters.department && filters.department !== "All") {
    const id = getDeptIdByName(filters.department);
    if (id != null) clean.department_id = Number(id);
  }

  if (filters.program && filters.program !== "All") {
    const id = getProgramIdByName(filters.program);
    if (id != null) clean.program_id = Number(id);
  }

  if (filters.origin && filters.origin !== "All") clean.origin = filters.origin;
  if (filters.gender && filters.gender !== "All") clean.gender = filters.gender;

  emit("update:filters", clean);
};



const handleClearFilters = () => {
  // Reset current filters to match initial filters
  currentFilters.value = {
    academic_year: getCurrentAcademicYear(),
    department: "All",
    program: "All",
    origin: "All",
    gender: "All",
  };
  emit("clear-filters");
};

const handleFilterChange = (changeInfo) => {
  emit("filter-change", changeInfo);
};

// Force a re-render when department options change
watch(departmentFilterOptions, () => {
  console.log('Department options changed, forcing re-render');
}, { deep: true });

// Watch for department changes to update the filtered lists
watch(() => currentFilters.value.department, (newDept, oldDept) => {
  if (newDept !== oldDept) {
    if (newDept && newDept !== "All" && newDept !== "Loading...") {
      const id = getDeptIdByName(newDept);
      setProgramsDepartment(id ?? "");
    } else {
      setProgramsDepartment("");
    }
  }
});

// Expose computed properties for parent component access if needed
defineExpose({
  teacherFilterDefinitions,
  initialTeacherFilters,
  departments,
  programs: allPrograms,
  loadingData,
});
</script>
