<template>
  <Filter
    :key="filterKey"
    :filter-definitions="studentFilterDefinitions"
    :initial-filters="initialStudentFilters"
    clear-button-text="Clear"
    :auto-clear="true"
    @update:filters="handleFiltersUpdate"
    @clear-filters="handleClearFilters"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();
import Filter from "@/components/features/Filter.vue";
import provincesData from "@/db/CambodiaAdministrationArea/provinces.json";
import { useFilteredByDepartment, useProgramsFilteredByDepartment, useSectionsFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";

/** Props */
const props = defineProps({
  filterDefs: {
    type: Array,
    default: () => []
  }
});

/** Emits */
const emit = defineEmits(["update:filters", "clear-filters", "filter-change"]);

/** 🎯 USE THE NEW FilterByDepartment COMPOSABLES */
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

/** Reactive Data */
// Current filter values to track department changes
const currentFilters = ref({
  department: "All",
  program: "All", 
  section: "All"
});

// Loading state for all API data
const loadingData = computed(() => 
  departmentsLoading.value || programsLoading.value || sectionsLoading.value
);

// Filter key to force re-render when data loads
const filterKey = computed(() => {
  return `filter-${loadingData.value ? 'loading' : 'loaded'}-${departments.value.length}-${allPrograms.value.length}-${allSections.value.length}-${departmentFilterOptions.value.length}`;
});

// Fetch data from APIs using composables - FilterByDepartment handles this automatically
// onMounted(async () => {
//   await Promise.all([
//     getAllDepartments(),
//     getAllPrograms(),
//     getAllSections()
//   ]);
// });

/** Computed Properties */

// Generate origin options from provinces data
const originOptions = computed(() => [
  "All",
  ...provincesData.map((province) => province.name).sort(),
]);

// Generate dynamic options from API data using composables
const departmentFilterOptions = computed(() => {
  if (loadingData.value) return ["All", "Loading..."];
  // Ensure stable array reference by using a consistent mapping
  const deptNames = departmentOptions.value.map(d => d.department_name || d.name);
  return ["All", ...deptNames];
});

const sectionOptions = computed(() => {
  if (loadingData.value) return ["All", "Loading..."];
  const sectionsToShow = currentFilters.value.department !== "All" ? sectionsFiltered.value : allSections.value;
  return ["All", ...sectionsToShow.map(s => s.name)];
});

const programOptions = computed(() => {
  if (loadingData.value) return ["All", "Loading..."];
  const programsToShow = currentFilters.value.department !== "All" ? programsFiltered.value : allPrograms.value;
  return ["All", ...programsToShow.map(p => p.program_name)];
});

// Get current academic year as default
const getCurrentAcademicYear = () => {
  const currentYear = new Date().getFullYear();
  return `${currentYear}-${currentYear + 1}`;
};

// Generate academic year options dynamically (current year + 5 previous years)
const academicYearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = ["All"];
  
  for (let i = 0; i <= 5; i++) {
    const startYear = currentYear - i;
    const endYear = startYear + 1;
    years.push(`${startYear}-${endYear}`);
  }
  
  return years;
});

// Student-specific filter definitions
const studentFilterDefinitions = computed(() => {
  // Make this computed property reactive to locale changes
  const currentLocale = locale.value;
  if (props.filterDefs.length > 0) {
    return props.filterDefs;
  }
  const khmerClass = currentLocale === 'kh' ? 'khmer-text' : '';
  return [
    {
      key: "academic_year",
      label: t("academic_year"),
      options: academicYearOptions.value,
      className: khmerClass,
    },
    {
      key: "department",
      label: t("department"),
      options: departmentFilterOptions.value,
      className: khmerClass,
    },
    {
      key: "program",
      label: t("program"),
      options: programOptions.value,
      className: khmerClass,
    },
    {
      key: "section",
      label: t("section"),
      options: sectionOptions.value,
      className: khmerClass,
    },
    { 
      key: "origin", 
      label: t("origin"), 
      options: originOptions.value,
      className: khmerClass,
    },
    { 
      key: "gender", 
      label: t("gender"), 
      options: ["All", "Male", "Female"],
      className: khmerClass,
    },
    // {
    //   key: "promotion",
    //   label: t("promotion"),
    //   options: ["All", "Promoted", "Repeat"],
    //   className: khmerClass,
    // },
    // {
    //   key: "shift",
    //   label: t("shift"),
    //   options: ["All", "Morning", "Afternoon", "Evening"],
    //   className: khmerClass,
    // },
    // {
    //   key: "score_range",
    //   label: t("score_range"),
    //   options: ["All", "90-100", "80-89", "70-79", "<70"],
    //   className: khmerClass,
    // },
    // {
    //   key: "pass_fail",
    //   label: t("pass_fail"),
    //   options: ["All", "Pass", "Fail"],
    //   className: khmerClass,
    // },
  ];
});

// Initial filter values for students
const initialStudentFilters = computed(() => ({
  academic_year: "All",
  department: "All",
  program: "All",
  section: "All",
  origin: "All",
  gender: "All",
  promotion: "All",
  shift: "All",
  score_range: "All",
  pass_fail: "All",
}));

/** Event Handlers */
const handleFiltersUpdate = (filters) => {
  // Update current filters to trigger reactive updates
  currentFilters.value = { ...filters };
  emit("update:filters", filters);
};

// Force a re-render when department options change
watch(departmentFilterOptions, () => {
  // Trigger a re-computation by updating the filter key
  console.log('Department options changed, forcing re-render');
}, { deep: true });

const handleClearFilters = () => {
  // Reset current filters to match initial filters
  currentFilters.value = {
    academic_year: "All",
    department: "All",
    program: "All", 
    section: "All",
    origin: "All",
    gender: "All",
    promotion: "All",
    shift: "All",
    score_range: "All",
    pass_fail: "All",
  };
  emit("clear-filters");
};

const handleFilterChange = (changeInfo) => {
  emit("filter-change", changeInfo);
};

// Watch for department changes to update the filtered lists
watch(() => currentFilters.value.department, (newDept, oldDept) => {
  if (newDept !== oldDept) {
    // Update the filters based on selected department
    // Use the same field mapping as in departmentFilterOptions
    const selectedDept = departments.value.find(d => 
      (d.department_name || d.name) === newDept
    );
    if (selectedDept && newDept !== "All") {
      setProgramsDepartment(selectedDept.id);
      setSectionsDepartment(selectedDept.id);
    } else {
      setProgramsDepartment(''); // Reset to show all
      setSectionsDepartment(''); // Reset to show all
    }
  }
});

// Expose computed properties for parent component access if needed
defineExpose({
  studentFilterDefinitions,
  initialStudentFilters,
  departments,
  sections: allSections,
  programs: allPrograms,
  loadingData,
});
</script>