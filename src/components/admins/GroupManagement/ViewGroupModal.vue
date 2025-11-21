<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200"
      >
        <h2 class="text-xl font-semibold text-gray-900">
          Group {{ resolvedGroupData?.name || '{name}' }}
        </h2>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Group Information -->
      <div class="p-6 border-b border-gray-200" v-if="resolvedGroupData">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-700">Department:</span>
            <div class="mt-1">
              <span v-if="resolvedGroupData.department_name !== 'N/A'" 
                    class="text-gray-900">{{ resolvedGroupData.department_name }}</span>
              <span v-else class="text-gray-400 italic">No department</span>
            </div>
          </div>
          <div>
            <span class="font-medium text-gray-700">Program:</span>
            <div class="mt-1">
              <span v-if="resolvedGroupData.program_name !== 'N/A'" 
                    class="text-gray-900">{{ resolvedGroupData.program_name }}</span>
              <span v-else class="text-gray-400 italic">No program</span>
            </div>
          </div>
          <div>
            <span class="font-medium text-gray-700">Section:</span>
            <div class="mt-1">
              <span v-if="resolvedGroupData.section_name !== 'N/A'" 
                    class="text-gray-900">{{ resolvedGroupData.section_name }}</span>
              <span v-else class="text-gray-400 italic">No section</span>
            </div>
          </div>
          <div>
            <span class="font-medium text-gray-700">Semester:</span>
            <div class="mt-1 flex items-center gap-2">
              <span class="text-gray-900 font-semibold text-lg">{{ semesterLabel }}</span>
              <span v-if="semesterDates" class="text-gray-500 text-xs">{{ semesterDates }}</span>
            </div>
          </div>
        </div>
        
        <!-- Additional Info Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
          <div v-if="resolvedGroupData.academic_year">
            <span class="font-medium text-gray-700">Academic Year:</span>
            <span class="ml-2 text-gray-900">{{ resolvedGroupData.academic_year }}</span>
          </div>
          <div v-if="resolvedGroupData.shift">
            <span class="font-medium text-gray-700">Shift:</span>
            <span class="ml-2 text-gray-900">{{ resolvedGroupData.shift }}</span>
          </div>
        </div>
        
        <div class="mt-4" v-if="resolvedGroupData.description">
          <span class="font-medium text-gray-700">Description:</span>
          <div class="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">{{ resolvedGroupData.description }}</div>
        </div>
      </div>

      <!-- Modal Body - Students Table -->
      <div class="overflow-y-auto max-h-[calc(90vh-280px)]">
        <!-- Loading state -->
        <div v-if="loading" class="p-8 text-center">
          <div class="flex items-center justify-center gap-2 text-gray-500">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            Loading students...
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="studentsList.length === 0" class="p-8 text-center">
          <div class="text-gray-500">
            <div v-if="studentCount > 0" class="mb-2">
              <p class="text-lg">This group has <strong class="text-gray-700">{{ studentCount }}</strong> {{ studentCount === 1 ? 'student' : 'students' }}</p>
              <p class="text-sm text-gray-400">but student details could not be loaded</p>
            </div>
            <div v-else>
              <p class="text-lg">No students found in this group</p>
            </div>
          </div>
        </div>

        <!-- Students Table -->
        <table v-else class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khmer Fullname
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Latin Fullname
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date of Birth
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gender
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="student in studentsList"
              :key="`student-${student.id}-${student.user_id}`"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ student.id_card }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ student.khmer_name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ student.latin_name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ student.date_of_birth || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : student.gender || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <AlertDialog>
                  <AlertDialogTrigger as-child>
                    <button
                      :disabled="isRemoving || removingStudents.includes(student.id)"
                      class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      :title="isRemoving ? 'Processing...' : 'Remove from group'"
                    >
                      <div v-if="removingStudents.includes(student.id)" class="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      <Trash2 v-else class="w-4 h-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{{$t('remove_student')}}</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove "{{ student.khmer_name || student.latin_name || `Student #${student.id_card}` }}" from this group? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{{$t('cancel')}}</AlertDialogCancel>
                      <AlertDialogAction 
                        class="bg-red-600 hover:bg-red-700 text-white" 
                        @click="removeStudentFromGroup(student)"
                      >
                        {{$t('remove')}}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <span>Total students: <strong class="text-gray-900">{{ studentCount }}</strong></span>
          <span v-if="loading" class="flex items-center gap-1">
            <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            Loading...
          </span>
          <span v-else-if="studentsList.length !== studentCount && studentCount > 0" 
                class="text-amber-600">
            ({{ studentsList.length }} loaded)
          </span>
        </div>
        <button
          @click="closeModal"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { X, Trash2 } from "lucide-vue-next";
import { GroupCRUD } from "@/stores/apis/GroupCRUD.js";
import { showNotification } from "@/lib/notifications.js";
import { useDepartment } from "@/stores/global/useDepartment.js";
import { useProgram } from "@/stores/global/useProgram.js";
import { useSection } from "@/stores/global/useSection.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getSemestersByProgram } from "@/stores/global/SemesterByProgram";

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  group: {
    type: Object,
    default: null,
  },
});

// Emits
const emit = defineEmits(["close", "student-removed"]);

// Composables for dynamic data resolution
const { getDepartmentById, getAllDepartments } = useDepartment();
const { getProgramById, getAllPrograms } = useProgram();
const { getSectionById, getAllSections } = useSection();

// State
const studentsList = ref([]);
const loading = ref(false);
const removingStudents = ref([]);
const isRemoving = ref(false); // Prevent multiple simultaneous removals

// ref for resolved semester
const resolvedSemester = ref(null)

// --- add below your existing refs ---
const semesterSource = computed(() => props.group?.semester || resolvedSemester.value || null)

const semesterLabel = computed(() => {
  const g = props.group || {}
  const s = semesterSource.value
  return (
    s?.semester_key ||
    (s?.semester_number ? `Semester ${s.semester_number}` : null) ||
    g.semester_key ||
    (g.semester_number ? `Semester ${g.semester_number}` : null) ||
    (g.semester_id ? `Semester ${g.semester_id}` : '—')
  )
})

const semesterDates = computed(() => {
  const s = semesterSource.value
  return (s?.start_date && s?.end_date) ? `${s.start_date} → ${s.end_date}` : ''
})

// Resolve semester object when we only have ids
const resolveSemesterForGroup = async () => {
  const g = props.group
  if (!g?.program_id || !g?.semester_id) {
    resolvedSemester.value = null
    return
  }
  try {
    const list = await getSemestersByProgram(g.program_id)
    const arr = Array.isArray(list) ? list : (list?.semesters || [])
    resolvedSemester.value = arr.find(s => Number(s.id) === Number(g.semester_id)) || null
  } catch {
    resolvedSemester.value = null
  }
}


// Computed properties for dynamic data resolution
const resolvedGroupData = computed(() => {
  if (!props.group) return null;
  
  try {
    // Get resolved names from IDs with fallbacks
    const department = getDepartmentById(props.group.department_id) || 
                     getDepartmentById(props.group.dept_id);
    const program = getProgramById(props.group.program_id) || 
                   getProgramById(props.group.programme_id);
    const section = getSectionById(props.group.section_id) || 
                   getSectionById(props.group.sub_department_id);

    return {
      ...props.group,
      department_name: department?.department_name || 
                      props.group.department || 
                      props.group.department_name || 
                      'N/A',
      program_name: program?.program_name || 
                   props.group.program || 
                   props.group.program_name || 
                   'N/A',
      section_name: section?.name || 
                   section?.section_name ||
                   props.group.section || 
                   props.group.section_name || 
                   'N/A'
    };
  } catch (error) {
    console.warn('Error resolving group data in modal:', error);
    return {
      ...props.group,
      department_name: props.group.department || 'N/A',
      program_name: props.group.program || 'N/A',
      section_name: props.group.section || 'N/A'
    };
  }
});

// Enhanced student count with multiple sources
const studentCount = computed(() => {
  // Always prioritize the actual loaded students count after operations
  return studentsList.value.length;
});

// Methods
const closeModal = () => {
  emit("close");
  resetData();
};

const resetData = () => {
  studentsList.value = [];
  removingStudents.value = [];
  isRemoving.value = false;
};

// Load composable data on mount
onMounted(async () => {
  await Promise.all([
    getAllDepartments(),
    getAllPrograms(),
    getAllSections()
  ]);
});

const loadGroupStudents = async () => {
  if (!props.group?.id) {
    studentsList.value = [];
    return;
  }

  loading.value = true;
  try {
    // Fetch group with students directly from the API
    const result = await GroupCRUD.getGroupStudents(props.group.id);
    if (result.success) {
      // Use the students data directly from the group
      studentsList.value = result.data.map((student, index) => ({
        id: student.id || student.user_id || `temp-${index}`, // Ensure we always have an ID
        user_id: student.user_id || student.id,
        id_card: student.id_card || student.id,
        khmer_name: student.khmer_name || student.name,
        latin_name: student.latin_name || student.name,
        full_name: student.full_name || student.khmer_name || student.latin_name,
        email: student.email,
        date_of_birth: student.date_of_birth || student.birth_date || 'N/A',
        gender: student.gender,
        pivot: student.pivot
      }));
      
      console.log("Students loaded:", studentsList.value.length);
    } else {
      console.error("Failed to load group students:", result.error);
      showNotification("Failed to load group students", 'error');
    }
  } catch (error) {
    console.error("Error loading group students:", error);
    showNotification("Error loading group students", 'error');
  } finally {
    loading.value = false;
  }
};

// Separate async function for the actual removal
const performRemoval = async (studentId, userId, studentName) => {
  try {
    const result = await GroupCRUD.removeStudentsFromGroup(props.group.id, [userId]);

    if (result.success) {
      // Update local state
      studentsList.value = studentsList.value.filter(s => s.id !== studentId);
      
      // Emit to parent
      emit("student-removed", {
        groupId: props.group.id,
        studentId: studentId,
        studentName,
        remainingCount: studentsList.value.length
      });

      showNotification(`${studentName} removed`, 'success');
    } else {
      showNotification("Failed to remove student", 'error');
    }
  } catch (error) {
    showNotification("Error removing student", 'error');
  } finally {
    // Cleanup
    isRemoving.value = false;
    removingStudents.value = removingStudents.value.filter(id => id !== studentId);
  }
};

const removeStudentFromGroup = (student) => {
  // Immediate validation and return
  if (isRemoving.value || !student?.id || !props.group?.id) return;
  
  const studentName = student.khmer_name || student.latin_name || `Student #${student.id_card}`;
  const studentId = student.id;
  const userId = student.user_id || student.id;

  // Immediate UI state update (no confirmation needed as AlertDialog handles it)
  isRemoving.value = true;
  if (!removingStudents.value) removingStudents.value = [];
  removingStudents.value.push(studentId);

  // Schedule async work for next tick
  setTimeout(() => performRemoval(studentId, userId, studentName), 0);
};

// Watch for modal open/close and group changes
watch(
  () => [props.isOpen, props.group],
  async ([isOpen, group]) => {
    if (isOpen && group) {
      await Promise.all([loadGroupStudents(), resolveSemesterForGroup()])
    } else if (!isOpen) {
      resetData()
      resolvedSemester.value = null
    }
  },
  { immediate: true }
)

</script>

<style scoped>
/* Add any custom styles if needed */
</style>
