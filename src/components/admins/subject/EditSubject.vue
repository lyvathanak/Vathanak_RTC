<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-start justify-center" @keydown.esc="close">
        <div class="absolute inset-0 bg-black/40" @click="close"></div>

        <div class="relative mt-6 w-[min(980px,95vw)] rounded-2xl bg-white shadow-xl overflow-hidden" :key="dialogKey">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h2 class="text-2xl font-semibold">Edit Subject</h2>
            <button class="p-2 rounded-full hover:bg-gray-100" @click="close" aria-label="Close">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
            <div v-if="errors.submit" class="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{{ errors.submit }}</div>

            <div>
              <div class="flex items-center gap-2 mb-3">
                <Info class="w-4 h-4" />
                <h3 class="font-semibold">Subject Information</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Subject Code (read-only) -->
                <div class="flex flex-col gap-1">
                  <label class="text-sm">Subject Code</label>
                  <input
                    :value="form.subject_code"
                    disabled
                    class="w-full rounded-lg border px-3 py-2.5 outline-none bg-gray-50 text-gray-700"
                  />
                  <p class="text-xs text-gray-500">Code cannot be changed here.</p>
                </div>

                <!-- Subject Name -->
                <div class="flex flex-col gap-1">
                  <label class="text-sm">Subject Name</label>
                  <input
                    v-model.trim="form.subject_name"
                    class="w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Subject Name"
                  />
                  <p v-if="errors.subject_name" class="text-xs text-red-600">{{ errors.subject_name }}</p>
                </div>

                <!-- Credit -->
                <div class="flex flex-col gap-1 relative">
                  <label class="text-sm">Subject Credit</label>
                  <input
                    v-model="creditInput"
                    @input="onCreditInput"
                    @keydown.enter.prevent="applyCreditFromInput"
                    @blur="hideCreditSuggest"
                    type="number" step="0.25" min="0"
                    placeholder="e.g., 1 or 1.5"
                    class="rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div
                    v-if="showCreditSuggest && creditSuggestions.length"
                    class="absolute left-0 right-0 top-full mt-1 z-20 w-full rounded-lg border bg-white shadow max-h-60 overflow-auto"
                  >
                    <button
                      v-for="opt in creditSuggestions"
                      :key="'cr-'+opt"
                      type="button"
                      class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      @mousedown.prevent="selectCreditSuggestion(opt)"
                    >
                      Credit {{ formatCredit(opt) }}
                    </button>
                  </div>
                  <p v-if="errors.credit" class="text-xs text-red-600">{{ errors.credit }}</p>
                </div>

                <!-- Program -->
                <div class="flex flex-col gap-1">
                  <label class="text-sm">Program</label>
                  <div class="relative">
                    <select
                      v-model.number="form.program_id"
                      @change="onProgramChange"
                      class="w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none pr-10"
                    >
                      <option :value="''" disabled>Select Program</option>
                      <option v-for="p in programs" :key="p.id" :value="p.id">
                        {{ p.name }}{{ programDeptSuffix(p) }}
                      </option>
                    </select>
                    <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center" aria-hidden="true">
                      <ChevronDown class="w-4 h-4 text-gray-500" />
                    </span>
                  </div>
                  <p v-if="errors.program_id" class="text-xs text-red-600">Program is required</p>
                </div>

                <!-- Department (auto) -->
                <div class="flex flex-col gap-1">
                  <label class="text-sm">Department (auto)</label>
                  <input
                    :value="selectedDepartmentName || 'Select a program first'"
                    disabled
                    class="w-full rounded-lg border px-3 py-2.5 outline-none bg-gray-50 text-gray-700"
                  />
                  <p v-if="errors.department_id" class="text-xs text-red-600">Department is required</p>
                </div>

                <!-- Total Time (hours) -->
                <div class="flex flex-col gap-1">
                  <label class="text-sm">Total Time (hours)</label>
                  <input
                    v-model="totalHoursInput"
                    @input="onTotalHoursInput"
                    type="number" step="0.25" min="0"
                    placeholder="e.g., 48"
                    class="rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p v-if="errors.total_hours" class="text-xs text-red-600">{{ errors.total_hours }}</p>
                </div>

                <!-- Practice Time (hours) -->
                <div class="flex flex-col gap-1">
                  <label class="text-sm">Practice Time (hours)</label>
                  <input
                    v-model="practiceHoursInput"
                    @input="onPracticeHoursInput"
                    type="number" step="0.25" min="0"
                    placeholder="e.g., 20"
                    class="rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p v-if="practiceExceedsTotal" class="text-xs text-red-600">
                    Practice time cannot be greater than total time.
                  </p>
                  <p v-else-if="errors.practice_hours" class="text-xs text-red-600">{{ errors.practice_hours }}</p>
                </div>

                <!-- Description -->
                <div class="md:col-span-2 flex flex-col gap-1">
                  <label class="text-sm">Description</label>
                  <textarea
                    v-model.trim="form.description"
                    rows="3"
                    class="w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    placeholder="Optional description"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t flex items-center justify-end gap-2 bg-gray-50">
            <button class="rounded-md bg-red-500 hover:bg-red-600 text-white px-4 py-2.5" @click="close" :disabled="submitting">
              Cancel
            </button>
            <button
              class="rounded-md bg-[#235AA6] hover:bg-[#1e4a94] text-white px-4 py-2.5 inline-flex items-center gap-2 disabled:opacity-60"
              @click="submit"
              :disabled="submitting || practiceExceedsTotal"
            >
              <span v-if="submitting" class="animate-pulse">Saving…</span>
              <span v-else>Save</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import api from '@/stores/apis/axios'
import { showNotification } from '@/lib/notifications.js'
import { X, Info, ChevronDown } from 'lucide-vue-next'

/* Props & emits */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  subject: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'close', 'updated'])

/* normalize incoming subject */
function normalizeIncoming(s) {
  const toNumOrEmpty = (v) => {
    if (v === '' || v == null) return ''
    const n = Number(v)
    return Number.isFinite(n) ? n : ''
  }
  return {
    id: s.id,
    subject_code: s.subject_code ?? s.subjectCode ?? s.code ?? s.course_code ?? '',
    subject_name: s.subject_name ?? s.subjectName ?? s.name ?? s.title ?? s.subject ?? '',
    department_id: s.department_id ?? s.departmentId ?? '',
    program_id: s.program_id ?? s.programId ?? '',
    credit: toNumOrEmpty(s.credit),
    total_hours: toNumOrEmpty(s.total_hours ?? s.total_hour ?? s.totalTime ?? s.totalHours),
    practice_hours: toNumOrEmpty(s.practice_hours ?? s.practice_hour ?? s.practiceTime ?? s.practiceHours),
    description: s.description ?? s.desc ?? '',
  }
}

/* state */
const submitting = ref(false)
const errors = ref({})
const form = ref(normalizeIncoming(props.subject))

/* dialog key */
const dialogKey = computed(() => String(form.value?.id ?? 'new') + '-' + (props.modelValue ? 'open' : 'closed'))

/* reference data */
const departments = ref([])
const deptMap = ref(new Map())
const programs = ref([])
const depsLoaded = ref(false)

/* Hours as strings */
const totalHoursInput = ref(form.value.total_hours !== '' ? String(form.value.total_hours) : '')
const practiceHoursInput = ref(form.value.practice_hours !== '' ? String(form.value.practice_hours) : '')
const parseHourString = (s) => {
  if (s === '' || s == null) return ''
  const n = parseFloat(String(s))
  return Number.isFinite(n) && n >= 0 ? n : ''
}
function onTotalHoursInput () { form.value.total_hours = parseHourString(totalHoursInput.value) }
function onPracticeHoursInput () { form.value.practice_hours = parseHourString(practiceHoursInput.value) }

/* Credit */
const creditInput = ref(form.value.credit !== '' ? String(form.value.credit) : '')
const showCreditSuggest = ref(false)
const creditSuggestions = computed(() => {
  const set = new Set([0.5,1,1.5,2,2.5,3,4,5,6])
  const raw = String(creditInput.value || '').trim()
  if (raw !== '') {
    const n = Number(raw)
    if (Number.isFinite(n) && n >= 0) {
      const b = Math.floor(n)
      set.add(b); set.add(b+0.5); set.add(b+1); set.add(b+1.5)
    }
  }
  return Array.from(set).sort((a,b)=>a-b).slice(0,8)
})
const formatCredit = (n) => Number(n ?? 0).toFixed(2)
function onCreditInput () { showCreditSuggest.value = true; const v = Number(creditInput.value); form.value.credit = Number.isFinite(v) ? v : '' }
function selectCreditSuggestion (val) { creditInput.value = String(val); form.value.credit = Number(val); showCreditSuggest.value = false }
function applyCreditFromInput () { const v = Number(creditInput.value); if (Number.isFinite(v)) form.value.credit = v; showCreditSuggest.value = false }
function hideCreditSuggest () { setTimeout(() => (showCreditSuggest.value = false), 120) }

/* Rule: practice must not exceed total */
const practiceExceedsTotal = computed(() => {
  const t = Number(form.value.total_hours)
  const p = Number(form.value.practice_hours)
  if (!Number.isFinite(t) || !Number.isFinite(p)) return false
  return p > t
})

/* program -> department auto bindings */
const selectedProgram = computed(() =>
  programs.value.find(p => Number(p.id) === Number(form.value.program_id)) || null
)
const selectedDepartmentId = computed(() => selectedProgram.value?.department_id ?? '')
const selectedDepartmentName = computed(() => {
  const id = selectedDepartmentId.value
  return id ? (deptMap.value.get(String(id))?.name || `#${id}`) : ''
})
function onProgramChange () {
  const depId = selectedDepartmentId.value
  form.value.department_id = depId || ''
}
function programDeptSuffix(p) {
  const dname = p?.department_id ? (deptMap.value.get(String(p.department_id))?.name ?? '') : ''
  return dname ? ` — ${dname}` : ''
}

/* sync with props */
watch(() => props.subject, (v) => {
  const norm = normalizeIncoming(v || {})
  form.value = norm
  totalHoursInput.value = norm.total_hours !== '' ? String(norm.total_hours) : ''
  practiceHoursInput.value = norm.practice_hours !== '' ? String(norm.practice_hours) : ''
  creditInput.value = norm.credit !== '' ? String(norm.credit) : ''

  if (depsLoaded.value && form.value.program_id && !form.value.department_id) {
    const depId = programs.value.find(p => Number(p.id) === Number(form.value.program_id))?.department_id
    if (depId) form.value.department_id = depId
  }
}, { immediate: true })

watch(() => props.modelValue, (open) => { if (open) errors.value = {} })

/* Validate & submit */
function validate () {
  const e = {}
  if (!form.value.subject_name) e.subject_name = 'Subject name is required'
  if (form.value.credit === '' || !Number.isFinite(Number(form.value.credit))) e.credit = 'Valid credit is required'
  if (form.value.total_hours === '' || !Number.isFinite(Number(form.value.total_hours))) e.total_hours = 'Valid total hours required'
  if (form.value.practice_hours === '' || !Number.isFinite(Number(form.value.practice_hours))) e.practice_hours = 'Valid practice hours required'
  if (practiceExceedsTotal.value) e.practice_hours = 'Practice time cannot be greater than total time'
  if (!form.value.program_id) e.program_id = 'Program is required'
  if (!form.value.department_id) e.department_id = 'Department is required'
  errors.value = e
  return Object.keys(e).length === 0
}

async function submit () {
  if (!validate()) { showNotification('Please fix validation errors.', 'error'); return }
  submitting.value = true
  errors.value = { ...errors.value, submit: '' }
  try {
    const id = form.value.id
    const payload = {
      subject_name: form.value.subject_name.trim(),
      department_id: Number(form.value.department_id),
      program_id: Number(form.value.program_id),
      credit: Number(form.value.credit),
      total_hours: Number(form.value.total_hours),
      practice_hours: Number(form.value.practice_hours),
      description: form.value.description?.trim() || null,
    }
    const { data } = await api.put(`/managements/update_subject/${id}`, payload)

    const updated = data?.subject || {
      id,
      subject_name: payload.subject_name,
      subject_code: form.value.subject_code,
      description: payload.description,
      credit: payload.credit,
      total_hours: payload.total_hours,
      practice_hours: payload.practice_hours,
      program_id: payload.program_id,
      department_id: payload.department_id,
    }

    emit('updated', updated)
    showNotification('Subject updated successfully!', 'success')
    emit('update:modelValue', false)
    emit('close')
  } catch (err) {
    const res = err?.response?.data
    if (res?.errors && typeof res.errors === 'object') {
      errors.value = Object.fromEntries(
        Object.entries(res.errors).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : String(v)])
      )
    }
    const msg = res?.message || err?.message || 'Update subject failed'
    errors.value.submit = msg
    showNotification(msg, 'error')
  } finally {
    submitting.value = false
  }
}
function close () { emit('update:modelValue', false); emit('close') }

/* Fetch deps on mount */
async function fetchDeps () {
  try {
    const [{ data: dres }, { data: pres }] = await Promise.all([
      api.get('/managements/get_all_department'),
      api.get('/managements/get_all_program'),
    ])

    const dlist = Array.isArray(dres?.all_department) ? dres.all_department : []
    departments.value = dlist.map(d => ({ id: Number(d.id), name: String(d.department_name) }))
    deptMap.value = new Map(departments.value.map(d => [String(d.id), d]))

    const plist = Array.isArray(pres?.programs) ? pres.programs : []
    programs.value = plist.map(p => ({
      id: Number(p.id),
      name: String(p.program_name),
      department_id: Number(p.department_id),
    }))
  } catch {
    departments.value = []
    deptMap.value = new Map()
    programs.value = []
  } finally {
    depsLoaded.value = true
    if (form.value.program_id && !form.value.department_id) {
      const depId = programs.value.find(p => Number(p.id) === Number(form.value.program_id))?.department_id
      if (depId) form.value.department_id = depId
    }
  }
}

onMounted(() => {
  fetchDeps()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
