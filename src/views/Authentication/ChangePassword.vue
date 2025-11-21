<template>
  <div class="min-h-screen bg-gray-200 flex items-center justify-center p-4 sm:p-6 lg:p-8">
    <div class="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl p-6 sm:p-8 lg:p-10">
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Change Password</h1>
        <p class="text-xs sm:text-sm lg:text-base text-gray-600">Please enter your current password and choose a new password</p>
      </div>

      <!-- Change Password Form -->
      <form @submit.prevent="handleChangePassword" class="space-y-4 sm:space-y-5 lg:space-y-6" name="change-password-form">
        <!-- Current Password -->
        <div>
          <label class="block text-sm sm:text-base font-medium text-gray-700 mb-2">
            Current Password <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="formData.current_password"
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="Enter current password"
              autocomplete="current-password"
              class="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              :class="{ 'border-red-500': errors.current_password }"
              required
            />
            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              class="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Eye v-if="showCurrentPassword" class="w-4 h-4 sm:w-5 sm:h-5" />
              <EyeOff v-else class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <p v-if="errors.current_password" class="text-red-500 text-xs sm:text-sm mt-1">
            {{ errors.current_password[0] }}
          </p>
        </div>

        <!-- New Password -->
        <div>
          <label class="block text-sm sm:text-base font-medium text-gray-700 mb-2">
            New Password <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="formData.new_password"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="Enter new password"
              autocomplete="new-password"
              class="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              :class="{ 'border-red-500': errors.new_password }"
              required
              minlength="8"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Eye v-if="showNewPassword" class="w-4 h-4 sm:w-5 sm:h-5" />
              <EyeOff v-else class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <p v-if="errors.new_password" class="text-red-500 text-xs sm:text-sm mt-1">
            {{ errors.new_password[0] }}
          </p>
          <p class="text-gray-500 text-xs sm:text-sm mt-1">Password must be at least 8 characters long</p>
        </div>

        <!-- Confirm New Password -->
        <div>
          <label class="block text-sm sm:text-base font-medium text-gray-700 mb-2">
            Confirm New Password <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="formData.new_password_confirmation"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Re-enter new password"
              autocomplete="new-password"
              class="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              :class="{ 'border-red-500': errors.new_password_confirmation }"
              required
              minlength="8"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Eye v-if="showConfirmPassword" class="w-4 h-4 sm:w-5 sm:h-5" />
              <EyeOff v-else class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <p v-if="errors.new_password_confirmation" class="text-red-500 text-xs sm:text-sm mt-1">
            {{ errors.new_password_confirmation[0] }}
          </p>
          <p v-else-if="passwordMismatch" class="text-red-500 text-xs sm:text-sm mt-1">
            Passwords do not match
          </p>
        </div>

        <!-- Submit Button -->
        <div class="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-3">
          <button
            type="button"
            @click="handleCancel"
            class="w-full sm:flex-1 px-4 py-2.5 sm:py-3 lg:py-3.5 border bg-red-500 border-gray-300 rounded-lg text-white font-medium hover:bg-red-600 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || passwordMismatch"
            class="w-full sm:flex-1 px-4 py-2.5 sm:py-3 lg:py-3.5 bg-[#235AA6] text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg
              v-if="loading"
              class="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? 'Changing...' : 'Change Password' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { changePassword } from '@/stores/Authentication/ChangePassword'
import { showNotification } from '@/lib/notifications.js'

const router = useRouter()
const route = useRoute()

// Form data
const formData = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

// UI state
const loading = ref(false)
const errors = ref({})
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Computed
const passwordMismatch = computed(() => {
  return formData.value.new_password !== '' && 
         formData.value.new_password_confirmation !== '' &&
         formData.value.new_password !== formData.value.new_password_confirmation
})

// Methods
const handleChangePassword = async () => {
  // Clear previous errors
  errors.value = {}

  // Client-side validation
  if (formData.value.new_password !== formData.value.new_password_confirmation) {
    showNotification('New passwords do not match', 'error')
    return
  }

  if (formData.value.new_password.length < 8) {
    showNotification('New password must be at least 8 characters long', 'error')
    return
  }

  loading.value = true

  try {
    const result = await changePassword(formData.value)

    if (result.success) {
      showNotification(result.message, 'success')
      
      // Reset form
      formData.value = {
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      }

      // Redirect back after 2 seconds
      setTimeout(() => {
        handleCancel()
      }, 2000)
    } else {
      errors.value = result.errors || {}
      showNotification(result.message, 'error')
    }
  } catch (error) {
    showNotification('An unexpected error occurred. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.go(-1) // Go back to previous page
}
</script>

<style scoped>
/* Optional: Add any additional custom styles here */
</style>