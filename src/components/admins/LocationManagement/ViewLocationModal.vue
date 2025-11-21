<!-- ViewLocationModal.vue -->
<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="close"></div>

      <!-- Dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 print:p-0">
        <div class="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl h-[95vh] sm:h-auto max-h-[90vh] rounded-lg sm:rounded-2xl bg-white shadow-xl print:shadow-none print:w-[380px] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b print:hidden">
            <h2 class="text-base sm:text-lg font-semibold">{{$t('view_location')}}</h2>
            <button class="rounded p-1 hover:bg-gray-100" @click="close" aria-label="Close">
              <span class="text-lg">✕</span>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-6">
            <!-- Location Information -->
            <div>
              <div class="mb-3 flex items-center gap-2">
                <MapPin class="w-4 h-4 text-gray-900"/>
                <span class="text-sm font-semibold">{{$t('location_information')}}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{$t('room_name')}}</label>
                  <input :value="loc.name" disabled class="mt-1 w-full rounded-md border border-gray-300/70 bg-gray-50 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{$t('floor_number')}}</label>
                  <input :value="loc.floor" disabled class="mt-1 w-full rounded-md border border-gray-300/70 bg-gray-50 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{$t('latitude')}}</label>
                  <input :value="loc.latitude" disabled class="mt-1 w-full rounded-md border border-gray-300/70 bg-gray-50 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{$t('longitude')}}</label>
                  <input :value="loc.longitude" disabled class="mt-1 w-full rounded-md border border-gray-300/70 bg-gray-50 px-3 py-2 text-sm" />
                </div>
              </div>
            </div>

            <!-- Building Information -->
            <div>
              <div class="mb-3 flex items-center gap-2">
                <Building class="w-4 h-4 text-gray-900"/>
                <span class="text-sm font-semibold">{{$t('building_information')}}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{$t('building')}}</label>
                  <input :value="buildingName" disabled class="mt-1 w-full rounded-md border border-gray-300/70 bg-gray-50 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{$t('ssid')}}</label>
                  <input :value="loc.wifi_ssid" disabled class="mt-1 w-full rounded-md border border-gray-300/70 bg-gray-50 px-3 py-2 text-sm" />
                </div>
              </div>

              
            </div>

            <!-- QR from backend -->
            <div>
              <div class="mb-3 flex items-center gap-2">
                <QrCode class="w-4 h-4 text-gray-900"/>
                <span class="text-sm font-semibold">{{$t('qr_code')}}</span>
              </div>

              <div class="flex flex-col items-center gap-3 sm:gap-4">
                <div ref="qrWrap" class="p-3 border rounded-xl flex items-center justify-center w-full max-w-[280px] sm:max-w-[320px] h-[280px] sm:h-[320px]">
                  <template v-if="loadingQr">
                    <span class="text-xs sm:text-sm text-gray-500">{{$t('loading_qr')}}</span>
                  </template>
                  <template v-else-if="qrError">
                    <span class="text-xs sm:text-sm text-red-600 text-center px-2">{{ qrError }}</span>
                  </template>
                  <template v-else>
                    <img v-if="qrDataUrl" :src="qrDataUrl" :alt="$t('location_qr')" class="block w-full h-full object-contain max-w-[240px] max-h-[240px]" />
                  </template>
                </div>

                <div class="print:hidden flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-sm">
                  <button
                    class="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 sm:py-2 text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                    type="button"
                    :disabled="loadingQr"
                    @click="fetchQr"
                  >
                    {{ qrDataUrl ? $t('reload') : $t('load_qr') }}
                  </button>
                  
                  <button
                    v-if="qrDataUrl"
                    class="flex-1 rounded-lg bg-green-600 px-4 py-2.5 sm:py-2 text-white hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                    type="button"
                    :disabled="loadingQr"
                    @click="regenerateQr"
                  >
                    {{$t('regenerate')}}
                  </button>
                  
                </div>
              </div>
            </div>
          </div>

          <PrintQr
            ref="printerRef"
            :src="qrDataUrl"
            :title="`${loc.name} - Floor ${loc.floor}`"
            :dpr="2"
            :qrSize="480"
            :padding="60"
          />

          <!-- Footer -->
          <div class="flex flex-row items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t print:hidden bg-gray-50 rounded-b-2xl overflow-hidden">
            <button 
              class="rounded-lg bg-red-500 text-white px-3 sm:px-4 py-2 hover:bg-red-600 text-xs sm:text-sm font-medium" 
              type="button" 
              @click="close"
            >
              {{$t('close')}}
            </button>
            <button
              class="rounded-lg bg-blue-600 px-3 sm:px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 text-xs sm:text-sm font-medium"
              type="button"
              :disabled="!qrDataUrl"
              @click="onPrintPng"
            >
              {{$t('print_png')}}
            </button>
            <button
              class="rounded-lg bg-emerald-600 px-3 sm:px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50 text-xs sm:text-sm font-medium"
              type="button"
              :disabled="!qrDataUrl"
              @click="printerRef?.download('png', loc.name || 'qr')"
            >
              {{$t('download_png')}}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import LocationCRUD from '@/stores/apis/LocationCRUD.js';
import { showNotification } from '@/lib/notifications';
import { MapPin, QrCode, Building } from "lucide-vue-next";
import PrintQr from '@/components/admins/LocationManagement/PrintQr.vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  location: { type: Object, default: () => ({}) },
  buildings: { type: Array, default: () => [] },
  qrFormat: { type: String, default: "png" }
});
const emit = defineEmits(["update:open"]);

const loc = computed(() => props.location || {});
const buildingName = computed(() => {
  const b = props.buildings.find((x) => x.id === loc.value.building_id);
  return b ? b.name : `#${loc.value.building_id ?? "-"}`;
});

const qrWrap = ref(null);
const qrDataUrl = ref("");
const loadingQr = ref(false);
const qrError = ref("");

const printerRef = ref(null);
const onPrintPng = () => {
  // template refs are auto-unwrapped, but using .value is 100% safe in <script>
  printerRef.value?.print('png');
};

// 🔄 Updated fetchQr method using LocationCRUD
async function fetchQr() {
  if (!loc.value?.id) return;
  loadingQr.value = true;
  qrError.value = "";
  qrDataUrl.value = "";

  try {
    const result = await LocationCRUD.getLocationQR(loc.value.id, props.qrFormat);
    
    if (result.success && result.qrUrl) {
      // Use the QR URL directly from the API response
      qrDataUrl.value = result.qrUrl;
      showNotification('QR code loaded successfully', 'success');
    } else {
      qrError.value = result.message || "No QR code available";
      showNotification(result.message || 'No QR code found', 'error');
    }
  } catch (error) {
    qrError.value = "Failed to load QR. Please try again.";
    showNotification('Failed to load QR code', 'error');
    console.error(error);
  } finally {
    loadingQr.value = false;
  }
}

// 🔄 New regenerateQr method
async function regenerateQr() {
  if (!loc.value?.id) return;
  loadingQr.value = true;
  qrError.value = "";

  try {
    const result = await LocationCRUD.regenerateLocationQR(loc.value.id, props.qrFormat);
    
    if (result.success && result.qrUrl) {
      qrDataUrl.value = result.qrUrl;
      showNotification('QR code regenerated successfully', 'success');
    } else {
      qrError.value = result.message || "Failed to regenerate QR";
      showNotification(result.message || 'Failed to regenerate QR', 'error');
    }
  } catch (error) {
    qrError.value = "Failed to regenerate QR. Please try again.";
    showNotification('Failed to regenerate QR code', 'error');
    console.error(error);
  } finally {
    loadingQr.value = false;
    fetchQr();
  }
}

function close() {
  emit("update:open", false);
}

// function printQr() {
//   if (!qrDataUrl.value) return;

//   const w = window.open('', '_blank', 'width=1000,height=920');

//   w.document.write(`
//     <html>
//       <head>
//         <title>Location QR - ${loc.value.name}</title>
//         <style>
//           * { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
//           html, body { margin: 0; padding: 0; }
//           /* Keep content compact, no full-viewport centering */
//           .wrap { padding: 8mm; }
//           .card {
//             display: inline-block;
//             padding: 6mm;
//             border: 1px solid #e5e7eb;
//             border-radius: 10px;
//             text-align: center;
//           }
//           h3 {
//             margin: 0 0 4mm 0;
//             color: #374151;
//             font-weight: 600;
//             font-size: 14px;
//           }
//           img {
//             width: 200px; /* tweak if you want smaller/larger */
//             height: 200px;
//             display: block;
//             margin: 0 auto;
//           }

//           /* Trim printer margins */
//           @page { size: auto; margin: 6mm; }
//           @media print {
//             html, body { margin: 0; padding: 0; }
//             .wrap { padding: 0; }
//             .card { margin: 0; }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="wrap">
//           <div class="card">
//             <h3>${loc.value.name} - Floor ${loc.value.floor}</h3>
//             <img id="qr-img" src="${qrDataUrl.value}" alt="Location QR" />
//           </div>
//         </div>
//       </body>
//     </html>
//   `);

//   w.document.close();

//   const img = w.document.getElementById('qr-img');
//   if (!img) { w.print(); w.close(); return; }

//   const done = () => {
//     // small delay to ensure layout is ready
//     setTimeout(() => { w.focus(); w.print(); w.close(); }, 100);
//   };
//   img.onload = done;
//   img.onerror = done;
// }

// auto-load QR when modal opens
watch(
  () => [props.open, loc.value?.id],
  ([isOpen, id]) => { if (isOpen && id) fetchQr(); },
  { immediate: true }
);

onMounted(() => { if (props.open && loc.value?.id) fetchQr(); });
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
