<template>
  <div class="p-6 space-y-5">
    <!-- Program inputs -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <!-- Program Name -->
      <div class="flex flex-col gap-y-2 w-full min-w-0">
        <label class="text-[12px] pr-2">Program Name</label>
        <Input
          v-model="program.name"
          placeholder="Input Program Name"
          class="transition-all border-black w-full placeholder:text-xs bg-white focus:border-black focus:ring-2 focus:ring-black"
          :class="program.name ? 'border-black ring-1 ring-black' : ''"
        />
      </div>
    </div>

    <!-- Degree + Duration (Degree required) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <!-- Degree Level -->
      <div class="flex flex-col gap-y-2 w-full min-w-0">
        <label class="text-[12px] pr-2">Degree Level <span class="text-red-600">*</span></label>
        <div class="relative">
          <select
            v-model="degreeLevel"
            class="border-black border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-black
                   appearance-none pr-9 w-full"
          >
            <option value="">Select degree…</option>
            <option v-for="opt in DEGREE_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
          </select>
          <span class="pointer-events-none absolute inset-y-0 right-2 flex items-center" aria-hidden="true">
            <ChevronDown class="w-4 h-4 text-gray-500" />
          </span>
        </div>
        <p v-if="degreeError" class="text-xs text-red-600 mt-1">{{ degreeError }}</p>
      </div>

      <!-- Duration -->
      <div class="flex flex-col gap-y-2 w-full min-w-0">
        <label class="text-[12px] pr-2">Duration (years)</label>
        <input
          v-model.number="durationYears"
          type="number"
          min="1"
          class="border-black border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-black"
          placeholder="e.g., 4"
        />
      </div>
    </div>

    <!-- Single Department (REQUIRED) -->
    <div class="grid grid-cols-1 gap-2 items-start">
      <div class="flex flex-col gap-y-2 w-full min-w-0">
        <label class="text-[12px] pr-2">Department <span class="text-red-600">*</span></label>
        <div class="relative min-w-[16rem]">
          <select
            v-model="departmentId"
            class="border-black border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-black
                   appearance-none pr-9 w-full disabled:bg-gray-100"
            :disabled="loadingDepartments"
          >
            <option value="">Select department…</option>
            <option v-for="d in departments" :key="d.id" :value="String(d.id)">
              {{ d.department_name }}
            </option>
          </select>
          <span class="pointer-events-none absolute inset-y-0 right-2 flex items-center" aria-hidden="true">
            <ChevronDown class="w-4 h-4 text-gray-500" />
          </span>
        </div>
        <p v-if="deptError" class="text-xs text-red-600 mt-1">{{ deptError }}</p>
      </div>

      <!-- Add Semester under department -->
      <div class="flex">
        <button
          type="button"
          @click="addSemester"
          class="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#235AA6] px-3 py-2 text-white font-semibold shadow hover:bg-[#1f4f93]"
        >
          <span class="text-xs leading-none"><Plus /></span>
          <span class="text-sm">Add Semester</span>
        </button>
      </div>
    </div>

    <!-- Semester cards -->
    <div class="my-4 space-y-3">
      <div
        v-for="(sem, idx) in semesters"
        :key="sem._key"
        class="rounded-xl bg-white shadow border border-gray-200"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="text-sm text-gray-700 font-medium">Semester {{ sem.semester_number }}</div>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 transition-colors"
              @click="removeSemester(idx)"
              title="Remove this semester"
            >
              <Trash2 class="w-5 h-5" />
            </button>
            <button
              class="p-2 rounded hover:bg-gray-100 transition"
              @click="sem.expanded = !sem.expanded"
              :aria-expanded="sem.expanded ? 'true' : 'false'"
              title="Expand / Collapse"
            >
              <ChevronRight class="w-5 w-5 transition-transform" :class="sem.expanded ? 'rotate-90' : ''" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div v-show="sem.expanded" class="px-5 pb-5 pt-0 space-y-6">
          <!-- Semester meta -->
          <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
            <!-- Semester Number (read-only) -->
            <div class="flex flex-col">
              <label class="text-xs text-gray-700 mb-1">Semester Number</label>
              <input
                :value="sem.semester_number"
                type="number"
                disabled
                class="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100"
              />
            </div>

            <!-- Semester Key -->
            <div class="flex flex-col md:col-span-3">
              <label class="text-xs text-gray-700 mb-1">Semester Key</label>
              <input
                v-model="sem.semester_key"
                type="text"
                class="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-black"
                placeholder="e.g., Semester 1"
              />
            </div>

            <!-- Start Date -->
            <div class="flex flex-col">
              <label class="text-xs text-gray-700 mb-1">Start Date</label>
              <input
                v-model="sem.start_date"
                type="date"
                class="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-black"
              />
            </div>

            <!-- End Date -->
            <div class="flex flex-col">
              <label class="text-xs text-gray-700 mb-1">End Date</label>
              <input
                v-model="sem.end_date"
                type="date"
                class="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <!-- Subjects -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <div class="text-xs text-gray-700 font-medium">Subjects</div>
              <button
                class="inline-flex items-center gap-1 rounded bg-gray-800 text-white text-xs px-2 py-1 hover:bg-black"
                @click="addRow(sem.rows)"
                title="Add subject"
              >
                + Add Subject
              </button>
            </div>

            <PickerTable
              :rows="sem.rows"
              :subjects="subjectOptions"
              @remove="(i) => sem.rows.splice(i,1)"
              @subject-change="(p) => onSubjectPicked(sem, p)"
            />
          </div>
        </div>
      </div>

      <div v-if="!semesters.length" class="text-sm text-gray-500 px-1">
        No semesters yet — add one to start assigning subjects.
      </div>
    </div>

    <!-- Submit -->
    <div class="pt-1">
      <button
        type="button"
        @click="createProgram"
        :disabled="saving"
        class="inline-flex items-center rounded-xl bg-[#235AA6] px-4 py-2 text-white font-semibold shadow hover:bg-[#1f4f93] disabled:opacity-60"
      >
        <span v-if="saving" class="inline-block h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ saving ? 'Saving…' : 'Create Program' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h, defineComponent, watch } from 'vue'
import api from '@/stores/apis/axios' // token-aware axios instance (adds Authorization)
import { Input } from '@/components/ui/input'
import { Plus, ChevronRight, Trash2, ChevronDown } from 'lucide-vue-next'

const DEGREE_OPTIONS = ['Bachelor', 'High Bachelor', 'Master', 'PhD']

/* ---------- Row table (subject picker + readonly credit/hour) ---------- */
const PickerTable = defineComponent({
  name: 'PickerTable',
  props: {
    rows: { type: Array, required: true },              // [{ subjectId, name, credit, hour }]
    subjects: { type: Array, required: true },          // [{ id, name, nameWithCode, credit, hour }]
  },
  emits: ['remove', 'subject-change'],
  setup(props, { emit }) {
    return () =>
      h('div', { class: 'overflow-x-auto border rounded-lg' }, [
        h('table', { class: 'min-w-full text-sm' }, [
          h('thead', null, [
            h('tr', { class: 'text-left bg-gray-100' }, [
              h('th', { class: 'px-3 py-2 font-semibold w-72' }, 'Subject'),
              h('th', { class: 'px-3 py-2 font-semibold w-20' }, 'Credit'),
              h('th', { class: 'px-3 py-2 font-semibold w-24' }, 'Hour'),
              h('th', { class: 'px-3 py-2 font-semibold w-20' }, 'Action'),
            ]),
          ]),
          h('tbody', null, [
            ...(props.rows.length
              ? props.rows.map((r, i) =>
                  h('tr', { class: 'border-t', key: i }, [
                    // Subject select (with ChevronDown)
                    h('td', { class: 'px-3 py-2' }, [
                      h('div', { class: 'relative' }, [
                        h('select', {
                          class: 'w-full border rounded px-2 py-2 bg-white focus:ring-2 focus:ring-black ' +
                                 'appearance-none pr-9',
                          value: r.subjectId || '',
                          onChange: (e) => emit('subject-change', { index: i, value: e.target.value }),
                        }, [
                          h('option', { value: '' }, 'Select subject…'),
                          ...props.subjects.map(s => h('option', { key: s.id, value: s.id }, s.nameWithCode || s.name))
                        ]),
                        h('span', { class: 'pointer-events-none absolute inset-y-0 right-2 flex items-center', 'aria-hidden': 'true' }, [
                          h(ChevronDown, { class: 'w-4 h-4 text-gray-500' })
                        ])
                      ])
                    ]),
                    // Credit + Hour (readonly)
                    h('td', { class: 'px-3 py-2' }, r.credit ?? ''),
                    h('td', { class: 'px-3 py-2' }, r.hour ?? ''),
                    // Action
                    h('td', { class: 'px-3 py-2' }, [
                      h(
                        'button',
                        {
                          type: 'button',
                          class: 'inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 transition-colors',
                          title: 'Remove',
                          onClick: (e) => { e.stopPropagation?.(); emit('remove', i) }
                        },
                        [ h(Trash2, { class: 'h-4 w-4' }) ]
                      )
                    ]),
                  ])
                )
              : [ h('tr', { key: 'empty' }, [ h('td', { class: 'px-3 py-3 text-center text-gray-500 italic', colSpan: 4 }, 'No subjects') ]) ]
            ),
          ]),
        ]),
      ])
  },
})

/* ---------- state ---------- */
const emit = defineEmits(['success'])

const saving = ref(false)
const program = reactive({ code: '', name: '' })

const degreeLevel = ref('')         // REQUIRED
const degreeError = ref('')
const durationYears = ref(1)

const departments = ref([])
const departmentId = ref('')
const loadingDepartments = ref(false)
const deptError = ref('')

const semesters = ref([])           // [{ _key, expanded, semester_number, semester_key, start_date, end_date, rows: [] }]
const subjectOptions = ref([])
const loadingSubjects = ref(false)

/* ---------- (optional) code suggestion seed ---------- */
const suggestedCode = ref('')
function acronymFromName(name = '') {
  if (!name.trim()) return 'PRG'
  const cleaned = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
  const stop = new Set(['and','of','in','for','the','with','&'])
  const parts = cleaned.split(' ').filter(w => !stop.has(w.toLowerCase()))
  if (parts.length >= 2) return parts.map(w => w[0]).join('').toUpperCase().slice(0,4)
  const w = parts[0] || 'PRG'
  let ac = w.replace(/[aeiou]/gi, '').slice(0,4).toUpperCase()
  if (ac.length < 2) ac = w.slice(0,4).toUpperCase()
  return ac
}
function yytwo(){ return String(new Date().getFullYear()).slice(-2) }
watch(() => program.name, () => {
  const prefix = `${acronymFromName(program.name)}${yytwo()}`
  suggestedCode.value = `${prefix}-001`
})

/* ---------- helpers ---------- */
function addSemester() {
  semesters.value.push({
    _key: uid(),
    expanded: true,
    semester_number: semesters.value.length + 1,        // auto number
    semester_key: `Semester ${semesters.value.length + 1}`,
    start_date: '',
    end_date: '',
    rows: []
  })
}
function removeSemester(index) {
  semesters.value.splice(index, 1)
  renumberSemesters()
}
function renumberSemesters() {
  semesters.value.forEach((s, i) => {
    s.semester_number = i + 1
    if (!s.semester_key || /^Semester\s+\d+$/i.test(s.semester_key)) {
      s.semester_key = `Semester ${i + 1}`
    }
  })
}
function addRow(target) { target.push({ subjectId: '', name: '', credit: null, hour: null }) }

function onSubjectPicked(sem, { index, value }) {
  const r = sem.rows[index]
  if (!r) return
  r.subjectId = value || ''
  const found = subjectOptions.value.find(s => String(s.id) === String(value))
  if (found) {
    r.name = found.name
    r.credit = found.credit
    r.hour = found.hour
  } else {
    r.name = ''
    r.credit = null
    r.hour = null
  }
}

/* ---------- fetchers (token-aware `api`) ---------- */
async function fetchDepartments() {
  loadingDepartments.value = true
  try {
    const { data } = await api.get('/managements/get_all_department') // {{base_url2}}
    departments.value = Array.isArray(data?.all_department) ? data.all_department : []
  } catch (e) {
    departments.value = []
    console.error('❌ Departments load failed:', e?.response?.data || e)
  } finally {
    loadingDepartments.value = false
  }
}

async function fetchSubjects() {
  loadingSubjects.value = true
  try {
    const { data } = await api.get('/managements/get_all_subjects') // {{base_url}}
    const arr = Array.isArray(data?.subjects?.data) ? data.subjects.data : []
    subjectOptions.value = arr.map(s => ({
      id: s.id,
      name: s.subject_name || s.name || '',
      nameWithCode: [s.subject_code, s.subject_name].filter(Boolean).join(' — '),
      credit: Number(s.credit ?? 0),
      hour: Number(s.total_hours ?? 0),
    }))
  } catch (e) {
    subjectOptions.value = []
    console.error('⚠️ Subjects load failed:', e?.response?.data || e)
  } finally {
    loadingSubjects.value = false
  }
}

/* ---------- semester subject bulk helpers ---------- */
// base_url2: add subjects to semester (bulk)
async function bulkAddSubjectsToSemester(semesterId, subjectIds) {
  if (!semesterId || !Array.isArray(subjectIds) || subjectIds.length === 0) return
  await api.post('/managements/add_subject_to_semester', {
    semester_id: Number(semesterId),
    subject_ids: subjectIds.map(Number)
  })
}

// base_url: remove subjects from semester (bulk)
async function bulkRemoveSubjectsFromSemester(semesterId, subjectIds) {
  if (!semesterId || !Array.isArray(subjectIds) || subjectIds.length === 0) return
  await api.delete('/managements/remove_subject_from_semester', {
    data: {
      semester_id: Number(semesterId),
      subject_ids: subjectIds.map(Number)
    }
  })
}

/* ---------- submit flow (token-aware `api`) ---------- */
async function createProgram() {
  deptError.value = ''
  degreeError.value = ''
  if (!departmentId.value) deptError.value = 'Department is required.'
  if (!degreeLevel.value)  degreeError.value = 'Degree level is required.'
  if (deptError.value || degreeError.value) return

  saving.value = true
  try {
    // 1) Create Program ({{base_url2}})
    const payloadProgram = {
      program_name: program.name?.trim() || null,
      degree_level: degreeLevel.value,
      duration_years: Number(durationYears.value || 1),
      department_id: Number(departmentId.value),
      sub_department_id: null
    }
    const createRes = await api.post('/managements/create_new_program', payloadProgram)
    const createdProgram = createRes?.data?.program
    const programId = Number(createdProgram?.id)
    if (!programId) throw new Error('Program was not created.')

    // 2) Create each semester ({{base_url}})
    for (const sem of semesters.value) {
      if (!sem.start_date || !sem.end_date) continue

      const semPayload = {
        program_id: programId,
        semester_number: Number(sem.semester_number),
        semester_key: String(sem.semester_key || `Semester ${sem.semester_number}`).trim(),
        start_date: sem.start_date,
        end_date: sem.end_date
      }

      let createdSemId = null
      try {
        const r = await api.post('/managements/create_new_semester_program', semPayload)
        createdSemId = r?.data?.semester?.id ?? null
      } catch (e) {
        console.error('❌ Create semester failed:', e?.response?.data || e)
      }

      // 3) Bulk-assign subjects to the semester ({{base_url2}})
      if (createdSemId) {
        const subjectIds = sem.rows
          .map(row => Number(row.subjectId))
          .filter(n => Number.isFinite(n) && n > 0)

        try {
          await bulkAddSubjectsToSemester(createdSemId, subjectIds)
        } catch (e) {
          console.error('⚠️ Bulk add subjects to semester failed:', e?.response?.data || e)
        }
      }
    }

    // ✅ Done
    emit('success', createdProgram)

    // reset
    program.code = ''
    program.name = ''
    degreeLevel.value = ''
    durationYears.value = 1
    departmentId.value = ''
    semesters.value = []
  } catch (err) {
    alert(err?.response?.data?.message || err?.message || 'Failed to create program.')
    console.error('❌ Create Program flow failed:', err)
  } finally {
    saving.value = false
  }
}

/* ---------- init ---------- */
onMounted(async () => {
  await Promise.all([fetchDepartments(), fetchSubjects()])
})

/* utils */
function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
</script>
