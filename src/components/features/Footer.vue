<template>
  <footer class="flex flex-col lg:flex-row items-start lg:items-end bg-[#E3E3E3] py-4 sm:py-6 lg:py-8 px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 gap-4 sm:gap-6 lg:gap-8 justify-between">
    <!-- Contact Form Section -->
    <div class="w-full xl-w-fit px-0 sm:px-2 md:px-4 lg:px-6">
      <div>
        <div class="flex flex-col gap-1 sm:gap-2 mb-4 sm:mb-6">
          <h1
            :class="[
              'text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900',
              locale === 'kh' ? 'khmer-text' : '',
            ]"
          >
            {{ t("contact_here") }}
          </h1>
          <p
            :class="[
              'text-xs sm:text-sm md:text-base text-[#74828F]',
              locale === 'kh' ? 'khmer-text' : '',
            ]"
          >
            {{ t("feedback_more_info") }}
          </p>
        </div>

        <form @submit.prevent="submitForm" class="space-y-3 sm:space-y-4 lg:space-y-5">
          <!-- Email Address Field -->
          <div>
            <label
              for="email"
              :class="[
                'block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2',
                locale === 'kh' ? 'khmer-text' : '',
              ]"
            >
              {{ t("email_address") }}
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              :placeholder="t('enter_email_address')"
              :class="[
                'w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
                locale === 'kh' ? 'khmer-text' : ''
              ]"
            />
          </div>

          <!-- Add Remark Field -->
          <div>
            <label
              for="remark"
              :class="[
                'block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 sm:mb-2',
                locale === 'kh' ? 'khmer-text' : '',
              ]"
            >
              {{ t("add_remark") }} <span class="text-red-500">*</span>
            </label>
            <textarea
              id="remark"
              v-model="formData.remark"
              :placeholder="t('enter_remark_here')"
              :rows="3"
              class="min-h-[60px] sm:min-h-[80px] md:min-h-[100px]"
              :class="[
                'w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200',
                locale === 'kh' ? 'khmer-text' : ''
              ]"
              required
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="submitting"
            :class="[
              'w-full sm:w-auto bg-[#235AA6] hover:bg-[#1e4a8c] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 sm:py-2.5 md:py-3 px-4 sm:px-6 md:px-8 rounded-md text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200',
              locale === 'kh' ? 'khmer-text' : '',
            ]"
          >
            {{ submitting ? 'Submitting...' : t("submit_here") }}
          </button>
        </form>
      </div>
    </div>

    <!-- Copyright Section -->
    <div class="text-center xl:text-right w-full mt-4 sm:mt-6 lg:mt-0">
      <p class="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
        Copyright © 2025 RTC | Battambang. All rights reserved.
      </p>
    </div>
  </footer>
</template>


<script setup>
import { ref } from 'vue'
import api from '@/stores/apis/axios.js'
import { useI18n } from 'vue-i18n'
import { showNotification } from '@/lib/notifications.js'
const {t, locale} = useI18n()

// Form data reactive object
const formData = ref({
    email: '',
    remark: ''
})

const submitting = ref(false)

// Submit form function
const submitForm = async () => {
    if (!formData.value.remark.trim()) {
        showNotification('Please enter a remark before submitting.', 'error')
        return
    }
    submitting.value = true
    try {
        // POST to backend
        const res = await api.post('/feedbacks/submit_feedback', {
            email: formData.value.email,
            remark: formData.value.remark
        })
        // Success: show message
        showNotification('Feedback submitted successfully! Thank you for your input.', 'success')
        formData.value.email = ''
        formData.value.remark = ''
    } catch (e) {
        // Error: show message
        let msg = e?.response?.data?.message || 'Failed to submit feedback. Please try again.'
        showNotification(msg, 'error')
        console.error('Feedback submit error:', e)
    } finally {
        submitting.value = false
    }
}
</script>