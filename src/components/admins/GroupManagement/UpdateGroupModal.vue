<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Update Group</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <div class="space-y-6">
          <!-- Basic -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Group Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="groupForm.name"
                type="text"
                placeholder="Enter group name"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Group Program <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  v-model.number="groupForm.program_id"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  :class="{ 'border-red-500': errors.program_id }"
                  :disabled="programsLoading || !groupForm.department_id"
                >
                  <option :value="null">{{ programsLoading ? 'Loading programs...' : 'Select Program' }}</option>
                  <option
                    v-for="program in filteredPrograms"
                    :key="program.id"
                    :value="program.id"
                  >
                    {{ program.program_name }}
                  </option>
                </select>
                <ChevronDown class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p v-if="errors.program_id" class="text-red-500 text-xs mt-1">{{ errors.program_id }}</p>
              <p v-if="!groupForm.department_id" class="text-gray-500 text-xs mt-1">Please select a department first</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Group Department <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  v-model.number="groupForm.department_id"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  :class="{ 'border-red-500': errors.department_id }"
                  :disabled="departmentsLoading"
                >
                  <option :value="null">{{ departmentsLoading ? 'Loading departments...' : 'Select Department' }}</option>
                  <option
                    v-for="department in departmentOptions"
                    :key="department.id"
                    :value="department.id"
                  >
                    {{ department.name }}
                  </option>
                </select>
                <ChevronDown class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p v-if="errors.department_id" class="text-red-500 text-xs mt-1">{{ errors.department_id }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Group Section <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  v-model.number="groupForm.section_id"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  :class="{ 'border-red-500': errors.section_id }"
                  :disabled="sectionsLoading || !groupForm.department_id"
                >
                  <option :value="null">{{ sectionsLoading ? 'Loading sections...' : 'Select Section' }}</option>
                  <option
                    v-for="section in filteredSections"
                    :key="section.id"
                    :value="section.id"
                  >
                    {{ section.name }}
                  </option>
                </select>
                <ChevronDown class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p v-if="errors.section_id" class="text-red-500 text-xs mt-1">{{ errors.section_id }}</p>
              <p v-if="!groupForm.department_id" class="text-gray-500 text-xs mt-1">Please select a department first</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Group Semester <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <select
                v-model.number="groupForm.semester_id"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                :class="{ 'border-red-500': errors.semester_id }"
                :disabled="loadingSemesters || !semesters.length"
              >
                <option :value="null">
                  {{ loadingSemesters ? 'Loading semesters...' : (semesters.length ? 'Select Semester' : 'No semesters available') }}
                </option>
                <option
                  v-for="s in semesters"
                  :key="s.id"
                  :value="s.id"
                >
                  Semester {{ s.semester_number || s.semester_key || s.id }} - {{ s.start_date }}/{{ s.end_date }}
                </option>
              </select>
              <ChevronDown class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p v-if="errors.semester_id" class="text-red-500 text-xs mt-1">{{ errors.semester_id }}</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Group Description</label>
            <textarea
              v-model="groupForm.description"
              rows="3"
              placeholder="Enter group description (optional)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          @click="closeModal"
          class="px-4 py-2 border border-gray-300 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="updateGroup"
          :disabled="!isFormValid || departmentsLoading || programsLoading || sectionsLoading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="departmentsLoading || programsLoading || sectionsLoading">Loading...</span>
          <span v-else>Update Group</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { X, ChevronDown } from "lucide-vue-next";
import { getSemestersByProgram } from "@/stores/global/SemesterByProgram";
import { showNotification } from "@/lib/notifications.js";

const semesters = ref([]);
const loadingSemesters = ref(false);
const semestersError = ref("");


// Composables that provide lists & filter-by-department
import {
  useFilteredByDepartment,
  useProgramsFilteredByDepartment,
  useSectionsFilteredByDepartment,
} from "@/stores/global/FilterByDepartment.js";

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  group: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["close", "update-group"]);

/* === Data sources === */
const {
  departments,           // full objects
  departmentOptions,     // simplified list for dropdown
  loading: departmentsLoading,
} = useFilteredByDepartment({ immediate: false }); // Don't load immediately

const {
  filtered: programsFiltered,
  rawList: allPrograms,
  loading: programsLoading,
  setDepartment: setProgramsDepartment,
} = useProgramsFilteredByDepartment({ immediate: false }); // Don't load immediately

const {
  filtered: sectionsFiltered,
  rawList: allSections,
  loading: sectionsLoading,
  setDepartment: setSectionsDepartment,
} = useSectionsFilteredByDepartment({ immediate: false }); // Don't load immediately

/* === Form (IDs only) === */
const groupForm = ref({
  id: null,
  group_name: "",
  description: "",
  program_id: null,
  department_id: null,
  section_id: null,   // backend: sub_department_id
  semester_id: null,
});

const errors = ref({});

/* === Lists depending on department === */
const filteredPrograms = computed(() =>
  groupForm.value.department_id ? programsFiltered.value : allPrograms.value
);
const filteredSections = computed(() =>
  groupForm.value.department_id ? sectionsFiltered.value : allSections.value
);

/* === Validity === */
const isFormValid = computed(() =>
  !!(
    groupForm.value.name &&
    groupForm.value.program_id &&
    groupForm.value.department_id &&
    groupForm.value.section_id &&
    groupForm.value.semester_id
  )
);

/* === Watchers === */
const suppressDeptWatcher = ref(false);

watch(
  () => groupForm.value.department_id,
  (deptId) => {
    if (suppressDeptWatcher.value) return;   // 👈 don't clear during reset

    groupForm.value.program_id = null;
    groupForm.value.section_id = null;

    if (deptId) {
      setProgramsDepartment(deptId);
      setSectionsDepartment(deptId);
    } else {
      setProgramsDepartment("");
      setSectionsDepartment("");
    }
  }
);


watch(() => groupForm.value.program_id, async (pid, old) => {
  if (pid === old) return;
  groupForm.value.semester_id = null;
  await fetchSemesters(pid);
});


const fetchSemesters = async (programId) => {
  semesters.value = [];
  semestersError.value = "";
  if (!programId) return;

  loadingSemesters.value = true;
  try {
    const list = await getSemestersByProgram(programId);
    semesters.value = Array.isArray(list) ? list : (list?.semesters || []);
  } catch (e) {
    semestersError.value = e?.message || "Failed to load semesters";
  } finally {
    loadingSemesters.value = false;
  }
};


/* === Init/reset === */
const resetForm = async () => {
  const g = props.group ?? {};
  suppressDeptWatcher.value = true;            // 👈 prevent watcher from nuking fields

  // Always load data when modal opens to ensure fresh data
  if (props.isOpen) {
    try {
      // Load all data in parallel and wait for completion
      await Promise.all([
        // Always reload departments to ensure fresh data
        departmentOptions.load?.(),
        // Always reload programs to ensure fresh data
        programsFiltered.load?.(),
        // Always reload sections to ensure fresh data
        sectionsFiltered.load?.()
      ].filter(Boolean));
    } catch (error) {
      console.error('Failed to load data:', error);
      showNotification('Failed to load form data', 'error');
    }
  }

  // Wait a tick to ensure reactive data is updated
  await new Promise(resolve => setTimeout(resolve, 0));

  // set department first so filters are ready
  groupForm.value.department_id = g.department_id ?? g.department?.id ?? null;

  if (groupForm.value.department_id) {
    setProgramsDepartment(groupForm.value.department_id);
    setSectionsDepartment(groupForm.value.department_id);
    
    // Wait for filters to update
    await new Promise(resolve => setTimeout(resolve, 0));
  } else {
    setProgramsDepartment("");
    setSectionsDepartment("");
  }

  // now safely set the rest
  groupForm.value = {
    id: g.id ?? null,
    name: g.name ?? g.group_name ?? "",        // 👈 map from group_name too
    description: g.description ?? "",
    department_id: groupForm.value.department_id,
    program_id: g.program_id ?? g.program?.id ?? null,
    section_id: g.sub_department_id ?? g.section_id ?? g.sub_department?.id ?? null,
    semester_id: g.semester_id ?? g.semester?.id ?? null,
  };

  // Load semesters if program is selected
  if (groupForm.value.program_id) {
    await fetchSemesters(groupForm.value.program_id);
  }

  suppressDeptWatcher.value = false;
  errors.value = {};
};


/* === Validation + Submit === */
const validateForm = () => {
  const e = {};
  if (!groupForm.value.name) e.name = "Group name is required";
  if (!groupForm.value.program_id) e.program_id = "Program is required";
  if (!groupForm.value.department_id) e.department_id = "Department is required";
  if (!groupForm.value.section_id) e.section_id = "Section is required";
  if (!groupForm.value.semester_id) e.semester_id = "Semester is required";
  errors.value = e;
  return Object.keys(e).length === 0;
};

const updateGroup = () => {
  if (!validateForm()) return;
  const payload = {
    id: groupForm.value.id ?? props.group?.id ?? null,
    name: groupForm.value.name,
    group_name: groupForm.value.name,
    description: groupForm.value.description ?? "",
    program_id: Number(groupForm.value.program_id),
    department_id: Number(groupForm.value.department_id),
    sub_department_id: Number(groupForm.value.section_id),
    semester_id: Number(groupForm.value.semester_id),
  };

  console.log("Updating group with data:", payload);
  emit("update-group", payload);
  closeModal();
};

const closeModal = () => {
  emit("close");
  resetForm();
};

/* === Open/reset on prop changes === */
watch(
  () => [props.isOpen, props.group],
  ([isOpen]) => {
    if (isOpen) resetForm();
  },
  { immediate: true, deep: true }
);
</script>
