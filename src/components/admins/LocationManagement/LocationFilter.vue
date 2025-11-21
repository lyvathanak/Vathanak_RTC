<template>
  <Filter
    :filter-definitions="filterDefinitions"
    :initial-filters="initialFilters"
    :clear-button-text="'Clear'"
    :auto-clear="true"
    @update:filters="handleFiltersUpdate"
    @clear-filters="handleClearFilters"
    @filter-change="handleFilterChange"
  />
</template>

<script setup>
import { computed } from 'vue';
import Filter from '@/components/features/Filter.vue';

// Props
const props = defineProps({
  // Available floors for filtering (required, must be provided by parent)
  floors: {
    type: Array,
    required: true
  },
  // Initial filter values
  initialFilters: {
    type: Object,
    default: () => ({
      floor: 'All'
    })
  }
});

// Emits
const emit = defineEmits(['update:filters', 'clear-filters', 'filter-change']);

// Filter definitions configuration
const filterDefinitions = computed(() => [
  {
    key: 'floor',
    label: 'Floor',
    options: ['All', ...props.floors]
  }
]);

// Event handlers
const handleFiltersUpdate = (filters) => {
  emit('update:filters', filters);
};

const handleClearFilters = () => {
  emit('clear-filters');
};

const handleFilterChange = (changeData) => {
  emit('filter-change', changeData);
};
</script>

<style scoped>
/* Additional styling if needed */
</style>
