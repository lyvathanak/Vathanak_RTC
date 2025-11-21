<template>
  <div class="rounded-[10px] overflow-x-hidden border border-gray-300">
    <table class="w-full table-fixed border-collapse">
      <thead>
        <tr class="bg-gray-200 text-gray-700">
          <th class="border border-gray-300 w-30 py-3 text-center px-3">Time</th>
          <th v-for="d in days" :key="d" class="border border-gray-300 py-3 font-semibold text-center">{{ d }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in times" :key="t" class="align-top">
          <td class="border border-gray-300 px-3 py-6 text-gray-700 font-medium w-28 text-center">{{ t }}</td>
          <td v-for="d in days" :key="d + t" class="border border-gray-300 px-3 py-4">
            <div v-if="slot(d, t)">
              <div class="text-center font-semibold">{{ slot(d, t)!.subject }}</div>
              <div class="mt-2 text-xs flex items-center text-gray-700">
                <span v-if="slot(d, t)!.teacher">{{ slot(d, t)!.teacher }}</span>
                <span v-if="slot(d, t)!.room" class="text-red-500 ml-auto">{{ slot(d, t)!.room }}</span>
              </div>
            </div>
            <div v-else class="h-16"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  days: string[]
  times: string[]
  slot: (day: string, time: string) => { subject: string; teacher?: string; room?: string } | undefined
}>()
</script>
