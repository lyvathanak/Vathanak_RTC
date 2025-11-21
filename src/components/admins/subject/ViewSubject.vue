<!-- /src/components/admins/subject/ViewSubject.vue -->
<template>
  <Teleport to="body">
    <div
      v-show="modelValue"
      class="fixed inset-0 z-[100] flex items-start justify-center"
      @keydown.esc="close"
    >
      <div class="absolute inset-0 bg-black/40" @click="close"></div>

      <div class="relative mt-6 w-[min(980px,95vw)] rounded-2xl bg-white shadow-xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <h2 class="text-2xl font-semibold">View Subject</h2>
          <button class="p-2 rounded-full hover:bg-gray-100" @click="close" aria-label="Close">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 space-y-8 max-h-[70vh] overflow-y-auto">
          <!-- Subject info -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <Info class="w-4 h-4" />
              <h3 class="font-semibold">Subject Information</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Code -->
              <div class="flex flex-col gap-1">
                <label class="text-sm">Subject Code</label>
                <input
                  disabled
                  v-model="view.subject_code"
                  class="w-full rounded-lg border px-3 py-2.5 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-700"
                />
              </div>

              <!-- Name -->
              <div class="flex flex-col gap-1">
                <label class="text-sm">Subject Name</label>
                <input
                  disabled
                  v-model="view.subject_name"
                  class="w-full rounded-lg border px-3 py-2.5 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-700"
                />
              </div>

              <!-- Credit -->
              <div class="flex flex-col gap-1">
                <label class="text-sm">Subject Credit</label>
                <input
                  disabled
                  :value="formatCredit(view.credit)"
                  class="w-full rounded-lg border px-3 py-2.5 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-700"
                />
              </div>

              <!-- Department (display-only with chevron) -->
              <div class="flex flex-col gap-1">
                <label class="text-sm">Department</label>
                <div class="w-full rounded-lg border px-3 py-2.5 bg-gray-50 text-gray-700 flex items-center justify-between">
                  <span class="truncate">{{ departmentLabel(view.department_id) || '-' }}</span>
                  <ChevronDown class="w-4 h-4 text-gray-500" />
                </div>
              </div>

              <!-- Program (display-only with chevron) -->
              <div class="flex flex-col gap-1">
                <label class="text-sm">Program</label>
                <div class="w-full rounded-lg border px-3 py-2.5 bg-gray-50 text-gray-700 flex items-center justify-between">
                  <span class="truncate">{{ programLabel(view.program_id) || '-' }}</span>
                  <ChevronDown class="w-4 h-4 text-gray-500" />
                </div>
              </div>

              <!-- Total Time (hours) -->
              <div class="flex flex-col gap-1">
                <label class="text-sm">Total Time (hours)</label>
                <input
                  disabled
                  :value="formatHour(view.total_hours)"
                  class="w-full rounded-lg border px-3 py-2.5 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-700"
                />
              </div>

              <!-- Practice Time (hours) -->
              <div class="flex flex-col gap-1">
                <label class="text-sm">Practice Time (hours)</label>
                <input
                  disabled
                  :value="formatHour(view.practice_hours)"
                  class="w-full rounded-lg border px-3 py-2.5 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-700"
                />
              </div>

              <!-- Description -->
              <div class="md:col-span-2 flex flex-col gap-1">
                <label class="text-sm">Description</label>
                <textarea
                  disabled
                  v-model="view.description"
                  rows="3"
                  class="w-full rounded-lg border px-3 py-2.5 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-700 resize-y"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Teachers -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <Info class="w-4 h-4" />
                <h3 class="font-semibold">Teachers ({{ teachers.length }})</h3>
              </div>
            </div>

            <div class="rounded-xl border overflow-hidden mb-3">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left text-sm font-medium text-gray-600 px-4 py-3">Name</th>
                    <th class="text-left text-sm font-medium text-gray-600 px-4 py-3">Email</th>
                    <th class="text-left text-sm font-medium text-gray-600 px-4 py-3">Assigned</th>
                    <th class="text-left text-sm font-medium text-gray-600 px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="t in teachers" :key="t.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm">{{ t.name || '-' }}</td>
                    <td class="px-4 py-3 text-sm">{{ t.email || '-' }}</td>
                    <td class="px-4 py-3 text-sm">{{ t.created_at || '-' }}</td>
                    <td class="px-4 py-3">
                      <button
                        class="inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 transition-colors disabled:opacity-50"
                        :title="isRemoving(t.id) ? 'Unassigning…' : 'Unassign teacher'"
                        :disabled="isRemoving(t.id)"
                        @click="handleUnassign(t)"
                      >
                        <Trash2 class="size-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!teachers.length">
                    <td colspan="4" class="px-4 py-3 text-sm text-gray-500">No teachers assigned.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Assign new teacher -->
            <div class="flex flex-col md:flex-row gap-2 md:items-center">
              <div class="flex-1">
                <div class="relative">
                  <select
                    v-model="selectedStaffId"
                    class="w-full rounded-lg border px-3 py-2.5 outline-none bg-white
                           appearance-none pr-10"
                  >
                    <option value="" disabled>Select teacher to assign</option>
                    <option
                      v-for="u in availableStaffOptions"
                      :key="u.id"
                      :value="u.id"
                    >
                      {{ u.name }} — {{ u.email }}
                    </option>
                  </select>
                  <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center" aria-hidden="true">
                    <ChevronDown class="w-4 h-4 text-gray-500" />
                  </span>
                </div>
              </div>
              <button
                class="rounded-md bg-[#235AA6] hover:bg-[#1e4a94] text-white px-4 py-2.5 disabled:opacity-60"
                :disabled="assigning || !selectedStaffId"
                @click="assignTeacher"
              >
                <span
                  v-if="assigning"
                  class="inline-block h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin mr-2"
                ></span>
                Assign Teacher
              </button>
            </div>
            <p v-if="assignError" class="text-sm text-red-600 mt-2">{{ assignError }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t flex items-center justify-end gap-2 bg-gray-50">
          <button class="rounded-md bg-[#235AA6] hover:bg-[#1e4a94] text-white px-4 py-2.5" @click="edit">
            Edit
          </button>
          <button class="rounded-md bg-red-500 hover:bg-red-600 text-white px-4 py-2.5" @click="close">
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import api from '@/stores/apis/axios'
import { X, Info, ChevronDown, Trash2 } from 'lucide-vue-next'
import { showNotification } from '@/lib/notifications'

/* Props/emit */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  subject: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'close', 'edit', 'updated'])

/* deep clone */
const clone = (v) => { try { return JSON.parse(JSON.stringify(v ?? {})) } catch { return { ...(v || {}) } } }

/* normalize incoming subject */
function normalize(s) {
  const nOr0 = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }
  return {
    id: s.id,
    subject_code: s.subject_code ?? s.subjectCode ?? s.code ?? s.course_code ?? '',
    subject_name: s.subject_name ?? s.subjectName ?? s.name ?? s.title ?? s.subject ?? '',
    credit: nOr0(s.credit),
    department_id: s.department_id ?? s.departmentId ?? s.department?.id ?? '',
    program_id: s.program_id ?? s.programId ?? s.program?.id ?? '',
    total_hours: nOr0(s.total_hours ?? s.total_hour ?? s.totalTime ?? s.totalHours),
    practice_hours: nOr0(s.practice_hours ?? s.practice_hour ?? s.practiceTime ?? s.practiceHours),
    description: s.description ?? s.desc ?? '',
  }
}
const normalizeTeacher = (t = {}) => ({
  id: t.id,
  name: t.name ?? '-',
  email: t.email ?? '-',
  created_at: t.created_at ?? '',
  updated_at: t.updated_at ?? '',
})

/* state */
const view = ref(normalize(props.subject))
const teachers = ref(Array.isArray(props.subject?.teachers) ? props.subject.teachers.map(normalizeTeacher) : [])

/* merge incoming to avoid wiping local additions */
watch(() => props.subject, (v) => {
  view.value = normalize(v || {})
  const incoming = Array.isArray(v?.teachers) ? v.teachers.map(normalizeTeacher) : null
  if (incoming) {
    const map = new Map(teachers.value.map(t => [String(t.id), t]))
    for (const t of incoming) map.set(String(t.id), t)
    teachers.value = Array.from(map.values())
  }
}, { immediate: true })

watch(() => props.modelValue, (open) => {
  if (!open) {
    selectedStaffId.value = ''
    assignError.value = ''
  } else {
    fetchStaffs()
    fetchDepartments()
    fetchPrograms()
  }
})

/* departments/programs */
const departments = ref([])   // {id,name}
const programs = ref([])      // {id,name}
const deptMap = ref(new Map())
const programMap = ref(new Map())

async function fetchDepartments () {
  try {
    const { data } = await api.get('/managements/get_all_department')
    const list = Array.isArray(data?.all_department) ? data.all_department : []
    departments.value = list.map(d => ({ id: d.id, name: d.department_name }))
    deptMap.value = new Map(departments.value.map(d => [String(d.id), d]))
  } catch (e) {
    console.error('Failed to load departments', e)
    departments.value = []
    deptMap.value = new Map()
    showNotification('Failed to load departments', 'error')
  }
}
async function fetchPrograms () {
  try {
    const { data } = await api.get('/managements/get_all_program')
    const list = Array.isArray(data?.programs) ? data.programs : []
    programs.value = list.map(p => ({ id: p.id, name: p.program_name }))
    programMap.value = new Map(programs.value.map(p => [String(p.id), p]))
  } catch (e) {
    console.error('Failed to load programs', e)
    programs.value = []
    programMap.value = new Map()
    showNotification('Failed to load programs', 'error')
  }
}
function departmentLabel (deptId) {
  if (!deptId) return ''
  return deptMap.value.get(String(deptId))?.name ?? `#${deptId}`
}
function programLabel (progId) {
  if (!progId) return ''
  return programMap.value.get(String(progId))?.name ?? `#${progId}`
}

/* staff list for assigning — from /users/get_all_users */
const staffs = ref([])
const loadingStaffs = ref(false)
async function fetchStaffs () {
  loadingStaffs.value = true
  try {
    const { data } = await api.get('/users/get_all_users', {
      params: { per_page: 1000, role: 'staff', gender: '' }
    })
    const list = Array.isArray(data?.users?.data) ? data.users.data : []
    staffs.value = list.map(u => ({
      id: u.id,
      name: u.name ?? u.latin_name ?? u.khmer_name ?? '-',
      email: u.email ?? '-',
      roles: u.roles || []
    }))
  } catch (e) {
    console.error('Failed to load teachers', e)
    staffs.value = []
    showNotification('Failed to load teachers', 'error')
  } finally {
    loadingStaffs.value = false
  }
}
const assignedIds = computed(() => new Set(teachers.value.map(t => String(t.id))))
const availableStaffOptions = computed(() => staffs.value.filter(u => !assignedIds.value.has(String(u.id))))

/* assign teacher (PUT) */
const selectedStaffId = ref('')
const assigning = ref(false)
const assignError = ref('')
async function assignTeacher () {
  if (!selectedStaffId.value || !view.value.id) return
  if (assignedIds.value.has(String(selectedStaffId.value))) {
    assignError.value = 'This staff is already assigned.'
    return
  }
  assignError.value = ''
  assigning.value = true
  try {
    const { data } = await api.put(`/managements/assign_teacher_subject/${view.value.id}`, {
      user_id: Number(selectedStaffId.value)
    })

    const newTeacher = data?.assigned_user ? normalizeTeacher(data.assigned_user) : null
    if (newTeacher) {
      teachers.value = [...teachers.value, newTeacher]
    } else {
      const picked = staffs.value.find(s => String(s.id) === String(selectedStaffId.value))
      if (picked) teachers.value = [...teachers.value, normalizeTeacher(picked)]
    }

    if (data?.subject) {
      const merged = normalize({ ...view.value, ...data.subject })
      view.value = merged
      emit('updated', { ...merged, teachers: teachers.value.map(t => ({ ...t })) })
    } else {
      emit('updated', { ...view.value, teachers: teachers.value.map(t => ({ ...t })) })
    }

    selectedStaffId.value = ''
    showNotification('Teacher assigned successfully', 'success')
  } catch (e) {
    console.error('Assign failed', e)
    assignError.value = e?.response?.data?.message || 'Failed to assign teacher.'
    showNotification(assignError.value, 'error')
  } finally {
    assigning.value = false
  }
}

/* unassign teacher — no dialog, snackbar only */
const removingIds = ref(new Set())
function isRemoving(id) { return removingIds.value.has(String(id)) }

function handleUnassign(t) {
  unassignTeacher(t.id)
}

async function unassignTeacher(userId) {
  if (!userId || !view.value?.id) return
  try {
    removingIds.value.add(String(userId))

    const { data } = await api.delete('/managements/unassign_teacher_subject', {
      data: { user_id: Number(userId), subject_id: Number(view.value.id) }
    })

    teachers.value = teachers.value.filter(t => String(t.id) !== String(userId))

    if (data?.subject) {
      const merged = normalize({ ...view.value, ...data.subject })
      view.value = merged
      emit('updated', { ...merged, teachers: teachers.value.map(t => ({ ...t })) })
    } else {
      emit('updated', { ...view.value, teachers: teachers.value.map(t => ({ ...t })) })
    }

    showNotification('Teacher unassigned successfully', 'success')
  } catch (e) {
    console.error('Unassign failed', e)
    const msg = e?.response?.data?.message || 'Failed to unassign teacher'
    showNotification(msg, 'error')
  } finally {
    removingIds.value.delete(String(userId))
  }
}

/* display helpers */
const formatCredit = (n) => {
  const num = Number(n ?? 0)
  if (!Number.isFinite(num)) return '0.00'
  return Number.isInteger(num) ? num.toFixed(2) : num.toFixed(2).replace(/\.?0+$/, '')
}
const formatHour = (h) => {
  const n = Number(h ?? 0)
  if (!Number.isFinite(n)) return '0'
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')
}

/* controls */
function close () { emit('update:modelValue', false); emit('close') }
function edit () { emit('edit', clone(view.value)) }

/* initial prefetch */
onMounted(() => {
  fetchDepartments()
  fetchPrograms()
  fetchStaffs()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
