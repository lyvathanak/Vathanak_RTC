<template>
  <div class="flex flex-wrap justify-center text-center gap-8 mb-6">
    <div
      v-for="item in orderedAttendance"
      :key="item.label"
      :class="[
        'flex flex-col w-[250px] items-center justify-center gap-4 px-[50px] py-5 bg-white rounded-[10px] max-sm:w-40 border-t-[3px] shadow-[0px_4px_4px_#00000040]',
        borderColor(item.color)
      ]"
    >
      <div class="font-normal text-blue text-base">{{ item.label }}</div>
      <div :class="['font-bold text-xl', textColor(item.color)]">
        {{ item.value }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  stats: { present: number; onTime: number; late: number; absence: number }
}>()

type AttendanceItem = {
  label: string
  value: number
  color: 'blue' | 'green' | 'yellow' | 'red'
}

// Order: Total Present → On Time → Late → Absence
const orderedAttendance = computed<AttendanceItem[]>(() => [
  { label: 'Total Present', value: props.stats.present, color: 'blue' },
  { label: 'On Time', value: props.stats.onTime, color: 'green' },
  { label: 'Late', value: props.stats.late, color: 'yellow' },
  { label: 'Absence', value: props.stats.absence, color: 'red' }
])

function borderColor(color: AttendanceItem['color']) {
  switch (color) {
    case 'blue': return 'border-blue-500'
    case 'green': return 'border-green-500'
    case 'yellow': return 'border-yellow-500'
    case 'red': return 'border-red-500'
  }
}

function textColor(color: AttendanceItem['color']) {
  switch (color) {
    case 'blue': return 'text-blue-500'
    case 'green': return 'text-green-500'
    case 'yellow': return 'text-yellow-500'
    case 'red': return 'text-red-500'
  }
}
</script> 
