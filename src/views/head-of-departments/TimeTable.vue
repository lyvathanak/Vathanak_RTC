<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6 pb-2 flex justify-between items-end">
        <div>
          <h1 :class="['text-3xl font-medium tracking-tight text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('department_timetable') || 'Time Table' }}
          </h1>
          <p class="text-lg text-gray-600 mt-1">
            Centralized tool for managing class assignments, resources, and conflict resolution.
          </p>
        </div>
        <button 
          class="px-5 py-2.5 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Generate Schedule
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
        <div class="flex items-center space-x-4 mb-4">
            <input 
                type="text" 
                placeholder="Search by Class/Teacher/Subject..." 
                class="border border-gray-300 rounded-lg p-2.5 flex-grow focus:ring-blue-500 focus:border-blue-500"
            >
            <button class="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">Search</button>
        </div>
        
        <div class="grid grid-cols-7 gap-3 mt-4">
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Academic Year</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Grade</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Section</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Origin</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Gender</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Shift</option>
            </select>
            <button class="px-4 py-2.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium">View Conflicts</button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div class="p-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Weekly Schedule: Grade 4 - Section A</h2>
          
          <div class="min-h-[600px] overflow-x-auto">
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
                      <tr v-for="slot in timeSlots" :key="slot.time" class="hover:bg-gray-50 transition duration-150">
                          <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800 bg-gray-50 border-r border-gray-200">{{ slot.time }}</td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                            <span :class="slot.mon.style">{{ slot.mon.subject }}</span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                            <span :class="slot.tue.style">{{ slot.tue.subject }}</span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                             <span :class="slot.wed.style">{{ slot.wed.subject }}</span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                            <span :class="slot.thu.style">{{ slot.thu.subject }}</span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-200">
                            <span :class="slot.fri.style">{{ slot.fri.subject }}</span>
                          </td>
                      </tr>
                      <tr>
                          <td colspan="6" class="p-4 text-center text-gray-500 font-medium bg-white">... Lunch and Afternoon Sessions ...</td>
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n({ messages: { en: { department_timetable: 'Time Table' } } }); 
const router = useRouter();
const route = useRoute();

const timeSlots = ref([]);

const getStyle = (subject) => {
    if (subject === 'Break' || subject === 'Free') return 'font-medium text-gray-500';
    if (subject.includes('Math')) return 'font-medium text-blue-800 bg-blue-100 px-3 py-1 rounded-full';
    if (subject.includes('English')) return 'font-medium text-purple-800 bg-purple-100 px-3 py-1 rounded-full';
    return 'font-medium text-green-800 bg-green-100 px-3 py-1 rounded-full';
};

const fetchData = () => {
    // Simulated data fetching
    setTimeout(() => {
        timeSlots.value = [
            {time: '8:00 - 9:00', mon: {subject: 'G4 Math', style: getStyle('G4 Math')}, tue: {subject: 'G4 Art', style: getStyle('G4 Art')}, wed: {subject: 'G4 Khmer', style: getStyle('G4 Khmer')}, thu: {subject: 'G4 Science', style: getStyle('G4 Science')}, fri: {subject: 'G4 PE', style: getStyle('G4 PE')}},
            {time: '9:00 - 10:00', mon: {subject: 'G4 English', style: getStyle('G4 English')}, tue: {subject: 'G4 Reading', style: getStyle('G4 Reading')}, wed: {subject: 'G4 Math', style: getStyle('G4 Math')}, thu: {subject: 'G4 English', style: getStyle('G4 English')}, fri: {subject: 'G4 Art', style: getStyle('G4 Art')}},
            {time: '10:00 - 10:15', mon: {subject: 'Break', style: getStyle('Break')}, tue: {subject: 'Break', style: getStyle('Break')}, wed: {subject: 'Break', style: getStyle('Break')}, thu: {subject: 'Break', style: getStyle('Break')}, fri: {subject: 'Break', style: getStyle('Break')}},
            {time: '10:15 - 11:15', mon: {subject: 'G4 Science', style: getStyle('G4 Science')}, tue: {subject: 'G4 Math', style: getStyle('G4 Math')}, wed: {subject: 'G4 English', style: getStyle('G4 English')}, thu: {subject: 'G4 Reading', style: getStyle('G4 Reading')}, fri: {subject: 'G4 Khmer', style: getStyle('G4 Khmer')}},
        ];
    }, 500); 
};

onMounted(fetchData);
</script>