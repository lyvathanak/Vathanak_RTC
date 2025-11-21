<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="closeModal"></div>

      <!-- Dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          class="w-full max-w-4xl rounded-2xl bg-white shadow-xl overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b bg-gray-50 flex items-center justify-between"
          >
            <div class="flex items-end gap-2">
              <div class="text-lg tracking-wider font-bold">HEAD OF DEPARTMENT</div>
              <span class="text-sm text-[#235AA6]">Edit HOD</span>
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
          <div class="px-6 pt-4">
            <div
              class="inline-flex rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                class="px-4 py-2 text-sm"
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
                class="px-4 py-2 text-sm"
                :class="
                  topTab === 'academic'
                    ? 'bg-[#235AA6] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                "
                @click="topTab = 'academic'"
              >
                Professional Information <span class="text-red-500">*</span>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="px-6 pb-2 pt-4 max-h-[70vh] overflow-y-auto">
            <!-- ===== General Information ===== -->
            <section v-if="topTab === 'general'" class="space-y-6">
              <!-- Basic Information (collapsible) -->
              <div>
                <button
                  class="w-full text-left flex items-center gap-2 font-semibold"
                  @click="basicOpen = !basicOpen"
                >
                  <Info class="w-4 text-gray-500 mr-1" />
                  Basic Information
                  <ChevronDown
                    class="ml-1 w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': basicOpen }"
                  />
                </button>

                <div v-show="basicOpen" class="mt-3 border rounded-lg p-4">
                  <div class="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
                    <!-- Photo -->
                    <div class="flex flex-col items-center">
                      <div class="w-32 h-40 bg-gray-100 border rounded-lg overflow-hidden mb-2">
                        <img
                          v-if="currentImageSrc"
                          :src="currentImageSrc"
                          :alt="hod?.full_name || hod?.latin_name || 'HOD Photo'"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                          <User class="w-12 h-12" />
                        </div>
                      </div>

                      <!-- important: :key lets us reset the input after Clear -->
                      <input
                        :key="fileInputKey"
                        ref="fileEl"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="onPhotoChange"
                      />

                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          @click="fileEl?.click()"
                          class="px-3 py-1.5 text-xs bg-gray-200 rounded-md transition-colors"
                        >
                          Choose a file
                        </button>

                        <button
                          v-if="previewUrl || typeof form.profile_picture === 'string' || hod?.profile_picture"
                          type="button"
                          @click="clearPhoto"
                          class="px-3 py-1.5 text-xs bg-gray-100 rounded-md transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <!-- Fields -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">ID Card</label>
                        <input
                          v-model="form.id_card"
                          class="w-full rounded-lg border px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                          disabled
                          readonly
                          aria-readonly="true"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Name KH</label>
                        <input
                          v-model="form.khmer_name"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Name Latin</label>
                        <input
                          v-model="form.latin_name"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Gender</label>
                        <div class="relative">
                          <select
                            v-model="form.gender"
                            class="w-full rounded-md border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                          <ChevronDown class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Date of Birth</label>
                        <input
                          v-model="form.date_of_birth"
                          type="date"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Place of Birth</label>
                        <input
                          v-model="form.place_of_birth"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div class="flex items-center gap-4 md:col-span-2">
                        <label class="flex items-center gap-2">
                          <input
                            v-model="form.active"
                            type="checkbox"
                            class="rounded"
                          />
                          <span class="text-sm text-gray-600">Active</span>
                        </label>
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm text-gray-600 mb-1">Bio</label>
                        <textarea
                          v-model="form.bio"
                          rows="3"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- More Information (collapsible) -->
              <div>
                <button
                  class="w-full text-left flex items-center gap-2 font-semibold"
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
                  <div class="p-4">
                    <!-- Contact Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Origin</label>
                        <div class="relative">
                          <select
                            v-model="form.origin"
                            class="w-full rounded-md border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
                        <label class="block text-sm text-gray-600 mb-1">Phone Number</label>
                        <input
                          v-model="form.phone"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Email</label>
                        <input
                          v-model="form.email"
                          type="email"
                          class="w-full rounded-md border px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                          disabled
                          readonly
                          aria-readonly="true"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Current Address</label>
                        <input
                          v-model="form.current_address"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm text-gray-600 mb-1">Permanent Address</label>
                        <input
                          v-model="form.address"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- ===== Professional Information ===== -->
            <section v-else class="space-y-4">
              <div class="border rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

                  <!-- Department (NEW) -->
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">Department <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <select
                        v-model.number="form.department_id"
                        class="w-full rounded-md border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        @change="onDepartmentChange"
                      >
                        <option value="">Select Department</option>
                        <option v-for="d in availableDepartments" :key="d.value" :value="d.value">
                          {{ d.label }}
                        </option>
                      </select>
                      <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm text-gray-600 mb-1"
                      >Join RTC <span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="form.join_at"
                      type="date"
                      class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1"
                      >Graduate From <span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="form.graduated_from"
                      class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm text-gray-600 mb-1"
                      >Graduate Year <span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="form.graduated_at"
                      type="number"
                      min="1950"
                      max="2030"
                      class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 2020"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-4 border-t bg-gray-50 flex items-center justify-between"
          >
            <button
              class="px-4 py-2 bg-red-500 text-white rounded-lg border hover:bg-red-600"
              @click="closeModal"
            >
              Cancel
            </button>

            <div class="flex gap-2">
              <button
                class="px-4 py-2 rounded-lg bg-[#FF7700] text-white hover:bg-[#e66a00] transition-colors"
                @click="promoteHOD"
              >
                Promote HOD
              </button>
              <button
                class="px-4 py-2 rounded-lg bg-[#235AA6] text-white hover:bg-[#1e4a94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="saveChanges"
                :disabled="saving"
              >
                {{ saving ? 'Updating...' : 'Update' }}
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
import provincesData from "@/db/CambodiaAdministrationArea/provinces.json";
import { useFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";
import { normalizeDateToYMD } from "@/stores/global/normalizedDate.js";
import HODCRUD from "@/stores/apis/HeadOfDepartmentCRUD.js";
import { showNotification } from "@/lib/notifications.js";

// Props
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  hod: { type: Object, default: () => null },
  departments: { type: Array, default: () => [] },
  positions: { type: Array, default: () => [] }
});

// Emits
const emit = defineEmits(["update:modelValue", "save", "promote"]);

// Top tabs
const topTab = ref("general");
const basicOpen = ref(true);
const moreOpen = ref(true);

// Loading state for save operation
const saving = ref(false);

/** Departments composable */
const {
  departmentOptions,       // [{label,value,id,name}]
  setDepartment,
  load: loadDepartments,
} = useFilteredByDepartment({ immediate: true });

/** Fallback options if composable list empty */
const deptOptions = computed(() => {
  if (Array.isArray(departmentOptions?.value) && departmentOptions.value.length) {
    // normalize external composable too
    return departmentOptions.value.map(o => ({
      label: o.label ?? o.name ?? String(o.value ?? o.id ?? ''),
      value: Number(o.value ?? o.id ?? 0),
    }));
  }
  return (props.departments || []).map(d => ({
    label: d.department_name || d.name,
    value: Number(d.id),               // ← make it a number
  }));
});

// IDs of departments that already have a head (excluding the one we're editing)
const takenDepartmentIds = computed(() => {
  const currentUserId = props.hod?.user_id ?? props.hod?.id ?? null;
  const set = new Set(
    (hods.value || [])
      .filter(h => (h.user_id ?? h.id) !== currentUserId) // exclude current HOD
      .map(h => h.head_department?.id ?? h.department_id)
      .filter(id => id != null)
      .map(Number)
  );
  return set;
});

// Final list for dropdown: all departments minus "taken", but always include current
const availableDepartments = computed(() => {
  const curId = Number(form.value.department_id || NaN);
  return (deptOptions.value || []).filter(d => {
    if (Number(d.value) === curId) return true; // keep current selection visible
    return !takenDepartmentIds.value.has(Number(d.value));
  });
});


function onDepartmentChange() {
  const deptId = form.value.department_id;
  console.log('🏢 Department changed:', { 
    deptId, 
    type: typeof deptId,
    formDepartmentId: form.value.department_id 
  });
  setDepartment(deptId);
}

// Provinces
const provinces = computed(() =>
  provincesData.slice().sort((a, b) => a.name.localeCompare(b.name)).map(p => p.name)
);

// Form model
const blank = () => ({
  id_card: "",
  khmer_name: "",
  latin_name: "",
  full_name: "",
  gender: "",
  date_of_birth: "",
  place_of_birth: "",
  active: true,
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
  department: "",
  department_id: null,
  position: "",
  experience_years: 0,
  academic_year: "2024-2025",
  photo_url: "",   // used only for preview/UI
  profile_picture: null, // original server URL (if any)
  file: null,      // File when user picks new image
});

const form = ref(blank());

/** Utils kept (gender code) */
function fromGenderCode(g) {
  if (!g) return "";
  if (g === "M") return "Male";
  if (g === "F") return "Female";
  return g;
}
function toGenderCode(g) {
  if (g === "Male") return "M";
  if (g === "Female") return "F";
  return g;
}

/** Hydrate form when opening / hod changes */
watch(
  () => [props.modelValue, props.hod],
  () => {
    if (!props.modelValue) return;

    const base = blank();
    const h = props.hod || {};

    const depId = Number(
      h.department_id ??
      h.user_detail?.department_id ??
      h.hod_detail?.department_id ??
      h.head_department?.id ?? 
      NaN
    );

    form.value = {
      ...base,

      // display-only
      id_card: h.id_card ?? h.employee_id ?? h.id ?? "",
      email: h.email ?? "",

      // names
      khmer_name: h.khmer_name ?? h.full_name ?? "",
      latin_name: h.latin_name ?? "",
      full_name: h.khmer_name ?? h.full_name ?? h.latin_name ?? "",

      // gender/date normalization (✅ use shared normalizer)
      gender: fromGenderCode(h.gender),
      date_of_birth: normalizeDateToYMD(h.date_of_birth || h.dob),
      join_at:      normalizeDateToYMD(h.join_at),

      // misc
      place_of_birth: h.place_of_birth ?? "",
      active: typeof h.active === "boolean" ? h.active : true,
      bio: h.bio ?? "",
      origin: h.origin ?? "",
      phone: h.phone ?? h.phone_number ?? "",
      current_address: h.current_address ?? "",
      address: h.address ?? "",

      graduated_at: h.graduated_at ?? "",
      graduated_from: h.graduated_from ?? "",
      degree: h.degree ?? "",

      // department (keep both id & name)
      department_id: Number.isFinite(depId) ? depId : null,
      department:
        h.department ||
        h.department_name ||
        (Number.isFinite(depId)
          ? (props.departments || []).find(d => Number(d.id) === depId)?.department_name
          : "") ||
        "",

      position: h.position ?? "",
      experience_years: h.experience_years ?? 0,
      academic_year: h.academic_year ?? "2024-2025",

      // image: server URL for display; file stays null until user picks new
      photo_url: h.photo_url || h.profile_picture || h.user_detail?.profile_picture || "",
      profile_picture: (h.profile_picture || h.photo_url || h.user_detail?.profile_picture || "") || null,
    };

    // Keep composable in sync
    if (Number.isFinite(depId)) setDepartment(depId); else setDepartment("");
  },
  { immediate: true }
);

// Ensure departments loaded
const hods = ref([]); // ✅ NEW

onMounted(async () => {
  await loadDepartments?.();

  // Load all current HODs to know which departments are already owned
  const res = await HODCRUD.getAllHODs();
  hods.value = Array.isArray(res?.data) ? res.data : [];
});


// Methods
const closeModal = () => {
  emit("update:modelValue", false);
};

const saveChanges = async () => {
  saving.value = true;
  
  try {
    const formData = { ...form.value };

    // Ensure we include the original HOD ID for update
    formData.id = formData.id || props.hod?.id || props.hod?.user_id;
    formData.user_id = formData.user_id || props.hod?.user_id || props.hod?.id;

    // keep full_name in sync
    if (formData.khmer_name) formData.full_name = formData.khmer_name;
    else if (formData.latin_name) formData.full_name = formData.latin_name;

    // date normalization
    formData.date_of_birth = normalizeDateToYMD(formData.date_of_birth);
    formData.join_at = normalizeDateToYMD(formData.join_at);

    // phone alias
    if (!formData.phone_number && formData.phone) {
      formData.phone_number = formData.phone;
    }

    // if uploading a file, don't send a data URL in photo_url
    if (formData.file instanceof File && typeof formData.photo_url === "string" && formData.photo_url.startsWith("data:")) {
      delete formData.photo_url;
    }

    // Convert graduated_at to integer
    if (formData.graduated_at) {
      formData.graduated_at = parseInt(formData.graduated_at) || null;
    }

    console.log("EditHODModal submitting:", {
      id: formData.id,
      user_id: formData.user_id,
      department_id: formData.department_id,
      department_id_type: typeof formData.department_id,
      department_id_number: Number(formData.department_id),
    });

    // Use the HOD ID from the form data or fall back to selected HOD
    const hodId = formData.id || formData.user_id;
    
    if (!hodId) {
      showNotification('HOD ID not found. Please try again.', 'error');
      return;
    }
    
    console.log('🔍 HOD Update - Using ID:', hodId, 'from data:', {
      formData_id: formData.id,
      formData_user_id: formData.user_id,
      hod_id: props.hod?.id,
      hod_user_id: props.hod?.user_id
    });
    
    const result = await HODCRUD.updateHOD(hodId, formData);
    
    if (result.success) {
      showNotification('HOD updated successfully!', 'success');
      emit("save", result.data); // Emit the updated data to parent for refresh
      closeModal();
    } else {
      console.error("Failed to update HOD:", result.message);
      showNotification(result.message || 'Failed to update HOD', 'error');
    }
  } catch (error) {
    console.error("Error updating HOD:", error);
    showNotification('Error updating HOD. Please try again.', 'error');
  } finally {
    saving.value = false;
  }
};

const promoteHOD = () => {
  emit("promote", {
    id_card: form.value.id_card,
    department: form.value.department,
    position: form.value.position,
  });
};

const fileEl = ref(null);
const fileInputKey = ref(0);   // NEW: to reset <input type="file">
const previewUrl = ref("");

// Revoke any old blob URL to avoid leaks
function releaseBlob() {
  if (previewUrl.value && previewUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewUrl.value = "";
}

const STORAGE_BASE = "https://api.rtc-bb.camai.kh/storage/";

const currentImageSrc = computed(() => {
  if (previewUrl.value) return previewUrl.value;

  const v = form.value.profile_picture ?? form.value.photo_url ?? "";
  if (!v) return "";

  // If it's a File, don't use it as src (previewUrl covers this case).
  if (v instanceof File) return "";

  if (v.startsWith("http") || v.startsWith("data:")) return v;
  return STORAGE_BASE + v.replace(/^\/+/, "");
});


function onPhotoChange(e) {
  const file = e.target?.files?.[0] || null;
  releaseBlob();
  if (file) {
    form.value.profile_picture = file;                          // NEW image stored here
    previewUrl.value = URL.createObjectURL(file);
  } else {
    // No new file → keep whatever URL we had (photo_url or existing string)
    previewUrl.value = "";
    if (typeof form.value.photo_url === "string") {
      form.value.profile_picture = form.value.photo_url;        // keep original
    } else if (typeof form.value.profile_picture !== "string") {
      form.value.profile_picture = null;
    }
  }
}

function clearPhoto() {
  releaseBlob();
  previewUrl.value = "";
  // revert to original URL if we had one; otherwise null
  form.value.profile_picture = form.value.photo_url || null;
  fileInputKey.value += 1; // resets the file input cleanly
}

// When modal closes, clean up blob URL
onBeforeUnmount(releaseBlob);
watch(() => props.modelValue, (open) => {
  if (!open) releaseBlob();
});

const onEsc = (ev) => { if (ev.key === "Escape") closeModal(); };
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
