<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 :class="['text-3xl font-bold text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('admin_dashboard') }}
          </h1>
          <p :class="['text-gray-600 mt-2', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('welcome') }}, {{ authStore.user?.name }}!
          </p>
        </div>
        
      </div>

      <!-- User Info Card -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 :class="['text-xl font-semibold mb-4', locale === 'kh' ? 'khmer-text' : '']">
          User Information
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Role:</label>
            <p class="text-lg font-semibold text-blue-600 capitalize">{{ authStore.userRole }}</p>
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

      <!-- Admin Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Total Users</p>
              <p class="text-3xl font-bold text-blue-600">1,234</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Active Courses</p>
              <p class="text-3xl font-bold text-green-600">45</p>
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
              <p class="text-sm font-medium text-gray-500">Teachers</p>
              <p class="text-3xl font-bold text-purple-600">28</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V9a2 2 0 00-2-2H10a2 2 0 00-2 2v3.1M16 20h4v-4M8 20H4v-4"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Students</p>
              <p class="text-3xl font-bold text-orange-600">1,206</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-full">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Permissions Display -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 :class="['text-xl font-semibold mb-4', locale === 'kh' ? 'khmer-text' : '']">
          Admin Permissions
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div 
            v-for="permission in authStore.userPermissions" 
            :key="permission"
            class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ permission.replace('_', ' ').toUpperCase() }}
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
