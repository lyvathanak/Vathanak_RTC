<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr class="text-xs uppercase text-gray-500">
          <th v-if="showSelection" class="w-10 px-3 py-3">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="handleSelectAll"
              :indeterminate="isIndeterminate"
            />
          </th>
          <th
            v-for="column in visibleColumns"
            :key="column.key"
            class="px-3 py-3 text-left font-medium"
            :class="column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''"
            @click="column.sortable ? handleSort(column.key) : null"
          >
            <div class="flex items-center gap-1">
              <span>{{ column.label }}</span>
              <span
                v-if="column.sortable && sortField === column.key"
                class="text-gray-400"
              >
                {{ sortDirection === "asc" ? "↑" : "↓" }}
              </span>
            </div>
          </th>
          <th v-if="showActions" class="px-3 py-3 text-left font-medium">
            Action
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-100 text-sm">
        <tr
          v-for="(row, index) in data"
          :key="getRowKey(row, index)"
          class="hover:bg-gray-50 transition-colors"
          :class="{ 'bg-blue-50': selectedIds.includes(getRowId(row)) }"
        >
          <td v-if="showSelection" class="px-3 py-3">
            <input
              type="checkbox"
              :value="getRowId(row)"
              :checked="selectedIds.includes(getRowId(row))"
              @change="handleRowSelect(getRowId(row))"
            />
          </td>

          <!-- Dynamic Columns -->
          <td
            v-for="column in visibleColumns"
            :key="column.key"
            class="px-3 py-3 text-gray-700"
          >
            <slot
              :name="`column-${column.key}`"
              :row="row"
              :value="getValue(row, column.key)"
              :column="column"
              :index="index"
            >
              <!-- Default column rendering -->
              <span v-if="column.type === 'badge'" 
                    :class="getBadgeClass(getValue(row, column.key), column.badgeConfig)">
                {{ formatValue(getValue(row, column.key), column) }}
              </span>
              <span v-else>
                {{ formatValue(getValue(row, column.key), column) }}
              </span>
            </slot>
          </td>

          <!-- Actions Column -->
          <td v-if="showActions" class="px-3 py-3 text-gray-700">
            <div class="flex items-center gap-2 action-buttons">
              <button
                v-if="showViewAction"
                class="inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 px-2.5 py-1.5 transition-colors"
                :title="viewActionTitle"
                @click="$emit('view', row)"
              >
                <Eye class="size-4" />
              </button>
              <button
                v-if="showEditAction"
                class="inline-flex items-center justify-center rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 transition-colors"
                :title="editActionTitle"
                @click="$emit('edit', row)"
              >
                <Pencil class="size-4" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger as-child>
                  <button
                    v-if="showDeleteAction"
                    class="inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 transition-colors"
                    :title="deleteActionTitle"
                  >
                    <Trash2 class="size-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle :class="isKhmer ? 'khmer-text' : ''">{{$t('delete_item')}}</AlertDialogTitle>
                    <AlertDialogDescription :class="isKhmer ? 'khmer-text' : ''">
                      {{$t('delete_item_confirm')}}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel :class="isKhmer ? 'khmer-text' : ''">{{$t('cancel')}}</AlertDialogCancel>
                    <AlertDialogAction class="bg-red-600 hover:bg-red-700 text-white" :class="isKhmer ? 'khmer-text' : ''" @click="$emit('delete', row)">{{$t('delete')}}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <!-- Custom Actions Slot -->
              <slot
                name="actions"
                :row="row"
                :index="index"
              ></slot>
            </div>
          </td>
        </tr>

        <!-- Empty State -->
        <!-- <tr v-if="!data.length && !loading">
          <td
            :colspan="totalColumns"
            class="px-3 py-12 text-center text-gray-500"
          >
            <div class="flex flex-col items-center gap-2">
              <div class="text-gray-400">
                <slot name="empty-icon">
                  <svg
                    class="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </slot>
              </div>
              <div class="text-lg font-medium text-gray-900">
                {{ emptyStateTitle }}
              </div>
              <div class="text-sm text-gray-500">{{ emptyStateMessage }}</div>
            </div>
          </td>
        </tr> -->

        <!-- Loading State -->
        <tr v-if="loading">
          <td :colspan="totalColumns" class="px-3 py-12 text-center">
            <div class="flex flex-col items-center gap-2">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
              ></div>
              <div class="text-sm text-gray-500">{{ loadingMessage }}</div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>

<script setup>
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from '@/components/ui/alert-dialog'
import { computed, defineProps, defineEmits } from "vue";
import { Eye, Pencil, Trash2 } from "lucide-vue-next";

import { useI18n } from 'vue-i18n';
const { locale } = useI18n();

const isKhmer = computed(() => locale.value === 'kh');

// Props
const props = defineProps({
  // Data props
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  
  // Row identification
  rowKey: {
    type: [String, Function],
    default: 'id_card'
  },

  // Selection props
  showSelection: {
    type: Boolean,
    default: false,
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },

  // Column configuration
  columns: {
    type: Array,
    required: true,
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
    default: "View details",
  },
  editActionTitle: {
    type: String,
    default: "Edit item",
  },
  deleteActionTitle: {
    type: String,
    default: "Delete item",
  },

  // Empty state customization
  emptyStateTitle: {
    type: String,
    default: "No data found",
  },
  emptyStateMessage: {
    type: String,
    default: "There is no data to display.",
  },

  // Loading message
  loadingMessage: {
    type: String,
    default: "Loading...",
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

// Computed properties
const visibleColumns = computed(() => {
  return props.columns.filter((column) => column.visible !== false);
});

const totalColumns = computed(() => {
  let count = visibleColumns.value.length;
  if (props.showSelection) count++;
  if (props.showActions) count++;
  return count;
});

const isAllSelected = computed(() => {
  return (
    props.data.length > 0 &&
    props.selectedIds.length === props.data.length
  );
});

const isIndeterminate = computed(() => {
  return (
    props.selectedIds.length > 0 &&
    props.selectedIds.length < props.data.length
  );
});

// Helper methods
const getRowKey = (row, index) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, index);
  }
  return row[props.rowKey] || index;
};

const getRowId = (row) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row);
  }
  return row[props.rowKey];
};

const getValue = (row, key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row);
};

const formatValue = (value, column) => {
  if (value === null || value === undefined) return 'N/A';
  
  switch (column.type) {
    case 'date':
      return formatDate(value);
    case 'currency':
      return formatCurrency(value);
    case 'number':
      return formatNumber(value);
    default:
      return value;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return dateString;
  }
};

const formatCurrency = (amount) => {
  if (isNaN(amount)) return amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatNumber = (number) => {
  if (isNaN(number)) return number;
  return new Intl.NumberFormat().format(number);
};

const getBadgeClass = (value, badgeConfig = {}) => {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  
  if (badgeConfig.classes && badgeConfig.classes[value]) {
    return `${baseClasses} ${badgeConfig.classes[value]}`;
  }
  
  return `${baseClasses} bg-gray-100 text-gray-800`;
};

// Event handlers
const handleSelectAll = () => {
  if (isAllSelected.value) {
    emit("selectAll", []);
  } else {
    emit(
      "selectAll",
      props.data.map((item) => getRowId(item))
    );
  }
};

const handleRowSelect = (itemId) => {
  emit("select", itemId);
};

const handleSort = (field) => {
  const column = props.columns.find((col) => col.key === field);
  if (!column || !column.sortable) return;

  let direction = "asc";
  if (props.sortField === field && props.sortDirection === "asc") {
    direction = "desc";
  }

  emit("sort", { field, direction });
};

// Expose methods for parent component
defineExpose({
  getValue,
  formatValue,
  formatDate,
  formatCurrency,
  formatNumber,
  getBadgeClass,
});
</script>

<style scoped>
/* Custom checkbox indeterminate state */
input[type="checkbox"]:indeterminate {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M4 8h8'/%3e%3c/svg%3e");
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Table responsive styles */
@media (max-width: 768px) {
  table {
    font-size: 12px;
  }

  .px-3 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .py-3 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}

/* Enhanced responsive styles for horizontal scroll */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Ensure minimum width for table on mobile */
@media (max-width: 640px) {
  table {
    min-width: 600px; /* Ensures horizontal scroll on very small screens */
  }
  
  /* Compact action buttons on mobile */
  .action-buttons button {
    padding: 0.375rem 0.5rem;
  }
  
  .action-buttons .size-4 {
    width: 1rem;
    height: 1rem;
  }
}

/* Hover effects */
tbody tr:hover {
  background-color: #f9fafb;
}

/* Selection highlight */
tbody tr.bg-blue-50:hover {
  background-color: #dbeafe;
}

/* Focus styles for accessibility */
button:focus,
input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Button transitions */
button {
  transition: all 0.2s ease-in-out;
}

/* Badge styles */
.inline-flex {
  white-space: nowrap;
}
</style>