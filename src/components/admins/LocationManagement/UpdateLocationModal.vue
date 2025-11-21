<!-- UpdateLocationModal.vue -->
<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="close"></div>

      <!-- Dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
        <div class="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl h-[95vh] sm:h-auto max-h-[90vh] rounded-lg sm:rounded-2xl bg-white shadow-xl flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b">
            <h2 class="text-base sm:text-lg font-semibold">
              {{ isEdit ? $t('edit_location') : $t('add_location') }}
            </h2>
            <button class="rounded p-1 hover:bg-gray-100" @click="close" aria-label="Close">
              <X class="w-5 h-5"/>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-6">
            <!-- Section: Location Information -->
            <div>
              <div class="mb-3 flex items-center gap-2">
                <MapPin class="w-4 h-4 text-gray-900"/>
                <span class="text-sm font-semibold">
                  {{$t('location_information')}}
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{$t('room_name')}}</label>
                  <input
                    v-model.trim="form.name"
                    type="text"
                    :placeholder="$t('room_name_placeholder')"
                    class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p v-if="errors.name" class="text-xs sm:text-sm text-red-600 mt-1">{{$t(errors.name)}}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">{{$t('floor_number')}}</label>
                  <input
                    v-model.number="form.floor"
                    type="number"
                    min="0"
                    :placeholder="$t('floor_number_placeholder')"
                    class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p v-if="errors.floor" class="text-xs sm:text-sm text-red-600 mt-1">{{$t(errors.floor)}}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">{{$t('latitude')}}</label>
                  <input
                    v-model.number="form.latitude"
                    type="number"
                    step="any"
                    :placeholder="$t('latitude_placeholder')"
                    class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p v-if="errors.latitude" class="text-xs sm:text-sm text-red-600 mt-1">{{$t(errors.latitude)}}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">{{$t('longitude')}}</label>
                  <input
                    v-model.number="form.longitude"
                    type="number"
                    step="any"
                    :placeholder="$t('longitude_placeholder')"
                    class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p v-if="errors.longitude" class="text-xs sm:text-sm text-red-600 mt-1">{{$t(errors.longitude)}}</p>
                </div>
              </div>
            </div>

            <!-- Section: Building Information -->
            <div>
              <div class="mb-3 flex items-center gap-2">
                 <Building class="w-4 h-4 text-gray-900"/>
                <span class="text-sm font-semibold">{{$t('building_information')}}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div class="relative">
                  <label class="block text-sm font-medium text-gray-700">{{$t('select_building')}}</label>
                  <div class="mt-1 relative">
                    <select
                      v-model.number="form.building_id"
                      class="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-8"
                    >
                      <option disabled value="">{{$t('select_building')}}</option>
                      <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                    <ChevronDown class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <p v-if="errors.building_id" class="text-xs sm:text-sm text-red-600 mt-1">{{$t(errors.building_id)}}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">{{$t('ssid_name')}}</label>
                  <input
                    v-model.trim="form.wifi_ssid"
                    type="text"
                    :placeholder="$t('ssid_name_placeholder')"
                    class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p v-if="errors.wifi_ssid" class="text-xs sm:text-sm text-red-600 mt-1">{{$t(errors.wifi_ssid)}}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div :class="[
            'flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50 rounded-b-2xl',
            isEdit ? 'flex-row' : 'flex-col sm:flex-row items-stretch sm:items-center'
          ]">
            <button
              v-if="isEdit"
              class="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 text-sm font-medium"
              type="button"
              @click="close"
            >
              {{$t('cancel')}}
            </button>
            <button
              class="rounded-lg bg-[#235AA6] px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              type="button"
              :disabled="submitting || !canSubmit"
              @click="handleSubmit"
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
import { ChevronDown, Building, MapPin, X } from "lucide-vue-next";
import { computed, reactive, watch } from "vue";

/**
 * Props:
 * - mode: "create" | "edit"
 * - open: boolean (use v-model:open)
 * - initial: { id?, name, floor, latitude, longitude, building_id } (for edit prefill)
 * - buildings: Array<{ id: number, name: string }>
 * - submitting: boolean (disable primary button while waiting)
 */
const props = defineProps({
  mode: { type: String, default: "create" },
  open: { type: Boolean, default: false },
  initial: {
    type: Object,
    default: () => ({
      name: "",
      floor: null,
      latitude: null,
      longitude: null,
      building_id: ""
    })
  },
  buildings: { type: Array, default: () => [] },
  submitting: { type: Boolean, default: false }
});

const emit = defineEmits(["update:open", "submit"]);

const isEdit = computed(() => props.mode === "edit");

// local form state
const form = reactive({
  name: props.initial.name || "",
  floor: props.initial.floor ?? null,
  latitude: props.initial.latitude ?? null,
  longitude: props.initial.longitude ?? null,
  building_id: props.initial.building_id ?? "",
  wifi_ssid: props.initial.wifi_ssid ?? ""
});

// keep in sync if parent changes `initial`
watch(
  () => props.initial,
  (v) => {
    form.name = v?.name || "";
    form.floor = v?.floor ?? null;
    form.latitude = v?.latitude ?? null;
    form.longitude = v?.longitude ?? null;
    form.building_id = v?.building_id ?? "";
    form.wifi_ssid = v?.wifi_ssid ?? "";
  },
  { deep: true }
);

const errors = reactive({
  name: "",
  floor: "",
  latitude: "",
  longitude: "",
  building_id: "",
  wifi_ssid: ""
});

// ✅ FIXED: Separate validation function that only sets errors when called
function validate() {
  // Clear previous errors
  Object.keys(errors).forEach(key => errors[key] = "");
  
  // Validate each field
  if (!form.name || !form.name.trim()) {
    errors.name = "Room name is required.";
  }
  
  if (!Number.isFinite(form.floor) || form.floor === null || form.floor === "") {
    errors.floor = "Floor must be a number.";
  }

  const latNum = Number(form.latitude);
  if (isNaN(latNum) || form.latitude === null || form.latitude === "") {
    errors.latitude = "Latitude must be a number.";
  } else if (latNum < -90 || latNum > 90) {
    errors.latitude = "Latitude must be between -90 and 90.";
  }
  
  const lngNum = Number(form.longitude);
  if (isNaN(lngNum) || form.longitude === null || form.longitude === "") {
    errors.longitude = "Longitude must be a number.";
  } else if (lngNum < -180 || lngNum > 180) {
    errors.longitude = "Longitude must be between -180 and 180.";
  }

  if (!form.building_id) {
    errors.building_id = "Please select a building.";
  }

  if (!form.wifi_ssid || !form.wifi_ssid.trim()) {
    errors.wifi_ssid = "Wi-Fi SSID is required.";
  }

  // Return true if no errors
  return !errors.name && !errors.floor && !errors.latitude && !errors.longitude && !errors.building_id && !errors.wifi_ssid;
}

const canSubmit = computed(() => {
  return form.name && 
         form.name.trim() && 
         form.floor !== null && 
         form.floor !== "" && 
         Number.isFinite(form.floor) &&
         form.latitude !== null && 
         form.latitude !== "" && 
         !isNaN(Number(form.latitude)) &&
         form.longitude !== null && 
         form.longitude !== "" && 
         !isNaN(Number(form.longitude)) &&
         form.building_id &&
         form.wifi_ssid && form.wifi_ssid.trim();
});

function close() {
  // ✅ Clear errors when closing
  Object.keys(errors).forEach(key => errors[key] = "");
  emit("update:open", false);
}

function handleSubmit() {
  if (!validate()) {
    return; // Stop if validation fails
  }

  // Convert strings to proper numbers for API
  const payload = {
    name: form.name.trim(),
    floor: Number(form.floor),
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
    building_id: Number(form.building_id),
    wifi_ssid: form.wifi_ssid.trim()
  };

  emit("submit", { mode: props.mode, payload });
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
