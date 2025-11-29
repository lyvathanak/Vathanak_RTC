<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 border-b border-gray-200 pb-4 flex justify-between items-end">
        <div>
          <h1 :class="['text-4xl font-extrabold tracking-tight text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('student_management') || 'Student Enrollment Management' }}
          </h1>
          <p class="text-lg text-gray-600 mt-1">
            Maintain student records, monitor attendance, and manage class assignments.
          </p>
        </div>
        <button 
          class="px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14c-1.46-1.54-3.53-2.5-6-2.5S3.46 12.46 2 14v4h12v-4z"></path></svg>
          Enroll New Student
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-indigo-600">
          <p class="text-sm font-semibold text-gray-500 uppercase">Total Enrollment</p>
          <p class="text-4xl font-bold text-gray-800 mt-1">285</p>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-600">
          <p class="text-sm font-semibold text-gray-500 uppercase">Avg. Daily Attendance</p>
          <p class="text-4xl font-bold text-green-600 mt-1">96.3%</p>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-6 transition-colors hover:bg-red-50 border-l-4 border-red-600 cursor-pointer">
          <p class="text-sm font-semibold text-red-600 uppercase">Chronic Absenteeism</p>
          <p class="text-4xl font-bold text-red-600 mt-1">5 Students</p>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-600">
          <p class="text-sm font-semibold text-gray-500 uppercase">Sections Created</p>
          <p class="text-4xl font-bold text-gray-800 mt-1">12</p>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Student Roster & Class Assignment</h2>
          
          <div class="flex items-center space-x-4 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input 
                  type="text" 
                  placeholder="Search by ID or Fullname..." 
                  class="border border-gray-300 rounded-lg p-2.5 flex-grow focus:ring-blue-500 focus:border-blue-500"
              >
              <select class="border border-gray-300 rounded-lg p-2.5">
                  <option value="">Filter by Grade</option>
                  <option value="G1">Grade 1</option><option value="G2">Grade 2</option>
              </select>
              <select class="border border-gray-300 rounded-lg p-2.5">
                  <option value="">Filter by Section</option>
                  <option value="A">Section A</option><option value="B">Section B</option>
              </select>
              <button class="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Export Data</button>
          </div>

          <div class="min-h-[400px] bg-white rounded-lg p-0">
              <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100">
                      <tr>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fullname</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Latin Fullname</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">DOB</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Gender</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Grade</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Section</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                      <tr class="hover:bg-blue-50 transition duration-150">
                          <td class="px-3 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">S001</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">សុខា មាស</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">Sokha Meas</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">2018-05-15</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">Female</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold">G3</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold">A</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm font-medium"><button class="text-indigo-600 hover:text-indigo-900">View/Edit</button></td>
                      </tr>
                      <tr class="bg-red-50 hover:bg-red-100 transition duration-150">
                          <td class="px-3 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">S014</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">ឆាយ ហេង</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">Chhay Heng</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">2017-02-28</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">Male</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold">G4</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold">B</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm font-medium"><button class="text-indigo-600 hover:text-indigo-900">View/Edit</button></td>
                      </tr>
                  </tbody>
              </table>
              <div class="py-4 text-center text-gray-500 text-sm border-t">... 283 more records (Pagination) ...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
// Mocked imports for display purposes
const authStore = { user: { name: 'Dr. Jane Doe' } };
const { t, locale } = useI18n({ messages: { en: { student_management: 'Student Management' } } }); 
const router = useRouter();
const route = useRoute();
</script>