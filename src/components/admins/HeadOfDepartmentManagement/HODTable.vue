<template>
  <ListTable
    :data="hods"
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
    @select="$emit('select', $event)"
    @selectAll="$emit('selectAll', $event)"
    @sort="$emit('sort', $event)"
  >
    <!-- ID Column Slot -->
    <template #column-id_card="{ value }">
      <span class="font-medium text-gray-700">{{ value }}</span>
    </template>

    <!-- Khmer Name Column Slot -->
    <template #column-khmer_name="{ value }">
      <div class="flex items-center">
        <div class="ml-4">
          <div class="text-sm font-medium text-gray-900 khmer-text">
            {{ value || 'N/A' }}
          </div>
        </div>
      </div>
    </template>

    <!-- Latin Name Column Slot -->
    <template #column-latin_name="{ value }">
      <div class="flex items-center">
        <div class="ml-4">
          <div class="text-sm font-medium text-gray-900">
            {{ value || 'N/A' }}
          </div>
        </div>
      </div>
    </template>

    <!-- Department Column Slot -->
    <template #column-department="{ value }">
      <span
        class="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium"
      >
        {{ value }}
      </span>
    </template>

    <!-- Phone Column Slot -->
    <template #column-phone="{ value }">
      <span class="text-sm text-gray-600">
        {{ formatPhone(value) }}
      </span>
    </template>

    <!-- Email Column Slot -->
    <template #column-email="{ value }">
      <span class="text-sm text-blue-600 hover:text-blue-800">
        {{ value }}
      </span>
    </template>

    <!-- Gender Column Slot -->
    <template #column-gender="{ value }">
      <span
        class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
        :class="getGenderBadgeClass(value)"
      >
        {{ value }}
      </span>
    </template>

  </ListTable>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import ListTable from "@/components/features/ListTable.vue";

// Props
const props = defineProps({
  // Data props
  hods: {
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
    default: "View HOD details",
  },
  editActionTitle: {
    type: String,
    default: "Edit HOD",
  },
  deleteActionTitle: {
    type: String,
    default: "Delete HOD",
  },

  // Empty state customization
  emptyStateTitle: {
    type: String,
    default: "No HODs found",
  },
  emptyStateMessage: {
    type: String,
    default:
      "There are no Head of Departments to display. Try adjusting your filters or add some HODs.",
  },

  // Loading message
  loadingMessage: {
    type: String,
    default: "Loading HODs...",
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

// Helper methods (HOD-specific formatting)
const getInitials = (name) => {
  if (!name) return "H";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

const getGenderBadgeClass = (gender) => {
  const classes = {
    Male: "bg-blue-50 text-blue-700",
    Female: "bg-pink-50 text-pink-700",
  };
  return classes[gender] || "bg-gray-50 text-gray-700";
};

const formatPhone = (phone) => {
  if (!phone) return "N/A";
  // Format phone number for Cambodia (+855)
  if (phone.startsWith("0")) {
    return phone.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  }
  return phone;
};

// Expose methods for parent component
defineExpose({
  getInitials,
  getGenderBadgeClass,
  formatPhone,
});
</script>
