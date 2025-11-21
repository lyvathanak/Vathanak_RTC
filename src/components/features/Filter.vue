<template>
  <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 px-3 sm:px-5">
    <!-- Mobile: Stack filters vertically, Desktop: Horizontal wrap -->
    <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
      <div v-for="f in filterDefinitions" :key="f.key" class="relative">
        <!-- pill as trigger -->
        <button
          type="button"
          class="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-gray-50 text-xs sm:text-sm min-w-0"
          @click="toggleDropdown(f.key)"
        >
          <span class="font-medium sm:font-bold truncate max-w-[120px] sm:max-w-none">
            {{ currentFilters[f.key] === "All" ? f.label : currentFilters[f.key] }}
          </span>
          <ChevronDown
            class="transition-transform duration-200 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
            :class="{ 'rotate-180': activeDropdown === f.key }"
          />
        </button>

        <!-- dropdown menu -->
        <div
          v-if="activeDropdown === f.key"
          class="absolute left-0 mt-1 w-40 sm:w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
        >
          <ul class="py-1 max-h-48 sm:max-h-60 overflow-auto">
            <li v-for="opt in f.options" :key="opt">
              <button
                type="button"
                class="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-100 truncate"
                @click="selectOption(f.key, opt)"
                :title="opt"
              >
                {{ opt }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Clear button with responsive positioning -->
    <button
      @click="clearFilters"
      class="text-xs sm:text-sm text-gray-600 hover:text-gray-900 mt-2 sm:mt-0 sm:ml-auto px-2 py-1 self-start sm:self-center"
    >
      {{ clearButtonText }}
    </button>
  </div>
</template>

<script setup>
import { ChevronDown } from "lucide-vue-next";
import { ref, reactive, watch, onMounted, onUnmounted } from "vue";

/** Props */
const props = defineProps({
  // Filter definitions - array of filter configurations
  filterDefinitions: {
    type: Array,
    required: true,
    validator: (filters) => {
      return filters.every(f => 
        f.key && 
        f.label && 
        Array.isArray(f.options) && 
        f.options.length > 0
      );
    }
  },
  
  // Initial filter values
  initialFilters: {
    type: Object,
    default: () => ({})
  },
  
  // Clear button text
  clearButtonText: {
    type: String,
    default: "Clear"
  },
  
  // Auto-clear behavior
  autoClear: {
    type: Boolean,
    default: true
  }
});

/** Emits */
const emit = defineEmits(["update:filters", "clear-filters", "filter-change"]);

/** State */
const activeDropdown = ref(null);

// Initialize filters based on filter definitions and initial values
const initializeFilters = () => {
  const filters = {};
  
  try {
    if (!Array.isArray(props.filterDefinitions)) {
      console.warn("Filter definitions is not an array:", props.filterDefinitions);
      return filters;
    }
    
    props.filterDefinitions.forEach(filterDef => {
      if (!filterDef || !filterDef.key || !Array.isArray(filterDef.options) || filterDef.options.length === 0) {
        console.warn("Invalid filter definition:", filterDef);
        return;
      }
      
      // Use initial value if provided, otherwise use first option or "All"
      const initialValue = props.initialFilters?.[filterDef.key];
      if (initialValue && filterDef.options.includes(initialValue)) {
        filters[filterDef.key] = initialValue;
      } else {
        // Default to "All" if available, otherwise first option
        filters[filterDef.key] = filterDef.options.includes("All") 
          ? "All" 
          : filterDef.options[0];
      }
    });
  } catch (error) {
    console.warn("Error initializing filters:", error);
  }
  
  return filters;
};

const currentFilters = reactive(initializeFilters());

/** Methods */
const toggleDropdown = (key) => {
  activeDropdown.value = activeDropdown.value === key ? null : key;
};

// Click outside handler to close dropdowns
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    activeDropdown.value = null;
  }
};

const selectOption = (key, value) => {
  try {
    if (!key || value === undefined) {
      console.warn("Invalid select option parameters:", { key, value });
      return;
    }
    
    currentFilters[key] = value;
    activeDropdown.value = null;
    
    // Emit events
    emit("update:filters", { ...currentFilters });
    emit("filter-change", { key, value, allFilters: { ...currentFilters } });
  } catch (error) {
    console.warn("Error selecting option:", error);
  }
};

const clearFilters = () => {
  try {
    // Reset all filters to their default values
    props.filterDefinitions.forEach(filterDef => {
      if (filterDef && filterDef.key && Array.isArray(filterDef.options) && filterDef.options.length > 0) {
        const defaultValue = filterDef.options.includes("All") 
          ? "All" 
          : filterDef.options[0];
        currentFilters[filterDef.key] = defaultValue;
      }
    });
    
    // Emit events
    emit("clear-filters");
    emit("update:filters", { ...currentFilters });
  } catch (error) {
    console.warn("Error clearing filters:", error);
  }
};

const resetFilters = () => {
  try {
    Object.assign(currentFilters, initializeFilters());
    emit("update:filters", { ...currentFilters });
  } catch (error) {
    console.warn("Error resetting filters:", error);
  }
};

// Watch for changes in filter definitions to reinitialize
watch(() => props.filterDefinitions, (newDefs, oldDefs) => {
  try {
    // Only reinitialize if filter definitions actually changed
    if (JSON.stringify(newDefs) !== JSON.stringify(oldDefs)) {
      const newFilters = initializeFilters();
      Object.keys(currentFilters).forEach(key => {
        delete currentFilters[key];
      });
      Object.assign(currentFilters, newFilters);
    }
  } catch (error) {
    console.warn("Error updating filters from filter definitions:", error);
  }
}, { deep: true });

// Watch for changes in initial filters
watch(() => props.initialFilters, (newInitial, oldInitial) => {
  try {
    // Only reinitialize if initial filters actually changed
    if (JSON.stringify(newInitial) !== JSON.stringify(oldInitial)) {
      const newFilters = initializeFilters();
      Object.keys(currentFilters).forEach(key => {
        delete currentFilters[key];
      });
      Object.assign(currentFilters, newFilters);
    }
  } catch (error) {
    console.warn("Error updating filters from initial filters:", error);
  }
}, { deep: true });

// Initialize on mount
onMounted(() => {
  try {
    emit("update:filters", { ...currentFilters });
    // Add click outside listener
    document.addEventListener('click', handleClickOutside);
  } catch (error) {
    console.warn("Error emitting initial filters:", error);
  }
});

// Cleanup event listener
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Expose methods and state for parent component access
defineExpose({
  currentFilters,
  clearFilters,
  resetFilters,
  selectOption
});
</script>

<style scoped>
/* Custom dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>