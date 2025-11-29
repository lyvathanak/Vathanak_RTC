<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 border-b border-gray-300 pb-4 flex justify-between items-end">
        <div>
          <h1 :class="['text-4xl font-extrabold tracking-tight text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('department_timetable') || 'Master Scheduling Dashboard' }}
          </h1>
          <p class="text-lg text-gray-600 mt-1">
            Centralized tool for managing class assignments, resources, and conflict resolution.
          </p>
        </div>
        <button 
          class="px-5 py-2.5 bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:bg-green-800 transition-all duration-300 transform hover:scale-[1.03] flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Run Optimization
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition-shadow">
          <p class="text-sm font-semibold text-gray-500 uppercase">Total Classrooms</p>
          <p class="text-4xl font-extrabold text-gray-900 mt-1">12</p>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition-shadow">
          <p class="text-sm font-semibold text-gray-500 uppercase">Specialist Utilization</p>
          <p class="text-4xl font-extrabold text-gray-900 mt-1">85%</p>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-6 transition-colors border-l-4 border-red-700 cursor-pointer hover:bg-red-50">
          <p class="text-sm font-semibold text-red-700 uppercase">Scheduling Conflicts</p>
          <p class="text-4xl font-extrabold text-red-700 mt-1">2</p>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-600 hover:shadow-xl transition-shadow">
          <p class="text-sm font-semibold text-gray-500 uppercase">Homeroom Gaps</p>
          <p class="text-4xl font-extrabold text-gray-900 mt-1">2</p>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Weekly Schedule Overview</h2>

          <div class="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-300">
              <select class="border border-gray-300 rounded-lg p-2.5 flex-1 min-w-40 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm">
                  <option value="current">Filter by Academic Year</option>
                  <option value="2025">2025/2026</option>
                  <option value="2024">2024/2025</option>
              </select>
              <select class="border border-gray-300 rounded-lg p-2.5 flex-1 min-w-40 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm">
                  <option value="">Filter by Grade Level</option>
                  <option value="G1">Grade 1</option><option value="G6">Grade 6</option>
              </select>
               <select class="border border-gray-300 rounded-lg p-2.5 flex-1 min-w-40 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm">
                  <option value="">Filter by Section/Room</option>
                  <option value="A101">G1-A / Rm A101</option><option value="B202">G3-B / Rm B202</option>
              </select>
              <button class="px-5 py-2.5 text-sm bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
                <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                Full Screen View
              </button>
          </div>

          <div class="min-h-[600px] overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-xl overflow-hidden">
                  <thead class="bg-indigo-600 text-white">
                      <tr>
                          <th scope="col" class="w-24 px-4 py-3 text-sm font-bold text-left">Time Slot</th>
                          <th v-for="day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']" :key="day" scope="col" class="px-4 py-3 text-sm font-bold text-center border-l border-indigo-500">
                            {{ day }}
                          </th>
                      </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="slot in [
                          {time: '8:00 - 9:00', mon: 'G4 Math', tue: 'G4 Art', wed: 'G4 Khmer', thu: 'G4 Science', fri: 'G4 PE'},
                          {time: '9:00 - 10:00', mon: 'G4 English', tue: 'G4 Reading', wed: 'G4 Math', thu: 'G4 English', fri: 'G4 Art'},
                          {time: '10:00 - 10:15', mon: 'Break', tue: 'Break', wed: 'Break', thu: 'Break', fri: 'Break'},
                          {time: '10:15 - 11:15', mon: 'G4 Science', tue: 'G4 Math', wed: 'G4 English', thu: 'G4 Reading', fri: 'G4 Khmer'},
                      ]" :key="slot.time" class="hover:bg-gray-50 transition duration-150">
                          <td class="px-4 py-3 whitespace-nowrap text-xs font-semibold text-gray-800 bg-gray-50 border-r border-gray-200">{{ slot.time }}</td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                            <span :class="['font-medium text-blue-800 bg-blue-100 px-3 py-1 rounded-full']">{{ slot.mon }}</span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                            <span :class="['font-medium text-purple-800 bg-purple-100 px-3 py-1 rounded-full']">{{ slot.tue }}</span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                             <span :class="['font-medium text-blue-800 bg-blue-100 px-3 py-1 rounded-full']">{{ slot.wed }}</span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                            <span :class="['font-medium text-green-800 bg-green-100 px-3 py-1 rounded-full']">{{ slot.thu }}</span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                            <span :class="['font-medium text-purple-800 bg-purple-100 px-3 py-1 rounded-full']">{{ slot.fri }}</span>
                          </td>
                      </tr>
                      <tr>
                          <td colspan="6" class="p-4 text-center text-gray-500 font-medium bg-white">... Lunch and Afternoon Sessions Continue ...</td>
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
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
// Mocked imports for display purposes
const { t, locale } = useI18n({ messages: { en: { department_timetable: 'Department Time Table' } } }); 
const router = useRouter();
const route = useRoute();
</script>