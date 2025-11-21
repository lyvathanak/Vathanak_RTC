<template>
  <!-- Add Student Modal -->
  <transition name="fade">
    <div v-if="showAdd" class="fixed inset-0 z-50">
      <!-- backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="closeAdd"></div>

      <!-- dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          class="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[80vh] sm:max-h-[85vh] rounded-xl sm:rounded-2xl bg-white shadow-xl flex flex-col"
        >
          <!-- header - fixed -->
          <div class="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b flex-shrink-0">
            <h3 class="text-base sm:text-lg md:text-xl font-semibold">{{$t('add_student')}}</h3>
            <button class="p-2 rounded-md hover:bg-gray-100 transition-colors" @click="closeAdd">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- body - scrollable -->
          <div class="flex-1 overflow-y-auto px-4 sm:px-5 md:px-6 py-4 sm:py-5">
            <div class="flex flex-col items-center gap-4 sm:gap-5">
              <!-- photo -->
              <div class="flex flex-col items-center flex-shrink-0">
                <label
                  class="relative w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 border-2 border-gray-300 rounded-sm overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onPhotoChange"
                  />
                  <div
                    v-if="!newStudent.profile_picture"
                    class="absolute inset-0 flex flex-col items-center justify-center text-gray-500"
                  >
                    <Plus class="w-6 sm:w-7 md:w-8 mb-1 sm:mb-2" />
                    <span class="text-xs sm:text-sm text-center px-1">
                      {{$t('click_to_upload_photo')}}
                    </span>
                  </div>
                  <img
                    v-if="newStudent.profile_picture"
                    :src="newStudent.profile_picture"
                    alt="Preview"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-if="newStudent.profile_picture"
                    class="absolute inset-0 bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center"
                  >
                    <span
                      class="text-white opacity-0 hover:opacity-100 text-sm font-medium"
                    >
                      {{$t('change_photo')}}
                    </span>
                  </div>
                </label>
              </div>

              <!-- form sections -->
              <div class="flex flex-col gap-4 sm:gap-5 w-full">
                <!-- Personal Information -->
                <div>
                  <div class="flex items-center font-semibold mb-3">
                    <Info class="w-4 text-gray-500 mr-2 flex-shrink-0" />
                    <h1 class="text-sm sm:text-base">{{$t('personal_information')}}</h1>
                  </div>
                  <div
                    class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-5 gap-y-3"
                  >
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('name_khmer')}}
                      </label>
                      <input
                        v-model="newStudent.khmer_name"
                        type="text"
                        class="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        :class="{ 'border-red-500 focus:ring-red-500': errors.khmer_name }"
                        :placeholder="$t('enter_name_khmer')"
                      />
                      <p v-if="errors.khmer_name" class="text-red-500 text-xs mt-1">{{ errors.khmer_name }}</p>
                    </div>
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('name_latin')}}
                      </label>
                      <input
                        v-model="newStudent.latin_name"
                        type="text"
                        class="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        :class="{ 'border-red-500 focus:ring-red-500': errors.latin_name }"
                        :placeholder="$t('enter_name_latin')"
                      />
                      <p v-if="errors.latin_name" class="text-red-500 text-xs mt-1">{{ errors.latin_name }}</p>
                    </div>
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('gender')}}
                      </label>
                      <div class="relative">
                        <select
                          v-model="newStudent.gender"
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.gender }"
                        >
                          <option value="" disabled>{{$t('select_gender')}}</option>
                          <option
                            v-for="g in genderOptions"
                            :key="g"
                            :value="g"
                          >
                            {{ g }}
                          </option>
                        </select>
                        <ChevronDown
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                      <p v-if="errors.gender" class="text-red-500 text-xs mt-1">{{ errors.gender }}</p>
                    </div>
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('date_of_birth')}}
                      </label>
                      <input
                        v-model="newStudent.date_of_birth"
                        type="date"
                        class="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        :class="{ 'border-red-500 focus:ring-red-500': errors.date_of_birth }"
                        :placeholder="$t('select_date_of_birth')"
                      />
                      <p v-if="errors.date_of_birth" class="text-red-500 text-xs mt-1">{{ errors.date_of_birth }}</p>
                    </div>
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('email')}}
                      </label>
                      <input
                        type="text"
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                        :value="newStudent.email || 'Auto-generated on save'"
                        disabled
                      />
                      <p class="text-xs text-gray-500">
                        This email will be generated by the system when you save the student.
                      </p>

                    </div>
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('phone_number')}}
                      </label>
                      <input
                        v-model="newStudent.phone_number"
                        type="tel"
                        class="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        :class="{ 'border-red-500 focus:ring-red-500': errors.phone_number }"
                        :placeholder="$t('enter_phone_number')"
                      />
                      <p v-if="errors.phone_number" class="text-red-500 text-xs mt-1">{{ errors.phone_number }}</p>
                    </div>
                  </div>
                </div>

                <!-- Academic Information -->
                <div>
                  <div class="flex items-center font-semibold mb-3">
                    <Info class="w-4 text-gray-500 mr-2 flex-shrink-0" />
                    <h1 class="text-sm sm:text-base">{{$t('academic_information')}}</h1>
                  </div>
                  <div
                    class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-5 gap-y-3"
                  >
                    <!-- Academic Year (Disabled but shows current) -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('academic_year')}}
                      </label>
                      <input
                        v-model="newStudent.academic_year"
                        type="text"
                        disabled
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                        :placeholder="getCurrentAcademicYear()"
                      />
                    </div>

                    <!-- Department -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('department')}}
                      </label>
                      <div class="relative">
                        <select
                          v-model="newStudent.department_id"
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.department_id }"
                          :disabled="departmentsLoading"
                        >
                          <option :value="null">
                            {{ departmentsLoading ? 'Loading departments...' : $t('select_department') }}
                          </option>
                          <option v-for="d in departmentOptions" :key="d.id" :value="d.id">
                            {{ d.name }}
                          </option>
                        </select>
                        <ChevronDown
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                      <p v-if="errors.department_id" class="text-red-500 text-xs mt-1">{{ errors.department_id }}</p>
                    </div>

                    <!-- Program (renamed from Promotion) -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('program')}}
                      </label>
                      <div class="relative">
                        <select
                          v-model.number="newStudent.program_id"
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.program_id }"
                          :disabled="programsLoading || !newStudent.department_id"
                        >
                          <!-- force select the placeholder -->
                          <option :value="null" :selected="newStudent.program_id == null">
                            {{
                              !newStudent.department_id
                                ? 'Please select a department first'
                                : programsLoading
                                  ? 'Loading programs...'
                                  : $t('select_program')
                            }}
                          </option>

                          <option v-for="p in filteredPrograms" :key="p.id" :value="p.id">
                            {{ p.program_name }}
                          </option>
                        </select>

                        <ChevronDown
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                      <p v-if="errors.program_id" class="text-red-500 text-xs mt-1">
                        {{ errors.program_id }}
                      </p>
                    </div>


                    <!-- Section -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        {{$t('section')}}
                      </label>
                      <div class="relative">
                        <select
                          v-model.number="newStudent.sub_department_id"
                          class="w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.sub_department_id }"
                          :disabled="sectionsLoading || !newStudent.department_id"
                        >
                          <!-- force select the placeholder -->
                          <option :value="null" :selected="newStudent.sub_department_id == null">
                            {{
                              !newStudent.department_id
                                ? 'Please select a department first'
                                : sectionsLoading
                                  ? 'Loading sections...'
                                  : $t('select_section')
                            }}
                          </option>

                          <option v-for="s in filteredSections" :key="s.id" :value="s.id">
                            {{ s.name }}
                          </option>
                        </select>

                        <ChevronDown
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                      <p v-if="errors.sub_department_id" class="text-red-500 text-xs mt-1">
                        {{ errors.sub_department_id }}
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- footer - fixed -->
          <div class="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t flex justify-end gap-3 flex-shrink-0 rounded-b-2xl bg-white">
            <button
              class="px-4 py-2 text-sm rounded-lg bg-[#FF4040] text-white border hover:bg-[#ff3030] transition-colors"
              @click="closeAdd"
            >
              {{$t('cancel')}}
            </button>
            <button
              class="px-4 py-2 text-sm rounded-lg bg-[#235AA6] text-white hover:bg-[#1e4a91] transition-colors"
              @click="saveStudent"
            >
              {{$t('save')}}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ChevronDown, Info, Plus, X } from "lucide-vue-next";
import { onMounted, onBeforeUnmount, computed, ref, reactive, watch } from "vue";
import { useAddStudent } from "@/stores/Student/useAddStudent.js";
import { StudentCRUD } from "@/stores/apis/StudentCRUD.js";
import { useFilteredByDepartment, useProgramsFilteredByDepartment, useSectionsFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";
import { useStudentFormValidate } from "@/stores/global/useFormValidate.js";
import { getAcademicYearForProgram } from "@/stores/global/getAcademicYear.js";

// Props
const props = defineProps({
  showAdd: { type: Boolean, required: true },
  rows: { type: Array, required: true },
});

// Emits
const emit = defineEmits(["close", "save"]);

// 🎯 Use the reusable composable
const { state: newStudent, setPhotoFile, submit, reset } = useAddStudent({
  createFn: StudentCRUD.createStudent,
  studentFullNameFromKhmer: true,
});

// ✅ Use reusable form validation composable
const { 
  errors, 
  validateStudent, 
  clearErrors, 
  mapServerErrors 
} = useStudentFormValidate();

function getCurrentAcademicYear() {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
}

// 🎯 Use FilterByDepartment composables
// Get departments for the dropdown
const { 
  departments, 
  departmentOptions,
  loading: departmentsLoading 
} = useFilteredByDepartment({ immediate: true });

// Get programs filtered by department
const { 
  selectedDepartmentId: selectedDepartmentIdForPrograms,
  filtered: programsFiltered, 
  rawList: allPrograms,
  loading: programsLoading,
  setDepartment: setProgramsDepartment
} = useProgramsFilteredByDepartment({ immediate: true });

// Get sections filtered by department  
const { 
  selectedDepartmentId: selectedDepartmentIdForSections,
  filtered: sectionsFiltered, 
  rawList: allSections,
  loading: sectionsLoading,
  setDepartment: setSectionsDepartment
} = useSectionsFilteredByDepartment({ immediate: true });

// Options for selects
const genderOptions = ["Male", "Female"];

// Computed properties for filtered options
const filteredPrograms = computed(() => {
  if (!newStudent.department_id) return allPrograms.value;
  return programsFiltered.value;
});

const filteredSections = computed(() => {
  if (!newStudent.department_id) return allSections.value;
  return sectionsFiltered.value;
});

const programOptions = computed(() => {
  if (programsLoading.value) return ["Loading..."];
  return filteredPrograms.value.map(p => p.program_name).filter(Boolean);
});

const sectionOptions = computed(() => {
  if (sectionsLoading.value) return ["Loading..."];
  return filteredSections.value.map(s => s.name).filter(Boolean);
});

// Helper functions for ID mapping
const getDepartmentId = (departmentName) => {
  const dept = departments.value.find(d => d.department_name === departmentName);
  return dept ? dept.id : null;
};

const getProgramId = (programName) => {
  const program = allPrograms.value.find(p => p.program_name === programName);
  return program ? program.id : null;
};

const getSectionId = (sectionName) => {
  const section = allSections.value.find(s => s.name === sectionName);
  return section ? section.id : null;
};

// Watch for department changes to reset dependent fields and update filters
watch(() => newStudent.department_id, (newDeptId, oldDeptId) => {
  if (newDeptId !== oldDeptId) {
    newStudent.program_id = null;
    newStudent.sub_department_id = null;
    newStudent.academic_year = getCurrentAcademicYear(); // Reset to default
    if (newDeptId) { setProgramsDepartment(newDeptId); setSectionsDepartment(newDeptId); }
    else { setProgramsDepartment(''); setSectionsDepartment(''); }
  }
});

// 🎯 Watch for program changes to auto-generate academic year
watch(() => newStudent.program_id, async (newProgramId) => {
  if (!newProgramId) {
    newStudent.academic_year = getCurrentAcademicYear();
    return;
  }

  try {
    console.log('🔍 Fetching academic year for program:', newProgramId);
    const result = await getAcademicYearForProgram(newProgramId);
    
    if (result.success && result.academicYear) {
      const dates = result.academicYear.dates;
      const academicYearString = `${dates.start_year}-${dates.end_year}`;
      newStudent.academic_year = academicYearString;
      console.log('✅ Academic year auto-generated:', academicYearString);
      console.log('📊 Program generation info:', result.generation);
    } else {
      console.warn('⚠️ Could not auto-generate academic year:', result.error);
      newStudent.academic_year = getCurrentAcademicYear();
    }
  } catch (error) {
    console.error('❌ Error fetching academic year:', error);
    newStudent.academic_year = getCurrentAcademicYear();
  }
});


// Close modal and reset
const closeAdd = () => {
  emit("close");
  reset();
  clearErrors();

  setTimeout(() => {
    newStudent.academic_year = getCurrentAcademicYear();
    newStudent.program_id = null;
    newStudent.department_id = null;
    newStudent.sub_department_id = null;
    newStudent.gender = null;
    newStudent.latin_name = null;
    newStudent.khmer_name = null;
    newStudent.date_of_birth = null;
    newStudent.phone_number = null;
    newStudent.email = null;
    newStudent.profile_picture = null;
    newStudent.file = null;

    // Reset file inputs
    document.querySelectorAll('input[type="file"]').forEach(i => (i.value = ""));
  }, 0);
};

// 🚀 Save
const saveStudent = async () => {
  clearErrors(); // fresh run
  newStudent.academic_year = getCurrentAcademicYear();

  // ✅ Use the reusable validation composable
  const formData = {
    latin_name: newStudent.latin_name,
    khmer_name: newStudent.khmer_name,
    phone_number: newStudent.phone_number,
    gender: newStudent.gender,
    date_of_birth: newStudent.date_of_birth,
    department_id: newStudent.department_id,
    program: newStudent.program_id,
    program_id: newStudent.program_id,
    section: newStudent.sub_department_id,
    sub_department_id: newStudent.sub_department_id,
    academic_year: newStudent.academic_year,
    profile_picture: newStudent.profile_picture,
    start_year: newStudent.start_year,
  };

  // ✅ ENABLE VALIDATION - This was commented out causing validation to be skipped!
  if (!validateStudent(formData)) {
    console.log("❌ Validation failed:", { ...errors });
    return;
  }

  // Map section/program (if labels) to IDs
  // const sectionId = getSectionId(newStudent.section);
  // const programId = getProgramId(newStudent.program);
  // if (sectionId !== undefined && sectionId !== null) newStudent.sub_department_id = Number(sectionId);
  // if (programId !== undefined && programId !== null) newStudent.program_id = Number(programId);

  // Ensure numeric department_id
  if (newStudent.department_id !== undefined && newStudent.department_id !== null && newStudent.department_id !== "") {
    newStudent.department_id = Number(newStudent.department_id);
  }

  // Ensure phone_number
  if (!newStudent.phone_number && newStudent.phone) {
    newStudent.phone_number = newStudent.phone;
  }

  // 🔎 Debug payload preview
  console.log("📤 SUBMITTING STUDENT DATA:", {
    latin_name: newStudent.latin_name,
    khmer_name: newStudent.khmer_name,
    gender: newStudent.gender,
    date_of_birth: newStudent.date_of_birth,
    phone_number: newStudent.phone_number,
    department_id: newStudent.department_id,
    sub_department_id: newStudent.sub_department_id,
    program_id: newStudent.program_id,
    academic_year: newStudent.academic_year,
    profile_picture: newStudent.profile_picture,
    file: newStudent.file,
  });

  const result = await submit();
  console.log("📥 SUBMISSION RESULT:", result);

  if (result.ok) {
    emit("save", result.data);
    closeAdd();
    return;
  }

  // ✅ FIXED: Map server errors → field errors
  mapServerErrors(result);
  console.log("❌ Server validation errors mapped:", { ...errors });
};

// 🖼️ Photo change
const onPhotoChange = (e) => {
  const f = e.target.files?.[0];
  e.target.value = "";
  if (!f) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(f.type)) {
    errors.global = "Please select a valid image file (JPEG, PNG, GIF, or WebP)";
    return;
  }
  if (f.size > 2 * 1024 * 1024) {
    errors.global = "Image size should be less than 2MB";
    return;
  }

  setPhotoFile(f);
  console.log("📸 Photo selected:", { name: f.name, size: f.size, type: f.type });
};

// ESC to close
const onEsc = (e) => { if (e.key === "Escape") closeAdd(); };

onMounted(async () => {
  window.addEventListener("keydown", onEsc);
  
  // FilterByDepartment composables handle data loading automatically
  // No need to manually call getAllDepartments, getAllPrograms, getAllSections
  
  newStudent.academic_year = getCurrentAcademicYear();
  newStudent.department_id = null;
  newStudent.program_id = null;
  newStudent.sub_department_id = null;
  if (!newStudent.gender) newStudent.gender = "";


  console.log("Modal mounted - Initial state:", {
    latin_name: newStudent.latin_name,
    khmer_name: newStudent.khmer_name,
    gender: newStudent.gender,
    date_of_birth: newStudent.date_of_birth,
    department_id: newStudent.department_id,
    section: newStudent.section,
    program: newStudent.program,
    academic_year: newStudent.academic_year,
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onEsc);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Y-axis responsiveness improvements */
@media (max-height: 700px) {
  .max-h-\[95vh\] {
    max-height: 98vh;
  }
}

@media (max-height: 600px) {
  .max-h-\[95vh\] {
    max-height: 100vh;
  }
  
  /* Reduce gaps on very short screens */
  .gap-3 {
    gap: 0.5rem;
  }
  
  .gap-4 {
    gap: 0.75rem;
  }
}

@media (max-height: 500px) {
  /* Further reduce spacing on extremely short screens */
  .py-3 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  .py-4 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .gap-y-2 {
    row-gap: 0.375rem;
  }
}
</style>
