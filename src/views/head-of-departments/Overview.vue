<template>
  <div class="min-h-screen bg-gray-50 py-6"> 
    <div class="px-6"> 
      
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 :class="['text-3xl font-bold text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('hod_dashboard') || 'Dashboard' }}
          </h1>
          <p :class="['text-gray-600 mt-2', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('welcome') || 'Welcome' }}, {{ authStore.user?.name }}!
          </p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 :class="['text-xl font-semibold mb-4', locale === 'kh' ? 'khmer-text' : '']">
          Department Head Information
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Role:</label>
            <p class="text-lg font-semibold text-purple-600 capitalize">
              {{ (authStore.userRole || '').replace(/_/g, ' ') }}
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Email:</label>
            <p class="text-lg">{{ authStore.user?.email }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Department:</label>
            <p class="text-lg font-bold text-blue-600">{{ hodStore.currentDepartment.name || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Department Teachers</p>
              <p class="text-3xl font-bold text-blue-600" v-if="!hodStore.isLoading">
                {{ hodStore.kpiStats.teachers || hodStore.teachers.length }}
              </p>
              <div v-else class="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Department Students</p>
              <p class="text-3xl font-bold text-purple-600" v-if="!hodStore.isLoading">
                {{ hodStore.kpiStats.students || hodStore.students.length }}
              </p>
              <div v-else class="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Pending Requests</p>
              <p class="text-3xl font-bold text-orange-600" v-if="!hodStore.isLoading">
                {{ hodStore.kpiStats.leavePending }}
              </p>
              <div v-else class="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div class="p-3 bg-orange-100 rounded-full">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Active Time Slots</p>
              <p class="text-3xl font-bold text-green-600" v-if="!hodStore.isLoading">
                {{ hodStore.timeSlots.length }}
              </p>
              <div v-else class="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
        </div>

      </div>

      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 :class="['text-xl font-semibold mb-4', locale === 'kh' ? 'khmer-text' : '']">
          Department Management
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button @click="router.push(`/${locale}/hod/teacher-management`)" class="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-500 text-white rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Manage Teachers</h3>
                <p class="text-sm text-gray-600">Assign and oversee faculty</p>
              </div>
            </div>
          </button>

          <button @click="router.push(`/${locale}/hod/leave-request`)" class="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-left transition-colors">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-red-500 text-white rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Approve Requests</h3>
                <p class="text-sm text-gray-600">Review pending absences</p>
              </div>
            </div>
          </button>

          <button @click="router.push(`/${locale}/hod/time-table`)" class="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-green-500 text-white rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Time Table</h3>
                <p class="text-sm text-gray-600">Manage class schedules</p>
              </div>
            </div>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/Authentication/authStore.js";
import { useHODDataStore } from '@/stores/HeadOfDepartment/useHODDataStore';

const router = useRouter();
const { t, locale } = useI18n({ messages: { en: { hod_dashboard: 'HOD Dashboard', welcome: 'Welcome' }, kh: { hod_dashboard: 'ផ្ទាំងគ្រប់គ្រងប្រធានផ្នែក', welcome: 'សូមស្វាគមន៍' } } });
const authStore = useAuthStore();
const hodStore = useHODDataStore();

onMounted(() => {
  // Use the master load function to update all KPIs
  hodStore.loadDashboardData();
});
</script>