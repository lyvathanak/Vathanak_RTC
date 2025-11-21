<!-- UpdateBuildingModal.vue -->
<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="close"></div>

      <!-- Dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div class="w-full max-w-xs sm:max-w-lg rounded-xl sm:rounded-2xl bg-white shadow-xl border border-gray-200">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b bg-gray-50 rounded-t-2xl">
            <h2 class="text-base sm:text-lg font-semibold tracking-wider">
              {{ isEdit ? $t('edit_building') : $t('add_building') }}
            </h2>
            <button
              class="rounded-md p-2 hover:bg-gray-100 transition-colors"
              @click="close"
              aria-label="Close"
            >✕</button>
          </div>

          <!-- Body -->
          <div class="px-4 sm:px-5 py-4 sm:py-5 space-y-3 sm:space-y-4">
            <label class="block text-sm font-medium text-gray-700">
              {{ $t("building_name") }}
              <input
                v-model.trim="localForm.name"
                type="text"
                :placeholder="placeholder"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <p v-if="nameError" class="text-xs sm:text-sm text-red-600">{{$t('building_name_required')}}</p>
          </div>

          <!-- Footer -->
          <div :class="[
            'flex items-center justify-end gap-2 md:gap-3 px-4 sm:px-5 py-3 sm:py-4 border-t bg-gray-50 rounded-b-2xl',
            isEdit ? 'flex-row' : 'flex-col md:flex-row items-stretch md:items-center'
          ]">
            <button
              v-if="isEdit"
              class="rounded-lg bg-red-500 px-3 sm:px-4 py-2 text-sm text-white hover:bg-red-600 transition-colors"
              type="button"
              @click="close"
            >
              {{$t('cancel')}}
            </button>
            <button
              class="rounded-lg bg-[#235AA6] px-3 sm:px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              type="button"
              :disabled="submitting || !canSubmit"
              @click="onSubmit"
            >
              {{ isEdit ? $t('save') : $t('create') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, reactive, watch } from "vue";

const props = defineProps({
  mode: { type: String, default: "create" }, // "create" or "edit"
  open: { type: Boolean, default: false },   // v-model:open
  initial: { type: Object, default: () => ({ name: "" }) },
  submitting: { type: Boolean, default: false },
  placeholder: { type: String, default: "Enter Department Code" }
});

const emit = defineEmits(["update:open", "submit"]);

const isEdit = computed(() => props.mode === "edit");
const placeholder = computed(() => props.placeholder);

const localForm = reactive({
  name: props.initial?.name || ""
});

// reset when `initial` changes
watch(
  () => props.initial,
  (val) => {
    localForm.name = val?.name || "";
  },
  { deep: true }
);

const nameError = computed(() =>
  !localForm.name.trim() ? "Building name is required." : ""
);

const canSubmit = computed(() => !nameError.value);

function close() {
  emit("update:open", false);
}

function onSubmit() {
  if (!canSubmit.value) return;
  emit("submit", { name: localForm.name.trim(), mode: props.mode });
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
