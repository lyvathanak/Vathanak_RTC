<template>
  <div class="min-h-screen bg-gray-50 p-8">
    
    <div class="bg-[#235AA6] text-white p-4 flex items-center justify-between shadow-lg -mx-8 -mt-8 mb-8">
      <div class="flex items-center"><h1 class="text-xl font-medium">Head of Department</h1></div>
      <div class="flex items-center space-x-4"><button class="relative"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.007 2.007 0 0118 14.285V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.285c0 .531-.192 1.053-.595 1.405L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg><span class="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span></button><select class="bg-[#1e4a8b] border border-blue-700 rounded-md py-1 px-2 text-sm"><option>🇺🇸 EN</option><option>🇰🇭 KH</option></select><div class="flex items-center space-x-2"><img src="https://via.placeholder.com/30" alt="User Avatar" class="w-8 h-8 rounded-full border-2 border-white"><span class="text-white font-medium">John Doe</span></div></div>
    </div>

    <div class="w-full">
      <div class="mb-6 pb-2 flex justify-between items-end">
        <div>
          <h1 :class="['text-3xl font-medium tracking-tight text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('teacher_management') || 'Teacher Information' }}
          </h1>
          <p class="text-lg text-gray-600 mt-1">
            Maintain and filter faculty records, assignments, and specialist roles.
          </p>
        </div>
        <button 
          class="px-5 py-2.5 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          New Teacher
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
        <div class="flex items-center space-x-4 mb-4">
            <input 
                type="text" 
                placeholder="Search by ID, Name, or Expertise..." 
                class="border border-gray-300 rounded-lg p-2.5 flex-grow focus:ring-blue-500 focus:border-blue-500"
            >
            <button class="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">Search</button>
            <button class="px-4 py-2.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shadow-sm font-medium">Export</button>
        </div>
        
        <div class="grid grid-cols-7 gap-3 mt-4">
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Academic Year</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Grade Level</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Assignment Type</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Origin</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Gender</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Status</option>
            </select>
            <select class="border border-gray-300 rounded-lg p-2.5 text-sm text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Shift</option>
            </select>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div class="p-4">
          <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
                  <tr>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">
                          <input type="checkbox" class="rounded border-gray-300 text-blue-600 shadow-sm">
                      </th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fullname</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Latin Fullname</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DOB</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade Level</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Section</th>
                      <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="teacher in teacherList" :key="teacher.id" class="hover:bg-gray-50 transition duration-150">
                      <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <input type="checkbox" class="rounded border-gray-300 text-blue-600 shadow-sm">
                      </td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ teacher.id }}</td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{{ teacher.fullName }}</td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{{ teacher.latinFullName }}</td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{{ teacher.dob }}</td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-700">{{ teacher.gender }}</td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{{ teacher.gradeLevel }}</td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{{ teacher.section }}</td>
                      <td class="px-3 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button class="text-blue-600 hover:text-blue-800">View</button>
                          <button class="text-yellow-600 hover:text-yellow-800">Edit</button>
                          <button class="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                  </tr>
              </tbody>
          </table>
          
          <div class="p-4 border-t flex justify-between items-center text-sm text-gray-600">
              <span>Showing 1 to 10 of {{ teacherKPIs.totalFaculty }} entries</span>
              <div class="flex space-x-1">
                  <button class="px-3 py-1 border rounded-lg hover:bg-gray-100">Previous</button>
                  <button class="px-3 py-1 border rounded-lg bg-blue-600 text-white">1</button>
                  <button class="px-3 py-1 border rounded-lg hover:bg-gray-100">2</button>
                  <button class="px-3 py-1 border rounded-lg hover:bg-gray-100">Next</button>
              </div>
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

const { t, locale } = useI18n({ messages: { en: { teacher_management: 'Teacher Information' } } }); 
const router = useRouter();
const route = useRoute();

const teacherList = ref([]);
const teacherKPIs = ref({
    totalFaculty: 12,
    avgClassSize: 24,
});

const fetchData = () => {
    // Simulated data fetching
    setTimeout(() => {
        teacherList.value = [
            { id: 'T001', fullName: 'ហេង សុវណ្ណារី', latinFullName: 'Heng Sovannary', dob: '1990-08-01', gender: 'Female', gradeLevel: 'G3', section: 'A', status: 'Active' },
            { id: 'T002', fullName: 'វណ្ណី វីរៈ', latinFullName: 'Vanny Virak', dob: '1985-04-20', gender: 'Male', gradeLevel: 'Specialist', section: 'Music', status: 'Specialist' },
            { id: 'T003', fullName: 'ជុំ សេរី', latinFullName: 'Chum Serey', dob: '1995-12-12', gender: 'Female', gradeLevel: 'G1', section: 'C', status: 'Unassigned' },
            { id: 'T004', fullName: 'ច័ន្ទ មុនី', latinFullName: 'Chan Mony', dob: '1988-02-15', gender: 'Female', gradeLevel: 'G5', section: 'B', status: 'Active' },
        ];
    }, 500); 
};

onMounted(fetchData);
</script>