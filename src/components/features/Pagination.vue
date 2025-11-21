<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
    <!-- Results Info -->
    <div class="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
      Showing
      <span class="font-medium">{{ displayStart }}</span
      >–<span class="font-medium">{{ displayEnd }}</span>
      of
      <span class="font-medium">{{ totalItems }}</span>
      {{ itemLabel }}
    </div>

    <!-- Pagination Controls -->
    <div class="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
      <!-- First Page -->
      <button
        class="min-w-8 sm:min-w-9 h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
        :disabled="currentPage === 1"
        @click="goToPage(1)"
        :title="firstPageTitle"
      >
        «
      </button>

      <!-- Previous Page -->
      <button
        class="min-w-8 sm:min-w-9 h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
        :title="previousPageTitle"
      >
        <span class="hidden sm:inline">Prev</span>
        <span class="sm:hidden">‹</span>
      </button>

      <!-- Page Numbers -->
      <button
        v-for="pageNum in visiblePages"
        :key="pageNum"
        class="min-w-8 sm:min-w-9 h-8 sm:h-9 px-2 sm:px-3 rounded-lg text-xs sm:text-sm transition-colors"
        :class="
          pageNum === currentPage
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        "
        @click="goToPage(pageNum)"
        :title="`Go to page ${pageNum}`"
      >
        {{ pageNum }}
      </button>

      <!-- Next Page -->
      <button
        class="min-w-8 sm:min-w-9 h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
        :title="nextPageTitle"
      >
        <span class="hidden sm:inline">Next</span>
        <span class="sm:hidden">›</span>
      </button>

      <!-- Last Page -->
      <button
        class="min-w-8 sm:min-w-9 h-8 sm:h-9 px-2 sm:px-3 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
        :disabled="currentPage === totalPages"
        @click="goToPage(totalPages)"
        :title="lastPageTitle"
      >
        »
      </button>

      <!-- Page Size Selector -->
      <select
        v-if="showPageSizeSelector"
        :value="pageSize"
        @change="changePageSize($event.target.value)"
        class="ml-1 sm:ml-2 rounded-lg border border-gray-300 text-xs sm:text-sm px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-16 sm:min-w-20"
        :title="pageSizeTitle"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from "vue";

// Props
const props = defineProps({
  // Required props
  currentPage: {
    type: Number,
    required: true,
    validator: (value) => value >= 1,
  },
  totalItems: {
    type: Number,
    required: true,
    validator: (value) => value >= 0,
  },
  pageSize: {
    type: Number,
    required: true,
    validator: (value) => value >= 1,
  },

  // Optional customization props
  maxVisiblePages: {
    type: Number,
    default: 5,
    validator: (value) => value >= 3 && value % 2 === 1, // Must be odd number >= 3
  },
  pageSizeOptions: {
    type: Array,
    default: () => [10, 25, 50, 100],
    validator: (value) =>
      value.every((size) => typeof size === "number" && size > 0),
  },
  showPageSizeSelector: {
    type: Boolean,
    default: true,
  },
  itemLabel: {
    type: String,
    default: "items",
  },

  // Accessibility titles
  firstPageTitle: {
    type: String,
    default: "Go to first page",
  },
  previousPageTitle: {
    type: String,
    default: "Go to previous page",
  },
  nextPageTitle: {
    type: String,
    default: "Go to next page",
  },
  lastPageTitle: {
    type: String,
    default: "Go to last page",
  },
  pageSizeTitle: {
    type: String,
    default: "Items per page",
  },
});

// Emits
const emit = defineEmits([
  "update:currentPage",
  "update:pageSize",
  "pageChange",
  "pageSizeChange",
]);

// Computed properties
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.totalItems / props.pageSize));
});

const displayStart = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const displayEnd = computed(() => {
  return Math.min(props.totalItems, props.currentPage * props.pageSize);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = props.currentPage;
  
  // Responsive max visible pages based on screen size
  // Use fewer pages on mobile for better UX
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const maxVisible = isMobile ? Math.min(3, props.maxVisiblePages) : props.maxVisiblePages;

  if (total <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Calculate range around current page
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, current + half);

    // Adjust if we're near the beginning or end
    if (end - start + 1 < maxVisible) {
      if (start === 1) {
        end = Math.min(total, start + maxVisible - 1);
      } else if (end === total) {
        start = Math.max(1, end - maxVisible + 1);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});

// Methods
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value || page === props.currentPage) {
    return;
  }

  emit("update:currentPage", page);
  emit("pageChange", {
    page,
    pageSize: props.pageSize,
    totalPages: totalPages.value,
    totalItems: props.totalItems,
  });
};

const changePageSize = (newSize) => {
  const size = parseInt(newSize);
  if (size === props.pageSize || size < 1) {
    return;
  }

  // Calculate what the new current page should be to maintain position
  const currentItemStart = (props.currentPage - 1) * props.pageSize;
  const newCurrentPage = Math.floor(currentItemStart / size) + 1;

  emit("update:pageSize", size);
  emit("update:currentPage", newCurrentPage);
  emit("pageSizeChange", {
    pageSize: size,
    currentPage: newCurrentPage,
    totalPages: Math.max(1, Math.ceil(props.totalItems / size)),
    totalItems: props.totalItems,
  });
};

// Utility methods for external use
const goToFirstPage = () => goToPage(1);
const goToLastPage = () => goToPage(totalPages.value);
const goToNextPage = () => goToPage(props.currentPage + 1);
const goToPreviousPage = () => goToPage(props.currentPage - 1);

// Expose methods for parent component
defineExpose({
  goToPage,
  goToFirstPage,
  goToLastPage,
  goToNextPage,
  goToPreviousPage,
  changePageSize,
  totalPages: totalPages,
  displayStart: displayStart,
  displayEnd: displayEnd,
});
</script>

<style scoped>
/* Custom focus styles for better accessibility */
button:focus,
select:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Ensure consistent button sizing */
button {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  button {
    min-height: 36px;
  }
}

/* Smooth transitions */
button,
select {
  transition: all 0.2s ease-in-out;
}

/* Disabled state styling */
button:disabled {
  cursor: not-allowed;
}

button:disabled:hover {
  background-color: white !important;
}

/* Active page button styling */
button.bg-blue-600:hover {
  background-color: #2563eb;
}

/* Mobile-first responsive design */
@media (max-width: 640px) {
  /* Compact spacing and sizing for mobile */
  .min-w-8 {
    min-width: 2rem;
  }
  
  /* Stack layout on very small screens */
  .pagination-container {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  /* Ensure text is centered on mobile */
  .text-xs {
    text-align: center;
  }
  
  /* Reduce padding for mobile controls */
  .pagination-controls {
    padding: 0 8px;
  }
}

@media (max-width: 480px) {
  /* Hide first/last page buttons on very small screens */
  button:first-child,
  button:last-child {
    display: none;
  }
  
  /* Show fewer page numbers */
  .visible-pages {
    max-width: 120px;
    overflow: hidden;
  }
  
  /* Compact select dropdown */
  select {
    font-size: 12px;
    padding: 4px 8px;
    min-width: 60px;
  }
}

@media (max-width: 360px) {
  /* Ultra-compact for very small devices */
  button {
    min-width: 28px;
    height: 28px;
    padding: 0 6px;
    font-size: 12px;
  }
  
  /* Stack everything vertically */
  .flex {
    flex-direction: column;
    gap: 8px;
  }
  
  /* Full width controls */
  .pagination-controls {
    width: 100%;
    justify-content: center;
  }
}

/* Improved touch targets for mobile */
@media (max-width: 640px) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  select {
    min-height: 44px;
    padding: 8px 12px;
  }
}

/* Enhanced visual feedback */
button:active {
  transform: scale(0.95);
}

select:active {
  transform: scale(0.98);
}

/* Loading state support */
.pagination-loading {
  opacity: 0.6;
  pointer-events: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  button {
    border-width: 2px;
  }
  
  button.bg-blue-600 {
    background-color: #1e40af;
    border-color: #1e40af;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  button,
  select {
    transition: none;
  }
  
  button:active {
    transform: none;
  }
}
</style>
