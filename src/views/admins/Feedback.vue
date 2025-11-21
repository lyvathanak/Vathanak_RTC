<!-- src/components/Feedback.vue -->
<template>
  <section class="px-3 sm:px-6 lg:px-13 py-4 sm:py-6">
    <div class="flex items-center gap-2 mb-4 sm:mb-6">
      <Newspaper class="w-5 h-5 sm:w-6 sm:h-6" />
      <h2
        :class="[
          'text-lg sm:text-xl lg:text-2xl font-semibold text-[#235AA6]',
          locale === 'kh' ? 'khmer-text' : '',
        ]"
      >
        {{ t("feedback") }}
      </h2>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      :class="[
        'text-sm sm:text-base text-gray-500 border rounded-lg sm:rounded-xl p-4 sm:p-6 text-center',
        locale === 'kh' ? 'khmer-text' : '',
      ]"
    >
      <div class="flex items-center justify-center gap-2">
        <div class="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-gray-500"></div>
        {{ t("loading_feedback") }}
      </div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="items.length === 0"
      :class="[
        'text-sm sm:text-base text-gray-500 border rounded-lg sm:rounded-xl p-4 sm:p-6 text-center',
        locale === 'kh' ? 'khmer-text' : '',
      ]"
    >
      <div class="flex flex-col items-center gap-2">
        <Newspaper class="w-8 h-8 text-gray-400" />
        {{ t("no_feedback_yet") }}
      </div>
    </div>

    <!-- Feedback list -->
    <div v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
        <article
          v-for="fb in pagedItems"
          :key="fb.id"
          class="rounded-lg sm:rounded-xl bg-[#E3E3E3] p-3 sm:p-4"
        >
          <div class="space-y-2 sm:space-y-3">
            <div>
              <label
                :class="[
                  'block text-xs sm:text-sm text-gray-700 mb-1',
                  locale === 'kh' ? 'khmer-text' : '',
                ]"
              >
                {{ t("from") }}
              </label>
              <input
                :value="!fb.email ? t('anonymous') : fb.email"
                disabled
                class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border bg-white border-gray-300 rounded-md"
                :placeholder="t('email')"
              />
            </div>
            <div>
              <label
                :class="[
                  'block text-xs sm:text-sm text-gray-700 mb-1',
                  locale === 'kh' ? 'khmer-text' : '',
                ]"
              >
                {{ t("remark") }}
              </label>
              <textarea
                :value="fb.remark ?? '—'"
                readonly
                rows="3"
                class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border bg-white border-gray-300 rounded-md resize-none overflow-auto"
                :placeholder="t('remark')"
              />
            </div>
            <p v-if="fb.created_at" class="text-[10px] sm:text-[11px] text-gray-500">
              {{ fb.created_at }}
            </p>
          </div>
        </article>
      </div>

      <!-- Footer -->
      <div
        class="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-between"
      >
        <button
          type="button"
          @click="reload"
          :class="[
            'text-sm px-3 py-2 rounded-md border bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto',
          ]"
        >
          Reload
        </button>
        <Pagination
          v-if="totalPages > 1"
          :current-page="currentPage"
          :total-items="items.length"
          :page-size="pageSize"
          :show-page-size-selector="false"
          @update:currentPage="currentPage = $event"
        />
      </div>
    </div>
  </section>
</template>



<script setup>
import { ref, computed, onMounted, onUnmounted, defineExpose } from 'vue'
import api from '@/stores/apis/axios.js'
import { Newspaper } from 'lucide-vue-next'
import Pagination from '@/components/features/Pagination.vue'
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n();


const items = ref([])
const loading = ref(false)
const currentPage = ref(1)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

// Responsive page size: 4 on mobile, 6 on larger screens
const pageSize = computed(() => {
  return windowWidth.value < 640 ? 4 : 6 // sm breakpoint
})

const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize.value)))
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return items.value.slice(start, start + pageSize.value)
})

/** Load from GET /locations/get_all_feedbacks (LocationCRUD style) */
async function reload() {
  loading.value = true
  try {
    // Use the endpoint and response shape from Postman
    const res = await api.get('/feedbacks/get_feedbacks')
    // Response: { feedback: { data: [...] } }
    items.value = res?.data?.feedbacks?.data ?? []
    // Reset to first page on reload
    currentPage.value = 1
  } catch (e) {
    console.error('Failed to load feedback:', e)
    items.value = []
  } finally {
    loading.value = false
  }
}

/** Append newly created item from the submit form without refetch */
function append(newItem) {
  // Normalize fields in case backend returns null email
  items.value.unshift({
    id: newItem?.id,
    email: newItem?.email ?? null,
    remark: newItem?.remark ?? '',
    created_at: newItem?.created_at ?? new Date().toISOString()
  })
  // Optionally, go to first page to show new feedback
  currentPage.value = 1
}

onMounted(() => {
  reload()
  
  // Handle window resize for responsive page size
  const handleResize = () => {
    windowWidth.value = window.innerWidth
  }
  
  window.addEventListener('resize', handleResize)
  
  // Cleanup listener on unmount
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})
defineExpose({ append, reload })
</script>
