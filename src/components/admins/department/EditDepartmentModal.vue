<!-- /src/components/admins/department/EditDepartmentModal.vue -->
<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-[9999] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="onClose" />
      <div class="relative bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden" role="dialog" aria-modal="true">
        <!-- Header -->
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900">Edit Department</h3>
          <button class="p-2 rounded-full hover:bg-gray-100 disabled:opacity-60" @click="onClose" :disabled="saving" aria-label="Close">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 max-h-[75vh] overflow-y-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div class="text-xs text-gray-500">Department ID</div>
              <div class="text-sm font-medium text-gray-900">#{{ form.id }}</div>
            </div>

            <div>
              <label class="text-xs text-gray-500">
                Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model.trim="form.name"
                :class="[
                  'w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.name && 'border-red-400'
                ]"
                placeholder="Department name"
              />
              <p class="text-xs mt-1 h-4" :class="errors.name ? 'text-red-600' : 'opacity-0'">
                {{ errors.name || 'placeholder' }}
              </p>
            </div>

            <div>
              <label class="text-xs text-gray-500">Head of Department</label>
              <div class="relative">
                <select
                  v-model.number="form.hodUserId"
                  class="w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none pr-10"
                >
                  <option :value="''">Not Assigned</option>
                  <option
                    v-for="h in filteredHodOptions"
                    :key="`${h.value}-${h.label}`"
                    :value="h.value"
                  >
                    {{ h.label }}
                  </option>
                </select>
                <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center" aria-hidden="true">
                  <ChevronDown class="w-4 h-4 text-gray-500" />
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Sends <code>{ user_id }</code> to <code>/managements/assign_head/:id</code> if changed.
              </p>
              <p v-if="unassignWarning" class="text-xs text-amber-600 mt-1">
                Unassign isn’t supported by the API; clearing the HOD won’t change the current assignment.
              </p>
            </div>

            <div class="md:col-span-2">
              <label class="text-xs text-gray-500">Description</label>
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Short description"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
          <button
            class="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            @click="onClose" :disabled="saving">
            Cancel
          </button>
          <button
            class="px-4 py-2.5 rounded-lg bg-[#235AA6] text-white hover:bg-[#1f4c93] disabled:opacity-60"
            @click="onSave" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import api from '@/stores/apis/axios'
import { showNotification } from '@/lib/notifications.js'
import { ChevronDown, X } from 'lucide-vue-next'

/* Props / Emits */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  department : { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue','saved','error'])

/* -------- State -------- */
const saving = ref(false)
const errors = reactive({ name: '' })
const form = reactive({ id:'', name:'', description:'', hodUserId:'' })
const original = reactive({ name:'', description:'', hodUserId:'' })

/* Raw API list */
const rawHeads = ref([]) // [{ id, name, head_department|null }, ...]

/* Utilities */
const N = (v) => (v === 0 || v ? Number(v) : null)
const S = (v) => (v === 0 || v ? String(v) : '')

/* Current dept context */
const currentDeptIdStr = computed(() => S(props.department?.id))

const currentHeadIdFromProp = computed(() => {
  const d = props.department || {}
  const id = d?.head_of_department?.id ?? d?.department_head_id
  return N(id)
})

/* Derived flags */
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

/* Filter HOD options (free OR current of this department) */
const filteredHodOptions = computed(() => {
  const opts = []
  const deptIdStr = currentDeptIdStr.value
  const currentHeadNum = currentHeadIdFromProp.value

  for (const u of rawHeads.value || []) {
    const free = (u && u.head_department === null)
    const isCurrentOfThis =
      !!currentHeadNum &&
      u && Number(u.id) === Number(currentHeadNum) &&
      u.head_department && String(u.head_department.id) === String(deptIdStr)

    if (free || isCurrentOfThis) {
      opts.push({
        value: Number(u.id),
        label: isCurrentOfThis ? `${u.name || 'Current Head'} (current)` : (u.name || `User ${u.id}`)
      })
    }
  }

  const seen = new Set()
  const uniq = opts.filter(o => (seen.has(o.value) ? false : (seen.add(o.value), true)))
  uniq.sort((a, b) => {
    const ac = a.label.endsWith('(current)')
    const bc = b.label.endsWith('(current)')
    if (ac && !bc) return -1
    if (!ac && bc) return 1
    return a.label.localeCompare(b.label)
  })
  return uniq
})

/* Fetch raw heads */
async function fetchHeads () {
  try {
    const { data } = await api.get('/users/get_all_head')
    rawHeads.value = Array.isArray(data?.users) ? data.users : []
  } catch {
    rawHeads.value = []
  }
}

/* Hydrate form from prop */
function hydrate(){
  const d = props.department || {}
  const headId = d?.head_of_department?.id ?? d?.department_head_id ?? null

  form.id          = d.id ?? ''
  form.name        = d.name ?? d.department_name ?? ''
  form.description = d.description ?? ''
  form.hodUserId   = N(headId) ?? ''   // empty if none

  original.name        = form.name
  original.description = form.description
  original.hodUserId   = form.hodUserId

  errors.name = ''
}

function onClose(){ if(!saving.value) emit('update:modelValue', false) }

/* Save pipeline */
async function onSave(){
  errors.name = form.name ? '' : 'Name is required'
  if (errors.name) {
    showNotification(errors.name, 'warning')
    return
  }

  if (!changedCore.value && !changedHod.value) {
    showNotification('No changes to save.', 'info')
    emit('update:modelValue', false)
    return
  }

  saving.value = true
  const warnings = []

  try {
    if (changedCore.value) {
      try {
        await api.put(`/managements/update_department/${form.id}`, {
          department_name: form.name,
          description    : form.description || '',
        })
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || 'Update failed'
        const fieldErr =
          e?.response?.data?.errors?.department_name?.[0] ||
          (msg && /name|exist|taken|already/i.test(msg) ? msg : '')
        if (fieldErr) {
          errors.name = fieldErr
          showNotification(fieldErr, 'error')
          emit('error', fieldErr)
        } else {
          showNotification(msg, 'error')
          emit('error', msg)
        }
        saving.value = false
        return
      }
    }

    if (changedHod.value && form.hodUserId) {
      try {
        await api.post(`/managements/assign_head/${form.id}`, { user_id: Number(form.hodUserId) })
      } catch (e) {
        const warn = e?.response?.data?.message || e?.message || 'Failed to assign HOD'
        warnings.push(warn)
      }
    }

    if (warnings.length) {
      showNotification(`Saved with warnings:\n- ${warnings.join('\n- ')}`, 'warning')
    } else {
      showNotification('Department updated successfully!', 'success')
    }

    emit('saved')
    emit('update:modelValue', false)
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Unexpected error'
    showNotification(msg, 'error')
    emit('error', msg)
  } finally {
    saving.value = false
  }
}

/* Boot & watchers */
async function boot(){
  hydrate()
  await nextTick()
  await fetchHeads()
}
watch(() => props.modelValue, (open) => { if (open) boot() })
watch(() => props.department?.id, async () => { if (props.modelValue) boot() })

/* ESC to close */
function onKey(e){ if (e.key === 'Escape') onClose() }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
