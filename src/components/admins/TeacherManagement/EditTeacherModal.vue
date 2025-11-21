<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="closeModal"></div>

      <!-- Dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          class="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl rounded-xl sm:rounded-2xl bg-white shadow-xl overflow-hidden max-h-[80vh] sm:max-h-[85vh] flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div
            class="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b bg-gray-50 flex items-center justify-between shrink-0"
          >
            <div class="flex items-end gap-2">
              <div class="text-base sm:text-lg md:text-xl tracking-wider font-bold">TEACHER</div>
              <span class="text-sm text-[#235AA6]">Edit Teacher</span>
            </div>
            <button
              class="p-2 rounded-md hover:bg-gray-100"
              @click="closeModal"
              aria-label="Close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Top Tabs -->
          <div class="px-4 sm:px-5 md:px-6 pt-3 sm:pt-4 shrink-0">
            <div
              class="inline-flex rounded-lg border border-gray-200 overflow-hidden w-full sm:w-auto"
            >
              <button
                class="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm"
                :class="
                  topTab === 'general'
                    ? 'bg-[#235AA6] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                "
                @click="topTab = 'general'"
              >
                General Information
              </button>
              <button
                class="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm"
                :class="
                  topTab === 'academic'
                    ? 'bg-[#235AA6] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                "
                @click="topTab = 'academic'"
              >
                <span class="hidden sm:inline">Professional Information</span>
                <span class="sm:hidden">Professional</span>
                <span class="text-red-500">*</span>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="px-4 sm:px-5 md:px-6 pb-2 pt-3 sm:pt-4 overflow-y-auto flex-1 min-h-0">
            <!-- ===== General Information ===== -->
            <section v-if="topTab === 'general'" class="space-y-4 sm:space-y-6">
              <!-- Basic Information (collapsible) -->
              <div>
                <button
                  class="w-full text-left flex items-center gap-2 font-semibold text-sm sm:text-base"
                  @click="basicOpen = !basicOpen"
                >
                  <Info class="w-4 text-gray-500 mr-1" />
                  Basic Information
                  <ChevronDown
                    class="ml-1 w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': basicOpen }"
                  />
                </button>

                <div v-show="basicOpen" class="mt-3 border rounded-lg p-3 sm:p-4">
                  <div class="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-4 sm:gap-5">
                    <!-- Photo -->
                    <div class="flex flex-col items-center justify-center lg:items-center">
                      <div class="w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 bg-gray-100 border rounded-lg overflow-hidden mb-2">
                        <img
                          v-if="currentImageSrc"
                          :src="currentImageSrc"
                          :alt="teacher.full_name || teacher.latin_name || 'Preview'"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                          <User class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                        </div>
                      </div>

                      <input
                        :key="fileInputKey"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        ref="fileEl"
                        @change="onPhotoChange"
                      />

                      <button
                        type="button"
                        @click="fileEl?.click()"
                        class="px-3 py-1.5 text-xs bg-gray-200 rounded-md transition-colors"
                      >
                        Choose a file
                      </button>
                    </div>

                    <!-- Fields -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs sm:text-sm text-gray-600 mb-1">ID Card</label>
                        <input
                          :value="form.id_card || '—'"
                          class="w-full rounded-lg border px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                          disabled
                          readonly
                          aria-readonly="true"
                        />
                      </div>
                      <div>
                        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Name KH</label>
                        <input
                          v-model="form.khmer_name"
                          class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Name Latin</label>
                        <input
                          v-model="form.latin_name"
                          class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Gender</label>
                        <div class="relative">
                          <select
                            v-model="form.gender"
                            class="w-full rounded-md border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                          <ChevronDown class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Date of Birth</label>
                        <input
                          v-model="form.date_of_birth"
                          type="date"
                          class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Place of Birth</label>
                        <input
                          v-model="form.place_of_birth"
                          class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div class="flex items-center gap-4 sm:col-span-2">
                        <label class="flex items-center gap-2">
                          <input
                            v-model="form.radie"
                            type="checkbox"
                            class="rounded"
                          />
                          <span class="text-xs sm:text-sm text-gray-600">Radie</span>
                        </label>
                        <label class="flex items-center gap-2">
                          <input
                            v-model="form.active"
                            type="checkbox"
                            class="rounded"
                          />
                          <span class="text-xs sm:text-sm text-gray-600">Active</span>
                        </label>
                      </div>
                      <div class="sm:col-span-2">
                        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Bio</label>
                        <textarea
                          v-model="form.bio"
                          rows="3"
                          class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- More Information (collapsible + inner tabs) -->
              <div>
                <button
                  class="w-full text-left flex items-center gap-2 font-semibold text-sm sm:text-base"
                  @click="moreOpen = !moreOpen"
                >
                  <Info class="w-4 text-gray-500 mr-1" />
                  More Information
                  <ChevronDown
                    class="ml-1 w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': moreOpen }"
                  />
                </button>

                <div v-show="moreOpen" class="mt-3 border rounded-lg">
                  <div class="p-3 sm:p-4">
                    <!-- Contact Information -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Origin</label>
                        <div class="relative">
                          <select
                            v-model="form.origin"
                            class="w-full rounded-md border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          >
                            <option value="">Select Province</option>
                            <option v-for="province in provinces" :key="province" :value="province">
                              {{ province }}
                            </option>
                          </select>
                          <ChevronDown class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Phone Number</label>
                        <input
                          v-model="form.phone"
                          class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Email</label>
                        <input
                          v-model="form.email"
                          type="email"
                          class="w-full rounded-md border px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                          disabled
                          readonly
                          aria-readonly="true"
                        />
                      </div>
                      <div>
                        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Current Address</label>
                        <input
                          v-model="form.current_address"
                          class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div class="sm:col-span-2">
                        <label class="block text-xs sm:text-sm text-gray-600 mb-1">Permanent Address</label>
                        <input
                          v-model="form.address"
                          class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- ===== New Academic Information ===== -->
            <section v-else class="space-y-3 sm:space-y-4">
              <div class="border rounded-lg p-3 sm:p-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs sm:text-sm text-gray-600 mb-1"
                      >Department <span class="text-red-500">*</span></label
                    >
                    <div class="relative">
                      <select
                        v-model="form.department_id"
                        @change="setDepartment(form.department_id)"
                        class="w-full rounded-md border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        :disabled="deptLoading"
                      >
                        <option value="">Select Department</option>
                        <option v-for="dept in departmentOptions" :key="dept.id" :value="dept.id">
                          {{ dept.label }}
                        </option>
                      </select>
                      <ChevronDown class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs sm:text-sm text-gray-600 mb-1"
                      >Join RTC <span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="form.join_at"
                      type="date"
                      class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-xs sm:text-sm text-gray-600 mb-1"
                      >Graduate From <span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="form.graduated_from"
                      class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-xs sm:text-sm text-gray-600 mb-1"
                      >Graduate Year <span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="form.graduated_at"
                      type="number"
                      min="1950"
                      max="2030"
                      class="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 2020"
                    />
                  </div>
                </div>
              </div>

            </section>
          </div>

          <!-- Footer -->
          <div
            class="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t bg-gray-50 flex items-center justify-between shrink-0"
          >
            <button
              class="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg border bg-red-500 text-white hover:bg-red-600 transition-colors"
              @click="closeModal"
            >
              Cancel
            </button>

            <div class="flex gap-2">
              <button
                class="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-[#FF7700] text-white hover:bg-[#e66a00] transition-colors"
                @click="promoteTeacher"
              >
                <span class="hidden sm:inline">Promote Teacher</span>
                <span class="sm:hidden">Promote</span>
              </button>
              <button
                class="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-[#235AA6] text-white hover:bg-[#1e4a94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="saveChanges"
                :disabled="saving"
              >
                <span v-if="saving">
                  <span class="hidden sm:inline">Updating...</span>
                  <span class="sm:hidden">Saving...</span>
                </span>
                <span v-else>
                  <span class="hidden sm:inline">Update</span>
                  <span class="sm:hidden">Save</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { X, ChevronDown, Info, User } from "lucide-vue-next";
// Import provinces data
import provincesData from "@/db/CambodiaAdministrationArea/provinces.json";
import { normalizeDateToYMD } from "@/stores/apis/TeacherCRUD";
import { useFilteredByDepartment, useProgramsFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";
import { TeacherCRUD } from "@/stores/apis/TeacherCRUD.js";
import { showNotification } from "@/lib/notifications.js";

// turn any date-ish value into input-friendly "YYYY-MM-DD" (or '')
const toDateInputValue = (v) => normalizeDateToYMD(v) || "";

// turn the current input value into API-friendly "YYYY-MM-DD" (or null)
const toApiDate = (v) => {
  const n = normalizeDateToYMD(v);
  return n && n.length ? n : null;
};

// Props
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  teacher: { type: Object, default: () => ({}) },
  departments: { type: Array, default: () => [] },
  positions: { type: Array, default: () => [] }
});

// Emits
const emit = defineEmits(["update:modelValue", "save", "promote"]);

// Use dynamic department and program composables
const { 
  departmentOptions, 
  selectedDepartmentId, 
  setDepartment,
  loading: deptLoading 
} = useFilteredByDepartment({ immediate: true });

const { 
  filtered: filteredPrograms, 
  selectedDepartmentId: programDeptId,
  setDepartment: setProgramDepartment,
  loading: programLoading 
} = useProgramsFilteredByDepartment({ immediate: true });

// Watch for department changes to filter programs
watch(selectedDepartmentId, (newDeptId) => {
  setProgramDepartment(newDeptId);
});

// Reactive state
const topTab = ref("general"); // 'general' | 'academic'
const basicOpen = ref(true);
const moreOpen = ref(true);
const innerTab = ref("contact");

// Loading state for save operation
const saving = ref(false);

// Tab configuration
const moreTabs = [
  { key: "contact", label: "Contact Information" }
];

// Sort provinces alphabetically for better UX
const provinces = computed(() => {
  return provincesData
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((province) => province.name);
});

// Form data structure for teacher
const blank = () => ({
  id_card: "",
  khmer_name: "",
  latin_name: "",
  full_name: "",
  gender: "",
  date_of_birth: "",
  place_of_birth: "",
  active: false,
  radie: false,
  bio: "",
  origin: "",
  phone: "",
  email: "",
  current_address: "",
  address: "",
  graduated_at: "",
  graduated_from: "",
  degree: "",
  join_at: "",
  start_year: "",
  end_year: "",
  department_id: "",
  position: "",
  experience_years: 0,
  academic_year: "2024-2025",
  photo_url: "",
  file: null,
});

const form = ref(blank());

const STORAGE_BASE = "https://api.rtc-bb.camai.kh/storage/";

const fileEl = ref(null);       // <input type="file"> reference
const fileInputKey = ref(0);    // to clear file input between opens
const previewUrl = ref(null);   // blob URL for new selection

// What the <img> should display: prefer new preview; else server image
const currentImageSrc = computed(() => {
  if (previewUrl.value) return previewUrl.value;

  const v =
    form.value.photo_url ||
    form.value.profile_picture ||
    form.value.user_detail?.profile_picture ||
    "";

  if (!v) return "";
  if (v.startsWith("http") || v.startsWith("data:")) return v; // absolute or data URL
  return STORAGE_BASE + v; // backend returns just a path
});

// Watch for prop changes and hydrate form
watch(
  () => [props.modelValue, props.teacher],
  () => {
    if (!props.modelValue) return;

    const base = blank();
    const data = JSON.parse(JSON.stringify(props.teacher || {}));

    // hydrate and normalize
    form.value = {
      ...base,
      ...data,

      // dates shown in <input type="date"> MUST be yyyy-mm-dd
      date_of_birth: toDateInputValue(
        data.user_detail?.date_of_birth ?? data.date_of_birth ?? ""
      ),
      join_at: toDateInputValue(
        data.join_at ?? data.hire_date ?? ""
      ),

      // common field name mismatches
      phone: data.phone ?? data.phone_number ?? "",
      full_name:
        data.full_name || data.khmer_name || data.latin_name || "",

      // file preview url
      photo_url: data.photo_url || data.profile_picture_url || "",
    };

    // ensure selects hold numbers (not strings/objects)
    form.value.department_id = Number(
      data.department_id ?? data.department?.id ?? ""
    ) || "";
    form.value.program_id = Number(
      data.program_id ?? data.program?.id ?? ""
    ) || "";

    // Set department selection for filtering programs
    if (data.department_id) {
      setDepartment(data.department_id);
    }
  },
  { immediate: true, deep: true }
);

watch(() => props.modelValue, (open) => {
  if (open) {
    fileInputKey.value++; // clears the <input type="file">
  } else if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
});

// Methods
const closeModal = () => {
  emit("update:modelValue", false);
};

const saveChanges = async () => {
  saving.value = true;
  
  try {
    const formData = { ...form.value };

    // Ensure we have the teacher ID for update
    const teacherId = formData.id || formData.user_id || props.teacher?.id || props.teacher?.user_id;
    
    if (!teacherId) {
      showNotification('Teacher ID not found. Please try again.', 'error');
      return;
    }

    // keep full_name in sync
    if (formData.khmer_name) formData.full_name = formData.khmer_name;
    else if (formData.latin_name) formData.full_name = formData.latin_name;

    // date normalization
    formData.date_of_birth = toApiDate(formData.date_of_birth);
    formData.join_at = toApiDate(formData.join_at);

    // phone alias
    if (!formData.phone_number && formData.phone) {
      formData.phone_number = formData.phone;
    }

    // if uploading a file, don't send a data URL in photo_url
    if (formData.file instanceof File && typeof formData.photo_url === "string" && formData.photo_url.startsWith("data:")) {
      delete formData.photo_url;
    }

    // Normalize IDs (accept number, string, or nested { id })
    formData.department_id = Number(
      formData.department_id ??
      formData.department?.id ??
      ""
    ) || null;

    formData.program_id = Number(
      formData.program_id ??
      formData.program?.id ??
      formData.programId ??
      ""
    ) || null;

    formData.sub_department_id = Number(
      formData.sub_department_id ??
      formData.sub_department?.id ??
      formData.section?.id ??
      ""
    ) || null;

    // Trim email/phone
    if (typeof formData.email === "string") {
      formData.email = formData.email.trim() || null;
    }
    if (typeof formData.phone_number === "string") {
      formData.phone_number = formData.phone_number.trim() || null;
    }

    // Convert graduated_at to integer
    if (formData.graduated_at) {
      formData.graduated_at = parseInt(formData.graduated_at) || null;
    }

    console.log("EditTeacherModal submitting:", {
      id: teacherId,
      department_id: formData.department_id,
      program_id: formData.program_id,
      sub_department_id: formData.sub_department_id,
    });

    const result = await TeacherCRUD.updateTeacher(teacherId, formData);

    if (result.success) {
      showNotification('Teacher updated successfully!', 'success');
      emit("save", result.data); // Emit the updated data to parent for refresh
      closeModal();
    } else {
      console.error("Failed to update teacher:", result.message);
      showNotification(result.message || 'Failed to update teacher', 'error');
    }
  } catch (error) {
    console.error("Error updating teacher:", error);
    showNotification('Error updating teacher. Please try again.', 'error');
  } finally {
    saving.value = false;
  }
};

const promoteTeacher = () => {
  emit("promote", {
    id_card: form.value.id_card,
    department_id: form.value.department_id,
    position: form.value.position,
  });
};

// Image upload handler
const onPhotoChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  form.value.file = file; // this is what you upload

  // live preview
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(file);
};


// ESC key handler
const onEsc = (ev) => {
  if (ev.key === "Escape") closeModal();
};

onMounted(() => window.addEventListener("keydown", onEsc));
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
</style>
