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
              :src="profile.photo ? `https://api.rtc-bb.camai.kh/storage/${profile.photo}` : 'https://via.placeholder.com/150'"
              alt="Profile picture" 
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 class="text-4xl font-bold text-black mb-2">{{ profile.name }}</h1>
            <p class="text-gray-600 text-lg">{{ profile.department }} • {{ profile.grade }}</p> 
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

          <!-- Academic Information -->
          <div>
          <div class="flex items-center gap-2 mb-6">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
            <h2 class="text-xl font-semibold text-black">Academic Information</h2>
          </div>
          <div class="space-y-4">
            <div v-for="(value, label) in academicInfo" :key="label">
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
import { getStudentProfile } from '@/stores/Student/StudentProfile'

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
  id: '',
  program: '',
  grade: '',
  department: '',
  promotion: '',
  subDepartment: ''
})

onMounted(async () => { 
  try {
    const data = await getStudentProfile()

    // ✅ must use data.user
    profile.photo = data.user.user_detail?.profile_picture || '' 
    profile.name = data.user?.name || '' 
    profile.dob = data.user.user_detail?.date_of_birth || ''
    profile.gender = data.user.user_detail?.gender || ''
    profile.address = data.user.user_detail?.current_address || data.user.user_detail?.address || ''
    profile.email = data.user?.email || ''
    profile.phone = data.user.user_detail?.phone_number || ''
    profile.id = data.user.user_detail?.id_card || ''
    profile.program = data.user.user_detail?.program?.program_name || ''
    profile.grade = data.user.user_detail?.grade || ''
    profile.department = data.user.user_detail?.department?.department_name || '' 
    profile.promotion = data.promotion?.[0]?.name || ''
    profile.subDepartment = data.user.user_detail?.sub_department?.name || ''
  } catch (err) {
    console.error('❌ Failed to fetch profile:', err)
    error.value = err.message || 'Unknown error'
  } finally {
    loading.value = false
  }
}) 


const personalInfo = computed(() => ({ 
  'FULL NAME': profile.name,
  'DATE OF BIRTH': profile.dob,
  'GENDER': profile.gender,
  'ADDRESS': profile.address,
  'EMAIL ADDRESS': profile.email,
  'PHONE NUMBER': profile.phone
}))

const academicInfo = computed(() => ({
  'ID': profile.id,
  'PROGRAM': profile.program,
  'GRADE': profile.grade,
  'DEPARTMENT': profile.department,
  'PROMOTION': profile.promotion,
  'SECTION': profile.subDepartment
}))
</script>

<style>
/* Optional custom styles */
</style>
