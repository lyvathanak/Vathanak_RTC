<template>
  <Filter
    :filter-definitions="leaveRequestFilterDefinitions"
    :initial-filters="initialLeaveRequestFilters"
    clear-button-text="Clear"
    :auto-clear="true"
    @update:filters="handleFiltersUpdate"
    @clear-filters="handleClearFilters"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { computed } from "vue";
import Filter from "@/components/features/Filter.vue";

const emit = defineEmits(["update:filters", "clear-filters", "filter-change"]);

// Leave request-specific filter definitions
const leaveRequestFilterDefinitions = computed(() => [
  {
    key: "status",
    label: "Status",
    options: ["All", "Pending", "Approved", "Rejected"],
  },
  {
    key: "type",
    label: "Leave Type",
    options: ["All", "Annual", "Sick Leave", "Personal Leave", "Maternity", "Other"],
  },
  {
    key: "role",
    label: "Role",
    options: ["All", "Student", "Teacher", "HOD"],
  },
  {
    key: "academicYear",
    label: "Academic Year",
    options: ["All", "2025", "2024", "2023"],
  },
  {
    key: "department",
    label: "Department",
    options: ["All", "CS", "Math", "Physics"],
  },
  {
    key: "program",
    label: "Program",
    options: ["All", "IT", "Business", "Engineering"],
  },
  {
    key: "section",
    label: "Section",
    options: ["All", "A", "B", "C"],
  },
  {
    key: "semester",
    label: "Semester",
    options: ["All", "1", "2"],
  },
  {
    key: "date",
    label: "Date",
    options: ["All", "Today", "This Week", "This Month"],
  },
]);

const initialLeaveRequestFilters = computed(() => ({
  status: "All",
  type: "All",
  role: "All",
  academicYear: "All",
  program: "All",
  department: "All",
  section: "All",
  semester: "All",
  date: "All",
}));

function handleFiltersUpdate(filters) {
  emit("update:filters", filters);
}
function handleClearFilters() {
  emit("clear-filters");
}
function handleFilterChange(changeInfo) {
  emit("filter-change", changeInfo);
}
</script>
