<template>
  <div class="bg-white rounded shadow-lg overflow-x-auto">
    <p v-if="!leaves.length" class="p-3 text-center text-gray-500">No leave requests found</p>
    <table v-else class="min-w-full border-collapse">
      <thead>
        <tr class="bg-gray-300 border-b">
          <th class="p-3 text-center">Leave Type</th>
          <th class="p-3 text-center">Start Date</th>
          <th class="p-3 text-center">End Date</th>
          <th class="p-3 text-center">Total Days</th>
          <th class="p-3 text-center">Submit Date</th>
          <th class="p-3 text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(leave, index) in leaves" :key="index" class="border-b hover:bg-gray-50">
          <td class="p-3 text-center">{{ leave.type }}</td>
          <td class="p-3 text-center">{{ leave.start }}</td>
          <td class="p-3 text-center">{{ leave.end }}</td>
          <td class="p-3 text-center">{{ String(leave.totalDays).padStart(2, '0') }}</td>
          <td class="p-3 text-center">{{ leave.submit }}</td>
          <td class="p-3 text-center">
            <span
              class="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm w-24"
              :class="{
                'bg-green-500 text-white': leave.status === 'Approved',
                'bg-yellow-500 text-white': leave.status === 'Pending',
                'bg-red-500 text-white': leave.status === 'Rejected',
              }"
            >
              {{ leave.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

// Receive leave data from parent
const props = defineProps({
  leaves: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
table th {
  font-weight: 600;
}
</style>