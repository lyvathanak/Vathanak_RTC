<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 border-b border-gray-200 pb-4 flex justify-between items-end">
        <div>
          <h1 :class="['text-4xl font-extrabold tracking-tight text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('teacher_management') || 'Faculty Assignment & Resources' }}
          </h1>
          <p class="text-lg text-gray-600 mt-1">
            Manage homeroom assignments, teaching expertise, and staffing needs.
          </p>
        </div>
        <button 
          class="px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14c-1.46-1.54-3.53-2.5-6-2.5S3.46 12.46 2 14v4h12v-4z"></path></svg>
          Add New Teacher
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-2xl shadow-xl p-6 border-b-4 border-indigo-600">
          <p class="text-sm font-semibold text-gray-500 uppercase">Total Homeroom Teachers</p>
          <p class="text-4xl font-bold text-gray-800 mt-1">10</p>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-6 border-b-4 border-purple-600">
          <p class="text-sm font-semibold text-gray-500 uppercase">Specialist Teachers</p>
          <p class="text-4xl font-bold text-gray-800 mt-1">2</p>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-6 transition-colors hover:bg-red-50 border-b-4 border-red-600 cursor-pointer">
          <p class="text-sm font-semibold text-red-600 uppercase">Unassigned Sections</p>
          <p class="text-4xl font-bold text-red-600 mt-1">2</p>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-6 border-b-4 border-green-600">
          <p class="text-sm font-semibold text-gray-500 uppercase">Avg. Experience (Years)</p>
          <p class="text-4xl font-bold text-gray-800 mt-1">5.5</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div class="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-600">
              <h3 class="text-xl font-bold mb-4 text-red-700 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>
                Sections Needing Assignment
              </h3>
              <ul class="space-y-3 text-sm">
                <li class="flex justify-between items-center text-gray-800 p-2 bg-red-50 rounded-lg">
                    <span>Grade 1, Section C</span>
                    <span class="font-bold text-red-600">Homeroom Gap</span>
                </li>
                 <li class="flex justify-between items-center text-gray-800 p-2 bg-yellow-50 rounded-lg">
                    <span>Grade 6</span>
                    <span class="font-bold text-yellow-600">Needs Art Specialist</span>
                </li>
                <li class="text-center pt-2"><button class="text-indigo-600 hover:text-indigo-800 font-medium text-xs">View Assignment Tool →</button></li>
              </ul>
          </div>
          
          <div class="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
              <h3 class="text-xl font-bold mb-4 text-gray-800">Grade Level Coverage & Expertise Gaps</h3>
              <div class="space-y-4">
                  <div class="p-3 bg-blue-50 rounded-lg border border-blue-200 flex justify-between items-center">
                      <span class="font-semibold text-blue-700">Homeroom Coverage: Grade 1-6</span>
                      <div class="flex items-center space-x-4">
                          <span class="text-sm text-gray-600">Assigned: 10/12 Sections</span>
                          <span class="text-xl font-bold text-red-700">Gap: 2</span>
                      </div>
                  </div>
                  <div class="p-3 bg-purple-50 rounded-lg border border-purple-200 flex justify-between items-center">
                      <span class="font-semibold text-purple-700">Need: Music Teacher Certification</span>
                      <div class="flex items-center space-x-4">
                          <span class="text-sm text-gray-600">Certified Staff: 0</span>
                          <span class="text-xl font-bold text-red-700">Gap: High</span>
                      </div>
                  </div>
                  <div class="p-3 bg-gray-100 rounded-lg border border-gray-300 flex justify-between items-center">
                      <span class="font-semibold text-gray-700">Teachers with First Aid Certification</span>
                      <div class="flex items-center space-x-4">
                          <span class="text-sm text-gray-600">Total Teachers: 12</span>
                          <span class="text-xl font-bold text-green-700">Count: 8</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Faculty Roster & Details</h2>
          
          <div class="flex items-center space-x-4 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input type="text" placeholder="Search by Teacher ID, Name, or Grade Level..." class="border border-gray-300 rounded-lg p-2.5 flex-grow focus:ring-blue-500 focus:border-blue-500">
              <select class="border border-gray-300 rounded-lg p-2.5"><option value="">Filter by Grade Level</option><option value="G1">Grade 1</option><option value="Art">Art Specialist</option></select>
              <select class="border border-gray-300 rounded-lg p-2.5"><option value="">Filter by Assignment</option><option value="Homeroom">Homeroom</option><option value="Specialist">Specialist</option></select>
              <button class="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Export Report</button>
          </div>

          <div class="min-h-[400px] bg-white rounded-lg p-0">
              <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100">
                      <tr>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fullname</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Latin Fullname</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">DOB</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Grade Level</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Section</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Gender</th>
                          <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                      <tr class="hover:bg-blue-50 transition duration-150">
                          <td class="px-3 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">T001</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">ហេង សុវណ្ណារី</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">Heng Sovannary</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">1990-08-01</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold">G3</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold">A</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">Female</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm font-medium"><button class="text-indigo-600 hover:text-indigo-900">View/Assign</button></td>
                      </tr>
                      <tr class="bg-yellow-50 hover:bg-yellow-100 transition duration-150">
                          <td class="px-3 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">T002</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">វណ្ណី វីរៈ</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">Vanny Virak</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">1985-04-20</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-yellow-600 font-bold">Specialist</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-yellow-600 font-bold">Music</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">Male</td>
                          <td class="px-3 py-4 whitespace-nowrap text-sm font-medium"><button class="text-indigo-600 hover:text-indigo-900">View/Assign</button></td>
                      </tr>
                  </tbody>
              </table>
              <div class="py-4 text-center text-gray-500 text-sm border-t">... 10 more records (Pagination) ...</div>
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
const { t, locale } = useI18n({ messages: { en: { teacher_management: 'Teacher Management' } } }); 
const router = useRouter();
const route = useRoute();
</script>