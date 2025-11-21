<template>
  <ListTable
    :data="teachers"
    :loading="loading"
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
    @sort="$emit('sort', $event)"
  >
    <!-- ID Column Slot -->
    <template #column-id_card="{ value }">
      <span class="font-medium text-gray-700">{{ value }}</span>
    </template>

    <!-- Khmer Name Column Slot -->
    <template #column-khmer_name="{ value }">
      <div class="text-sm font-medium text-gray-900 khmer-text">
        {{ value || 'N/A' }}
      </div>
    </template>

    <!-- Latin Name Column Slot -->
    <template #column-latin_name="{ value }">
      <div class="text-sm font-medium text-gray-900">
        {{ value || 'N/A' }}
      </div>
    </template>

    <!-- Department Column Slot -->
    <template #column-department="{ value }">
      <span
        class="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium"
      >
        {{ value || 'N/A' }}
      </span>
    </template>

    <!-- Department Name Column Slot -->
    <template #column-department_name="{ value }">
      <span
        class="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium"
      >
        {{ value || 'N/A' }}
      </span>
    </template>

    <!-- Position Column Slot -->
    <template #column-position="{ value }">
      <span
        class="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium"
      >
        {{ value || 'N/A' }}
      </span>
    </template>

    <!-- Program Column Slot -->
    <template #column-program="{ value }">
      <span
        class="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
      >
        {{ value || 'N/A' }}
      </span>
    </template>

    <!-- Phone Column Slot -->
    <template #column-phone_number="{ value }">
      <span class="text-sm text-gray-600">
        {{ formatPhone(value) }}
      </span>
    </template>

    <!-- Section Column Slot -->
    <template #column-section="{ value }">
      <span
        class="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
      >
        {{ value || 'N/A' }}
      </span>
    </template>

    <!-- Email Column Slot -->
    <template #column-email="{ value }">
      <span class="text-sm text-blue-600 hover:text-blue-800">
        {{ value }}
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
  teachers: {
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
      { key: "id_card", label: "ID", visible: true, sortable: true },
      {
        key: "khmer_name",
        label: "Khmer Name",
        visible: true,
        sortable: true,
      },
      {
        key: "latin_name",
        label: "Latin Name",
        visible: true,
        sortable: true,
      },
      { key: "email", label: "Email", visible: true, sortable: true },
      { key: "phone_number", label: "Phone", visible: true, sortable: false },
      { key: "department", label: "Department", visible: true, sortable: true },
      { key: "section", label: "Section", visible: true, sortable: true },
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
    default: "View teacher details",
  },
  editActionTitle: {
    type: String,
    default: "Edit teacher",
  },
  deleteActionTitle: {
    type: String,
    default: "Delete teacher",
  },

  // Empty state customization
  emptyStateTitle: {
    type: String,
    default: "No teachers found",
  },
  emptyStateMessage: {
    type: String,
    default:
      "There are no teachers to display. Try adjusting your filters or add some teachers.",
  },

  // Loading message
  loadingMessage: {
    type: String,
    default: "Loading teachers...",
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

// Helper methods (teacher-specific formatting)
const getInitials = (name) => {
  if (!name) return "T";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

const getStatusBadgeClass = (status) => {
  const classes = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-red-100 text-red-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Suspended: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

const formatPhone = (phone) => {
  if (!phone) return "N/A";
  // Format phone number (you can customize this based on your needs)
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
};

// Expose methods for parent component
defineExpose({
  getInitials,
  getStatusBadgeClass,
  formatPhone,
});
</script>


