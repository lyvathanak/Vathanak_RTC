<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-start justify-center" @keydown.esc="onClose">
        <div class="absolute inset-0 bg-black/40" @click="onClose" />

        <div class="relative mt-6 w-[min(980px,95vw)] rounded-2xl bg-white shadow-xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h2 class="text-2xl font-semibold">Add Subject</h2>
            <button class="p-2 rounded-full hover:bg-gray-100" @click="onClose" aria-label="Close">
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
                <!-- Subject Code (auto) -->
                <div class="flex flex-col gap-1">
                  <label class="text-sm">
                    Subject Code <span class="text-gray-400">(auto)</span>
                  </label>
                  <input
                    :value="form.subject_code || ''"
                    type="text"
                    disabled
                    placeholder="Will be generated after save"
                    class="rounded-lg border px-3 py-2.5 outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-700"
                  />
                  <p class="text-xs text-gray-500">The system will generate the code automatically.</p>
                </div>

                <!-- Subject Name -->
                <div class="flex flex-col gap-1">
                  <label class="text-sm">Subject Name</label>
                  <input
                    v-model.trim="form.subject_name"
                    type="text"
                    placeholder="Enter Subject Name"
                    class="rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
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
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder="e.g., 1 or 1.5"
                    class="rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <!-- Suggestion dropdown placed below input -->
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
                      {{ formatCredit(opt) }}
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
                      class="rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none pr-10 w-full"
                    >
                      <option :value="''" disabled>Select Program</option>
                      <option v-for="p in programs" :key="p.id" :value="p.id">
                        {{ p.program_name }} — {{ programDeptName(p) }}
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
                    class="rounded-lg border px-3 py-2.5 outline-none bg-gray-50 text-gray-700"
                  />
                </div>

                <!-- Total Hours -->
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

                <!-- Practice Hours -->
                <div class="flex flex-col gap-1">
                  <label class="text-sm">Practice Time (hours)</label>
                  <input
                    v-model="practiceHoursInput"
                    @input="onPracticeHoursInput"
                    type="number" step="0.25" min="0"
                    placeholder="e.g., 20"
                    class="rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p v-if="practiceExceedsTotal" class="text-xs text-red-600">Practice time cannot be greater than total time.</p>
                  <p v-else-if="errors.practice_hours" class="text-xs text-red-600">{{ errors.practice_hours }}</p>
                </div>

                <!-- Description -->
                <div class="md:col-span-2 flex flex-col gap-1">
                  <label class="text-sm">Description</label>
                  <textarea
                    v-model.trim="form.description"
                    rows="3"
                    placeholder="Optional description"
                    class="rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t flex items-center justify-end gap-2 bg-gray-50">
            <button class="rounded-md bg-red-500 hover:bg-red-600 text-white px-4 py-2.5" @click="onClose" :disabled="submitting">Cancel</button>
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
import { ref, watch, onMounted, computed } from 'vue'
import api from '@/stores/apis/axios'
import { showNotification } from '@/lib/notifications.js'
import { X, Info, ChevronDown } from 'lucide-vue-next'

const BASE = (import.meta.env.VITE_API_BASE_URL || '{{base_url}}').replace(/\/+$/, '')

const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue', 'close', 'created'])

const submitting = ref(false)
const errors = ref({})

/* user id */
const currentUserId = ref(null)
async function fetchMeMaybe () {
  try {
    const { data } = await api.get('/auth/get_detail_user')
    currentUserId.value = data?.id ?? data?.user?.id ?? null
  } catch (e) {
    console.error('[AddSubject] get_detail_user failed', e)
    currentUserId.value = null
  }
}

/* reference */
const programs = ref([])
const deptMap = ref(new Map())

function programDeptName (p) {
  return p?.department?.department_name || deptMap.value.get(String(p.department_id))?.name || 'Unknown'
}

/* form */
const form = ref({
  subject_name: '',
  subject_code: '',
  total_hours: '',
  practice_hours: '',
  credit: '',
  description: '',
  program_id: ''
})

/* derived department */
const selectedProgram = computed(() => programs.value.find(p => String(p.id) === String(form.value.program_id)) || null)
const selectedDepartmentId = computed(() => selectedProgram.value?.department?.id ?? selectedProgram.value?.department_id ?? null)
const selectedDepartmentName = computed(() =>
  selectedProgram.value?.department?.department_name
  || (selectedDepartmentId.value ? (deptMap.value.get(String(selectedDepartmentId.value))?.name || '') : '')
)
function onProgramChange () {}

/* inputs */
const totalHoursInput = ref('')
const practiceHoursInput = ref('')
function parseHourString (s) {
  if (s === '' || s == null) return ''
  const n = parseFloat(String(s))
  return Number.isFinite(n) && n >= 0 ? n : ''
}
function onTotalHoursInput () { form.value.total_hours = parseHourString(totalHoursInput.value) }
function onPracticeHoursInput () { form.value.practice_hours = parseHourString(practiceHoursInput.value) }

/* credit */
const creditInput = ref('')
const showCreditSuggest = ref(false)
const creditSuggestions = computed(() => {
  const set = new Set([0.5, 1, 1.5, 2, 2.5, 3])
  const raw = (creditInput.value ?? '').toString().trim()
  if (raw) {
    const n = Number(raw)
    if (Number.isFinite(n) && n >= 0) {
      const b = Math.floor(n)
      set.add(b); set.add(b + 0.5); set.add(b + 1); set.add(b + 1.5)
    }
  }
  return Array.from(set).sort((a,b)=>a-b).slice(0,8)
})
function formatCredit (n) { const x = Number(n ?? 0); return Number.isFinite(x) ? x.toFixed(2) : '0.00' }
function onCreditInput () { showCreditSuggest.value = true; const v = Number(creditInput.value); form.value.credit = Number.isFinite(v) ? v : '' }
function selectCreditSuggestion (val) { creditInput.value = String(val); form.value.credit = Number(val); showCreditSuggest.value = false }
function applyCreditFromInput () { const v = Number(creditInput.value); if (Number.isFinite(v)) form.value.credit = v; showCreditSuggest.value = false }
function hideCreditSuggest () { setTimeout(() => (showCreditSuggest.value = false), 120) }

/* validation */
const practiceExceedsTotal = computed(() => {
  const t = Number(form.value.total_hours)
  const p = Number(form.value.practice_hours)
  if (!Number.isFinite(t) || !Number.isFinite(p)) return false
  return p > t
})
function validate () {
  const e = {}
  if (!form.value.subject_name) e.subject_name = 'Subject name is required'
  if (form.value.credit === '' || form.value.credit === null) e.credit = 'Credit is required'

  const hasTotal = form.value.total_hours !== '' && form.value.total_hours != null
  const hasPractice = form.value.practice_hours !== '' && form.value.practice_hours != null
  if (!hasTotal) e.total_hours = 'Total hour is required'
  if (!hasPractice) e.practice_hours = 'Practice hour is required'

  const th = Number(form.value.total_hours)
  const ph = Number(form.value.practice_hours)
  if (hasTotal && (!Number.isFinite(th) || th < 0)) e.total_hours = 'Enter a valid non-negative hour'
  if (hasPractice && (!Number.isFinite(ph) || ph < 0)) e.practice_hours = 'Enter a valid non-negative hour'
  if (!e.practice_hours && practiceExceedsTotal.value) e.practice_hours = 'Practice time cannot be greater than total time'

  if (!form.value.program_id) e.program_id = 'Program is required'

  errors.value = e
  return Object.keys(e).length === 0
}

/* submit */
function onClose () { emit('update:modelValue', false); emit('close') }
async function submit () {
  if (submitting.value) return
  if (!validate()) { showNotification('Please fix validation errors.', 'error'); return }
  submitting.value = true
  errors.value = { ...errors.value, submit: '' }
  try {
    const payload = {
      subject_name: form.value.subject_name.trim(),
      total_hours: Number(form.value.total_hours),
      practice_hours: Number(form.value.practice_hours),
      credit: Number(form.value.credit),
      description: form.value.description?.trim() || null,
      program_id: Number(form.value.program_id),
    }

    const { data } = await api.post('/managements/create_subject', payload)
    const created = data?.subject
    if (!created) throw new Error(data?.message || 'Create subject failed')

    const p = created.program || programs.value.find(pp => Number(pp.id) === Number(created.program_id)) || null
    const deptId = p?.department_id ?? p?.department?.id ?? null
    const deptName =
      p?.department?.department_name
      || (deptId ? (deptMap.value.get(String(deptId))?.name || null) : null)

    const emitPayload = {
      ...created,
      department_id: deptId,
      department_name: deptName,
      program_name: p?.program_name ?? null,
      program: p ? { id: p.id, program_name: p.program_name, department_id: p.department_id } : null,
      department: (deptId || deptName) ? { id: deptId, name: deptName } : null,
    }

    emit('created', emitPayload)
    showNotification('Subject created successfully!', 'success')
    onClose()

    // reset
    Object.assign(form.value, {
      subject_name:'', subject_code:'', total_hours:'', practice_hours:'', credit:'', description:'', program_id:''
    })
    creditInput.value = ''
    showCreditSuggest.value = false
    totalHoursInput.value = ''
    practiceHoursInput.value = ''
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Failed to create subject'
    errors.value.submit = msg
    showNotification(msg, 'error')
  } finally {
    submitting.value = false
  }
}

/* lifecycle */
watch(() => props.modelValue, (open) => {
  if (!open) return
  errors.value = {}
  totalHoursInput.value = form.value.total_hours !== '' && form.value.total_hours != null ? String(form.value.total_hours) : ''
  practiceHoursInput.value = form.value.practice_hours !== '' && form.value.practice_hours != null ? String(form.value.practice_hours) : ''
})

onMounted(async () => {
  await fetchMeMaybe()

  // departments
  try {
    const { data } = await api.get('/managements/get_all_department')
    const list = Array.isArray(data?.all_department) ? data.all_department : []
    const rows = list.map(d => ({ id: Number(d.id), name: String(d.department_name) }))
    deptMap.value = new Map(rows.map(d => [String(d.id), d]))
  } catch {
    deptMap.value = new Map()
  }

  // programs
  try {
    const { data } = await api.get('/managements/get_all_program')
    const plist = Array.isArray(data?.programs) ? data.programs : []
    programs.value = plist.map(p => ({
      id: Number(p.id),
      program_name: String(p.program_name),
      department_id: Number(p.department_id),
      department: p.department ? { id: Number(p.department.id), department_name: String(p.department.department_name) } : null,
    }))
  } catch (e) {
    console.error('Failed to load programs', e)
    programs.value = []
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
