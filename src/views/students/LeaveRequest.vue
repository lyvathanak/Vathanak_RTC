<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">My Leave Request</h1>
        <p class="text-gray-500">Track and manage leave applications</p>
      </div>
      <!-- Add Leave Button -->
      <button
        @click="showForm = true"
        class="bg-blue-800 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-500 transition font-bold"
      >
        + Add Leave Request
      </button>
    </div>

    <!-- Status cards -->
    <LeaveRequestStatus :stats="leaveStats" />

    <!-- Table -->
    <LeaveRequestTable :leaves="pagedLeaves" />

    <!-- Pagination -->
    <div class="mt-4 flex justify-center">
      <Pagination
        v-model:currentPage="page"
        v-model:pageSize="pageSize"
        :totalItems="leaves.length"
        itemLabel="leaves"
        @pageChange="handlePageChange"
        @pageSizeChange="handlePageSizeChange"
      />
    </div>

    <!-- Modal Form -->
    <div
      v-if="showForm"
      class="fixed inset-0 flex items-center justify-center bg-black/40"
    >
      <LeaveRequestForm
        @close="showForm = false"
        @submit="handleNewLeave"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import LeaveRequestStatus from "@/components/students/LeaveReqestStatus.vue";
import LeaveRequestTable from "@/components/students/LeaveRequestTable.vue";
import LeaveRequestForm from "@/components/features/LeaveRequestForm.vue";
import { getLeaveRequestsService } from "@/stores/Student/LeaveRequestFrom"; 
import Pagination from "@/components/features/Pagination.vue";

const showForm = ref(false);
const leaves = reactive([]);

// Pagination state
const page = ref(1);
const pageSize = ref(10); // default page size

// ✅ Paged data
const pagedLeaves = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return leaves.slice(start, start + pageSize.value);
});

// Fetch leaves
const fetchLeaves = async () => {
  try {
    const requests = await getLeaveRequestsService();
    const formattedLeaves = requests.map((request) => ({
      id: request.id,
      type: request.type,
      start: request.start_date,
      end: request.end_date,
      totalDays: request.total_days,
      submit: request.requested_at,
      status: request.status,
      reason: request.reason,
      handover_detail: request.handover_detail,
      emergency_contact: request.emergency_contact,
      document: request.document,
    }));
    leaves.splice(0, leaves.length, ...formattedLeaves);
  } catch (err) {
    console.error("❌ Failed to fetch leaves:", err);
  }
};
onMounted(fetchLeaves);

// Add new leave
const handleNewLeave = (newLeave) => {
  leaves.push(newLeave);
  showForm.value = false;
};

// Stats
const leaveStats = computed(() => ({
  total: leaves.length,
  approved: leaves.filter((l) => l.status === "Approved").length,
  rejected: leaves.filter((l) => l.status === "Rejected").length,
  pending: leaves.filter((l) => l.status === "Pending").length,
}));

// Event handlers
const handlePageChange = (paginationData) => {
  console.log("Page changed:", paginationData);
};
const handlePageSizeChange = (paginationData) => {
  console.log("Page size changed:", paginationData);
};
</script>
