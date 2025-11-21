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
        class="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-500 transition"
      >
        + Add Leave Request
      </button>
    </div>

    <!-- Status cards -->
    <LeaveRequestStatus :stats="leaveStats" />

    <!-- Table -->
    <LeaveRequestTable :leaves="leaves" />

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
import { ref, reactive, computed } from "vue"
import LeaveRequestStatus from "@/components/teachers/LeaveRequestStatus.vue"
import LeaveRequestTable from "@/components/teachers/LeaveRequestTable.vue"
import LeaveRequestForm from "@/components/features/LeaveRequestForm.vue"

// Modal visibility
const showForm = ref(false)

// Reactive leave data
const leaves = reactive([
  { type: "Annual Leave", start: "2025-09-01", end: "2025-09-03", totalDays: 3, submit: "2025-08-28", status: "Approved" },
  { type: "Sick Leave", start: "2025-09-05", end: "2025-09-06", totalDays: 2, submit: "2025-08-28", status: "Pending" },
  { type: "Personal Leave", start: "2025-09-07", end: "2025-09-07", totalDays: 1, submit: "2025-08-28", status: "Rejected" }
])

// Handle new leave from form
const handleNewLeave = (newLeave) => {
  leaves.push({ ...newLeave }) // Add new leave to reactive array
  showForm.value = false
}

// Compute stats dynamically
const leaveStats = computed(() => ({
  total: leaves.length,
  approved: leaves.filter(l => l.status === "Approved").length,
  rejected: leaves.filter(l => l.status === "Rejected").length,
  pending: leaves.filter(l => l.status === "Pending").length
}))
</script>

