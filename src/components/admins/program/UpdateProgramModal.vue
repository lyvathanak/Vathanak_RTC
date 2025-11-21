<!-- /src/components/admins/program/UpdateProgramModal.vue -->
<template>
  <form @submit.prevent="submit" class="max-w-none">
    <div class="space-y-8">
      <!-- ============= Program Information ============= -->
      <section class="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs font-bold">i</span>
          <h3 class="font-semibold">Program Information</h3>
        </div>

        <div class="px-4 py-4">
          <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
            <!-- Program Name (4/6) -->
            <div class="flex flex-col md:col-span-4">
              <label class="text-sm font-medium mb-1">Program Name</label>
              <input
                v-model="form.program_name"
                type="text"
                placeholder="Enter Program Name"
                class="h-10 w-full rounded-2xl border px-3 outline-none focus:ring-2 focus:ring-[#235AA6]"
              />
              <p v-if="errors.program_name" class="text-red-600 text-sm mt-1">{{ errors.program_name }}</p>
            </div>

            <!-- Degree Level (2/6) -->
            <div class="flex flex-col md:col-span-2">
              <label class="text-sm font-medium mb-1">Degree Level <span class="text-red-600">*</span></label>
              <div class="relative">
                <select
                  v-model="form.degree_level"
                  required
                  class="h-10 w-full rounded-2xl border px-3 outline-none bg-white focus:ring-2 focus:ring-[#235AA6]
                         appearance-none pr-9"
                >
                  <option value="">Select degree level</option>
                  <option v-for="opt in degreeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center" aria-hidden="true">
                  <ChevronDown class="w-4 h-4 text-gray-500" />
                </span>
              </div>
              <p v-if="errors.degree_level" class="text-red-600 text-sm mt-1">{{ errors.degree_level }}</p>
            </div>

            <!-- Duration (2/6) -->
            <div class="flex flex-col md:col-span-2">
              <label class="text-sm font-medium mb-1">Duration (years) <span class="text-red-600">*</span></label>
              <input
                v-model.number="form.duration_years"
                type="number" min="1"
                placeholder="Enter Duration"
                class="h-10 w-full rounded-2xl border px-3 outline-none focus:ring-2 focus:ring-[#235AA6]"
                required
              />
              <p v-if="errors.duration_years" class="text-red-600 text-sm mt-1">{{ errors.duration_years }}</p>
            </div>

            <!-- Department (4/6) -->
            <div class="flex flex-col md:col-span-4">
              <label class="text-sm font-medium mb-1">Department <span class="text-red-600">*</span></label>
              <div class="relative">
                <select
                  v-model="form.department_id"
                  class="h-10 w-full rounded-2xl border px-3 outline-none bg-white focus:ring-2 focus:ring-[#235AA6]
                         appearance-none pr-9 disabled:bg-gray-100"
                  :disabled="loadingDepartments"
                  required
                >
                  <option value="">Select department…</option>
                  <option v-for="d in departments" :key="d.id" :value="String(d.id)">{{ d.department_name }}</option>
                </select>
                <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center" aria-hidden="true">
                  <ChevronDown class="w-4 h-4 text-gray-500" />
                </span>
              </div>
              <p v-if="errors.department_id" class="text-red-600 text-sm mt-1">{{ errors.department_id }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============= Semesters & Subjects ============= -->
      <section class="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs font-bold">i</span>
            <h3 class="font-semibold">Semesters</h3>
          </div>
          <button
            type="button"
            @click="startNewSemester"
            class="inline-flex items-center gap-2 rounded-xl bg-[#235AA6] px-3 py-2 text-white font-semibold shadow hover:bg-[#1f4f93]"
          >
            <Plus class="w-4 h-4" />
            <span>Add Semester</span>
          </button>
        </div>

        <div class="px-4 py-4">
          <!-- New semester inline editor (stays open after save) -->
          <div v-if="showNewSem" class="rounded-xl bg-white shadow border border-gray-200 mb-6">
            <div class="px-4 py-3 border-b flex items-center justify-between">
              <div class="font-medium text-gray-700">New Semester</div>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-xl bg-[#235AA6] text-white text-sm font-semibold shadow hover:bg-[#1f4f93] disabled:opacity-60"
                  :disabled="creatingSem"
                  @click="createNewSemester"
                >
                  <span v-if="creatingSem" class="inline-block h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Save
                </button>
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-xl border text-sm hover:bg-gray-50 disabled:opacity-60"
                  :disabled="creatingSem"
                  @click="cancelNewSemester"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div class="px-4 py-4 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div class="flex flex-col">
                  <label class="text-xs text-gray-700 mb-1">Semester No.</label>
                  <input :value="newSem.semester_number" disabled class="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100" />
                </div>

                <div class="flex flex-col md:col-span-3">
                  <label class="text-xs text-gray-700 mb-1">Semester Name</label>
                  <input v-model="newSem.semester_key" type="text" class="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#235AA6]" />
                </div>

                <div class="flex flex-col">
                  <label class="text-xs text-gray-700 mb-1">Start Date</label>
                  <input v-model="newSem.start_date" type="date" class="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#235AA6]" />
                </div>

                <div class="flex flex-col">
                  <label class="text-xs text-gray-700 mb-1">End Date</label>
                  <input v-model="newSem.end_date" type="date" class="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#235AA6]" />
                </div>
              </div>

              <!-- Subject picker (like create UI) -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <div class="text-xs text-gray-700 font-medium">Subjects</div>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded bg-gray-800 text-white text-xs px-2 py-1 hover:bg-black"
                    @click="addNewRow"
                    title="Add subject"
                  >
                    + Add Subject
                  </button>
                </div>

                <div class="overflow-x-auto border rounded-lg">
                  <table class="min-w-full text-sm">
                    <thead>
                      <tr class="text-left bg-gray-100">
                        <th class="px-3 py-2 font-semibold w-72">Subject</th>
                        <th class="px-3 py-2 font-semibold w-20">Credit</th>
                        <th class="px-3 py-2 font-semibold w-24">Hour</th>
                        <th class="px-3 py-2 font-semibold w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!newSem.rows.length">
                        <td colspan="4" class="px-3 py-3 text-center text-gray-500 italic">No subjects</td>
                      </tr>
                      <tr v-for="(r, i) in newSem.rows" :key="`ns-${i}`" class="border-t">
                        <td class="px-3 py-2">
                          <div class="relative">
                            <select
                              class="w-full border rounded px-2 py-2 bg-white focus:ring-2 focus:ring-black appearance-none pr-9"
                              :value="r.subjectId || ''"
                              @change="onNewSubjectPicked(i, $event.target.value)"
                            >
                              <option value="">Select subject…</option>
                              <option v-for="s in subjectCatalog" :key="s.id" :value="s.id">
                                {{ s.nameWithCode || s.name }}
                              </option>
                            </select>
                            <span class="pointer-events-none absolute inset-y-0 right-2 flex items-center" aria-hidden="true">
                              <ChevronDown class="w-4 h-4 text-gray-500" />
                            </span>
                          </div>
                        </td>
                        <td class="px-3 py-2">{{ r.credit ?? '' }}</td>
                        <td class="px-3 py-2">{{ r.hour ?? '' }}</td>
                        <td class="px-3 py-2">
                          <button
                            type="button"
                            class="inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 transition-colors"
                            @click="removeNewRow(i)"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <p v-if="newSemMsg" class="text-xs" :class="newSemOk ? 'text-green-700' : 'text-red-600'">{{ newSemMsg }}</p>
            </div>
          </div>

          <!-- Loading / empty -->
          <div v-if="loadingSemesters" class="text-sm text-gray-500">Loading semesters…</div>
          <div v-else-if="semesters.length === 0" class="text-sm text-gray-500 italic">No semesters in this program.</div>

          <!-- Semester Cards -->
          <div
            v-for="sem in semesters"
            :key="sem.id"
            class="rounded-xl bg-white shadow border border-gray-200 mb-4"
          >
            <!-- Header + edit controls -->
            <div class="px-4 py-3">
              <div class="flex items-start justify-between gap-3">
                <!-- View -->
                <div v-if="!sem._editing" class="flex flex-wrap items-center gap-2 sm:gap-x-6">
                  <div class="text-sm text-gray-700 font-medium">
                    <span class="text-gray-600">{{ sem.semester_key }}</span>
                  </div>
                  <span
                    v-if="sem.academic_year_label"
                    class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700"
                  >
                    AY {{ sem.academic_year_label }}
                  </span>
                  <div class="text-xs text-gray-500">
                    <span class="font-medium">Start:</span> {{ sem.start_date || '—' }}
                    <span class="mx-2">•</span>
                    <span class="font-medium">End:</span> {{ sem.end_date || '—' }}
                  </div>
                </div>

                <!-- Edit -->
                <div v-else class="grid grid-cols-1 md:grid-cols-6 gap-3 w-full">
                  <div class="md:col-span-3">
                    <label class="text-xs text-gray-700 mb-1 block">Semester Name</label>
                    <input v-model="sem._edit.semester_key" type="text" class="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#235AA6]" />
                  </div>
                  <div>
                    <label class="text-xs text-gray-700 mb-1 block">Start Date</label>
                    <input v-model="sem._edit.start_date" type="date" class="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#235AA6]" />
                  </div>
                  <div>
                    <label class="text-xs text-gray-700 mb-1 block">End Date</label>
                    <input v-model="sem._edit.end_date" type="date" class="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#235AA6]" />
                  </div>
                </div>

                <!-- Right controls -->
                <div class="flex items-center gap-2 shrink-0">
                  <template v-if="!sem._editing">
                    <button type="button" class="p-2 rounded-lg hover:bg-gray-100" title="Edit semester" @click="enterEdit(sem)">
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      class="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50"
                      title="Delete semester"
                      :disabled="sem._deleting"
                      @click="deleteSemester(sem)"
                    >
                      <span
                        v-if="sem._deleting"
                        class="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                      />
                      <Trash2 v-else class="w-4 h-4" />
                    </button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded-xl bg-[#235AA6] text-white text-sm font-semibold shadow hover:bg-[#1f4f93] disabled:opacity-60"
                      :disabled="sem._saving"
                      @click="saveSemHeader(sem)"
                    >
                      <span v-if="sem._saving" class="inline-block h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Save
                    </button>
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded-xl border text-sm hover:bg-gray-50 disabled:opacity-60"
                      :disabled="sem._saving"
                      @click="cancelEdit(sem)"
                    >
                      Cancel
                    </button>
                  </template>
                </div>
              </div>

              <p v-if="sem._msgHead" class="mt-2 text-xs" :class="sem._okHead ? 'text-green-700' : 'text-red-600'">
                {{ sem._msgHead }}
              </p>
            </div>

            <!-- Subjects table -->
            <div class="px-4 pb-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="relative">
                  <select
                    v-model="sem._subjectToAdd"
                    class="h-9 rounded-xl border px-3 outline-none bg-white focus:ring-2 focus:ring-[#235AA6] min-w-[18rem]
                           appearance-none pr-9"
                    :disabled="sem._adding || loadingAllSubjects"
                    title="Select a subject to add"
                  >
                    <option value="">Select subject…</option>
                    <option v-for="s in availableSubjectsForSemester(sem.id)" :key="s.id" :value="String(s.id)">
                      {{ s.subject_code ? `${s.subject_code} — ${s.subject_name}` : s.subject_name }}
                    </option>
                  </select>
                  <span class="pointer-events-none absolute inset-y-0 right-2 flex items-center" aria-hidden="true">
                    <ChevronDown class="w-4 h-4 text-gray-500" />
                  </span>
                </div>

                <button
                  type="button"
                  @click="addSubjectToSemester(sem)"
                  :disabled="!sem._subjectToAdd || sem._adding"
                  class="inline-flex items-center gap-2 rounded-xl bg-[#235AA6] px-3 py-1.5 text-white font-semibold shadow hover:bg-[#1f4f93] disabled:opacity-60"
                >
                  <span v-if="sem._adding" class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{{ sem._adding ? 'Adding…' : '+ Add Subject' }}</span>
                </button>
              </div>

              <div class="overflow-x-auto border rounded-lg">
                <table class="min-w-full text-sm">
                  <thead>
                    <tr class="bg-gray-100 text-left">
                      <th class="px-3 py-2 font-semibold w-24">ID</th>
                      <th class="px-3 py-2 font-semibold">Subject</th>
                      <th class="px-3 py-2 font-semibold w-20">Credit</th>
                      <th class="px-3 py-2 font-semibold w-24">Hours</th>
                      <th class="px-3 py-2 font-semibold w-24 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="sem._loading">
                      <td colspan="5" class="px-3 py-3 text-center text-gray-500">Loading…</td>
                    </tr>

                    <tr v-else-if="(semesterSubjects[sem.id] || []).length === 0">
                      <td colspan="5" class="px-3 py-3 text-center text-gray-500 italic">No subjects in this semester.</td>
                    </tr>

                    <tr v-for="sub in (semesterSubjects[sem.id] || [])" :key="`${sem.id}-${sub.id}`" class="border-t">
                      <td class="px-3 py-2">#{{ sub.id }}</td>
                      <td class="px-3 py-2">
                        <div class="font-medium">
                          {{ sub.subject_code ? `${sub.subject_code} — ${sub.subject_name}` : sub.subject_name }}
                        </div>
                        <div class="text-xs text-gray-500" v-if="sub.description">{{ sub.description }}</div>
                      </td>
                      <td class="px-3 py-2">{{ sub.credit ?? '—' }}</td>
                      <td class="px-3 py-2">{{ sub.total_hours ?? sub.practice_hours ?? '—' }}</td>
                      <td class="px-3 py-2">
                        <div class="flex justify-end">
                          <button
                            type="button"
                            :disabled="isRemoving(sem.id, sub.id)"
                            @click="removeSubjectFromSemester(sem, sub.id)"
                            :title="isRemoving(sem.id, sub.id) ? 'Removing…' : 'Remove subject from semester'"
                            class="inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <span
                              v-if="isRemoving(sem.id, sub.id)"
                              class="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                            />
                            <Trash2 v-else class="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p v-if="sem._msg" class="text-xs mt-2" :class="sem._ok ? 'text-green-700' : 'text-red-600'">
                {{ sem._msg }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ============= Footer (sticky) ============= -->
    <div class="sticky -bottom-5 mt-10 -mx-6 sm:mx-0 bg-white border-t px-6 py-4 -mb-5">
      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white font-semibold shadow hover:bg-red-700"
        >
          Cancel
        </button>

        <button
          type="submit"
          :disabled="loading || !canSubmit"
          class="inline-flex items-center gap-2 rounded-xl bg-[#235AA6] px-4 py-2 text-white font-semibold shadow disabled:opacity-60"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
            <path d="M4 12a 8 8 0 0 1 8-8" stroke="currentColor" stroke-width="4" fill="none"/>
          </svg>
          <span>Save</span>
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import api from '@/stores/apis/axios'
import { Trash2, Pencil, Plus, ChevronDown } from 'lucide-vue-next'  // ⟵ added ChevronDown

/* ---------- props / emits ---------- */
const props = defineProps({ program: { type: Object, required: true } })
const emit = defineEmits(['success', 'cancel'])

/* ---------- form ---------- */
const degreeOptions = [
  { label: 'Bachelor', value: 'Bachelor' },
  { label: 'High Bachelor', value: 'High Bachelor' },
  { label: 'Master', value: 'Master' },
  { label: 'PhD', value: 'PhD' },
]
const form = ref({
  program_code: '',
  program_name: '',
  degree_level: '',
  duration_years: 1,
  department_id: '',
})
const errors = ref({})
const loading = ref(false)

/* ---------- departments ---------- */
const departments = ref([])
const loadingDepartments = ref(false)

/* ---------- semesters ---------- */
const semesters = ref([]) // [{id, semester_number, semester_key, start_date, end_date, locals...}]
const loadingSemesters = ref(false)

/* ---------- subjects (catalog) ---------- */
const allSubjects = ref([])
const loadingAllSubjects = ref(false)
const subjectCatalog = computed(() =>
  allSubjects.value.map(s => ({
    id: s.id,
    name: s.subject_name || s.name || '',
    nameWithCode: [s.subject_code, (s.subject_name || s.name)].filter(Boolean).join(' — '),
    credit: s.credit ?? 0,
    hour: s.total_hours ?? s.practice_hours ?? 0
  }))
)

/* ---------- subjects per semester ---------- */
const semesterSubjects = reactive({}) // { [semesterId]: Subject[] }
const removingSet = ref(new Set())     // keys "semesterId|subjectId"

/* =============================== Date helpers =============================== */
function pad2(n){ return String(n).padStart(2,'0') }
function toISO(dmyOrIso){
  if (!dmyOrIso) return ''
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dmyOrIso)) {
    const [y,m,d] = dmyOrIso.split('-'); return `${y}-${pad2(m)}-${pad2(d)}`
  }
  const [d,m,y] = (dmyOrIso||'').split('-')
  if (y && m && d) return `${y}-${pad2(m)}-${pad2(d)}`
  return ''
}
function dmyToISO(dmy){
  const [d,m,y] = (dmy||'').split('-')
  if (y && m && d) return `${y}-${pad2(m)}-${pad2(d)}`
  return ''
}

/* ---------- augment semester for UI ---------- */
function augmentSemester(s){
  const startISO = toISO(s.start_date)
  const endISO   = toISO(s.end_date)
  const ayLabel  = s.academic_year?.year_label || s.academic_year || null
  return {
    ...s,
    start_date: startISO || '',
    end_date  : endISO   || '',
    academic_year_label: ayLabel,
    _editing: false,
    _saving: false,
    _edit: {
      semester_key: s.semester_key || `Semester ${s.semester_number}`,
      start_date: startISO,
      end_date: endISO
    },
    _okHead: false,
    _msgHead: '',
    _subjectToAdd: '',
    _adding: false,
    _loading: false,
    _ok: false,
    _msg: '',
    _deleting: false,
  }
}

/* ========================= Add new semester (inline) ======================== */
const showNewSem = ref(false)
const creatingSem = ref(false)
const newSem = ref({ semester_number: 1, semester_key: 'Semester 1', start_date: '', end_date: '', rows: [] })
const newSemMsg = ref('')
const newSemOk = ref(false)

function startNewSemester() {
  const nextNo = Math.max(0, ...semesters.value.map(s => Number(s.semester_number) || 0)) + 1
  newSem.value = { semester_number: nextNo, semester_key: `Semester ${nextNo}`, start_date: '', end_date: '', rows: [] }
  newSemMsg.value = ''; newSemOk.value = false
  showNewSem.value = true
}
function cancelNewSemester() {
  showNewSem.value = false
  newSem.value = { semester_number: 1, semester_key: 'Semester 1', start_date: '', end_date: '', rows: [] }
  newSemMsg.value = ''; newSemOk.value = false
}
function addNewRow(){ newSem.value.rows.push({ subjectId: '', name: '', credit: null, hour: null }) }
function removeNewRow(i){ newSem.value.rows.splice(i,1) }
function onNewSubjectPicked(index, value){
  const r = newSem.value.rows[index]; if (!r) return
  r.subjectId = value || ''
  const found = subjectCatalog.value.find(s => String(s.id) === String(value))
  if (found){ r.name = found.name; r.credit = found.credit; r.hour = found.hour }
  else { r.name=''; r.credit=null; r.hour=null }
}

async function createNewSemester(){
  if (!props.program?.id) return
  newSemMsg.value=''; newSemOk.value=false; creatingSem.value=true
  try{
    const body = {
      program_id: Number(props.program.id),
      semester_number: Number(newSem.value.semester_number),
      semester_key: String(newSem.value.semester_key || `Semester ${newSem.value.semester_number}`).trim(),
      start_date: newSem.value.start_date || '',
      end_date  : newSem.value.end_date   || ''
    }
    // 1) create semester
    const r = await api.post('/managements/create_new_semester_program', body)
    const created = r?.data?.semester || null
    const createdId = created?.id
    if (!createdId) throw new Error('Semester not created.')

    // 2) assign selected subjects (if any)
    const subjectIds = newSem.value.rows
      .map(x => Number(x.subjectId))
      .filter(n => Number.isFinite(n) && n>0)
    if (subjectIds.length){
      await api.post('/managements/add_subject_to_semester', {
        semester_id: Number(createdId),
        subject_ids: subjectIds
      })
    }

    // 3) show in list immediately (keep the inline creator open)
    const uiSem = augmentSemester(created)
    semesters.value.push(uiSem)
    await loadSubjectsInSemester(uiSem.id)

    // 4) reset the inline editor for the next one
    const nextNo = Math.max(...semesters.value.map(s=>Number(s.semester_number)||0)) + 1
    newSem.value = { semester_number: nextNo, semester_key: `Semester ${nextNo}`, start_date: '', end_date: '', rows: [] }
    newSemOk.value = true
    newSemMsg.value = 'Semester created. You can add another.'
  }catch(e){
    newSemOk.value = false
    newSemMsg.value = e?.response?.data?.message || e?.message || 'Failed to create semester.'
  }finally{
    creatingSem.value=false
  }
}

/* ====================== Existing semester: inline edit ====================== */
function enterEdit(sem){
  sem._edit = {
    semester_key: sem.semester_key || `Semester ${sem.semester_number}`,
    start_date: toISO(sem.start_date),
    end_date: toISO(sem.end_date)
  }
  sem._okHead = false
  sem._msgHead = ''
  sem._editing = true
}
function cancelEdit(sem){
  sem._editing = false
  sem._msgHead = ''
}
async function saveSemHeader(sem){
  if (!sem?._edit) return
  sem._saving = true; sem._okHead = false; sem._msgHead = ''
  try{
    const body = {
      semester_key   : (sem._edit.semester_key || '').trim() || `Semester ${sem.semester_number}`,
      semester_number: Number(sem.semester_number),
      start_date     : sem._edit.start_date || '',
      end_date       : sem._edit.end_date   || '',
      program_id     : Number(props.program?.id)
    }
    const { data } = await api.put(`/managements/update_semester/${sem.id}`, body)
    const srv = data?.semester || {}

    // reflect server-of-record values (API returns DMY)
    sem.semester_key        = srv.semester_key ?? body.semester_key
    sem.semester_number     = Number(srv.semester_number ?? body.semester_number)
    sem.start_date          = dmyToISO(srv.start_date ?? body.start_date)
    sem.end_date            = dmyToISO(srv.end_date   ?? body.end_date)
    sem.academic_year_label = data?.academic_year || srv.academic_year?.year_label || sem.academic_year_label || null

    sem._okHead = true
    sem._msgHead = data?.message || 'Semester updated.'
    sem._editing = false
  }catch(e){
    sem._okHead = false
    sem._msgHead = e?.response?.data?.message || 'Failed to update semester.'
  }finally{
    sem._saving = false
  }
}

/* ====================== Delete existing semester (card) ===================== */
async function deleteSemester(sem){
  if (!sem?.id) return
  if (!confirm(`Delete "${sem.semester_key}"? This cannot be undone.`)) return
  sem._deleting = true
  try{
    await api.delete(`/managements/delete_semester/${sem.id}`)
    semesters.value = semesters.value.filter(s => String(s.id) !== String(sem.id))
    delete semesterSubjects[sem.id]
  }catch(e){
    sem._msgHead = e?.response?.data?.message || 'Failed to delete semester.'
    sem._okHead = false
    setTimeout(()=> { sem._msgHead = '' }, 3000)
  }finally{
    sem._deleting = false
  }
}

/* =========================== Subjects add / remove ========================== */
function rmKey(semesterId, subjectId) { return `${semesterId}|${subjectId}` }
function isRemoving(semesterId, subjectId) { return removingSet.value.has(rmKey(semesterId, subjectId)) }

async function addSubjectToSemester(sem) {
  if (!sem?._subjectToAdd) return
  sem._ok = false; sem._msg = ''; sem._adding = true
  try {
    await api.post('/managements/add_subject_to_semester', {
      semester_id: Number(sem.id),
      subject_ids: [Number(sem._subjectToAdd)]
    })
    sem._subjectToAdd = ''
    await loadSubjectsInSemester(sem.id)
    sem._ok = true
    sem._msg = 'Subject added to semester.'
  } catch (e) {
    sem._ok = false
    sem._msg = e?.response?.data?.message || 'Failed to add subject.'
    console.error('❌ Add subject to semester failed:', e?.response?.data || e)
  } finally {
    sem._adding = false
  }
}

async function removeSubjectFromSemester(sem, subjectId) {
  const key = rmKey(sem.id, subjectId)
  const set = new Set(removingSet.value); set.add(key); removingSet.value = set
  sem._ok = false; sem._msg = ''
  try {
    await api.delete('/managements/remove_subject_from_semester', {
      data: { semester_id: Number(sem.id), subject_ids: [Number(subjectId)] }
    })
    semesterSubjects[sem.id] = (semesterSubjects[sem.id] || []).filter(s => String(s.id) !== String(subjectId))
    sem._ok = true
    sem._msg = 'Subject removed from semester.'
  } catch (e) {
    sem._ok = false
    sem._msg = e?.response?.data?.message || 'Failed to remove subject.'
    console.error('❌ Remove subject from semester failed:', e?.response?.data || e)
  } finally {
    const s2 = new Set(removingSet.value); s2.delete(key); removingSet.value = s2
  }
}

/* =============================== Loaders ==================================== */
const canSubmit = computed(() =>
  !!form.value.degree_level &&
  Number(form.value.duration_years) >= 1 &&
  !!form.value.department_id
)

function availableSubjectsForSemester(semesterId) {
  const present = new Set((semesterSubjects[semesterId] || []).map(s => String(s.id)))
  return allSubjects.value.filter(s => !present.has(String(s.id)))
}

async function loadDepartments() {
  loadingDepartments.value = true
  try {
    const { data } = await api.get('/managements/get_all_department')
    departments.value = Array.isArray(data?.all_department) ? data.all_department : []
  } catch (e) {
    departments.value = []
    console.error('❌ Departments load failed:', e?.response?.data || e)
  } finally {
    loadingDepartments.value = false
  }
}

async function loadAllSubjects() {
  loadingAllSubjects.value = true
  try {
    const { data } = await api.get('/managements/get_all_subjects')
    const arr = Array.isArray(data?.subjects?.data) ? data.subjects.data : []
    allSubjects.value = arr.map(s => ({
      id: s.id,
      subject_name: s.subject_name || s.name || '',
      subject_code: s.subject_code,
      credit: Number(s.credit ?? 0),
      total_hours: Number(s.total_hours ?? 0),
      practice_hours: Number(s.practice_hours ?? 0),
      description: s.description
    }))
  } catch (e) {
    allSubjects.value = []
    console.error('⚠️ All subjects load failed:', e?.response?.data || e)
  } finally {
    loadingAllSubjects.value = false
  }
}

async function loadSemesters(programId) {
  loadingSemesters.value = true
  try {
    const { data } = await api.get(`/managements/get_semesters_by_program/${programId}`)
    const list = Array.isArray(data?.semesters) ? data.semesters : []
    semesters.value = list.map(augmentSemester)
    for (const s of semesters.value) {
      await loadSubjectsInSemester(s.id)
    }
  } catch (e) {
    semesters.value = []
    console.error('❌ Semesters load failed:', e?.response?.data || e)
  } finally {
    loadingSemesters.value = false
  }
}

async function loadSubjectsInSemester(semesterId) {
  const sem = semesters.value.find(x => Number(x.id) === Number(semesterId))
  if (sem) sem._loading = true
  try {
    const { data } = await api.get(`/managements/get_all_subject_in_semester/${semesterId}`)
    semesterSubjects[semesterId] = Array.isArray(data?.subjects) ? data.subjects : []
  } catch (e) {
    semesterSubjects[semesterId] = []
    console.error('❌ Subjects in semester load failed:', e?.response?.data || e)
  } finally {
    if (sem) sem._loading = false
  }
}

/* ============================== Submit program ============================== */
function validateLocal() {
  errors.value = {}
  if (!form.value.degree_level) errors.value.degree_level = 'Degree level is required.'
  if (!form.value.duration_years || Number(form.value.duration_years) < 1) {
    errors.value.duration_years = 'Duration must be at least 1.'
  }
  if (!form.value.department_id) errors.value.department_id = 'Department is required.'
  return Object.keys(errors.value).length === 0
}

async function submit() {
  if (!validateLocal()) return
  loading.value = true
  try {
    const payload = {
      program_name: form.value.program_name?.trim() || '',
      degree_level: form.value.degree_level,
      duration_years: Number(form.value.duration_years),
      department_id: Number(form.value.department_id)
    }
    await api.put(`/managements/update_program/${props.program.id}`, payload)
    emit('success', { ...payload, id: props.program.id })
  } catch (err) {
    const data = err?.response?.data
    if (data?.errors) {
      const flat = {}
      Object.entries(data.errors).forEach(([k, v]) => { flat[k] = Array.isArray(v) ? v[0] : String(v) })
      errors.value = flat
    }
    console.error('❌ Update program failed:', data || err)
  } finally {
    loading.value = false
  }
}

/* =============================== Hydration ================================== */
watch(
  () => props.program,
  async (p) => {
    if (!p) return
    form.value.program_code   = p.program_code || p.code || ''
    form.value.program_name   = p.program_name || p.name || ''
    form.value.degree_level   = p.degree_level || ''
    form.value.duration_years = Number(p.duration_years ?? 1)
    form.value.department_id  = String(p.department_id ?? p.department?.id ?? '')

    await Promise.all([loadDepartments(), loadAllSubjects()])
    await loadSemesters(p.id)
    errors.value = {}
  },
  { immediate: true }
)

onMounted(async () => {
  await Promise.all([loadDepartments(), loadAllSubjects()])
  if (props.program?.id) await loadSemesters(props.program.id)
})
</script>
