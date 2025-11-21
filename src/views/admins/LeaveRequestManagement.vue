<template>
  <div class="flex flex-col gap-4 sm:gap-5 py-3 sm:py-5">
    <!-- Header - Responsive Only -->
    <div class="flex items-center px-3 sm:px-5">
      <span class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mr-2 flex items-center">
        <ClipboardList class="h-6 w-6 sm:h-8 sm:w-8 mr-2" />        
        List of Leave Request
      </span>
    </div>

    <!-- Status Bar - Responsive Only -->
    <AdminLeaveRequestStatus
      :pending="statusCounts.pending"
      :approved="statusCounts.approved"
      :rejected="statusCounts.rejected"
      :total="statusCounts.total"
      class="px-3 sm:px-5"
    />

    <!-- Search and Filter - Responsive Only -->
    <div class="flex flex-col px-3 sm:px-5">
      <div class="relative mb-3 w-full max-w-lg">
        <input
          v-model="search"
          type="text"
          placeholder="Search by name, ID, or leave type..."
          :disabled="loading"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
        />
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
      </div>
      <div class="w-full">
        <div class="flex flex-wrap gap-2">
          <LeaveRequestFilter @update:filters="handleFilterUpdate" :disabled="loading" />
        </div>
      </div>
    </div>

    <!-- Table - Responsive Only -->
    <div class="px-3 sm:px-5 overflow-x-auto">
      <LeaveRequestTable
        :leave-requests="filteredLeaveRequests"
        :loading="loading"
        @view="handleView"
      />
    </div>

    <!-- View Leave Request Modal -->
    <ViewLeaveRequestForm
      v-if="showViewModal"
      :leave-request="selectedLeaveRequest"
      @close="closeViewModal"
      @updated="handleLeaveRequestUpdated"
    />

    <!-- Pagination - Responsive Only -->
    <div class="flex justify-center mt-4 px-3 sm:px-5">
      <Pagination
        :current-page="page"
        :total-items="totalFilteredItems"
        :page-size="pageSize"
        :page-size-options="[5, 10, 25, 50]"
        item-label="requests"
        @update:currentPage="val => page = val"
        @update:pageSize="val => { pageSize = val; page = 1; }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import AdminLeaveRequestStatus from '@/components/admins/LeaveRequestManagement.vue/AdminLeaveRequestStatus.vue';
import LeaveRequestFilter from '@/components/admins/LeaveRequestManagement.vue/LeaveRequestFilter.vue';
import LeaveRequestTable from '@/components/admins/LeaveRequestManagement.vue/LeaveRequestTable.vue';
import ViewLeaveRequestForm from '@/components/admins/LeaveRequestManagement.vue/ViewLeaveRequestForm.vue';
import { ClipboardList, Search } from 'lucide-vue-next';
import Pagination from '@/components/features/Pagination.vue';
import apiLeave from '@/stores/apis/LeaveRequestManagement.js';

// Reactive data
const allLeaveRequests = ref([]); 
const loading = ref(false);
const error = ref(null);
const search = ref('');
const filters = ref({});
const page = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const currentPage = ref(1);
const showViewModal = ref(false);
const selectedLeaveRequest = ref(null);
const statusStats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0
});

// API functions
const fetchLeaveRequests = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Fetch all data (backend doesn't support filtering yet)
    const params = {
      page: 1,
      limit: 1000, // Get all records for client-side filtering
    };

    console.log('🔍 Fetching all leave requests for client-side filtering');

    const { success, requests, pagination, error: apiError } = await apiLeave.getAllLeaveRequests(params);
    
    if (success) {
      console.log('✅ Raw requests from API:', requests.length, 'records');
      allLeaveRequests.value = requests.map(transformLeaveRequestData);
      totalItems.value = requests.length;
      calculateStatusStats();
    } else {
      error.value = apiError || 'Failed to fetch leave requests';
      allLeaveRequests.value = [];
    }
  } catch (err) {
    error.value = 'Failed to fetch leave requests';
    console.error('Error fetching leave requests:', err);
  } finally {
    loading.value = false;
  }
};

// Calculate status statistics
const calculateStatusStats = () => {
  // Calculate from filtered results, not all data
  const filtered = applyClientSideFilters(allLeaveRequests.value);
  const pending = filtered.filter(lr => lr.status.toLowerCase() === 'pending').length;
  const approved = filtered.filter(lr => lr.status.toLowerCase() === 'approved').length;
  const rejected = filtered.filter(lr => lr.status.toLowerCase() === 'rejected').length;
  const total = filtered.length;
  statusStats.value = { pending, approved, rejected, total };
};

// Client-side filtering function
const applyClientSideFilters = (requests) => {
  let filtered = [...requests];

  console.log('🔍 Applying client-side filters:', filters.value);
  console.log('🔍 Starting with', filtered.length, 'requests');

  // Apply search filter
  if (search.value && search.value.trim()) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(req => 
      req.id_card?.toLowerCase().includes(searchLower) ||
      req.latin_name?.toLowerCase().includes(searchLower) ||
      req.leaveType?.toLowerCase().includes(searchLower)
    );
    console.log('📍 After search:', filtered.length, 'requests');
  }

  // Apply status filter
  if (filters.value.status && filters.value.status !== 'All') {
    filtered = filtered.filter(req => 
      req.status.toLowerCase() === filters.value.status.toLowerCase()
    );
    console.log('📍 After status filter:', filtered.length, 'requests');
  }

  // Apply type filter - match backend format
  if (filters.value.type && filters.value.type !== 'All') {
    filtered = filtered.filter(req => {
      const reqType = req.originalData?.type || req.leaveType;
      // Handle both "Annual Leave" -> "Annual" and exact matches
      const filterType = filters.value.type.replace(' Leave', '');
      return reqType === filters.value.type || reqType === filterType;
    });
    console.log('📍 After type filter (' + filters.value.type + '):', filtered.length, 'requests');
  }

  // Apply role filter
  if (filters.value.role && filters.value.role !== 'All') {
    filtered = filtered.filter(req => {
      const userRole = req.originalData?.user_role || req.originalData?.role;
      return userRole?.toLowerCase() === filters.value.role.toLowerCase();
    });
    console.log('📍 After role filter:', filtered.length, 'requests');
  }

  // Apply department filter
  if (filters.value.department && filters.value.department !== 'All' && filters.value.department !== 'Loading...') {
    filtered = filtered.filter(req => {
      const dept = req.originalData?.department || req.originalData?.department_name;
      return dept?.toLowerCase() === filters.value.department.toLowerCase();
    });
    console.log('📍 After department filter:', filtered.length, 'requests');
  }

  // Apply program filter
  if (filters.value.program && filters.value.program !== 'All' && filters.value.program !== 'Loading...') {
    filtered = filtered.filter(req => {
      const prog = req.originalData?.program || req.originalData?.program_name;
      return prog?.toLowerCase() === filters.value.program.toLowerCase();
    });
    console.log('📍 After program filter:', filtered.length, 'requests');
  }

  // Apply section filter
  if (filters.value.section && filters.value.section !== 'All' && filters.value.section !== 'Loading...') {
    filtered = filtered.filter(req => {
      const sect = req.originalData?.section || req.originalData?.section_name;
      return sect?.toLowerCase() === filters.value.section.toLowerCase();
    });
    console.log('📍 After section filter:', filtered.length, 'requests');
  }

  // Apply semester filter
  if (filters.value.semester && filters.value.semester !== 'All') {
    filtered = filtered.filter(req => {
      const sem = req.originalData?.semester?.toString();
      return sem === filters.value.semester;
    });
    console.log('📍 After semester filter:', filtered.length, 'requests');
  }

  // Apply academic year filter
  if (filters.value.academicYear && filters.value.academicYear !== 'All') {
    filtered = filtered.filter(req => {
      const year = req.originalData?.academic_year || req.originalData?.year;
      return year?.toString() === filters.value.academicYear;
    });
    console.log('📍 After academic year filter:', filtered.length, 'requests');
  }

  // Apply date range filter
  if (filters.value.date && filters.value.date !== 'All') {
    const now = new Date();
    let startDate, endDate;

    switch (filters.value.date) {
      case 'Today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'This Week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDate = startOfWeek;
        endDate = new Date();
        break;
      case 'This Month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;
    }

    if (startDate && endDate) {
      filtered = filtered.filter(req => {
        const reqDate = parseDate(req.originalData?.requested_at || req.submitDate);
        return reqDate >= startDate && reqDate <= endDate;
      });
      console.log('📍 After date filter:', filtered.length, 'requests');
    }
  }

  console.log('✅ Final filtered:', filtered.length, 'requests');
  return filtered;
};

// Helper to parse date from API format (DD-MM-YYYY HH:MM)
const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split(' ')[0].split('-'); // Get date part only
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]); // YYYY, MM, DD
  }
  return new Date(dateStr);
};

// Transform API data → table row
const transformLeaveRequestData = (request) => {
  return {
    id_card: request.id_card || 'N/A',
    latin_name: request.latin_name || `User ${request.user_id}` || 'Unknown User', // ✅ safer mapping
    leaveType: request.type || 'N/A',
    submitDate: request.requested_at || 'N/A',
    status: capitalizeFirst(request.status) || 'Pending',
    originalData: request
  };
};

const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Filtering + pagination (client-side)
const filteredLeaveRequests = computed(() => {
  // Apply all filters
  const filtered = applyClientSideFilters(allLeaveRequests.value);
  
  // Apply client-side pagination
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  
  return filtered.slice(start, end);
});

const totalFilteredItems = computed(() => {
  // Return count of filtered items (for pagination)
  return applyClientSideFilters(allLeaveRequests.value).length;
});

const statusCounts = computed(() => statusStats.value);

function handleView(row) {
  selectedLeaveRequest.value = row;
  showViewModal.value = true;
}

function closeViewModal() {
  showViewModal.value = false;
  selectedLeaveRequest.value = null;
}

function handleLeaveRequestUpdated() {
  // Refresh the leave requests data after approval/rejection
  fetchLeaveRequests();
  closeViewModal();
}

function handleFilterUpdate(newFilters) {
  console.log('🎯 Filter updated:', newFilters);
  filters.value = newFilters;
  page.value = 1; // Reset to first page when filters change
  calculateStatusStats(); // Recalculate stats based on filtered data
}

onMounted(fetchLeaveRequests);

// Watch for pagination changes only (no need to refetch on filter change)
watch([page, pageSize], () => {
  // No need to fetch again, just update the view
  calculateStatusStats();
});

// Debounce search to avoid too many recomputations
let searchTimeout;
watch(search, () => {
  page.value = 1;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    calculateStatusStats();
  }, 300);
});
</script>