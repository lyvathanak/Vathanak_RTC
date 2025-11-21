<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 :class="['text-3xl font-bold text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('hod_dashboard') }}
          </h1>
          <p :class="['text-gray-600 mt-2', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('welcome') }}, {{ authStore.user?.name }}!
          </p>
        </div>
        
      </div>

      <!-- Department Head Info Card -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 :class="['text-xl font-semibold mb-4', locale === 'kh' ? 'khmer-text' : '']">
          Department Head Information
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Role:</label>
            <p class="text-lg font-semibold text-purple-600 capitalize">{{ authStore.userRole.replace('_', ' ') }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Email:</label>
            <p class="text-lg">{{ authStore.user?.email }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Department:</label>
            <p class="text-lg">{{ authStore.user?.profile?.department }}</p>
          </div>
        </div>
      </div>

      <!-- Department Management Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Department Teachers</p>
              <p class="text-3xl font-bold text-blue-600">12</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Department Courses</p>
              <p class="text-3xl font-bold text-green-600">18</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Department Students</p>
              <p class="text-3xl font-bold text-purple-600">285</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Pending Requests</p>
              <p class="text-3xl font-bold text-orange-600">7</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-full">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Management Actions -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 :class="['text-xl font-semibold mb-4', locale === 'kh' ? 'khmer-text' : '']">
          Department Management
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button class="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-500 text-white rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Manage Teachers</h3>
                <p class="text-sm text-gray-600">Assign and oversee department faculty</p>
              </div>
            </div>
          </button>

          <button class="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-green-500 text-white rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Course Approval</h3>
                <p class="text-sm text-gray-600">Review and approve course proposals</p>
              </div>
            </div>
          </button>

          <button class="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-purple-500 text-white rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Department Reports</h3>
                <p class="text-sm text-gray-600">View performance and analytics</p>
              </div>
            </div>
          </button>

          <button class="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition-colors">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-indigo-500 text-white rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Schedule Classes</h3>
                <p class="text-sm text-gray-600">Manage department timetables</p>
              </div>
            </div>
          </button>

          <button class="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-yellow-500 text-white rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Budget Requests</h3>
                <p class="text-sm text-gray-600">Submit and track department budgets</p>
              </div>
            </div>
          </button>

          <button class="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-left transition-colors">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-red-500 text-white rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Approve Requests</h3>
                <p class="text-sm text-gray-600">Review pending department requests</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Permissions Display -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 :class="['text-xl font-semibold mb-4', locale === 'kh' ? 'khmer-text' : '']">
          Head of Department Permissions
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div 
            v-for="permission in authStore.userPermissions" 
            :key="permission"
            class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ permission.replace(/_/g, ' ').toUpperCase() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/Authentication/authStore.js";
import ChangeLanguage from "@/components/language/ChangLanguage.vue";

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  const currentLang = route.params.lang || 'en';
  router.push(`/${currentLang}/login`);
};
</script>
