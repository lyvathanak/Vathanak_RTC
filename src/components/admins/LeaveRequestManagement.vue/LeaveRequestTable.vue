<template>
  <ListTable
    :data="leaveRequests"
    :columns="columns"
    :loading="loading"
    :show-selection="false"
    :show-actions="false"
    :show-view-action="false"
    :show-edit-action="false"
    :show-delete-action="false"
    empty-state-title="No leave requests found"
    empty-state-message="There are no leave requests to display."
    loading-message="Loading leave requests..."
    @view="handleView"
  >
    <!-- Status badge slot -->
    <template #column-status="{ value }">
      <span :class="statusBadgeClass(value)">{{ value }}</span>
    </template>
    <!-- Action button slot -->
    <template #column-action="{ row }">
      <button
        class="bg-[#235AA6] hover:bg-[#1E4A78] text-white rounded px-4 py-1 font-semibold"
        @click="$emit('view', row)"
      >
        View
      </button>
    </template>
  </ListTable>
</template>

<script setup>
import { ref } from 'vue';
import ListTable from '@/components/features/ListTable.vue';

const props = defineProps({
  leaveRequests: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['view']);

const columns = [
  { key: 'id_card', label: 'ID' },
  { key: 'latin_name', label: 'Name' },
  { key: 'leaveType', label: 'Leave Type' },
  { key: 'submitDate', label: 'Submit At' },
  { key: 'status', label: 'Status', type: 'badge', badgeConfig: {
    classes: {
      'Pending': 'bg-orange-100 text-[#FF7700] border border-[#FF7700]',
      'Approved': 'bg-green-100 text-[#10B981] border border-[#10B981]',
      'Rejected': 'bg-red-100 text-[#FF4040] border border-[#FF4040]',
    }
  } },
  { key: 'action', label: 'Action' }
];

function handleView(row) {
  emit('view', row);
}

function statusBadgeClass(status) {
  switch (status) {
    case 'Pending':
      return 'inline-block px-4 py-1 rounded font-semibold bg-orange-100 text-[#FF7700] border border-orange-400';
    case 'Approved':
      return 'inline-block px-4 py-1 rounded font-semibold bg-green-100 text-[#10B981] border border-[#10B981]';
    case 'Rejected':
      return 'inline-block px-4 py-1 rounded font-semibold bg-red-100 text-[#FF4040] border border-[#FF4040]';
    default:
      return 'inline-block px-4 py-1 rounded font-semibold bg-gray-100 text-gray-600 border border-gray-300';
  }
}
</script>
