<!-- ViewStudentModal.vue -->
<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="close"></div>

      <!-- Dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6" @click.stop>
        <div role="dialog" aria-modal="true" class="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl rounded-xl sm:rounded-2xl bg-white shadow-xl overflow-hidden max-h-[80vh] sm:max-h-[85vh] flex flex-col">
          <!-- Header -->
          <div class="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b bg-gray-50 flex items-center justify-between">
            <div class="flex items-end text-sm text-gray-600 gap-1">
              <span :class="['font-bold text-base sm:text-lg md:text-xl text-gray-900', locale === 'kh' ? 'khmer-text' : '']">{{ t('student') }}</span>
              <span :class="['text-sm', locale === 'kh' ? 'khmer-text' : '']">{{ t('view_student') }}</span>
            </div>
            <button class="p-2 rounded-md hover:bg-gray-100 transition-colors" @click="close" aria-label="Close">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 min-h-0">
            <!-- Profile row -->
            <div class="rounded-xl sm:rounded-2xl bg-gray-100 p-3 sm:p-4 md:p-5">
              <div class="grid grid-cols-1 lg:grid-cols-[120px_1fr_1fr] xl:grid-cols-[140px_1fr_1fr] gap-4 sm:gap-5 md:gap-6 items-start">
                <!-- Photo + name -->
                <div class="flex lg:block items-center justify-center lg:justify-start gap-4">
                  <div class="w-[100px] h-[120px] sm:w-[120px] sm:h-[140px] rounded-md overflow-hidden border bg-white mx-auto lg:mx-0">
                    <img
                      v-if="student?.profile_picture || student?.photo_url || student?.user_detail?.profile_picture"
                      :src="`https://api.rtc-bb.camai.kh/storage/${student.profile_picture}`"
                      class="w-full h-full object-cover"
                      alt="Student photo"
                    />
                  </div>
                </div>

                <!-- Personal Information -->
                <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                  <div class="flex items-center gap-2 text-sm font-semibold mb-3">
                    <User2 class="w-4 h-4" /> <span :class="[locale === 'kh' ? 'khmer-text' : '']">{{ t('personal_information') }}</span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('latin_name') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                        {{ student.latin_name || '—' }}
                      </div>
                    </div>
                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('khmer_name') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800 khmer-text">
                        {{ student.khmer_name || '—' }}
                      </div>
                    </div>
                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('date_of_birth') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                        {{ fmtDate(student.date_of_birth) || '—' }}
                      </div>
                    </div>
                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('gender') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                        {{ student.gender || '—' }}
                      </div>
                    </div>
                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('address') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                        {{ student.address || '—' }}
                      </div>
                    </div>
                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('email_address') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                        {{ student.email || '—' }}
                      </div>
                    </div>
                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('phone_number') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                        {{ student.phone_number || '—' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Academic Information -->
                <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                  <div class="flex items-center gap-2 text-sm font-semibold mb-3">
                    <GraduationCap class="w-4 h-4" /> <span :class="[locale === 'kh' ? 'khmer-text' : '']">{{ t('academic_information') }}</span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('id_card') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                        {{ student.id_card || '—' }}
                      </div>
                    </div>

                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('department') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                        {{ getDepartmentName(student.department_id) }}
                      </div>
                    </div>

                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('grade') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                        {{ student.grade || '—' }}
                      </div>
                    </div>
                    
                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('program') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                        {{ getProgramName(student.program_id) }}
                      </div>
                    </div>

                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('promotion') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                        {{ student.promotion || '—' }}
                      </div>
                    </div>
                    <div>
                      <div :class="['text-[11px] tracking-wide text-gray-500 mb-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('section') }}</div>
                      <div class="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800">
                        {{ getSectionName(student.sub_department_id) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Academic History -->
            <div class="rounded-xl sm:rounded-2xl bg-gray-100 p-3 sm:p-4 md:p-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <div class="flex items-center gap-2 text-sm font-semibold">
                  <Clock class="w-4 h-4" /> <span :class="[locale === 'kh' ? 'khmer-text' : '']">{{ t('academic_history') }}</span>
                </div>

                <div
                  v-if="activeYear && yearData"
                  class="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-semibold"
                  :title="t('year_gpa')"
                >
                  {{ t('year_gpa') }}: {{ (yearData.gpaYear || 0).toFixed(2) }}
                </div>
              </div>

              <!-- Year tiles -->
              <div v-if="!activeYear" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                <button
                  v-for="y in years"
                  :key="y"
                  class="text-left rounded-lg sm:rounded-xl bg-white shadow-sm px-3 sm:px-4 py-2 sm:py-3 border hover:shadow-md transition"
                  @click="openYear(y)"
                >
                  <div :class="['text-sm font-semibold', locale === 'kh' ? 'khmer-text' : '']">{{ y }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ t('year_gpa') }}:
                    <span class="font-medium text-gray-700">
                      {{ (history[y]?.gpaYear || 0).toFixed(2) }}
                    </span>
                  </div>
                  <div v-if="student.id_card" class="text-[10px] sm:text-[11px] text-gray-400 mt-1">
                    {{ student.id_card }}
                  </div>
                </button>
              </div>

              <!-- Year detail -->
              <div v-else>
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <button
                    class="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline self-start"
                    @click="activeYear = ''"
                  >
                    <ChevronLeft class="w-4 h-4" /> Back to Years
                  </button>
                  <div class="text-base font-semibold">{{ activeYear }}</div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <!-- Semester 1 -->
                  <div class="bg-white rounded-lg sm:rounded-xl shadow-sm border overflow-hidden">
                    <div class="px-3 sm:px-4 py-2 bg-gray-50 border-b">
                      <span class="inline-block rounded-md bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1">
                        Semester 1
                      </span>
                    </div>
                    <div class="overflow-x-auto">
                      <table class="min-w-full text-xs sm:text-sm">
                        <thead>
                          <tr class="text-gray-500 text-xs uppercase bg-white">
                            <th class="px-3 sm:px-4 py-2 text-left">{{ t('subject') }}</th>
                            <th class="px-3 sm:px-4 py-2 text-left">{{ t('credit') }}</th>
                            <th class="px-3 sm:px-4 py-2 text-left">{{ t('absence') }}</th>
                            <th class="px-3 sm:px-4 py-2 text-left">{{ t('score') }}</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y">
                          <tr v-for="(r, i) in (yearData.sem1 || [])" :key="'s1-'+i" class="hover:bg-gray-50">
                            <td class="px-3 sm:px-4 py-2">{{ r.subject }}</td>
                            <td class="px-3 sm:px-4 py-2">{{ r.credit }}</td>
                            <td class="px-3 sm:px-4 py-2">{{ r.absence }}</td>
                            <td class="px-3 sm:px-4 py-2">{{ r.score }}</td>
                          </tr>
                          <tr v-if="!(yearData.sem1 && yearData.sem1.length)">
                            <td class="px-3 sm:px-4 py-4 sm:py-6 text-center text-gray-500" colspan="4">{{ t('no_subjects') }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Semester 2 -->
                  <div class="bg-white rounded-lg sm:rounded-xl shadow-sm border overflow-hidden">
                    <div class="px-3 sm:px-4 py-2 bg-gray-50 border-b">
                      <span class="inline-block rounded-md bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1">
                        Semester 2
                      </span>
                    </div>
                    <div class="overflow-x-auto">
                      <table class="min-w-full text-xs sm:text-sm">
                        <thead>
                          <tr class="text-gray-500 text-xs uppercase bg-white">
                            <th class="px-3 sm:px-4 py-2 text-left">{{ t('subject') }}</th>
                            <th class="px-3 sm:px-4 py-2 text-left">{{ t('credit') }}</th>
                            <th class="px-3 sm:px-4 py-2 text-left">{{ t('absence') }}</th>
                            <th class="px-3 sm:px-4 py-2 text-left">{{ t('score') }}</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y">
                          <tr v-for="(r, i) in (yearData.sem2 || [])" :key="'s2-'+i" class="hover:bg-gray-50">
                            <td class="px-3 sm:px-4 py-2">{{ r.subject }}</td>
                            <td class="px-3 sm:px-4 py-2">{{ r.credit }}</td>
                            <td class="px-3 sm:px-4 py-2">{{ r.absence }}</td>
                            <td class="px-3 sm:px-4 py-2">{{ r.score }}</td>
                          </tr>
                          <tr v-if="!(yearData.sem2 && yearData.sem2.length)">
                            <td class="px-3 sm:px-4 py-4 sm:py-6 text-center text-gray-500" colspan="4">{{ t('no_subjects') }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t bg-gray-50 flex justify-end shrink-0">
            <button :class="['px-4 py-2 rounded-lg border bg-red-600 hover:bg-red-500 text-white', locale === 'kh' ? 'khmer-text' : '']" @click="close">{{ t('close') }}</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { X, ChevronLeft, Clock, User2, GraduationCap } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
// Import composables for departments, programs, and sections
import { useDepartment } from "@/stores/global/useDepartment.js";
import { useProgram } from "@/stores/global/useProgram.js";
import { useSection } from "@/stores/global/useSection.js";

const { t, locale } = useI18n()

// Use composables for departments, programs, and sections
const {
  departments,
  getAllDepartments,
  departmentLoading
} = useDepartment();

const {
  programs,
  getAllPrograms,
  loading: programLoading,
} = useProgram();

const {
  sections: subDepartments,
  getAllSections,
  loading: sectionLoading
} = useSection();

// Fetch all required data
onMounted(async () => {
  try {
    console.log('ViewStudentModal: Loading departments, programs, and sections...');
    
    // Load data with individual error handling
    const results = await Promise.allSettled([
      getAllDepartments().catch(err => {
        console.error('Failed to load departments:', err);
        return { success: false, error: err };
      }),
      getAllPrograms().catch(err => {
        console.error('Failed to load programs:', err);
        return { success: false, error: err };
      }),
      getAllSections().catch(err => {
        console.error('Failed to load sections:', err);
        return { success: false, error: err };
      })
    ]);
    
    console.log('ViewStudentModal: Data loading results:', results);
    console.log('ViewStudentModal: Final data state:', {
      departments: departments?.value,
      programs: programs?.value,
      sections: subDepartments?.value
    });
  } catch (error) {
    console.error('ViewStudentModal: Failed to fetch data:', error);
  }
})

// Lookup functions
const getDepartmentName = (id) => {
  try {
    if (!id) return 'N/A';
    if (departmentLoading?.value) return 'Loading...';
    const deptList = departments?.value || [];
    if (!Array.isArray(deptList)) return 'N/A';
    const dept = deptList.find(d => d && d.id === id);
    const result = dept ? (dept.department_name || dept.name) : 'N/A';
    console.log('Looking up department:', { id, dept, result });
    return result;
  } catch (error) {
    console.error('Error in getDepartmentName:', error);
    return 'N/A';
  }
}

const getProgramName = (id) => {
  try {
    if (!id) return 'N/A';
    if (programLoading?.value) return 'Loading...';

    const list = programs?.value || [];
    const program = list.find(p => String(p?.id) === String(id));
    return program ? (program.program_name || program.name) : 'N/A';
  } catch (e) {
    console.error('Error in getProgramName:', e);
    return 'N/A';
  }
};

const getSectionName = (id) => {
  try {
    if (!id) return 'N/A';
    if (sectionLoading?.value) return 'Loading...';
    const sectionList = subDepartments?.value || [];
    if (!Array.isArray(sectionList)) return 'N/A';
    const section = sectionList.find(s => s && s.id === id);
    const result = section ? (section.name || section.sub_department_name) : 'N/A';
    console.log('Looking up section:', { id, section, result });
    return result;
  } catch (error) {
    console.error('Error in getSectionName:', error);
    return 'N/A';
  }
}

/* Props / Emits */
const props = defineProps({
  modelValue: { type: Boolean, default: false }, // v-model
  student: { type: Object, default: () => ({}) }, // includes academic_history
})
const emit = defineEmits(['update:modelValue'])

const modelValue = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
const student = computed(() => props.student || {})
const close = () => (modelValue.value = false)

// Debug student data when it changes
watch(() => props.student, (newStudent) => {
  console.log('ViewStudentModal: Student data received:', newStudent);
}, { immediate: true });

watch(
  () => props.modelValue,
  (open) => {
    if (open && props.student) {
      console.log('👀 ViewStudent RAW student:', props.student)
      console.log(
        '👀 ViewStudent DOB raw:',
        props.student.date_of_birth,
        '→ shown as:',
        fmtDate(props.student.date_of_birth)
      )
    }
  },
  { immediate: false }
)

/* Academic history */
const history = computed(() => (student.value.academic_history || {}))
const years = computed(() => Object.keys(history.value).sort((a, b) => a.localeCompare(b)))
const activeYear = ref('') // when empty, shows tiles
const yearData = computed(() => (activeYear.value ? history.value[activeYear.value] : null))
const openYear = (y) => (activeYear.value = y)

watch(() => student.value, () => { activeYear.value = '' })

/* Utilities */
const fmtDate = (d) => {
  if (!d) return '';
  try {
    let dateValue = d;
    
    // Handle different date formats from backend
    // If it's in DD-MM-YYYY format, convert to a proper date
    if (typeof dateValue === 'string' && dateValue.includes('-')) {
      const parts = dateValue.split('-');
      if (parts.length === 3 && parts[2].length === 4) {
        // Assume DD-MM-YYYY format, convert to MM/DD/YYYY for Date parsing
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        dateValue = `${month}/${day}/${year}`;
      }
    }
    // If it's in DD/MM/YYYY format, convert to MM/DD/YYYY for Date parsing
    else if (typeof dateValue === 'string' && dateValue.includes('/')) {
      const parts = dateValue.split('/');
      if (parts.length === 3) {
        // Check if it's DD/MM/YYYY (day > 12 or month <= 12)
        const first = parseInt(parts[0]);
        const second = parseInt(parts[1]);
        if (first > 12 || (first <= 12 && second <= 12 && parts[2].length === 4)) {
          // Assume DD/MM/YYYY format, convert to MM/DD/YYYY
          dateValue = `${parts[1]}/${parts[0]}/${parts[2]}`;
        }
      }
    }
    
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } else {
      // If date parsing fails, return the original value
      return d;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return d; // Return original value if formatting fails
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
