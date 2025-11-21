<template>
  <form @submit.prevent="submit" class="max-w-3xl mx-auto">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Program Name (optional) -->
      <div class="flex flex-col">
        <label class="text-sm font-medium mb-1">Program Name (optional)</label>
        <input
          v-model="form.program_name"
          type="text"
          class="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-[#235AA6]"
          placeholder="e.g., Computer Science"
        />
        <p v-if="errors.program_name" class="text-red-600 text-sm mt-1">{{ errors.program_name }}</p>
      </div>

      <!-- Degree Level (required, dropdown) -->
      <div class="flex flex-col">
        <label class="text-sm font-medium mb-1">Degree Level <span class="text-red-600">*</span></label>
        <select
          v-model="form.degree_level"
          class="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-[#235AA6] bg-white"
          required
        >
          <option value="">None</option>
          <option v-for="opt in DEGREE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <p v-if="errors.degree_level" class="text-red-600 text-sm mt-1">{{ errors.degree_level }}</p>
      </div>

      <!-- Duration Years (required) -->
      <div class="flex flex-col">
        <label class="text-sm font-medium mb-1">Duration (years) <span class="text-red-600">*</span></label>
        <input
          v-model.number="form.duration_years"
          type="number"
          min="1"
          class="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-[#235AA6]"
          placeholder="e.g., 4"
          required
        />
        <p v-if="errors.duration_years" class="text-red-600 text-sm mt-1">{{ errors.duration_years }}</p>
      </div>

      <!-- Department (dropdown; no default; has None) -->
      <div class="flex flex-col">
        <label class="text-sm font-medium mb-1">Department <span class="text-red-600">*</span></label>
        <select
          v-model="form.department_id"          
          @change="onDepartmentChange"
          class="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-[#235AA6] bg-white"
          :disabled="loadingDepartments"
          required
        >
          <option value="">None</option>
          <option v-if="loadingDepartments" disabled value="">Loading departments…</option>
          <option v-for="d in departments" :key="d.id" :value="String(d.id)">
            {{ d.department_name }}
          </option>
        </select>
        <p v-if="errors.department_id" class="text-red-600 text-sm mt-1">{{ errors.department_id }}</p>
      </div>

      <!-- Sub-department (only visible after department selected; has None) -->
      <div class="flex flex-col" v-if="form.department_id">
        <label class="text-sm font-medium mb-1">Sub-department <span class="text-red-600">*</span></label>
        <select
          v-model="form.sub_department_id"    
          class="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-[#235AA6] bg-white"
          :disabled="loadingSubDepartments"
          required
        >
          <option value="">None</option>
          <option v-if="loadingSubDepartments" disabled value="">Loading sub-departments…</option>
          <option v-for="s in subDepartments" :key="s.id" :value="String(s.id)">
            {{ s.name }}
          </option>
        </select>
        <p v-if="errors.sub_department_id" class="text-red-600 text-sm mt-1">{{ errors.sub_department_id }}</p>
      </div>

      <!-- Helper message when no department chosen yet -->
      <div class="flex items-end text-sm text-gray-500" v-else>
        Select a department to choose a sub-department.
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 flex items-center gap-3">
      <button
        type="submit"
        :disabled="loading || !canSubmit"
        class="inline-flex items-center gap-2 rounded-xl bg-[#235AA6] px-4 py-2 text-white font-semibold shadow disabled:opacity-60"
      >
        <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" fill="none"/>
        </svg>
        <span>Create</span>
      </button>

      <button
        type="button"
        @click="reset"
        class="inline-flex items-center gap-2 rounded-xl bg-gray-200 px-4 py-2 text-gray-900 font-semibold shadow hover:bg-gray-300"
      >
        Reset
      </button>

      <p v-if="serverMessage" class="text-sm ml-2" :class="serverOk ? 'text-green-700' : 'text-red-600'">
        {{ serverMessage }}
      </p>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const DEGREE_OPTIONS = [
  { label: 'Bachelor',      value: 'Bachelor' },
  { label: 'High Bachelor', value: 'High Bachelor' },
  { label: 'Master',        value: 'Master' },
  { label: 'PhD',           value: 'PhD' }
]

const emit = defineEmits(['success'])

const loading = ref(false)
const serverMessage = ref('')
const serverOk = ref(false)
const errors = ref({})

const loadingDepartments = ref(false)
const loadingSubDepartments = ref(false)

const departments = ref([])       // [{ id, department_name, ... }]
const subDepartments = ref([])    // [{ id, name, department_id, ... }]

const form = ref({
  program_name: '',
  degree_level: '',
  duration_years: 1,
  department_id: '',       // string '' | departmentId
  sub_department_id: ''    // string '' | subDeptId
})

const canSubmit = computed(() =>
  !!form.value.degree_level &&
  Number(form.value.duration_years) >= 1 &&
  !!form.value.department_id &&
  !!form.value.sub_department_id
)

function reset() {
  form.value = {
    program_name: '',
    degree_level: '',
    duration_years: 1,
    department_id: '',
    sub_department_id: ''
  }
  errors.value = {}
  serverMessage.value = ''
  serverOk.value = false
  subDepartments.value = []
}

function validateLocal() {
  errors.value = {}
  if (!form.value.degree_level) {
    errors.value.degree_level = 'Degree level is required.'
  }
  if (!form.value.duration_years || Number(form.value.duration_years) < 1) {
    errors.value.duration_years = 'Duration must be at least 1.'
  }
  if (!form.value.department_id) {
    errors.value.department_id = 'Department is required.'
  }
  if (!form.value.sub_department_id) {
    errors.value.sub_department_id = 'Sub-department is required.'
  }
  return Object.keys(errors.value).length === 0
}

async function fetchDepartments() {
  loadingDepartments.value = true
  try {
    const res = await axios.get('/api/managements/get_all_department')
    departments.value = Array.isArray(res?.data?.all_department) ? res.data.all_department : []
  } catch (err) {
    console.error('❌ Failed to load departments:', err?.response?.data || err)
  } finally {
    loadingDepartments.value = false
  }
}

async function fetchSubDepartments(deptId) {
  if (!deptId) {
    subDepartments.value = []
    form.value.sub_department_id = ''
    return
  }
  loadingSubDepartments.value = true
  try {
    const res = await axios.get(`/api/managements/get_all_sub_department`, {
      params: { department_id: deptId }
    })
    subDepartments.value = Array.isArray(res?.data?.all_sub_departments) ? res.data.all_sub_departments : []
    // do NOT auto-pick; user must choose (we leave sub_department_id as '')
    if (!subDepartments.value.length) form.value.sub_department_id = ''
  } catch (err) {
    console.error('❌ Failed to load sub-departments:', err?.response?.data || err)
    subDepartments.value = []
    form.value.sub_department_id = ''
  } finally {
    loadingSubDepartments.value = false
  }
}

async function onDepartmentChange() {
  const id = form.value.department_id ? Number(form.value.department_id) : null
  form.value.sub_department_id = ''     // clear previous selection
  await fetchSubDepartments(id)
}

async function submit() {
  if (!validateLocal()) return

  loading.value = true
  serverMessage.value = ''
  serverOk.value = false

  const payload = {
    program_name: form.value.program_name?.trim() || null,
    degree_level: form.value.degree_level,
    duration_years: Number(form.value.duration_years),
    department_id: Number(form.value.department_id),        // cast to number
    sub_department_id: Number(form.value.sub_department_id) // cast to number
  }

  try {
    const res = await axios.post('/api/managements/create_new_program', payload)
    serverMessage.value = res?.data?.message || 'Created.'
    serverOk.value = true
    emit('success', res?.data?.program) // parent refresh + close
  } catch (err) {
    const data = err?.response?.data
    if (data?.errors) {
      const flat = {}
      Object.entries(data.errors).forEach(([k, v]) => { flat[k] = Array.isArray(v) ? v[0] : String(v) })
      errors.value = flat
    }
    serverMessage.value = data?.message || 'Create failed.'
    serverOk.value = false
    console.error('❌ Create failed:', data || err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchDepartments)
</script>
