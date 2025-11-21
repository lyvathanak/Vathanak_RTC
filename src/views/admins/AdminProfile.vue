<template>
  <div class="min-h-screen bg-gray-200 p-8">
    <div class="max-w-4xl mx-auto bg-gray-300 rounded-lg p-8">

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <span class="text-lg font-semibold text-gray-700">Loading profile...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-red-600 font-semibold text-center">
        Failed to load profile. Please try again later.
      </div>

      <!-- Profile Display -->
      <div v-else>
        <!-- Header Section -->
        <div class="flex items-center gap-6 mb-8">
          <div class="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
            <img 
              :src="profile.photo ? `https://api.rtc-bb.camai.kh/storage/${profile.photo}` : image "
              alt="Profile picture" 
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 class="text-4xl font-bold text-black mb-2">{{ profile.name }}</h1>
            <p class="text-gray-600 text-lg">{{ profile.role }}</p> 
          </div>
        </div>

        <!-- Information Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Personal Information -->
          <div>
            <div class="flex items-center gap-2 mb-6">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              <h2 class="text-xl font-semibold text-black">Personal Information</h2>
            </div>
            <div class="space-y-4">
              <div v-for="(value, label) in personalInfo" :key="label">
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
                <p class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900">
                  {{ value || '-' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Work Information -->
          <div>
            <div class="flex items-center gap-2 mb-6">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              <h2 class="text-xl font-semibold text-black">Work Information</h2>
            </div>
            <div class="space-y-4">
              <div v-for="(value, label) in workInfo" :key="label">
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
                <p class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900">
                  {{ value || '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, ref } from 'vue'
import { getAdminProfile } from '@/stores/Admin/AdminProfile'
import image from '@/assets/default-avatar.png';

const loading = ref(true)
const error = ref(null)

const profile = reactive({
  photo: '',
  name: '',
  dob: '',
  gender: '',
  address: '',
  email: '',
  phone: '',
  role: '',
  employeeId: '',
  position: ''
})

onMounted(async () => { 
  try {
    const data = await getAdminProfile()

    // ✅ must use data.user
    profile.photo = data.user.user_detail?.profile_picture || '' 
    profile.name = data.user?.name || '' 
    profile.dob = data.user.user_detail?.date_of_birth || ''
    profile.gender = data.user.user_detail?.gender || ''
    profile.address = data.user.user_detail?.current_address || data.user.user_detail?.address || ''
    profile.email = data.user?.email || ''
    profile.phone = data.user.user_detail?.phone_number || ''
    profile.role = 'Administrator'
    profile.employeeId = data.user.user_detail?.id_card || data.user.user_detail?.employee_id || ''
    profile.position = data.user.user_detail?.position || 'System Administrator'
  } catch (err) {
    console.error('❌ Failed to fetch profile:', err)
    error.value = err.message || 'Unknown error'
  } finally {
    loading.value = false
  }
}) 

const personalInfo = computed(() => ({ 
  'FULL NAME': profile.name,
  'GENDER': profile.gender,
  'EMAIL ADDRESS': profile.email,
  'PHONE NUMBER': profile.phone
}))

const workInfo = computed(() => ({
  'EMPLOYEE ID': profile.employeeId,
  'ROLE': profile.role,
  'POSITION': profile.position,

}))
</script>

<style>
/* Optional custom styles */
</style>