<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2 sm:p-4 md:p-6">
      <div class="relative">

        <div class="bg-white rounded-xl sm:rounded-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl shadow-2xl max-h-[80vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-gray-200 shrink-0">
            
             <!-- Close button -->
            <button
              @click="closeModal"
              aria-label="Close"
              class="absolute top-3 right-3 p-2 rounded-full hover:bg-white/70 text-gray-600 hover:text-gray-800 transition"
            >
              <X class="w-5 h-5" />
            </button>

            <div class="flex items-end gap-1">
              <div class="flex items-center gap-3">
                <h3 :class="['text-base sm:text-lg md:text-xl font-bold text-gray-800', locale === 'kh' ? 'khmer-text' : '']">{{ t('teacher_profile') }}</h3>
              </div>
              <div :class="['text-xs sm:text-sm text-gray-500', locale === 'kh' ? 'khmer-text' : '']">
                {{ t('view_details') }}
              </div>
            </div>
          </div>

          <div class="flex flex-col lg:flex-row overflow-y-auto flex-1 min-h-0" v-if="teacher">
            <!-- Left Panel - Personal Information -->
            <div class="w-full lg:w-1/2 p-3 sm:p-4 md:p-5 lg:border-r border-gray-200">
              <!-- Profile Section -->
              <div class="text-center mb-4 sm:mb-5">
                <div class="w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 mx-auto mb-3 rounded-lg flex items-center justify-center border-4 border-white shadow-lg">
                  <img 
                    v-if="teacher.photo_url || teacher.profile_picture || teacher.user_detail?.profile_picture"
                    :src="`https://api.rtc-bb.camai.kh/storage/${teacher.profile_picture || teacher.photo_url || teacher.user_detail?.profile_picture}`"
                    :alt="teacher.full_name || teacher.latin_name"
                    class="w-full h-full rounded-lg object-cover"
                  />
                  <User v-else class="text-white" :size="32" />
                </div>
                <h1 class="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1">
                  {{ teacher.full_name }}
                </h1>
                <p class="text-gray-600 text-xs sm:text-sm">{{ teacher.department }} • {{ teacher.position }}</p>
              </div>

              <!-- Personal Information -->
              <div>
                <h2 :class="['text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3', locale === 'kh' ? 'khmer-text' : '']">
                  {{ t('personal_information') }}
                </h2>
                
                <div class="space-y-2 sm:space-y-3">
                  <div>
                    <label :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('khmer_name') }}
                    </label>
                    <div class="bg-gray-100 p-2 sm:p-3 rounded text-xs sm:text-sm text-gray-800 khmer-text">
                      {{ teacher.khmer_name }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('latin_name') }}
                    </label>
                    <div class="bg-gray-100 p-2 sm:p-3 rounded text-xs sm:text-sm text-gray-800">
                      {{ teacher.latin_name }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('teacher_id') }}
                    </label>
                    <div class="bg-gray-100 p-2 sm:p-3 rounded text-xs sm:text-sm text-gray-800">
                      {{ teacher.id_card }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('date_of_birth') }}
                    </label>
                    <div class="bg-gray-100 p-2 sm:p-3 rounded text-xs sm:text-sm text-gray-800">
                      {{ formatDate(teacher.date_of_birth) }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('gender') }}
                    </label>
                    <div class="bg-gray-100 p-2 sm:p-3 rounded text-xs sm:text-sm text-gray-800">
                      {{ teacher.gender === 'M' ? t('male') : t('female') }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('email_address') }}
                    </label>
                    <div class="bg-gray-100 p-2 sm:p-3 rounded text-xs sm:text-sm text-gray-800">
                      {{ teacher.email || 'N/A' }}
                    </div>
                  </div>

                  <div>
                    <label :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('phone_number') }}
                    </label>
                    <div class="bg-gray-100 p-2 sm:p-3 rounded text-xs sm:text-sm text-gray-800">
                      {{ teacher.phone || 'N/A' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Panel - Professional Information -->
            <div class="w-full lg:w-1/2 p-3 sm:p-4 md:p-5">
              <h2 :class="['text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3', locale === 'kh' ? 'khmer-text' : '']">
                {{ t('professional_information') }}
              </h2>

              <!-- Professional Details -->
              <div class="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('department') }}
                    </label>
                    <div class="bg-gray-100 p-2 sm:p-3 rounded text-xs sm:text-sm text-gray-800">
                      {{ teacher.department }}
                    </div>
                  </div>
                  <div>
                    <label :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('program') }}
                    </label>
                    <div class="bg-gray-100 p-2 sm:p-3 rounded text-xs sm:text-sm text-gray-800">
                      {{ programLabel(teacher) }}
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-3">
                  <div>
                    <label :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('experience') }}
                    </label>
                    <div class="bg-gray-100 p-2 sm:p-3 rounded text-xs sm:text-sm text-gray-800">
                      {{ teacher.experience_years || 0 }} {{ t('years') }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Subjects/Courses Section -->
              <div v-if="teacher.courses_taught && teacher.courses_taught.length">
                <h3 :class="['text-sm sm:text-base font-semibold text-gray-900 mb-3', locale === 'kh' ? 'khmer-text' : '']">{{ t('courses_taught') }}</h3>
                
                <!-- Table Header -->
                <div class="flex mb-3 pb-2 border-b border-gray-200">
                  <div class="w-2/3">
                    <span :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('subject') }}
                    </span>
                  </div>
                  <div class="w-1/3 text-right">
                    <span :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('experience') }}
                    </span>
                  </div>
                </div>

                <!-- Courses List -->
                <div class="space-y-2">
                  <div v-for="(course, index) in teacher.courses_taught" :key="index" 
                       class="flex items-center py-2 px-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <div class="w-2/3">
                      <span class="text-xs sm:text-sm font-medium text-gray-800">
                        {{ course }}
                      </span>
                    </div>
                    <div class="w-1/3 text-right">
                      <span class="text-xs sm:text-sm text-gray-600">
                        {{ teacher.experience_years || 0 }} {{ t('years') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Default subjects if no courses_taught -->
              <div v-else>
                <h3 :class="['text-sm sm:text-base font-semibold text-gray-900 mb-3', locale === 'kh' ? 'khmer-text' : '']">{{ t('teaching_areas') }}</h3>
                
                <!-- Table Header -->
                <div class="flex mb-3 pb-2 border-b border-gray-200">
                  <div class="w-2/3">
                    <span :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('department') }}
                    </span>
                  </div>
                  <div class="w-1/3 text-right">
                    <span :class="['text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide', locale === 'kh' ? 'khmer-text' : '']">
                      {{ t('experience') }}
                    </span>
                  </div>
                </div>

                <!-- Default teaching area -->
                <div class="space-y-2">
                  <div class="flex items-center py-2 px-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <div class="w-2/3">
                      <span class="text-xs sm:text-sm font-medium text-gray-800">
                        {{ teacher.department }}
                      </span>
                    </div>
                    <div class="w-1/3 text-right">
                      <span class="text-xs sm:text-sm text-gray-600">
                        {{ teacher.experience_years || 0 }} {{ t('years') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t border-gray-200 shrink-0" v-if="teacher">
            <div class="flex items-center justify-between">
              <div :class="['text-[10px] sm:text-xs text-gray-500', locale === 'kh' ? 'khmer-text' : '']">
                {{ t('last_updated') }}: {{ new Date().toLocaleDateString() }}
              </div>
              <div class="flex gap-3">
                <button
                  @click="closeModal"
                  :class="['px-4 sm:px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-xs sm:text-sm', locale === 'kh' ? 'khmer-text' : '']"
                >
                  {{ t('close') }}
                </button>
              </div>
            </div>
          </div>

          <!-- No data state -->
          <div v-if="!teacher" class="flex items-center justify-center py-8 sm:py-12">
            <div class="text-center text-gray-500">
              <User class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
              <p :class="['text-base sm:text-lg font-medium', locale === 'kh' ? 'khmer-text' : '']">{{ t('no_teacher_data') }}</p>
              <p :class="['text-xs sm:text-sm text-gray-400 mt-1', locale === 'kh' ? 'khmer-text' : '']">{{ t('try_again_contact_support') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { X, User } from "lucide-vue-next";
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

// Props
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  teacher: { type: Object, default: () => null }
});

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

const programLabel = (t) =>
  t?.program_name || t?.program?.name || t?.program || 'N/A';


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
