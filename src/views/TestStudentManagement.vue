<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Student Management Testing</h1>
            <p class="text-gray-600 mt-1">Test adding students and viewing all information</p>
          </div>
          <button
            @click="showAddModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            Add Test Student
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <Users class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Total Students</p>
              <p class="text-2xl font-semibold text-gray-900">{{ students.length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <CheckCircle class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Successful Adds</p>
              <p class="text-2xl font-semibold text-gray-900">{{ successCount }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-3 bg-red-100 rounded-lg">
              <XCircle class="w-6 h-6 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Failed Adds</p>
              <p class="text-2xl font-semibold text-gray-900">{{ errorCount }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <Clock class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Last Operation</p>
              <p class="text-sm font-medium text-gray-900">{{ lastOperationTime }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Test Actions</h2>
        <div class="flex flex-wrap gap-3">
          <button
            @click="loadAllStudents"
            :disabled="loading"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
            {{ loading ? 'Loading...' : 'Refresh Students' }}
          </button>
          
          <button
            @click="addRandomStudent"
            :disabled="loading"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Shuffle class="w-4 h-4" />
            Add Random Student
          </button>
          
          <button
            @click="clearResults"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Trash2 class="w-4 h-4" />
            Clear Results
          </button>
          
          <button
            @click="exportData"
            :disabled="students.length === 0"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Download class="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      <!-- Error/Success Messages -->
      <div v-if="messages.length > 0" class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Operation Messages</h2>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="[
              'p-3 rounded-lg text-sm',
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            ]"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium">{{ message.title }}</p>
                <p class="mt-1">{{ message.message }}</p>
                <p class="text-xs mt-1 opacity-75">{{ message.timestamp }}</p>
              </div>
              <button
                @click="removeMessage(index)"
                class="text-gray-500 hover:text-gray-700"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Students Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Students List ({{ students.length }})</h2>
            <div class="flex items-center gap-3">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search students..."
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                v-model="filterDepartment"
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                <option v-for="dept in uniqueDepartments" :key="dept" :value="dept">
                  {{ dept }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="filteredStudents.length === 0" class="p-12 text-center">
          <Users class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">No students found</p>
          <p class="text-gray-400 text-sm">Add some students to see them here</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="student in paginatedStudents" :key="student.id || student.user_id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    <img
                      v-if="student.profile_picture"
                      :src="student.profile_picture"
                      :alt="student.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <User class="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ student.id || student.user_id || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ student.latin_name || student.name || 'N/A' }}</div>
                  <div class="text-sm text-gray-500">{{ student.khmer_name || '' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ student.email || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ student.phone_number || student.phone || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getDepartmentName(student.department_id) || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getProgramName(student.program_id) || student.program || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewStudent(student)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteStudent(student)" 
                    class="text-red-600 hover:text-red-900"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, filteredStudents.length) }} of {{ filteredStudents.length }} results
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span class="px-3 py-1 text-sm">{{ currentPage }} of {{ totalPages }}</span>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Student Modal -->
    <AddStudentModal
      :showAdd="showAddModal"
      :rows="students"
      @close="showAddModal = false"
      @save="handleStudentAdded"
    />

    <!-- View Student Modal -->
    <ViewStudentModal
      v-if="selectedStudent"
      :open="showViewModal"
      :student="selectedStudent"
      @update:open="showViewModal = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Plus, Users, CheckCircle, XCircle, Clock, RefreshCw, Shuffle, Trash2, Download,
  X, Eye, User
} from 'lucide-vue-next';
import AddStudentModal from '@/components/admins/StudentManagement/AddStudentModal.vue';
import ViewStudentModal from '@/components/admins/StudentManagement/ViewStudentModal.vue';
import { StudentCRUD } from '@/stores/apis/StudentCRUD.js';
import { useDepartment } from '@/stores/global/useDepartment.js';
import { useProgram } from '@/stores/global/useProgram.js';

// Reactive data
const students = ref([]);
const loading = ref(false);
const showAddModal = ref(false);
const showViewModal = ref(false);
const selectedStudent = ref(null);
const messages = ref([]);
const successCount = ref(0);
const errorCount = ref(0);
const lastOperationTime = ref('Never');

// Search and filter
const searchQuery = ref('');
const filterDepartment = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// Composables
const { departments, getAllDepartments, getDepartmentById } = useDepartment();
const { programs, getAllPrograms, getProgramById } = useProgram();

// Computed properties
const filteredStudents = computed(() => {
  let filtered = students.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(student =>
      (student.latin_name || student.name || '').toLowerCase().includes(query) ||
      (student.khmer_name || '').toLowerCase().includes(query) ||
      (student.email || '').toLowerCase().includes(query) ||
      (student.phone_number || student.phone || '').toLowerCase().includes(query)
    );
  }

  // Department filter
  if (filterDepartment.value) {
    filtered = filtered.filter(student =>
      getDepartmentName(student.department_id) === filterDepartment.value
    );
  }

  return filtered;
});

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredStudents.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredStudents.value.length / pageSize.value);
});

const uniqueDepartments = computed(() => {
  const depts = new Set();
  students.value.forEach(student => {
    const deptName = getDepartmentName(student.department_id);
    if (deptName && deptName !== 'N/A') {
      depts.add(deptName);
    }
  });
  return Array.from(depts).sort();
});

// Helper functions
const getDepartmentName = (deptId) => {
  if (!deptId) return 'N/A';
  const dept = departments.value.find(d => d.id == deptId);
  return dept?.department_name || dept?.name || 'Unknown';
};

const getProgramName = (progId) => {
  if (!progId) return 'N/A';
  const prog = programs.value.find(p => p.id == progId);
  return prog?.program_name || prog?.name || 'Unknown';
};

const addMessage = (type, title, message) => {
  messages.value.unshift({
    type,
    title,
    message,
    timestamp: new Date().toLocaleTimeString()
  });
  
  // Keep only last 10 messages
  if (messages.value.length > 10) {
    messages.value = messages.value.slice(0, 10);
  }
  
  lastOperationTime.value = new Date().toLocaleTimeString();
};

const removeMessage = (index) => {
  messages.value.splice(index, 1);
};

// CRUD operations
const loadAllStudents = async () => {
  loading.value = true;
  try {
    const result = await StudentCRUD.getAllStudents();
    if (result.success) {
      students.value = result.data || [];
      addMessage('success', 'Students Loaded', `Successfully loaded ${students.value.length} students`);
    } else {
      addMessage('error', 'Load Failed', result.message || 'Failed to load students');
    }
  } catch (error) {
    console.error('Failed to load students:', error);
    addMessage('error', 'Load Error', error.message || 'Unknown error occurred');
  } finally {
    loading.value = false;
  }
};

const handleStudentAdded = async (newStudent) => {
  console.log('📥 New student added:', newStudent);
  addMessage('success', 'Student Added', `Successfully added ${newStudent.name || newStudent.latin_name}`);
  successCount.value++;
  
  // Refresh the list
  await loadAllStudents();
};

const deleteStudent = async (student) => {
  if (!confirm(`Are you sure you want to delete ${student.latin_name || student.name}?`)) {
    return;
  }

  try {
    const result = await StudentCRUD.deleteStudent(student);
    if (result.success) {
      students.value = students.value.filter(s => 
        (s.id !== student.id) && (s.user_id !== student.user_id)
      );
      addMessage('success', 'Student Deleted', `Successfully deleted ${student.latin_name || student.name}`);
    } else {
      addMessage('error', 'Delete Failed', result.message || 'Failed to delete student');
    }
  } catch (error) {
    console.error('Failed to delete student:', error);
    addMessage('error', 'Delete Error', error.message || 'Unknown error occurred');
  }
};

const viewStudent = (student) => {
  selectedStudent.value = student;
  showViewModal.value = true;
};

const addRandomStudent = async () => {
  const randomData = {
    latin_name: `Test Student ${Math.floor(Math.random() * 1000)}`,
    khmer_name: `សិស្សពិសោធន៍ ${Math.floor(Math.random() * 1000)}`,
    email: `test${Math.floor(Math.random() * 1000)}@example.com`,
    phone_number: `+855${Math.floor(Math.random() * 90000000) + 10000000}`,
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    date_of_birth: '2000-01-01',
    department_id: departments.value.length > 0 ? departments.value[0].id : null,
    program_id: programs.value.length > 0 ? programs.value[0].id : null,
    academic_year: '2024-2025'
  };

  try {
    const result = await StudentCRUD.createStudent(randomData);
    if (result.success) {
      addMessage('success', 'Random Student Added', `Successfully added ${randomData.latin_name}`);
      successCount.value++;
      await loadAllStudents();
    } else {
      addMessage('error', 'Random Add Failed', result.message || 'Failed to add random student');
      errorCount.value++;
    }
  } catch (error) {
    console.error('Failed to add random student:', error);
    addMessage('error', 'Random Add Error', error.message || 'Unknown error occurred');
    errorCount.value++;
  }
};

const clearResults = () => {
  if (confirm('Are you sure you want to clear all results and messages?')) {
    students.value = [];
    messages.value = [];
    successCount.value = 0;
    errorCount.value = 0;
    lastOperationTime.value = 'Never';
    currentPage.value = 1;
    searchQuery.value = '';
    filterDepartment.value = '';
  }
};

const exportData = () => {
  const dataStr = JSON.stringify(students.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `students_export_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  addMessage('success', 'Data Exported', `Exported ${students.value.length} students to JSON file`);
};

// Lifecycle
onMounted(async () => {
  // Load departments and programs first
  await Promise.all([
    getAllDepartments(),
    getAllPrograms()
  ]);
  
  // Then load students
  await loadAllStudents();
});
</script>

<style scoped>
/* Custom styles for testing interface */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
