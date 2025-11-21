<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="relative">

        <div class="bg-white rounded-lg max-w-5xl w-full shadow-2xl max-h-[80vh] overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <h3 :class="['text-xl font-bold text-gray-800', locale === 'kh' ? 'khmer-text' : '']">{{ t('hod_profile') }}</h3>
                <div :class="['text-sm text-gray-500', locale === 'kh' ? 'khmer-text' : '']">
                {{ t('view_details') }}
              </div>
              </div>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="flex overflow-y-auto max-h-[calc(80vh-120px)]" v-if="hod">
            <!-- Left Panel - Personal Information -->
            <div class="w-1/2 p-4 border-r border-gray-200">
              <!-- Profile Section -->
              <div class="text-center mb-4">
                <div class="w-[120px] h-[152px] mx-auto mb-3 rounded-lg flex items-center justify-center border-4 border-white shadow-lg">
                  <img
                    v-if="hodPhotoSrc"
                    :src="hodPhotoSrc"
                    :alt="hodFullName"
                    class="w-full h-full rounded-lg object-cover"
                    @error="onImgError"
                  />
                  <!-- placeholder when no image -->
                  <div
                    v-else
                    class="w-full h-full rounded-lg grid place-items-center bg-gray-100 text-gray-500 text-sm"
                  >
                    No photo
                  </div>
                </div>
                <h1 class="text-lg font-bold text-gray-900 mb-1">
                  {{ hod.latin_name }}
                </h1>
                <p class="text-gray-600 text-sm">{{ hod.department }} • {{ hod.position }}</p>
              </div>

              <!-- Personal Information -->
              <div>
                <h2 :class="['text-md font-semibold text-gray-900 mb-3', locale === 'kh' ? 'khmer-text' : '']">
                  {{ t('personal_information') }}
                </h2>
                
                <div class="space-y-2">
                  <div>
                    <label :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('khmer_name') }}
                    </label>
                    <div class="bg-gray-100 p-2 rounded text-sm text-gray-800 khmer-text">
                      {{ hod.khmer_name || hod.full_name }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('latin_name') }}
                    </label>
                    <div class="bg-gray-100 p-2 rounded text-sm text-gray-800">
                      {{ hod.latin_name || 'N/A' }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('employee_id') }}
                    </label>
                    <div class="bg-gray-100 p-2 rounded text-sm text-gray-800">
                      {{ hod.employee_id || hod.id_card }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('date_of_birth') }}
                    </label>
                    <div class="bg-gray-100 p-2 rounded text-sm text-gray-800">
                      {{ formatDate(hod.date_of_birth) }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('gender') }}
                    </label>
                    <div class="bg-gray-100 p-2 rounded text-sm text-gray-800">
                      {{ hod.gender || 'N/A' }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('email_address') }}
                    </label>
                    <div class="bg-gray-100 p-2 rounded text-sm text-gray-800">
                      {{ hod.email || 'N/A' }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('phone_number') }}
                    </label>
                    <div class="bg-gray-100 p-2 rounded text-sm text-gray-800">
                      {{ hod.phone || 'N/A' }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('origin') }}
                    </label>
                    <div class="bg-gray-100 p-2 rounded text-sm text-gray-800">
                      {{ hod.origin || 'N/A' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Panel - Professional Information -->
            <div class="w-1/2 p-4">
              <h2 :class="['text-md font-semibold text-gray-900 mb-3', locale === 'kh' ? 'khmer-text' : '']">
                {{ t('professional_information') }}
              </h2>

              <!-- Professional Details -->
              <div class="space-y-2 mb-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('department') }}
                    </label>
                    <div class="bg-gray-100 p-2 rounded text-sm text-gray-800">
                      {{ hod.department }}
                    </div>
                  </div>
                  <div>
                    <label :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('position') }}
                    </label>
                    <div class="bg-gray-100 p-2 rounded text-sm text-gray-800">
                      {{ hod.position }}
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('experience') }}
                    </label>
                    <div class="bg-gray-100 p-2 rounded text-sm text-gray-800">
                      {{ hod.experience_years || 0 }} {{ t('years') }}
                    </div>
                  </div>
                  <div>
                    <label :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('status') }}
                    </label>
                    <div class="bg-gray-100 p-2 rounded text-sm text-gray-800">
                      <span 
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        :class="getStatusBadgeClass(hod.status)"
                      >
                        {{ hod.status || 'Active' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Courses Taught Section -->
              <div v-if="hod.courses_taught && hod.courses_taught.length">
                <h3 :class="['text-md font-semibold text-gray-900 mb-3', locale === 'kh' ? 'khmer-text' : '']">{{ t('courses_taught') }}</h3>
                
                <!-- Table Header -->
                <div class="flex mb-3 pb-2 border-b border-gray-200">
                  <div class="w-2/3">
                    <span :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('subject') }}
                    </span>
                  </div>
                  <div class="w-1/3 text-right">
                    <span :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('experience') }}
                    </span>
                  </div>
                </div>

                <!-- Courses List -->
                <div class="space-y-2">
                  <div v-for="(course, index) in hod.courses_taught" :key="index" 
                       class="flex items-center py-2 px-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <div class="w-2/3">
                      <span class="text-sm font-medium text-gray-800">
                        {{ course }}
                      </span>
                    </div>
                    <div class="w-1/3 text-right">
                      <span class="text-sm text-gray-600">
                        {{ hod.experience_years || 0 }} {{ t('years') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Default teaching area if no courses_taught -->
              <div v-else>
                <h3 :class="['text-md font-semibold text-gray-900 mb-3', locale === 'kh' ? 'khmer-text' : '']">{{ t('teaching_areas') }}</h3>
                
                <!-- Table Header -->
                <div class="flex mb-3 pb-2 border-b border-gray-200">
                  <div class="w-2/3">
                    <span :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('department') }}
                    </span>
                  </div>
                  <div class="w-1/3 text-right">
                    <span :class="['text-xs font-semibold text-gray-500 uppercase tracking-wide', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('experience') }}
                    </span>
                  </div>
                </div>

                <!-- Default teaching area -->
                <div class="space-y-2">
                  <div class="flex items-center py-2 px-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <div class="w-2/3">
                      <span class="text-sm font-medium text-gray-800">
                        {{ hod.department }} {{ t('department_leadership') }}
                      </span>
                    </div>
                    <div class="w-1/3 text-right">
                      <span class="text-sm text-gray-600">
                        {{ hod.management_experience || hod.experience_years || 0 }} {{ t('years') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-6 py-4 border-t border-gray-200" v-if="hod">
            <div class="flex items-center justify-between">
              <div :class="['text-xs text-gray-500', locale === 'kh' ? 'khmer-text' : '']">
                {{ t('last_updated') }}: {{ new Date().toLocaleDateString() }}
              </div>
              <div class="flex gap-3">
                <button
                  @click="closeModal"
                  :class="['px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium', locale === 'kh' ? 'khmer-text' : '']"
                >
                  {{ t('close') }}
                </button>
              </div>
            </div>
          </div>

          <!-- No data state -->
          <div v-if="!hod" class="flex items-center justify-center py-12">
            <div class="text-center text-gray-500">
              <User class="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p :class="['text-lg font-medium', locale === 'kh' ? 'khmer-text' : '']">{{ t('no_hod_data') }}</p>
              <p :class="['text-sm text-gray-400 mt-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('try_again_contact_support') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from "vue";
import { X, User } from "lucide-vue-next";
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

// Props
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  hod: { type: Object, default: () => null }
});

const FALLBACK_IMG = "https://via.placeholder.com/300x380?text=No+Photo";

const onImgError = (e) => {
  e.target.onerror = null;          // prevent loop
  e.target.src = FALLBACK_IMG;      // graceful fallback
};

const STORAGE_BASE = "https://api.rtc-bb.camai.kh/storage/";

const pickFirst = (...vals) => vals.find(v => v !== undefined && v !== null && v !== "");
const isAbsoluteUrl = (u) => /^https?:\/\//i.test(u);
const toStorageUrl = (path) => (isAbsoluteUrl(path) ? path : STORAGE_BASE + String(path).replace(/^\/+/, ""));


// Emits
const emit = defineEmits(["update:modelValue"]);

const closeModal = () => {
  emit("update:modelValue", false);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusBadgeClass = (status) => {
  const classes = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-red-100 text-red-800",
    On_Leave: "bg-orange-100 text-orange-800",
    Suspended: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

// Always resolve from the prop you declared
const subject = computed(() => props.hod ?? null);

const hodPhotoSrc = computed(() => {
  const t = subject.value;
  if (!t) return null;

  // Try common fields seen across APIs
  const raw = pickFirst(
    t.photo_url,                       // absolute or relative
    t.photo,                           // sometimes just "photo"
    t.profile_picture,                 // flat field
    t.user_detail?.profile_picture,    // nested
    t.user_detail?.photo,              // nested alt
    t.hod_detail?.profile_picture,     // HOD-specific nested
    t.hod_detail?.photo                // another possible alias
  );

  return raw ? toStorageUrl(raw) : null;
});

const hodFullName = computed(() => {
  const t = subject.value || {};
  return (
    t.full_name ||
    t.latin_name ||
    [t.first_name, t.last_name].filter(Boolean).join(" ") ||
    "HOD"
  );
});

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
