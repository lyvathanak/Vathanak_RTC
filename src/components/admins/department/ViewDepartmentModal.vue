<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-[9999] flex items-center justify-center">
      <!-- Backdrop: clicking closes ONLY this parent modal -->
      <div class="absolute inset-0 bg-black/50" @click="editMode ? null : onClose" />

      <!-- Panel -->
      <div class="relative bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden" role="dialog" aria-modal="true">
        <!-- Header -->
        <div class="px-6 py-4 border-b">
          <h3 class="text-xl font-semibold text-gray-900">Department Details</h3>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">
          <section>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <div class="text-xs text-gray-500">Name</div>
                  <div v-if="!editMode" class="text-sm font-semibold text-gray-900">
                    {{ dept?.name }}
                  </div>
                  <input
                    v-else
                    v-model.trim="form.name"
                    class="w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Department name"
                  />
                  <p v-if="editMode && errors.name" class="text-xs text-red-600 mt-1">{{ errors.name }}</p>
                </div>

                <div>
                  <div class="text-xs text-gray-500">Status</div>
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Active</span>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <div class="text-xs text-gray-500">Head of Department</div>
                  <div v-if="!editMode" class="text-sm font-medium text-gray-900">{{ hodResolved }}</div>
                  <select
                    v-else
                    v-model.number="form.hodUserId"
                    class="w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option :value="''">Not Assigned</option>
                    <option v-for="h in filteredHods" :key="h.value" :value="h.value">
                      {{ h.label }}
                    </option>
                  </select>
                  <p v-if="editMode && unassignWarning" class="text-xs text-amber-600 mt-1">
                    Clearing HOD won’t unassign (no API for unassign).
                  </p>
                </div>
              </div>

              <div class="md:col-span-2">
                <div class="text-xs text-gray-500">Description</div>
                <div v-if="!editMode" class="text-sm text-gray-800">{{ dept?.description || '—' }}</div>
                <textarea
                  v-else
                  v-model="form.description"
                  rows="4"
                  class="w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          <!-- Sub-Departments -->
          <section>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-gray-900" />
                <h4 class="font-semibold text-gray-900">Sub-Departments</h4>
              </div>
            </div>

            <div class="mb-3 flex items-center gap-2">
              <button class="px-3 py-2 rounded-lg border hover:bg-gray-50" @click="silentRefreshSubDepts" title="Refresh">⟳</button>
              <button class="px-3 py-2 rounded-lg bg-[#235AA6] text-white hover:bg-[#1f4c93]" @click="openCreateSubDept">
                + New
              </button>
            </div>

            <div class="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm text-gray-600">ID</th>
                    <th class="px-4 py-2 text-left text-sm text-gray-600">Name</th>
                    <th class="px-4 py-2 text-left text-sm text-gray-600">Active</th>
                    <th class="px-4 py-2 text-left text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="row in subDepts" :key="row.__key">
                    <td class="px-4 py-2 text-sm">#{{ row.id ?? '—' }}</td>
                    <td class="px-4 py-2 text-sm">{{ row.name }}</td>
                    <td class="px-4 py-2 text-sm">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Active</span>
                    </td>
                    <td class="px-4 py-2 text-sm">
                      <div class="flex items-center gap-2">
                        <button class="inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 px-2.5 py-1.5" title="View" @click="openViewSubDept(row)">
                          <Eye class="size-4" />
                        </button>
                        <button class="inline-flex items-center justify-center rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 px-2.5 py-1.5" title="Edit" @click="openEditSubDept(row)">
                          <Pencil class="size-4" />
                        </button>
                        <button
                          type="button"
                          class="inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5"
                          title="Delete"
                          @click="askDelete(row)"
                          :disabled="deleting && String(confirmRow?.id) === String(row.id)"
                        >
                          <Trash2 class="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!subDepts.length">
                    <td colspan="5" class="px-4 py-6 text-center text-gray-500 text-sm">No sub-departments found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
          <button v-if="!editMode" class="px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-100" @click="enableEdit">Edit</button>
          <button v-if="editMode" class="px-3 py-2 rounded-lg bg-[#235AA6] text-white hover:bg-[#1f4c93] disabled:opacity-60" :disabled="savingDept" @click="saveDepartment">
            {{ savingDept ? 'Saving…' : 'Save' }}
          </button>
          <button class="px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-100" @click="editMode ? cancelEdit() : onClose()">
            {{ editMode ? 'Cancel' : 'Close' }}
          </button>
        </div>
      </div>

      <!-- Sub-Department Modal -->
      <CreateSubDepartmentModal
        v-model="showSubModal"
        :mode="subModalMode"
        :department="dept"
        :sub-department="activeSubDept"
        @saved="handleSubDeptSaved"
      />

      <!-- Delete Alert -->
      <transition name="fade">
        <div v-if="confirming" class="fixed inset-0 z-[10010] flex items-center justify-center" @keydown.esc.prevent="confirming = false">
          <div class="absolute inset-0 bg-black/60" @click="confirming = false" />
          <div class="relative bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div class="px-6 py-4 border-b">
              <h4 class="text-lg font-semibold">Delete sub-department?</h4>
            </div>
            <div class="px-6 py-4 text-sm text-gray-700">
              This action cannot be undone. This will permanently delete
              <span class="font-semibold">{{ confirmRow?.name || 'this item' }}</span>.
            </div>
            <div class="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
              <button class="px-3 py-2 rounded-lg border hover:bg-gray-100" @click="confirming = false">Cancel</button>
              <button class="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700" :disabled="deleting" @click="doDelete">
                {{ deleting ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/stores/apis/axios'
import { showNotification } from '@/lib/notifications.js'
import CreateSubDepartmentModal from './CreateSubDepartmentModal.vue'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'

/* Props / Emits */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  department : { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

/* Router */
const route = useRoute()
const router = useRouter()

/* Local state */
const editMode = ref(false)
const savingDept = ref(false)
const errors = reactive({ name: '' })

/* Detail from backend */
const detail = ref(null)
const dept = computed(() => detail.value ?? props.department ?? null)

/* Snapshots */
const original = reactive({ name:'', description:'', hodUserId:'' })

/* HODs */
const rawHeads = ref([])
const filteredHods = computed(() => {
  const d = dept.value
  const depId = d?.id != null ? String(d.id) : ''
  const currentHeadId =
    d?.head_of_department?.id != null ? String(d.head_of_department.id)
    : (d?.department_head_id != null ? String(d.department_head_id) : '')

  const out = []
  for (const u of rawHeads.value || []) {
    const free = u && u.head_department === null
    const isCurrentOfThis =
      currentHeadId &&
      String(u?.id) === currentHeadId &&
      u?.head_department &&
      String(u.head_department.id) === depId

    if (free || isCurrentOfThis) {
      out.push({
        value: Number(u.id),
        label: isCurrentOfThis ? `${u.name || 'Current Head'} (current)` : (u.name || `User ${u.id}`)
      })
    }
  }
  const seen = new Set()
  const uniq = out.filter(o => (seen.has(o.value) ? false : (seen.add(o.value), true)))
  uniq.sort((a, b) => {
    const ac = a.label.endsWith('(current)')
    const bc = b.label.endsWith('(current)')
    if (ac && !bc) return -1
    if (!ac && bc) return 1
    return a.label.localeCompare(b.label)
  })
  return uniq
})

/* Sub-departments */
const subDepts = ref([])

/* Sub modal (via query) */
const subMode = computed({
  get: () => route.query.sub ?? null,
  set: (v) => {
    const q = { ...route.query }
    if (!v) { delete q.sub; delete q.subId }
    else { q.sub = v }
    router.replace({ query: q })
  }
})
const showSubModal = computed({
  get: () => ['create','edit','view'].includes(String(subMode.value || '')),
  set: (v) => { if (!v) subMode.value = null }
})
const subModalMode = computed(() => {
  const m = String(subMode.value || '')
  return m === 'edit' ? 'edit' : m === 'view' ? 'view' : 'create'
})
const activeSubDept = computed(() => {
  const sid = route.query.subId
  if (!sid) return null
  return subDepts.value.find(s => String(s.id) === String(sid)) || null
})
function openCreateSubDept(){ router.replace({ query: { ...route.query, sub: 'create' } }) }
function openEditSubDept(row){ router.replace({ query: { ...route.query, sub: 'edit', subId: row.id } }) }
function openViewSubDept(row){ router.replace({ query: { ...route.query, sub: 'view', subId: row.id } }) }

/* Delete dialog state (via query) */
const confirming = computed({
  get: () => !!route.query.confirmId,
  set: (v) => {
    const q = { ...route.query }
    if (!v) delete q.confirmId
    router.replace({ query: q })
  }
})
const confirmRow = computed(() => {
  const id = route.query.confirmId
  if (!id) return null
  return subDepts.value.find(s => String(s.id) === String(id)) || null
})
const deleting = ref(false)
function askDelete(row){
  router.replace({ query: { ...route.query, confirmId: row.id } })
}

/* Delete with fallbacks + snackbars */
async function doDelete(){
  const row = confirmRow.value
  if (!row?.id) return
  deleting.value = true

  // optimistic update
  const prev = subDepts.value.slice()
  subDepts.value = subDepts.value.filter(s => String(s.id) !== String(row.id))

  try {
    await api.delete(`/managements/delete_sub_department/${row.id}`)
    showNotification('Sub-department deleted.', 'success')
    confirming.value = false
    await silentRefreshSubDepts()
  } catch (e1) {
    try {
      await api.post(`/managements/delete_sub_department`, { id: Number(row.id) })
      showNotification('Sub-department deleted.', 'success')
      confirming.value = false
      await silentRefreshSubDepts()
    } catch (e2) {
      try {
        await api.delete(`/managements/remove_sub_department/${row.id}`)
        showNotification('Sub-department deleted.', 'success')
        confirming.value = false
        await silentRefreshSubDepts()
      } catch (e3) {
        subDepts.value = prev
        const msg =
          e3?.response?.data?.message ||
          e2?.response?.data?.message ||
          e1?.response?.data?.message ||
          e3?.message || e2?.message || e1?.message || 'Failed to delete sub-department'
        showNotification(msg, 'error')
      }
    }
  } finally {
    deleting.value = false
  }
}

/* Labels */
const hodResolved = computed(() => {
  if (!dept.value) return 'Not Assigned'
  if (dept.value.head_of_department?.name) return dept.value.head_of_department.name
  if (dept.value.department_head_id) return `Head of Department ${dept.value.department_head_id}`
  return 'Not Assigned'
})

/* UI helpers */
function onClose(){ emit('update:modelValue', false) }
function enableEdit(){
  editMode.value = true
  copyIntoForm(dept.value)
  loadHeads()
  errors.name = ''
}
function cancelEdit(){ editMode.value = false }

/* Edit form & change detection */
const form = reactive({ id:null, name:'', description:'', hodUserId:'' })
const changedCore = computed(() =>
  (form.name || '') !== (original.name || '') ||
  (form.description || '') !== (original.description || '')
)
const changedHod  = computed(() =>
  String(form.hodUserId || '') !== String(original.hodUserId || '')
)
const unassignWarning = computed(() =>
  changedHod.value && !form.hodUserId && !!original.hodUserId
)

function copyIntoForm(d){
  const headId =
    d?.head_of_department?.id ? Number(d.head_of_department.id)
    : (d?.department_head_id != null ? Number(d.department_head_id) : '')

  form.id          = d?.id ?? null
  form.name        = d?.name ?? ''
  form.description = d?.description ?? ''
  form.hodUserId   = headId

  original.name        = form.name
  original.description = form.description
  original.hodUserId   = form.hodUserId
}

/* Save department with snackbars */
async function saveDepartment(){
  if (!form.id) return
  errors.name = form.name ? '' : 'Name is required'
  if (errors.name) return

  if (!changedCore.value && !changedHod.value) {
    editMode.value = false
    emit('saved', buildEmitPayload(detail.value, filteredHods.value, form.hodUserId))
    showNotification('No changes to save.', 'info')
    return
  }

  savingDept.value = true
  const warnings = []

  try {
    if (changedCore.value) {
      try {
        await api.put(`/managements/update_department/${form.id}`, {
          department_name: form.name,
          description: form.description || ''
        })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || 'Update failed'
        const fieldErr =
          e?.response?.data?.errors?.department_name?.[0] ||
          (msg && /name/i.test(msg) ? msg : '')
        if (fieldErr) errors.name = fieldErr
        showNotification(fieldErr || msg, 'error')
        savingDept.value = false
        return
      }
    }

    if (changedHod.value && form.hodUserId) {
      try {
        await api.post(`/managements/assign_head/${form.id}`, { user_id: Number(form.hodUserId) })
      } catch (e) {
        warnings.push(e?.response?.data?.message || e?.message || 'Failed to assign head')
      }
    }

    await fetchDepartmentDetail(form.id)
    editMode.value = false
    errors.name = ''
    emit('saved', buildEmitPayload(detail.value, filteredHods.value, form.hodUserId))

    if (warnings.length) {
      showNotification(`Saved with warnings: ${warnings.join(' | ')}`, 'warning')
    } else {
      showNotification('Department updated successfully.', 'success')
    }
  } catch (e) {
    showNotification(`Save failed: ${e?.response?.data?.message || e?.message || 'Unknown error'}`, 'error')
  } finally {
    savingDept.value = false
  }
}

function buildEmitPayload(d, hodOptions, selectedHodId) {
  if (!d) return null
  const fallbackLabel = (() => {
    const opt = (hodOptions || []).find(h => String(h.value) === String(selectedHodId))
    return opt?.label || (selectedHodId ? `User ${selectedHodId}` : 'Not Assigned')
  })()
  const headObj = d.head_of_department
    ? d.head_of_department
    : (selectedHodId
        ? { id: Number(selectedHodId), name: fallbackLabel }
        : { name: 'Not Assigned' })

  return {
    id: d.id,
    name: d.name,
    description: d.description || '',
    department_head_id: d.department_head_id ?? (selectedHodId ? Number(selectedHodId) : null),
    head_of_department: headObj,
  }
}

/* Data loading */
function normalizeDetail(apiRow) {
  return {
    id: apiRow?.id ?? null,
    name: apiRow?.department_name ?? '',
    description: apiRow?.description ?? '',
    department_head_id: apiRow?.department_head_id ?? null,
    head_of_department: apiRow?.head_of_department ?? null,
  }
}
function decorateSub(rows){
  return (rows || []).map(r => ({
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    active: true,
    __key: `${r.id}-${Math.random().toString(36).slice(2,7)}`
  }))
}
async function fetchDepartmentDetail(id){
  if (!id) { detail.value = null; subDepts.value = []; return }
  try {
    const { data } = await api.get(`/managements/get_department_detail/${id}`)
    const d = normalizeDetail(data?.department)
    detail.value = d
    subDepts.value = decorateSub(data?.department?.sub_departments || [])
  } catch (e) {
    console.error('[ViewDepartmentModal] detail load error:', e)
    showNotification(e?.response?.data?.message || e?.message || 'Failed to load department details', 'error')
    detail.value = props.department || null
    subDepts.value = []
  }
}
async function loadHeads(){
  try {
    const { data } = await api.get('/users/get_all_head')
    rawHeads.value = Array.isArray(data?.users) ? data.users : []
  } catch (e) {
    console.error('[ViewDepartmentModal] get_all_head error:', e)
    showNotification(e?.response?.data?.message || e?.message || 'Failed to load HOD list', 'error')
    rawHeads.value = []
  }
}

/* Silent refresh (no blue info toast) */
async function silentRefreshSubDepts(){
  await fetchDepartmentDetail(dept.value?.id)
}

/* ✅ Handle create/update from child with green success toasts */
function handleSubDeptSaved(payload){
  if (!payload) return
  const op = payload.__op || (payload.id ? 'update' : 'create')

  if (op === 'create') {
    subDepts.value = [
      {
        id: payload.id ?? null,
        name: payload.name,
        description: payload.description ?? '',
        active: true,
        __key: `${payload.id ?? 'temp'}-${Math.random().toString(36).slice(2,7)}`
      },
      ...subDepts.value
    ]
    showNotification('Create sub-department successful', 'success')
  } else {
    subDepts.value = subDepts.value.map(s =>
      String(s.id) === String(payload.id)
        ? { ...s, name: payload.name, description: payload.description ?? '' }
        : s
    )
    showNotification('Update sub-department successful', 'success')
  }

  // Optional: sync with backend silently to pick up any server-side fields
  silentRefreshSubDepts()
}

/* Open/close + react to department change */
watch(() => props.modelValue, async (open) => {
  if (open) {
    await fetchDepartmentDetail(props.department?.id ?? route.params.deptId)
    await loadHeads()
  } else {
    editMode.value = false
  }
})
watch(() => props.department?.id, async () => {
  if (props.modelValue) {
    await fetchDepartmentDetail(props.department?.id)
    await loadHeads()
  }
})

/* ESC to close (only parent) */
function onKey(e){ if (e.key === 'Escape') (editMode.value ? cancelEdit() : onClose()) }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
