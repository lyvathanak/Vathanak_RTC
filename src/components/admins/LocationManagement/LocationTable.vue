<template>
  <ListTable
    :data="locations"
    :columns="columns"
    :loading="loading"
    :show-selection="false"
    :show-actions="true"
    :show-view-action="true"
    :show-edit-action="true"
    :show-delete-action="true"
    :view-action-title="'View Location'"
    :edit-action-title="'Edit Location'"
    :delete-action-title="'Delete Location'"
    :empty-state-title="'No Locations Found'"
    :empty-state-message="'There are no locations to display. Add a new location to get started.'"
    @view="handleView"
    @edit="handleEdit"
    @delete="handleDelete"
  >
    <!-- Custom Room Name Column -->
    <template #column-room_name="{ row, value }">
      <div class="flex items-center">
        <div class="font-medium text-gray-900">
          {{ row.name }}
        </div>
      </div>
    </template>

    <!-- Custom Floor Column -->
    <template #column-floor="{ row, value }">
      <div class="flex items-center">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Floor {{ row.floor }}
        </span>
      </div>
    </template>

    <!-- Custom Empty State Icon -->
    <template #empty-icon>
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
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    </template>
  </ListTable>
</template>

<script setup>
import { computed } from 'vue';
import ListTable from '@/components/features/ListTable.vue';

// Props
const props = defineProps({
  locations: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['view', 'edit', 'delete']);

// Column configuration
const columns = computed(() => [
  {
    key: 'room_name',
    label: 'Room name',
    sortable: true,
    visible: true
  },
  {
    key: 'floor',
    label: 'Floor',
    sortable: true,
    visible: true,
    type: 'badge'
  }
]);

// Event handlers
const handleView = (location) => {
  emit('view', location);
};

const handleEdit = (location) => {
  emit('edit', location);
};

const handleDelete = (location) => {
  emit('delete', location);
};
</script>

<style scoped>
/* Additional styling if needed */
</style>
