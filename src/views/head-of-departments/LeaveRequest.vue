<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 border-b border-gray-200 pb-4 flex justify-between items-end">
        <div>
          <h1 :class="['text-4xl font-extrabold tracking-tight text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('leave_requests_approval') || 'Leave Requests Approval' }}
          </h1>
          <p class="text-lg text-gray-600 mt-1">
            Review and take action on pending absence requests from staff and student guardians.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-2xl shadow-xl p-6 transition-transform hover:scale-[1.02] border-l-4 border-orange-500 flex justify-between items-center">
          <div><p class="text-sm font-semibold text-orange-600 uppercase">Pending Approvals</p><p class="text-4xl font-bold text-gray-800 mt-1">5</p></div>
          <div class="p-3 bg-orange-100 rounded-full"><svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-6 transition-transform hover:scale-[1.02] border-l-4 border-green-600 flex justify-between items-center">
          <div><p class="text-sm font-semibold text-green-600 uppercase">Approved This Week</p><p class="text-4xl font-bold text-gray-800 mt-1">12</p></div>
          <div class="p-3 bg-green-100 rounded-full"><svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-6 transition-transform hover:scale-[1.02] border-l-4 border-red-600 flex justify-between items-center">
          <div><p class="text-sm font-semibold text-red-600 uppercase">Rejected This Week</p><p class="text-4xl font-bold text-gray-800 mt-1">3</p></div>
          <div class="p-3 bg-red-100 rounded-full"><svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
          </div>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-4 mb-6 flex justify-between items-center border border-gray-100">
        <div class="flex items-center space-x-4">
            <input 
                type="text" 
                placeholder="Search by Requester Name or ID..." 
                class="border border-gray-300 rounded-lg p-2.5 w-80 focus:ring-blue-500 focus:border-blue-500"
            >
            <select class="border border-gray-300 rounded-lg p-2.5">
                <option value="">Filter by Role</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5">
                <option value="pending">Filter by Status (Pending)</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>
        <button class="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors shadow-sm">
            View History
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Requests Needing Review (5)</h2>
          
          <div class="min-h-[400px] bg-white rounded-lg p-0">
              <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100">
                      <tr>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider rounded-tl-lg">ID</th>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Requester</th>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Homeroom / Section</th>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                          <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider rounded-tr-lg">Action</th>
                      </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                      <tr class="hover:bg-orange-50 transition duration-150 border-l-4 border-orange-400">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">101</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Teacher A</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Teacher</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">G3-A</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">2025-12-01</td>
                          <td class="px-6 py-4 whitespace-nowrap"><span class="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-0.5 rounded-full">Pending</span></td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"><button class="text-blue-600 hover:text-blue-800 font-bold">Review & Approve</button></td>
                      </tr>
                      <tr class="hover:bg-orange-50 transition duration-150 border-l-4 border-orange-400">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">102</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Student X (Guardian)</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Student</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">G4-B</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">2025-12-05</td>
                          <td class="px-6 py-4 whitespace-nowrap"><span class="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-0.5 rounded-full">Pending</span></td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"><button class="text-blue-600 hover:text-blue-800 font-bold">Review & Approve</button></td>
                      </tr>
                  </tbody>
              </table>
              <div class="py-4 text-center text-gray-500 text-sm border-t">... 3 more pending records ...</div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
// Mocked imports for display purposes
const { t, locale } = useI18n({ messages: { en: { leave_requests_approval: 'Leave Requests Approval' } } }); 
const router = useRouter();
const route = useRoute();
</script>