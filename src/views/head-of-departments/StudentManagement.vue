<template>
  <div class="min-h-screen bg-gray-50">
    
    <div class="bg-[#235AA6] text-white p-4 flex items-center justify-between shadow-lg mb-8">
      <div class="flex items-center"><h1 class="text-xl font-medium">Head of Department</h1></div>
      <div class="flex items-center space-x-4">
        <span class="text-white font-medium">{{ hodStore.currentDepartment.name || 'Department' }}</span>
      </div>
    </div>

    <div class="w-full px-8 pb-8">
      <div class="mb-6 pb-2 flex justify-between items-end">
        <div>
          <h1 :class="['text-3xl font-medium tracking-tight text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('student_management') || 'Student Information' }}
          </h1>
          <p class="text-lg text-gray-600 mt-1">
            Maintain and filter student records for {{ hodStore.currentDepartment.name }}.
          </p>
        </div>
        <button 
          class="px-5 py-2.5 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          New Student
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
        <div class="flex items-center space-x-4 mb-4">
            <input 
                type="text" 
                placeholder="Search by ID, Name..." 
                class="border border-gray-300 rounded-lg p-2.5 flex-grow focus:ring-blue-500 focus:border-blue-500"
            >
            <button class="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">Search</button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div v-if="hodStore.isLoading" class="p-8 text-center text-gray-500">Loading students...</div>
        
        <div v-else class="p-4">
          <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
                  <tr>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khmer Name</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Latin Name</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Gender</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="student in hodStore.students" :key="student.id" class="hover:bg-gray-50 transition duration-150">
                      <td class="px-3 py-4 text-sm font-medium text-gray-900">{{ student.id_card || student.id }}</td>
                      <td class="px-3 py-4 text-sm text-gray-700">{{ student.khmer_name }}</td>
                      <td class="px-3 py-4 text-sm text-gray-700">{{ student.latin_name || student.name }}</td>
                      <td class="px-3 py-4 text-sm text-gray-700">{{ student.gender }}</td>
                      <td class="px-3 py-4 text-sm text-indigo-600 font-medium">{{ student.grade || '-' }}</td>
                      <td class="px-3 py-4 text-sm font-medium space-x-2">
                          <button class="text-blue-600 hover:text-blue-800">View</button>
                      </td>
                  </tr>
                  <tr v-if="hodStore.students.length === 0">
                    <td colspan="6" class="p-4 text-center text-gray-500">No students found.</td>
                  </tr>
              </tbody>
          </table>
          <div class="p-4 border-t text-sm text-gray-600">
              Showing {{ hodStore.students.length }} entries
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

const { t, locale } = useI18n({ messages: { en: { student_management: 'Student Information' } } }); 
const router = useRouter();
const hodStore = useHODDataStore();

onMounted(() => {
  hodStore.fetchStudents();
});
</script>