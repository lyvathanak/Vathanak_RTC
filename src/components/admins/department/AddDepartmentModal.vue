<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="onClose" />

      <!-- Dialog -->
      <div
        class="relative bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden"
        role="dialog" aria-modal="true" @click.stop
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900">Add Department</h3>
          <button class="p-2 rounded-full hover:bg-gray-100 disabled:opacity-60"
                  @click="onClose" :disabled="saving" aria-label="Close">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 space-y-6">
          <!-- Department Information -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <span class="w-2 h-2 rounded-full bg-gray-900" />
              <h4 class="font-semibold text-gray-900">Department Information</h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Department Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.trim="form.department_name"
                  type="text"
                  placeholder="Enter Department Name"
                  class="w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="errors.department_name && 'border-red-400'"
                />
                <p v-if="errors.department_name" class="text-xs text-red-600 mt-1">{{ errors.department_name }}</p>
              </div>

              <!-- Head of Department (ONLY available) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Head of Department</label>
                <div class="relative">
                  <select
                    v-model="hodUserId"
                    class="w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none pr-10"
                  >
                    <option value="">Not Assigned</option>
                    <option v-for="h in hodOptions" :key="h.value" :value="h.value">
                      {{ h.label }}
                    </option>
                  </select>
                  <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center" aria-hidden="true">
                    <ChevronDown class="w-4 h-4 text-gray-500" />
                  </span>
                </div>
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="Short description"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Sub-departments -->
          <div class="border rounded-xl">
            <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-gray-900"></span>
                <h4 class="font-semibold text-gray-900">Sub-departments</h4>
              </div>
              <button type="button" class="px-3 py-1.5 rounded-lg border hover:bg-gray-100" @click="addSubDep">
                + Add sub-department
              </button>
            </div>

            <div class="p-4 space-y-3">
              <div v-if="!subDeps.length" class="text-sm text-gray-500">
                No sub-departments. Add one if needed.
              </div>

              <div v-for="(sd, i) in subDeps" :key="sd.__key" class="rounded-lg border p-3">
                <div class="flex items-start gap-3">
                  <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Name <span class="text-red-500" v-if="sd._errName">*</span>
                      </label>
                      <input
                        v-model.trim="sd.name"
                        type="text"
                        placeholder="e.g., Web Development"
                        class="w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        :class="sd._errName ? 'border-red-400' : 'border-gray-300'"
                      />
                      <p v-if="sd._errName" class="text-xs text-red-600 mt-1">Name is required.</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        v-model="sd.description"
                        type="text"
                        placeholder="Short description"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    class="self-start p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-60"
                    @click="removeSubDep(i)"
                    aria-label="Remove"
                    :disabled="saving"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
          <button class="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                  @click="onClose" :disabled="saving">Cancel</button>
          <button class="px-4 py-2.5 rounded-lg bg-[#235AA6] text-white hover:bg-[#1f4c93] disabled:opacity-60"
                  @click="save" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue'
import api from '@/stores/apis/axios'
import { ChevronDown, X } from 'lucide-vue-next'

/* Props / Emits */
const props = defineProps({ modelValue: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue', 'saved', 'error'])

/* ---------------- State ---------------- */
const saving = ref(false)
const errors = reactive({ department_name: '' })

/* -------- HOD options (only available) -------- */
const hodOptions = ref([])  // [{ value, label }]
const hodUserId  = ref('')

async function fetchHods() {
  try {
    const { data } = await api.get('/users/get_all_head')
    const list = Array.isArray(data?.users) ? data.users : []
    // Only heads that are NOT currently assigned anywhere
    const free = list.filter(u => u?.head_department == null)
    hodOptions.value = free.map(u => ({ value: String(u.id), label: u.name || `User ${u.id}` }))
  } catch (e) {
    console.error('[AddDepartmentModal] fetchHods error:', e)
    hodOptions.value = []
  }
}
watch(() => props.modelValue, (open) => { if (open) fetchHods() })

/* -------- Form -------- */
const form = reactive({
  code: '',
  department_name: '',
  description: '',
})

/* -------- Sub-departments -------- */
const subDeps = ref([]) // [{ name:'', description:'', _errName:false, __key }]
function addSubDep() { subDeps.value.push({ name: '', description: '', _errName: false, __key: (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) }) }
function removeSubDep(i) { subDeps.value.splice(i, 1) }

/* -------- Utilities -------- */
function resetForm() {
  form.code = ''
  form.department_name = ''
  form.description = ''
  errors.department_name = ''
  hodUserId.value = ''
  subDeps.value = []
}
function onClose() { if (!saving.value) emit('update:modelValue', false) }

/* Esc to close */
function onKey(e){ if (e.key === 'Escape') onClose() }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

/* ---- Save pipeline ---- */
async function save() {
  // validate
  errors.department_name = form.department_name ? '' : 'Department name is required'
  let subErr = false
  subDeps.value.forEach(sd => { sd._errName = !sd.name?.trim(); subErr ||= sd._errName })
  if (errors.department_name || subErr) {
    return
  }

  saving.value = true
  const warnings = []

  try {
    // 1) Create department
    const { data: createRes } = await api.post('/managements/add_new_department', {
      department_name: form.department_name,
      description: form.description || '',
    })
    const createdDeptId =
      createRes?.Department?.id ?? createRes?.department?.id ?? createRes?.id
    if (!createdDeptId) throw new Error('Create department: missing ID in response')

    // 2) Assign head (optional)
    if (hodUserId.value) {
      try {
        await api.post(`/managements/assign_head/${createdDeptId}`, { user_id: Number(hodUserId.value) })
      } catch (e) {
        warnings.push(`Assign head: ${e?.response?.data?.message || e?.message || 'failed'}`)
      }
    }

    // 3) Create sub-departments (optional)
    const validSubs = subDeps.value.filter(sd => sd.name && sd.name.trim())
    if (validSubs.length) {
      const reqs = validSubs.map(sd =>
        api.post('/managements/create_sub_department', {
          name: sd.name.trim(),
          department_id: createdDeptId,
          description: sd.description || '',
        }).catch(e => ({ _err: e }))
      )
      const results = await Promise.all(reqs)
      results.forEach((r, idx) => {
        if (r && r._err) {
          const sd = validSubs[idx]
          warnings.push(`Sub "${sd.name}": ${r._err?.response?.data?.message || r._err?.message || 'failed'}`)
        }
      })
    }

    // Build minimal payload for parent to insert immediately
    const payload = {
      id: createdDeptId,
      name: form.department_name,
      description: form.description || '',
      head_of_department: hodUserId.value
        ? { id: Number(hodUserId.value), name: (hodOptions.value.find(o => o.value === String(hodUserId.value))?.label) || `User ${hodUserId.value}` }
        : null,
    }

    // Let the parent handle the single success toast to avoid duplicates
    emit('saved', payload)
    emit('update:modelValue', false)
    resetForm()
  } catch (e) {
    const res = e?.response?.data
    const nameTaken =
      res?.errors?.department_name?.[0] ||
      (typeof res?.message === 'string' && /already|taken|exists/i.test(res.message) ? res.message : null)

    if (nameTaken) {
      errors.department_name = nameTaken
      emit('error', nameTaken)
    } else {
      const msg = res?.message || e?.message || 'Create failed'
      emit('error', msg)
    }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
