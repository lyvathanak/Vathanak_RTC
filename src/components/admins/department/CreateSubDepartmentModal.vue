<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[10001] flex items-center justify-center"
      @keydown.esc.stop.prevent="onClose"
    >
      <div class="absolute inset-0 bg-black/50" @click.stop="onClose" />
      <div
        class="relative bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden"
        role="dialog" aria-modal="true" @click.stop
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <h3 class="text-xl font-semibold">{{ modeTitle }}</h3>
          <span v-if="saving" class="text-sm text-gray-500">Saving…</span>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div class="text-xs text-gray-500">Department</div>
              <div class="h-11 flex items-center text-sm font-medium">
                #{{ department?.id }} — {{ department?.name || department?.department_name }}
              </div>
            </div>

            <div>
              <label class="text-xs text-gray-500">Name <span v-if="isEditing" class="text-red-500">*</span></label>
              <input
                v-if="isEditing"
                v-model.trim="form.name"
                :class="['h-11 w-full rounded-lg border px-3 outline-none focus:ring-2 focus:ring-blue-500', errors.name && 'border-red-400']"
                placeholder="e.g., Web Development"
              />
              <div v-else class="h-11 flex items-center text-sm font-medium">
                {{ form.name || '—' }}
              </div>
              <p v-if="isEditing" class="text-xs mt-1 h-4" :class="errors.name ? 'text-red-600' : 'opacity-0'">
                {{ errors.name || 'placeholder' }}
              </p>
            </div>

            <div class="md:col-span-2">
              <label class="text-xs text-gray-500">Description</label>
              <textarea
                v-if="isEditing"
                v-model="form.description"
                rows="4"
                class="w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Short description"
              />
              <div v-else class="text-sm text-gray-800 min-h-[44px] flex items-center">
                {{ form.description || '—' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
          <button v-if="!isEditing" class="px-4 py-2.5 rounded-lg border text-gray-700 hover:bg-gray-100" @click="onClose">Close</button>
          <template v-else>
            <button class="px-4 py-2.5 rounded-lg border text-gray-700 hover:bg-gray-100" :disabled="saving" @click="onClose">Cancel</button>
            <button class="px-4 py-2.5 rounded-lg bg-[#235AA6] text-white hover:bg-[#1f4c93] disabled:opacity-60" :disabled="saving" @click="onSave">
              {{ saving ? 'Saving…' : (mode === 'create' ? 'Create' : 'Save changes') }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import api from '@/stores/apis/axios'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'create' }, // 'create' | 'view' | 'edit'
  department: { type: Object, default: null },
  subDepartment: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue','saved'])

const saving = ref(false)
const errors = reactive({ name: '' })
const form = reactive({ id:null, name:'', description:'' })

const isEditing = computed(() => props.mode === 'create' || props.mode === 'edit')
const modeTitle = computed(() =>
  props.mode === 'create'
    ? 'Create Sub-Department'
    : props.mode === 'edit'
      ? 'Edit Sub-Department'
      : 'Sub-Department Details'
)
const departmentId = computed(() => props.department?.id ?? null)

function hydrate(){
  const d = props.subDepartment || {}
  form.id = d.id ?? null
  form.name = d.name ?? ''
  form.description = d.description ?? ''
}

function onClose(){ emit('update:modelValue', false) }

async function onSave(){
  errors.name = form.name ? '' : 'Name is required'
  if (errors.name) return
  if (!departmentId.value) { alert('Missing department_id'); return }

  saving.value = true
  try{
    if (props.mode === 'create'){
      const { data } = await api.post('/managements/create_sub_department', {
        name: form.name,
        department_id: departmentId.value,
        description: form.description || '',
      })
      const created = (data?.sub_department || data?.data || data) ?? null
      emit('saved', {
        __op: 'create',
        id: created?.id ?? null,
        name: created?.name ?? form.name,
        description: created?.description ?? form.description ?? '',
        active: true,
      })
    } else {
      await api.put(`/managements/update_sub_department/${form.id}`, {
        name: form.name,
        department_id: departmentId.value,
        description: form.description || '',
      })
      emit('saved', {
        __op: 'update',
        id: form.id,
        name: form.name,
        description: form.description ?? '',
        active: true,
      })
    }
    onClose()
  }catch(e){
    alert(e?.response?.data?.message || e?.message || 'Operation failed')
  }finally{
    saving.value = false
  }
}

watch(() => props.modelValue, (open) => { if (open) hydrate() })
watch(() => props.subDepartment?.id, () => { if (props.modelValue) hydrate() })
</script>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .2s}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>
