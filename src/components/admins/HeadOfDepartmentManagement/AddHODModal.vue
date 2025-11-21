<template>
  <!-- Add HOD Modal -->
  <transition name="fade">
    <div v-if="showAdd" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="closeAdd"></div>

      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div role="dialog" aria-modal="true" class="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl h-[90vh] sm:h-[85vh] rounded-xl bg-white shadow-xl overflow-hidden border border-gray-200 flex flex-col" @click.stop>
          <!-- header -->
          <div class="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b bg-gray-50">
            <h3 class="text-base sm:text-lg md:text-xl font-semibold">Add Head of Department</h3>
            <button class="p-2 rounded-md hover:bg-gray-100 transition-colors" @click="closeAdd" aria-label="Close">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- body -->
          <div class="px-4 sm:px-5 md:px-6 py-4 sm:py-5 flex-1 overflow-y-auto min-h-0">
            <div class="flex flex-col gap-4 sm:gap-6">
              <!-- Photo -->
              <div class="flex justify-center">
                <label
                  class="relative w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 hover:bg-gray-100 transition-colors">
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    @change="onPickHodImage"
                    class="hidden"
                  />
                  <div v-if="!previewUrl" class="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <Plus class="w-6 sm:w-8 mb-1 sm:mb-2" />
                    <span class="text-xs sm:text-sm text-center px-1">Upload photo</span>
                  </div>
                  <img v-else :src="previewUrl" alt="Preview" class="w-full h-full object-cover" />
                </label>
              </div>

              <!-- Form -->
              <div class="w-full space-y-4 sm:space-y-6">
                <!-- Personal Information -->
                <section>
                  <div class="flex items-center font-semibold mb-3 text-sm sm:text-base">
                    <Info class="w-4 text-gray-500 mr-2" />
                    <h2>Personal Information</h2>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                    <!-- Khmer Name -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        Name Khmer <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model.trim="newHOD.khmer_name"
                        type="text"
                        class="w-full rounded-md border px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter name in Khmer"
                      />
                      <p v-if="errors.khmer_name" class="mt-1 text-xs text-red-600">{{ errors.khmer_name }}</p>
                    </div>

                    <!-- Latin Name -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        Name Latin <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model.trim="newHOD.latin_name"
                        type="text"
                        class="w-full rounded-md border px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter name in Latin"
                      />
                      <p v-if="errors.latin_name" class="mt-1 text-xs text-red-600">{{ errors.latin_name }}</p>
                    </div>

                    <!-- Gender -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        Gender <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <select
                          v-model="newHOD.gender"
                          class="w-full rounded-md border px-3 py-2 pr-8 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        <ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      <p v-if="errors.gender" class="mt-1 text-xs text-red-600">{{ errors.gender }}</p>
                    </div>

                    <!-- DOB -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        Date of Birth <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="newHOD.date_of_birth"
                        type="date"
                        class="w-full rounded-md border px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p v-if="errors.date_of_birth" class="mt-1 text-xs text-red-600">{{ errors.date_of_birth }}</p>
                    </div>

                    <!-- Email (auto-generated by backend) -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        Email <span class="text-xs text-gray-500">(auto)</span>
                      </label>
                      <input
                        value="Auto-generated on save"
                        class="w-full rounded-md border px-3 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                        disabled
                        autocomplete="off"
                        name="auto_email_preview"
                      />
                    </div>

                    <!-- Phone -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">Phone Number <span class="text-red-500">*</span></label>
                      <input
                        v-model="newHOD.phone"
                        type="tel"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        maxlength="20"
                        @input="onPhoneInput"
                        class="w-full rounded-md border px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter phone number"
                      />
                      <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
                    </div>

                  </div>
                </section>

                <!-- Professional Information -->
                <section>
                  <div class="flex items-center font-semibold mb-3 text-sm sm:text-base">
                    <Info class="w-4 text-gray-500 mr-2" />
                    <h2>Professional Information</h2>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <!-- Department -->
                    <div>
                      <label class="block text-sm text-gray-600 mb-1">
                        Department <span class="text-red-500">*</span>
                      </label>

                      <div v-if="isDeptLoading" class="text-sm text-gray-500 py-2">
                        Loading departments…
                      </div>

                      <div v-else-if="deptErrorString" class="text-sm text-red-600 py-2">
                        {{ deptErrorString }}
                        <button class="ml-2 underline" @click="reloadDepts">Retry</button>
                      </div>

                      <div v-else-if="deptOptions.length === 0" class="text-sm text-gray-500 py-2">
                        No available departments found. All departments may already have heads assigned. <button class="underline" @click="reloadDepts">Reload</button>
                      </div>

                      <div v-else class="relative">
                        <select
                          v-model="selectedDepartmentId"
                          class="w-full rounded-md border px-3 py-2 pr-8 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                          <option value="">Select Department</option>
                          <option v-for="d in deptOptions" :key="d.value" :value="String(d.value)">
                            {{ d.label }}
                          </option>
                        </select>
                        <ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      <p v-if="errors.department_id" class="mt-1 text-xs text-red-600">{{ errors.department_id }}</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <!-- footer -->
          <div class="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t bg-gray-50 flex justify-end gap-2 sm:gap-3">
            <button class="px-3 sm:px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors" @click="closeAdd">
              Cancel
            </button>
            <button class="px-3 sm:px-4 py-2 text-sm rounded-lg bg-[#235AA6] text-white hover:bg-[#1e4a94] transition-colors" @click="saveHOD">
              Save HOD
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>


<script setup>
import { reactive, onMounted, onBeforeUnmount, computed, ref } from "vue";
import { ChevronDown, Info, Plus, X } from "lucide-vue-next";
import { useFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";
import { useFormValidate } from "@/stores/global/useFormValidate";
import HODCRUD from "@/stores/apis/HeadOfDepartmentCRUD.js";

/** Props & Emits */
const props = defineProps({ showAdd: { type: Boolean, required: true } });
const emit = defineEmits(["close", "save"]);

/** Department composable */
const dept = useFilteredByDepartment({ immediate: true });

// Store all current HODs to filter out departments that already have heads
const allHODs = ref([]);

const isDeptLoading = computed(() => {
  const l = dept.loading;
  return typeof l === "object" && l !== null && "value" in l ? !!l.value : !!l;
});
const deptErrorString = computed(() => {
  const e = typeof dept.error === "object" && dept.error && "value" in dept.error ? dept.error.value : dept.error;
  if (!e) return "";
  if (typeof e === "string") return e;
  if (e && typeof e.message === "string") return e.message;
  try { return JSON.stringify(e); } catch { return String(e); }
});

// Get all department options from the composable
const allDeptOptions = computed(() => {
  const opts =
    typeof dept.departmentOptions === "object" && dept.departmentOptions && "value" in dept.departmentOptions
      ? dept.departmentOptions.value
      : dept.departmentOptions;
  return Array.isArray(opts) ? opts : [];
});

// Get IDs of departments that already have a head assigned
const takenDepartmentIds = computed(() => {
  const set = new Set(
    (allHODs.value || [])
      .map(h => h.head_department?.id ?? h.department_id)
      .filter(id => id != null)
      .map(Number)
  );
  return set;
});

// Filter out departments that already have heads assigned
const deptOptions = computed(() => {
  return (allDeptOptions.value || []).filter(d => {
    const deptId = Number(d.value ?? d.id ?? 0);
    return !takenDepartmentIds.value.has(deptId);
  });
});
const selectedDepartmentId = computed({
  get() {
    const v =
      typeof dept.selectedDepartmentId === "object" &&
      dept.selectedDepartmentId &&
      "value" in dept.selectedDepartmentId
        ? dept.selectedDepartmentId.value
        : dept.selectedDepartmentId;
    return v ?? "";
  },
  set(id) { dept.setDepartment(id); },
});
async function reloadDepts() {
  try { 
    await dept.load(); 
    // Also reload HODs to get updated list of assigned departments
    await loadAllHODs();
  } catch {/* surfaced via deptErrorString */}
}

// Load all current HODs to know which departments are taken
async function loadAllHODs() {
  try {
    const res = await HODCRUD.getAllHODs();
    allHODs.value = Array.isArray(res?.data) ? res.data : [];
    console.log("🏢 Loaded HODs for department filtering:", allHODs.value.length);
  } catch (error) {
    console.error("❌ Error loading HODs:", error);
    allHODs.value = [];
  }
}

/** Image preview (blob URL like Teacher) */
const fileInputRef = ref(null);
const previewUrl = ref("");

function revokePreview() {
  if (previewUrl.value?.startsWith("blob:")) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
}

function onPickHodImage(e) {
  const f = e.target?.files?.[0] || null;
  revokePreview();
  if (f) {
    previewUrl.value = URL.createObjectURL(f);
  }
  // keep both for create + UI parity with Teacher
  newHOD.file = f;
  // keep string only if not a File (we show previewUrl anyway)
  newHOD.profile_picture = f ? "" : newHOD.profile_picture;
}

/** Form state */
const newHOD = reactive({
  profile_picture: "", // string URL (server) or empty; preview uses previewUrl
  file: null,          // File for upload
  latin_name: "",
  khmer_name: "",
  gender: "",
  date_of_birth: "",
  phone: "",
  status: "Active",
  active: true,
});

/** Shared validation (like AddTeacher) */
const { errors, clearErrors, validateFields } = useFormValidate();
const hodValidationSchema = {
  latin_name: ["required", "latin"],
  khmer_name: ["required", "khmer"],
  phone: ["required", "phone"],
  gender: ["required"],
  date_of_birth: ["required", "dateOfBirth"],
  department_id: ["required"], // Department is required
};

/** Lifecycle */
onMounted(async () => {
  await reloadDepts();
  await loadAllHODs(); // Load HODs to filter departments
  window.addEventListener("keydown", onEsc);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onEsc);
  revokePreview();
});

/** Handlers */
function resetForm() {
  revokePreview();
  Object.assign(newHOD, {
    profile_picture: "",
    file: null,
    latin_name: "",
    khmer_name: "",
    gender: "",
    date_of_birth: "",
    phone: "",
    status: "Active",
    active: true,
  });
  dept.setDepartment("");
  clearErrors();
  // Reload HODs to get fresh list of available departments
  loadAllHODs();
}

function closeAdd() {
  emit("close");
  resetForm();
}

function saveHOD() {
  clearErrors();

  const toValidate = {
    latin_name: newHOD.latin_name,
    khmer_name: newHOD.khmer_name,
    phone: newHOD.phone,
    gender: newHOD.gender,
    date_of_birth: newHOD.date_of_birth,
    department_id: Number(selectedDepartmentId.value) || "",
  };

  const ok = validateFields(toValidate, hodValidationSchema);
  if (!ok) return;

  const hodData = {
    khmer_name: newHOD.khmer_name,
    latin_name: newHOD.latin_name,
    full_name: newHOD.khmer_name,
    first_name: newHOD.latin_name.split(" ").slice(1).join(" "),
    last_name: newHOD.latin_name.split(" ")[0],
    gender: newHOD.gender,
    date_of_birth: newHOD.date_of_birth,
    phone: newHOD.phone,
    // email excluded — backend generates it
    department_id: Number(selectedDepartmentId.value),
    status: newHOD.status,
    active: newHOD.active,
    file: newHOD.file || undefined,                           // send File for create
    profile_picture: newHOD.file ? undefined : (newHOD.profile_picture || undefined), // string URL if no file
  };

  emit("save", hodData);
  // Reload HODs after successful save to update available departments
  loadAllHODs();
}

function onPhoneInput(e) {
  // Keep digits only; preserve leading zero
  const digits = (e.target.value || "").replace(/\D/g, "");
  newHOD.phone = digits;
}

function onEsc(e) {
  if (e.key === "Escape") closeAdd();
}
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
