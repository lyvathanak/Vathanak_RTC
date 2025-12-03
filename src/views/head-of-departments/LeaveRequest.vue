<template>
  <div class="min-h-screen bg-gray-50">
    
    <div class="bg-[#235AA6] text-white p-4 flex items-center justify-between shadow-lg mb-8">
      <div class="flex items-center"><h1 class="text-xl font-medium">Head of Department</h1></div>
      <div class="flex items-center space-x-4">
        <span class="text-white font-medium">{{ hodStore.currentDepartment.name || 'Department' }}</span>
      </div>
    </div>

    <div class="w-full px-8 pb-8">
      <div class="mb-6 pb-2 flex justify-between items-end">
        <div>
          <h1 :class="['text-3xl font-medium tracking-tight text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('leave_requests_approval') || 'Leave Request' }}
          </h1>
          <p class="text-lg text-gray-600 mt-1">Manage absence requests for your department.</p>
        </div>
        <button class="px-5 py-2.5 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 flex items-center gap-2 font-medium">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Add Leave Request
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <p class="text-sm font-medium text-gray-500">Pending</p>
          <p class="text-3xl font-semibold text-gray-800 mt-1">{{ hodStore.kpiStats.leavePending }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
          <p class="text-sm font-medium text-gray-500">Approved</p>
          <p class="text-3xl font-semibold text-gray-800 mt-1">{{ hodStore.kpiStats.leaveApproved }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-600">
          <p class="text-sm font-medium text-gray-500">Rejected</p>
          <p class="text-3xl font-semibold text-gray-800 mt-1">{{ hodStore.kpiStats.leaveRejected }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <p class="text-sm font-medium text-gray-500">Total</p>
          <p class="text-3xl font-semibold text-gray-800 mt-1">{{ hodStore.kpiStats.leaveTotal }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div v-if="hodStore.isLoading" class="p-8 text-center text-gray-500">Loading requests...</div>
        
        <div v-else class="p-4">
          <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
                  <tr>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requester</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Start Date</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">End Date</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="request in hodStore.leaveRequests" :key="request.id" class="hover:bg-gray-50">
                      <td class="px-3 py-4 text-sm font-medium text-gray-900">{{ request.user?.name || request.user_id }}</td>
                      <td class="px-3 py-4 text-sm text-gray-700">{{ request.type }}</td>
                      <td class="px-3 py-4 text-sm text-gray-700">{{ request.start_date }}</td>
                      <td class="px-3 py-4 text-sm text-gray-700">{{ request.end_date }}</td>
                      <td class="px-3 py-4">
                          <span :class="['px-2 py-1 rounded-full text-xs font-medium', request.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800']">
                            {{ request.status || 'Pending' }}
                          </span>
                      </td>
                      <td class="px-3 py-4 text-sm">
                          <button class="text-blue-600 hover:text-blue-800">Review</button>
                      </td>
                  </tr>
                  <tr v-if="hodStore.leaveRequests.length === 0">
                    <td colspan="6" class="p-4 text-center text-gray-500">No requests found.</td>
                  </tr>
              </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useHODDataStore } from '@/stores/HeadOfDepartment/useHODDataStore';

const { t, locale } = useI18n({ messages: { en: { leave_requests_approval: 'Leave Request' } } }); 
const router = useRouter();
const hodStore = useHODDataStore();

onMounted(() => {
  hodStore.fetchLeaveRequests();
});
</script>