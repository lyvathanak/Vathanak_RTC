<template>
  <!-- Add Teacher Modal -->
  <transition name="fade">
    <div v-if="showAdd" class="fixed inset-0 z-50">
      <!-- backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="closeAdd"></div>

      <!-- dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          class="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl rounded-xl sm:rounded-2xl bg-white shadow-xl max-h-[80vh] sm:max-h-[85vh] flex flex-col"
        >
          <!-- header -->
          <div class="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b shrink-0">
            <h3 class="text-base sm:text-lg md:text-xl font-semibold">Add Teacher</h3>
            <button class="p-2 rounded-md hover:bg-gray-100" @click="closeAdd">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- body -->
          <div class="px-4 sm:px-5 md:px-6 py-4 sm:py-5 overflow-y-auto flex-1 min-h-0">
            <div class="flex flex-col items-center gap-4 sm:gap-5">
              <!-- Global error display -->
              <div v-if="errors.global" class="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-600">{{ errors.global }}</p>
              </div>

              <!-- photo -->
              <div class="flex flex-col items-center">
                <label
                  class="relative w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 border-2 border-gray-300 rounded-sm overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onPhotoChange"
                  />
                  <div
                    v-if="!newTeacher.photo_url"
                    class="absolute inset-0 flex flex-col items-center justify-center text-gray-500"
                  >
                    <Plus class="w-6 sm:w-7 md:w-8 mb-1 sm:mb-2" />
                    <span class="text-[10px] sm:text-xs text-center px-1">Upload photo</span>
                  </div>
                  <img
                    v-if="newTeacher.photo_url"
                    :src="newTeacher.photo_url"
                    alt="Preview"
                    class="w-full h-full object-cover"
                  />
                </label>
                <p v-if="errors.photo" class="text-xs text-red-500 mt-2 text-center">
                  {{ errors.photo }}
                </p>
              </div>

              <!-- form fields -->
              <div class="flex flex-col gap-4 sm:gap-5 w-full">
                <!-- Personal Information -->
                <div>
                  <div class="flex items-center font-semibold mb-3">
                    <Info class="w-4 text-gray-500 mr-1" />
                    <h2 class="text-sm sm:text-base">Personal Information</h2>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label class="block text-xs sm:text-sm text-gray-600 mb-1"
                        >Name Khmer <span class="text-red-500">*</span></label
                      >
                      <input
                        v-model="newTeacher.khmer_name"
                        type="text"
                        :class="[
                          'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500',
                          errors.khmer_name ? 'border-red-500 focus:ring-red-500' : ''
                        ]"
                        placeholder="Enter name in Khmer"
                        required
                      />
                      <p v-if="errors.khmer_name" class="text-xs text-red-500 mt-1">
                        {{ errors.khmer_name }}
                      </p>
                    </div>
                    <div>
                      <label class="block text-xs sm:text-sm text-gray-600 mb-1"
                        >Name Latin <span class="text-red-500">*</span></label
                      >
                      <input
                        v-model="newTeacher.latin_name"
                        type="text"
                        :class="[
                          'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500',
                          errors.latin_name ? 'border-red-500 focus:ring-red-500' : ''
                        ]"
                        placeholder="Enter name in Latin"
                        required
                      />
                      <p v-if="errors.latin_name" class="text-xs text-red-500 mt-1">
                        {{ errors.latin_name }}
                      </p>
                    </div>
                    <div>
                      <label class="block text-xs sm:text-sm text-gray-600 mb-1"
                        >Gender <span class="text-red-500">*</span></label
                      >
                      <div class="relative">
                        <select
                          v-model="newTeacher.gender"
                          :class="[
                            'w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none',
                            errors.gender ? 'border-red-500 focus:ring-red-500' : ''
                          ]"
                          required
                        >
                          <option value="" disabled>Select Gender</option>
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
                      <p v-if="errors.gender" class="text-xs text-red-500 mt-1">
                        {{ errors.gender }}
                      </p>
                    </div>
                    <div>
                      <label class="block text-xs sm:text-sm text-gray-600 mb-1"
                        >Date of Birth
                        <span class="text-red-500">*</span></label
                      >
                      <input
                        v-model="newTeacher.date_of_birth"
                        type="date"
                        :class="[
                          'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500',
                          errors.date_of_birth ? 'border-red-500 focus:ring-red-500' : ''
                        ]"
                        required
                      />
                      <p v-if="errors.date_of_birth" class="text-xs text-red-500 mt-1">
                        {{ errors.date_of_birth }}
                      </p>
                    </div>
                    <div>
                      <label class="block text-xs sm:text-sm text-gray-600 mb-1"
                        >Email</label
                      >
                      <input
                        type="text"
                        class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                        :value="newTeacher.email || 'Auto-generated on save'"
                        disabled
                      />
                      <p class="text-xs text-gray-500">
                        This email will be generated by the system when you save the teacher.
                      </p>
                    </div>
                    <div>
                      <label class="block text-xs sm:text-sm text-gray-600 mb-1"
                        >Phone Number <span class="text-red-500">*</span></label
                      >
                      <input
                        v-model="newTeacher.phone"
                        type="tel"
                        :class="[
                          'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500',
                          errors.phone_number ? 'border-red-500 focus:ring-red-500' : ''
                        ]"
                        placeholder="Enter phone number"
                      />
                      <p v-if="errors.phone_number" class="text-xs text-red-500 mt-1">
                        {{ errors.phone_number }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Professional Information -->
                <div>
                  <div class="flex items-center font-semibold mb-3">
                    <Info class="w-4 text-gray-500 mr-1" />
                    <h2 class="text-sm sm:text-base">Professional Information</h2>
                  </div>
                  <div class="grid grid-cols-1 gap-3 sm:gap-4">
                    <!-- Department -->
                    <div>
                      <label class="block text-xs sm:text-sm text-gray-600 mb-1"
                        >Department <span class="text-red-500">*</span></label
                      >
                      <div class="relative">
                        <select
                          v-model.number="newTeacher.department_id"
                          :class="[
                            'w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none',
                            errors.department_id ? 'border-red-500 focus:ring-red-500' : ''
                          ]"
                          :disabled="departmentsLoading"
                          required
                        >
                          <option :value="null">
                            {{ 
                              departmentsLoading 
                                ? "Loading departments..." 
                                : departmentOptions.length === 0 
                                ? "No departments available" 
                                : "Select Department" 
                            }}
                          </option>
                          <option v-for="d in departmentOptions" :key="d.id" :value="d.id">
                            {{ d.department_name || d.name || d.label }}
                          </option>
                        </select>
                        <ChevronDown
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        />
                      </div>
                      <p v-if="errors.department_id" class="text-xs text-red-500 mt-1">
                        {{ errors.department_id }}
                      </p>
                      <p v-if="departmentOptions.length === 0 && !departmentsLoading" class="text-xs text-red-500 mt-1">
                        No departments found. Please check your connection.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- footer -->
          <div class="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t flex justify-end gap-2 sm:gap-3 shrink-0">
            <button
              class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors text-sm sm:text-base"
              @click="closeAdd"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 rounded-lg bg-[#235AA6] text-white hover:bg-[#1e4a94] transition-colors text-sm sm:text-base"
              @click="saveTeacher"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ChevronDown, Info, Plus, X } from "lucide-vue-next";
import { onMounted, onBeforeUnmount, reactive, computed, watch } from "vue";
import { TeacherCRUD } from "@/stores/apis/TeacherCRUD.js";
import { useAddTeacher } from "@/stores/Teacher/useAddTeacher.js";
import { useFilteredByDepartment, useProgramsFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";
import { useTeacherFormValidate } from "@/stores/global/useFormValidate.js";
import { showNotification } from "@/lib/notifications.js";

// Props
const props = defineProps({
  showAdd: { type: Boolean, required: true },
});

// Emits
const emit = defineEmits(["close", "save"]);

// ✅ Use reusable form validation composable
const { 
  errors, 
  validateTeacher, 
  clearErrors, 
  mapServerErrors,
  setError
} = useTeacherFormValidate();

// Teacher form data
const newTeacher = reactive({
  photo_url: "",
  file: null,
  latin_name: "",
  khmer_name: "",
  gender: "",
  date_of_birth: "",
  phone: "",
  // email removed - will be auto-generated by backend
  department_id: null,
  program_id: null,
  academic_year: "",
  status: "Active",
  active: true,
});

function getCurrentAcademicYear() {
  const y = new Date().getFullYear();
  return `${y}-${y + 1}`;
}

// 🎯 Use FilterByDepartment composables
// Get departments for the dropdown
const { 
  departments, 
  departmentOptions,
  loading: departmentsLoading,
  load: loadDepartments
} = useFilteredByDepartment({ immediate: true });

// Get programs filtered by department
const { 
  selectedDepartmentId: selectedDepartmentIdForPrograms,
  filtered: programsFiltered, 
  rawList: allPrograms,
  loading: programsLoading,
  setDepartment: setProgramsDepartment
} = useProgramsFilteredByDepartment({ immediate: true });

// Options for selects
const genderOptions = ["Male", "Female"];

// Computed properties for filtered options
const filteredPrograms = computed(() => {
  if (!newTeacher.department_id) return allPrograms.value;
  return programsFiltered.value;
});

// Watch for department changes to reset dependent fields and update filters
watch(() => newTeacher.department_id, (newDeptId, oldDeptId) => {
  if (newDeptId !== oldDeptId) {
    newTeacher.program_id = null;
    if (newDeptId) { 
      setProgramsDepartment(newDeptId); 
    }
    else { 
      setProgramsDepartment(''); 
    }
  }
});

// Debug watchers
watch(departments, (newDepts) => {
  console.log("🏢 Departments updated:", newDepts);
}, { deep: true });

watch(departmentOptions, (newOptions) => {
  console.log("📋 Department options updated:", newOptions);
}, { deep: true });

const closeAdd = () => {
  emit("close");
  resetForm();
  clearErrors();
};

const resetForm = () => {
  Object.assign(newTeacher, {
    photo_url: "",
    file: null,
    latin_name: "",
    khmer_name: "",
    gender: "",
    date_of_birth: "",
    phone: "",
    // email removed - will be auto-generated
    department_id: null,
    program_id: null,
    academic_year: getCurrentAcademicYear(),
    status: "Active",
    active: true,
  });
  
  console.log("🔄 Form reset to:", {
    latin_name: `"${newTeacher.latin_name}"`,
    khmer_name: `"${newTeacher.khmer_name}"`,
    phone: `"${newTeacher.phone}"`,
    gender: `"${newTeacher.gender}"`,
    department_id: newTeacher.department_id,
    academic_year: `"${newTeacher.academic_year}"`
  });
};

// Save teacher function
const saveTeacher = async () => {
  // Clear previous errors
  clearErrors();
  
  console.log("🔍 Current form state before validation:", {
    latin_name: `"${newTeacher.latin_name}"`,
    khmer_name: `"${newTeacher.khmer_name}"`,
    phone: `"${newTeacher.phone}"`,
    gender: `"${newTeacher.gender}"`,
    department_id: newTeacher.department_id,
    department_id_type: typeof newTeacher.department_id,
    date_of_birth: `"${newTeacher.date_of_birth}"`,
    academic_year: `"${newTeacher.academic_year}"`
  });
  
  // Ensure academic year is set
  if (!newTeacher.academic_year) {
    newTeacher.academic_year = getCurrentAcademicYear();
  }

  // ✅ Use the reusable validation composable (excluding email since it's auto-generated)
  const formData = {
    latin_name: newTeacher.latin_name?.trim(),
    khmer_name: newTeacher.khmer_name?.trim(),
    gender: newTeacher.gender,
    date_of_birth: newTeacher.date_of_birth,
    phone_number: newTeacher.phone?.trim(), // Map phone to phone_number for validation
    department_id: newTeacher.department_id,
    position: "Teacher" // Default position for teachers
    // ❌ NO EMAIL - it's auto-generated by backend
  };

  console.log("🔍 Validation data:", formData);

  // Additional manual checks for empty strings
  if (!formData.latin_name || formData.latin_name === '') {
    setError('latin_name', 'Latin Name is required');
  }
  if (!formData.khmer_name || formData.khmer_name === '') {
    setError('khmer_name', 'Khmer Name is required'); 
  }
  if (!formData.phone_number || formData.phone_number === '') {
    setError('phone_number', 'Phone Number is required');
  }
  if (!formData.gender || formData.gender === '') {
    setError('gender', 'Gender is required');
  }
  if (!formData.department_id || formData.department_id === null) {
    setError('department_id', 'Department is required');
  }
  if (!formData.date_of_birth || formData.date_of_birth === '') {
    setError('date_of_birth', 'Date of Birth is required');
  }

  // Check if we have any manual errors
  if (Object.keys(errors).length > 0) {
    console.log("❌ Manual validation failed:", { ...errors });
    return;
  }

  // Validate using the teacher validation schema (no email validation needed)
  if (!validateTeacher(formData)) {
    console.log("❌ Schema validation failed:", { ...errors });
    return;
  }

  // Create teacher object
  const teacherData = {
    // Primary identifiers - make sure name is set properly
    latin_name: newTeacher.latin_name?.trim(),
    khmer_name: newTeacher.khmer_name?.trim(),
    name: (newTeacher.latin_name || newTeacher.khmer_name || newTeacher.full_name || '').trim(),
    full_name: newTeacher.khmer_name?.trim(),

    // Contact information
    phone: newTeacher.phone?.trim(),
    phone_number: newTeacher.phone?.trim(), // Ensure both phone fields are set

    // Personal information
    gender: newTeacher.gender,
    date_of_birth: newTeacher.date_of_birth,
    
    // Academic/Professional information
    department_id: Number(newTeacher.department_id), // Ensure it's a number
    program_id: newTeacher.program_id ? Number(newTeacher.program_id) : null,
    academic_year: newTeacher.academic_year,
    position: "Teacher", // Default position for teachers
    
    // Status and activity
    status: newTeacher.status,
    active: newTeacher.active,
    is_active: newTeacher.active,
    
    // Media/Profile
    photo_url: newTeacher.photo_url,
    profile_picture: newTeacher.photo_url,
    file: newTeacher.file,
    
    // Additional fields backend might expect
    hire_date: new Date().toISOString().split("T")[0],
    join_rtc: new Date().toISOString().split("T")[0],
    experience_years: 0,
  };

    // 🔒 Final hard guards before API
  if (!teacherData.name) {
    setError('latin_name', 'Latin Name is required');
    return;
  }
  if (!Number.isFinite(teacherData.department_id)) {
    setError('department_id', 'Department is required');
    return;
  }


  console.log("📤 SUBMITTING TEACHER DATA:", teacherData);
  console.log("🔍 Form validation data:", {
    latin_name: newTeacher.latin_name,
    khmer_name: newTeacher.khmer_name,
    phone: newTeacher.phone,
    gender: newTeacher.gender,
    department_id: newTeacher.department_id,
    department_id_type: typeof newTeacher.department_id
  });

  try {
    const result = await TeacherCRUD.createTeacher(teacherData);
    console.log("📥 SUBMISSION RESULT:", result);
    
    if (result.success) {
      // Show success notification
      showNotification("Teacher created successfully!", "success");
      // Emit to parent component
      emit("save", result.data);
      closeAdd();
    } else {
      // Log error details for debugging
      console.log("❌ Server returned error:", {
        success: result.success,
        message: result.message,
        error: result.error,
        errors: result.errors,
        validation: result.validation
      });
      
      // Only map server errors if we have specific field errors
      if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
        mapServerErrors(result);
      } else if (result.errors && typeof result.errors === 'object') {
        // Handle object-style errors
        Object.entries(result.errors).forEach(([field, message]) => {
          if (typeof message === 'string' && field && message) {
            setError(field, message);
          }
        });
      } else {
        // Show general error message in global error field
        setError('global', result.message || result.error || "Failed to create teacher");
      }
    }
  } catch (error) {
    console.error("💥 Unexpected error creating teacher:", error);
    setError('global', "Failed to create teacher. Please try again.");
  }
};

// Photo handling
const onPhotoChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Clear any previous photo-related errors
  if (errors.photo) {
    delete errors.photo;
  }
  
  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    errors.photo = "Please select a valid image file (JPEG, PNG, GIF, or WebP)";
    return;
  }
  
  // Validate file size (2MB limit)
  if (file.size > 2 * 1024 * 1024) {
    errors.photo = "Image size should be less than 2MB";
    return;
  }

  // Set the file
  newTeacher.file = file;
  
  // Create preview URL
  const reader = new FileReader();
  reader.onload = () => (newTeacher.photo_url = reader.result);
  reader.readAsDataURL(file);
  
  console.log("📸 Photo selected:", { name: file.name, size: file.size, type: file.type });
};

// ESC key handling
const onEsc = (e) => {
  if (e.key === "Escape") closeAdd();
};

onMounted(async () => {
  window.addEventListener("keydown", onEsc);
  
  // Clear any existing errors
  clearErrors();
  
  // Explicitly load departments to ensure they're available
  try {
    console.log("🚀 Starting to load departments...");
    await loadDepartments();
    console.log("📊 Departments loaded:", departments.value);
    console.log("📋 Department options:", departmentOptions.value);
    console.log("🔄 Loading state:", departmentsLoading.value);
  } catch (error) {
    console.error("❌ Error loading departments:", error);
  }
  
  // Initialize form with current academic year
  newTeacher.academic_year = getCurrentAcademicYear();
  newTeacher.department_id = null;
  newTeacher.program_id = null;
  if (!newTeacher.gender) newTeacher.gender = "";
  
  // Debug current state
  setTimeout(() => {
    console.log("🔍 Current state after mount:");
    console.log("  - Departments:", departments.value?.length || 0);
    console.log("  - Department options:", departmentOptions.value?.length || 0);
    console.log("  - Programs:", allPrograms.value?.length || 0);
  }, 1000);
});
onBeforeUnmount(() => window.removeEventListener("keydown", onEsc));
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

/* Custom select styling */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
