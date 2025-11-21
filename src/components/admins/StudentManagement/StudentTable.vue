<template>
  <ListTable
    :data="students"
    :loading="loading"
    :show-selection="showSelection"
    :selected-ids="selectedIds"
    :columns="columns"
    :sort-field="sortField"
    :sort-direction="sortDirection"
    :show-actions="showActions"
    :show-view-action="showViewAction"
    :show-edit-action="showEditAction"
    :show-delete-action="showDeleteAction"
    :view-action-title="viewActionTitle"
    :edit-action-title="editActionTitle"
    :delete-action-title="deleteActionTitle"
    :empty-state-title="emptyStateTitle"
    :empty-state-message="emptyStateMessage"
    :loading-message="loadingMessage"
    row-key="id"
    @view="$emit('view', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
    @select="$emit('select', $event)"
    @selectAll="$emit('selectAll', $event)"
    @sort="$emit('sort', $event)"
  >
    <!-- ID Column Slot -->
    <template #column-id_card="{ value }">
      <span class="font-medium text-gray-700">{{ value }}</span>
    </template>

    <!-- Khmer name Column Slot -->
    <template #column-khmer_name="{ value }">
      <span class="font-medium text-gray-700 khmer-text">{{ value }}</span>
    </template>

    <!-- Latin name Column Slot -->
    <template #column-latin_name="{ value }">
      <span class="font-medium text-gray-700">{{ value }}</span>
    </template>

    <!-- Gender Column Slot -->
    <template #column-gender="{ value }">
      <span
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
        :class="getGenderBadgeClass(value)"
      >
        {{ getGenderLabel(value) }}
      </span>
    </template>

    <!-- Department Column Slot -->
    <template #column-department_id="{ value, row }">
      <span
        class="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
      >
        {{ getDepartmentName(value) }}
      </span>
    </template>

    <!-- Section/Sub-Department Column Slot -->
    <template #column-sub_department_id="{ value, row }">
      <span
        class="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium"
      >
        {{ getSectionName(value) }}
      </span>
    </template>

    <!-- Date of Birth Column Slot -->
    <template #column-date_of_birth="{ value }">
      {{ formatDate(value) }}
    </template>

    <!-- Phone Column Slot -->
    <template #column-phone_number="{ value }">
      <span class="font-mono">{{ value || 'N/A' }}</span>
    </template>

    <!-- Email Column Slot -->
    <template #column-email="{ value }">
      <span class="text-blue-600 hover:underline">{{ value || 'N/A' }}</span>
    </template>

    <!-- Academic Year Column Slot -->
    <template #column-academic_year="{ value }">
      <span class="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium">
        {{ value }}
      </span>
    </template>

    <!-- Program Column Slot -->
    <template #column-program="{ value }">
      <span class="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
        {{ value }}
      </span>
    </template>

    <!-- Grade Column Slot -->
    <template #column-grade="{ value }">
      <span class="inline-flex items-center px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 text-xs font-medium">
        {{ value || 'N/A' }}
      </span>
    </template>

    <!-- Custom Actions Slot -->
    <template #actions="{ row, index }">
      <slot name="actions" :row="row" :index="index"></slot>
    </template>

  </ListTable>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import ListTable from "@/components/features/ListTable.vue";

// Props
const props = defineProps({
  // Data props
  students: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },

  // Selection props
  showSelection: {
    type: Boolean,
    default: true,
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },

  // Column configuration
  columns: {
    type: Array,
    default: () => [
      { key: "id_card", label: "ID Card", visible: true, sortable: true },
      { key: "khmer_name", label: "Khmer Name", visible: true, sortable: true },
      { key: "latin_name", label: "Latin Name", visible: true, sortable: true },
      { key: "gender", label: "Gender", visible: true, sortable: true },
      { key: "date_of_birth", label: "Date of Birth", visible: true, sortable: true, type: "date" },
      { key: "phone_number", label: "Phone", visible: true, sortable: true },  // Changed from phone
      { key: "email", label: "Email", visible: true, sortable: true },
      { key: "department_id", label: "Department", visible: true, sortable: true }, // Changed from department
      { key: "sub_department_id", label: "Section", visible: true, sortable: true }, // Changed from section
      { key: "academic_year", label: "Academic Year", visible: true, sortable: true },
      { key: "program_id", label: "Program", visible: true, sortable: true }, // Changed from degree to program_id
      { key: "grade", label: "Grade", visible: true, sortable: true }
    ],
  },

  // Sorting props
  sortField: {
    type: String,
    default: "",
  },
  sortDirection: {
    type: String,
    default: "asc",
    validator: (value) => ["asc", "desc"].includes(value),
  },

  // Action props
  showActions: {
    type: Boolean,
    default: true,
  },
  showViewAction: {
    type: Boolean,
    default: true,
  },
  showEditAction: {
    type: Boolean,
    default: true,
  },
  showDeleteAction: {
    type: Boolean,
    default: true,
  },

  // Action titles (for accessibility)
  viewActionTitle: {
    type: String,
    default: "View student details",
  },
  editActionTitle: {
    type: String,
    default: "Edit student",
  },
  deleteActionTitle: {
    type: String,
    default: "Delete student",
  },

  // Empty state customization
  emptyStateTitle: {
    type: String,
    default: "No students found",
  },
  emptyStateMessage: {
    type: String,
    default:
      "There are no students to display. Try adjusting your filters or add some students.",
  },

  // Loading message
  loadingMessage: {
    type: String,
    default: "Loading students...",
  },
});

// Emits
const emit = defineEmits([
  "view",
  "edit",
  "delete",
  "select",
  "selectAll",
  "sort",
]);

import { ref, onMounted } from 'vue';
import { useDepartment } from '@/stores/global/useDepartment';
import { useSection } from '@/stores/global/useSection';

// Use composables for department and section data
const { departments, getAllDepartments, getDepartmentById } = useDepartment();
const { sections, getAllSections, getSectionById } = useSection();

// Fetch data on component mount
onMounted(async () => {
  try {
    await Promise.all([
      getAllDepartments(),
      getAllSections()
    ]);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
});

// Department name lookup
const getDepartmentName = (id) => {
  const dept = getDepartmentById(id);
  return dept ? dept.department_name : 'N/A';
};

// Section name lookup
const getSectionName = (id) => {
  const section = getSectionById(id);
  return section ? section.name : 'N/A';
};

// Helper methods (student-specific formatting)
const formatDate = (dateString) => {
  return dateString || "N/A";
};

const getGenderLabel = (gender) => {
  const labels = {
    Male: "Male",
    Female: "Female",
    male: "Male",
    female: "Female",
  };
  return labels[gender] || gender || "N/A";
};

const getGenderBadgeClass = (gender) => {
  const classes = {
    Male: "bg-blue-100 text-blue-800",
    Female: "bg-pink-100 text-pink-800",
    male: "bg-blue-100 text-blue-800",
    female: "bg-pink-100 text-pink-800",
  };
  return classes[gender] || "bg-gray-100 text-gray-800";
};

// Expose methods for parent component
defineExpose({
  formatDate,
  getGenderLabel,
  getGenderBadgeClass,
  getDepartmentName,
  getSectionName,
}); 
</script>
