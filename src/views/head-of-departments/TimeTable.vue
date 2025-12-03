<template>
  <div class="min-h-screen bg-gray-50">
    <div class="w-full px-8 pb-8">
      <div class="mb-6 pb-2 flex justify-between items-end">
        <div>
          <h1 :class="['text-3xl font-medium tracking-tight text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('department_timetable') || 'Time Table' }}
          </h1>
          <p class="text-lg text-gray-600 mt-1">
            Department Schedule for {{ hodStore.currentDepartment.name }}.
          </p>
        </div>
        <button 
          class="px-5 py-2.5 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Generate Schedule
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div class="p-4">
          <div v-if="hodStore.isLoading" class="p-8 text-center text-gray-500">Loading schedule...</div>
          
          <div v-else class="min-h-[600px] overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-xl overflow-hidden">
                  <thead class="bg-indigo-600 text-white">
                      <tr>
                          <th scope="col" class="w-24 px-4 py-3 text-sm font-semibold text-left">Time Slot</th>
                          <th v-for="day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day" scope="col" class="px-4 py-3 text-sm font-semibold text-center border-l border-indigo-500">
                            {{ day }}
                          </th>
                      </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="slot in hodStore.timeSlots" :key="slot.id" class="hover:bg-gray-50 transition duration-150">
                          <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800 bg-gray-50 border-r border-gray-200">
                            {{ slot.time_slot ? slot.time_slot.start_time : 'N/A' }}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                            {{ slot.mon?.subject || '-' }}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                            {{ slot.tue?.subject || '-' }}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                             {{ slot.wed?.subject || '-' }}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                            {{ slot.thu?.subject || '-' }}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                            {{ slot.fri?.subject || '-' }}
                          </td>
                      </tr>
                      <tr v-if="!hodStore.timeSlots.length">
                          <td colspan="6" class="p-4 text-center text-gray-500">No schedule data available.</td>
                      </tr>
                  </tbody>
              </table>
          </div>
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

const { t, locale } = useI18n({ messages: { en: { department_timetable: 'Time Table' } } }); 
const router = useRouter();
const hodStore = useHODDataStore();

onMounted(() => {
  hodStore.fetchTimeTable();
});
</script>