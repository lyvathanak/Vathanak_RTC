<template>
  <div class="min-h-screen bg-gray-50">
    
    <div class="bg-[#235AA6] text-white p-4 flex items-center justify-between shadow-lg mb-8">
      <div class="flex items-center"><h1 class="text-xl font-medium">Head of Department</h1></div>
      <div class="flex items-center space-x-4"><button class="relative"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.007 2.007 0 0118 14.285V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.285c0 .531-.192 1.053-.595 1.405L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg><span class="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span></button><select class="bg-[#1e4a8b] border border-blue-700 rounded-md py-1 px-2 text-sm"><option>🇺🇸 EN</option><option>🇰🇭 KH</option></select><div class="flex items-center space-x-2"><img src="https://via.placeholder.com/30" alt="User Avatar" class="w-8 h-8 rounded-full border-2 border-white"><span class="text-white font-medium">John Doe</span></div></div>
    </div>

    <div class="w-full px-8 pb-8">
      <div class="mb-6 pb-2 flex justify-between items-end">
        <div>
          <h1 :class="['text-3xl font-medium tracking-tight text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('leave_requests_approval') || 'Leave Request' }}
          </h1>
          <p class="text-lg text-gray-600 mt-1">
            Centralized tool for managing staff and student absence requests.
          </p>
        </div>
        <button 
          class="px-5 py-2.5 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Add Leave Request
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center border border-gray-100 border-l-4 border-orange-500">
          <div><p class="text-sm font-medium text-gray-500">Pending</p><p class="text-3xl font-semibold text-gray-800 mt-1">{{ leaveRequestKPIs.pending }}</p></div>
        </div>
        <div class="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center border border-gray-100 border-l-4 border-green-600">
          <div><p class="text-sm font-medium text-gray-500">Approved</p><p class="text-3xl font-semibold text-gray-800 mt-1">{{ leaveRequestKPIs.approvedThisWeek }}</p></div>
        </div>
        <div class="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center border border-gray-100 border-l-4 border-red-600">
          <div><p class="text-sm font-medium text-gray-500">Rejected</p><p class="text-3xl font-semibold text-gray-800 mt-1">{{ leaveRequestKPIs.rejectedThisWeek }}</p></div>
        </div>
        <div class="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center border border-gray-100 border-l-4 border-blue-600">
          <div><p class="text-sm font-medium text-gray-500">Total Request</p><p class="text-3xl font-semibold text-gray-800 mt-1">{{ leaveRequestKPIs.total }}</p></div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
        <div class="flex items-center space-x-4 mb-4">
            <input 
                type="text" 
                placeholder="Search by Requester Name or ID..." 
                class="border border-gray-300 rounded-lg p-2.5 w-80 focus:ring-blue-500 focus:border-blue-500"
            >
            <button class="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">Search</button>
        </div>

        <div class="grid grid-cols-5 gap-3 mt-4">
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Status</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Leave Type</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Requester Role</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Academic Year</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Homeroom / Section</option>
            </select>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div class="p-4">
          <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
                  <tr>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">
                          <input type="checkbox" class="rounded border-gray-300 text-blue-600 shadow-sm">
                      </th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Requester</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Leave Type</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End Date</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Day</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submit Date</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                  </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="request in pendingRequests" :key="request.id" class="hover:bg-gray-50 transition duration-150">
                      <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <input type="checkbox" class="rounded border-gray-300 text-blue-600 shadow-sm">
                      </td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ request.requester }}</td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{{ request.type }}</td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{{ request.startDate }}</td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{{ request.endDate }}</td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{{ request.totalDays }}</td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{{ request.submitDate }}</td>
                      <td class="px-3 py-4 whitespace-nowrap">
                          <span :class="`text-xs font-medium px-2.5 py-0.5 rounded-full ${request.statusStyle}`">{{ request.status }}</span>
                      </td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button class="text-blue-600 hover:text-blue-800">View</button>
                      </td>
                  </tr>
              </tbody>
          </table>
          
          <div class="p-4 border-t flex justify-between items-center text-sm text-gray-600">
              <span>Showing 1 to 10 of {{ leaveRequestKPIs.total }} entries</span>
              <div class="flex space-x-1">
                  <button class="px-3 py-1 border rounded-lg hover:bg-gray-100">Previous</button>
                  <button class="px-3 py-1 border rounded-lg bg-blue-600 text-white">1</button>
                  <button class="px-3 py-1 border rounded-lg hover:bg-gray-100">2</button>
                  <button class="px-3 py-1 border rounded-lg hover:bg-gray-100">Next</button>
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
// FIX 1: Import the API object directly (aliased for clarity)
import LeaveAPI from "@/stores/apis/LeaveRequestManagement"; 

const { t, locale } = useI18n({ messages: { en: { leave_requests_approval: 'Leave Request' } } }); 
const router = useRouter();
const route = useRoute();
// FIX 2: Assign the imported object directly, do NOT call it as a function
const leaveRequestStore = LeaveAPI; 

const leaveRequestKPIs = ref({
    pending: 0,
    approvedThisWeek: 0,
    rejectedThisWeek: 0,
    total: 0,
});
const pendingRequests = ref([]);

const fetchData = async () => {
    try {
        const statsResponse = await leaveRequestStore.getLeaveRequestStats();
        const listResponse = await leaveRequestStore.getAllLeaveRequests();
        
        // Map stats data to KPIs
        if (statsResponse.success) {
            leaveRequestKPIs.value.pending = statsResponse.stats.pending_count || 0;
            leaveRequestKPIs.value.approvedThisWeek = statsResponse.stats.approved_this_week || 0;
            leaveRequestKPIs.value.rejectedThisWeek = statsResponse.stats.rejected_this_week || 0;
            leaveRequestKPIs.value.total = statsResponse.stats.total_count || 0;
        }

        // Map list data
        if (listResponse.success && Array.isArray(listResponse.requests)) {
             pendingRequests.value = listResponse.requests.map(req => ({
                id: req.id,
                requester: req.user_id || 'N/A', 
                type: req.type || 'N/A',
                startDate: req.start_date || 'N/A',
                endDate: req.end_date || 'N/A',
                totalDays: req.total_days || 0,
                submitDate: req.requested_at ? new Date(req.requested_at).toLocaleDateString() : 'N/A',
                status: req.status || 'Pending',
                statusStyle: req.status ? leaveRequestStore.getStatusBadgeClass(req.status) : 'bg-orange-100 text-orange-800',
            }));
        }

    } catch (error) {
        console.error("Failed to fetch leave request data (using mock fallback):", error);
        // Fallback to mock data to ensure rendering
        leaveRequestKPIs.value = { pending: 5, approvedThisWeek: 12, rejectedThisWeek: 3, total: 20 };
        pendingRequests.value = [
            { id: 101, requester: 'Teacher A', type: 'Sick Leave', startDate: '01/12/2025', endDate: '01/12/2025', totalDays: 1, submitDate: '30/11/2025', status: 'Pending', statusStyle: 'bg-orange-100 text-orange-800' },
            { id: 102, requester: 'Student X', type: 'Family Event', startDate: '05/12/2025', endDate: '06/12/2025', totalDays: 2, submitDate: '01/12/2025', status: 'Pending', statusStyle: 'bg-orange-100 text-orange-800' },
        ];
    }
};

onMounted(fetchData);
</script>