<template>
  <div class="w-full flex justify-between items-center bg-[#235AA6] px-3 sm:px-6 md:px-8 lg:px-12 py-[0.6rem]">
    <div class="flex items-center gap-2">
      <button 
        @click="toggleSidebar" 
        class="md:hidden p-2 text-white hover:bg-white/10 rounded"
        aria-label="Toggle sidebar"
      >
        <Menu class="w-5 h-5" />
      </button>
      <h1 :class="['text-sm sm:text-lg md:text-xl text-white font-bold truncate max-w-[150px] sm:max-w-none', khmerTextClass]">
        {{ roleDisplay }}
      </h1>
    </div>
    <!-- Right side - Controls -->
    <div class="flex items-center gap-2 sm:gap-3 md:gap-4">
      <Bell class="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
      <div class="hidden sm:block">
        <ChangeLanguage class="text-white" />
      </div>
      <!-- User Profile Dropdown -->
      <div
        ref="dropdownRef"
        class="relative"
        @mouseenter="showDropdown"
        @mouseleave="hideDropdown"
      >
        <button
          @click="toggleDropdown"
          class="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1 rounded"
          aria-label="Toggle user profile dropdown"
          :aria-expanded="isDropdownOpen"
        >
          <img 
            :src="profile.photo 
              ? `https://api.rtc-bb.camai.kh/storage/${profile.photo}` 
              : image"
            alt="Profile photo"
            class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover rounded-full flex-shrink-0"
          />

          <p class="text-white text-xs sm:text-sm md:text-base truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">{{ profile.name }}</p>
        </button>
        <!-- Dropdown Menu -->
        <div
          v-if="isDropdownOpen"
          class="absolute right-0 top-full mt-2 w-64 sm:w-52 md:w-56 bg-white rounded-lg shadow-lg border overflow-hidden z-50 min-w-[250px] sm:min-w-0"
          @mouseenter="showDropdown"
          @mouseleave="hideDropdown"
        >
          <!-- Language selector for mobile -->
          <div class="block sm:hidden border-b border-gray-200 p-3">
            <div class="flex items-center gap-2 text-gray-700">
              <span class="text-sm font-medium">Language:</span>
              <ChangeLanguage class="text-gray-700" />
            </div>
          </div>
          
          <!-- Menu Items -->
          <div class="py-1">
            <button
              @click="viewProfile"
              class="flex items-center gap-3 w-full px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors text-left"
            >
              <img 
                :src="profile.photo ? `https://api.rtc-bb.camai.kh/storage/${profile.photo}` : image"
                alt="Profile Photo" class="w-10 h-10 object-cover rounded-full flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">
                  <template v-if="authStore.userRole === 'student'">Student Profile</template>
                  <template v-else-if="authStore.userRole === 'teacher'">Teacher Profile</template>
                  <template v-else-if="authStore.userRole === 'hod'">Head of Department Profile</template>
                  <template v-else-if="authStore.userRole === 'admin'">Admin Profile</template>
                  <template v-else>Profile</template>
                </div>
                <div class="text-xs text-gray-500 truncate">{{ profile.name }}</div>
              </div>
            </button>
            
            <div class="border-t border-gray-200 my-1"></div>
            
            <button
              @click="goToLibrary"
              class="flex items-center gap-3 w-full px-4 py-3 text-gray-900 hover:bg-blue-50 transition-colors text-left"
            >
              <BookOpen class="w-4 h-4 flex-shrink-0" />
              <span :class="['text-sm font-medium', locale === 'kh' ? 'khmer-text' : '']">Library</span>
            </button>
            
            <div class="border-t border-gray-200 my-1"></div>
            
            <button
              @click="changePassword"
              class="flex items-center gap-3 w-full px-4 py-3 text-gray-900 hover:bg-yellow-50 transition-colors text-left"
            >
              <KeyRound class="w-4 h-4 flex-shrink-0" />
              <span :class="['text-sm font-medium', locale === 'kh' ? 'khmer-text' : '']">Change Password</span>
            </button>
            
            <div class="border-t border-gray-200 my-1"></div>
            
            <button
              @click="logout"
              class="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut class="w-4 h-4 flex-shrink-0" />
              <span :class="['text-sm font-medium', locale === 'kh' ? 'khmer-text' : '']">{{ t('logout') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/Authentication/authStore.js";
import ChangeLanguage from "@/components/language/ChangLanguage.vue";
import { Bell, LogOut, BookOpen, KeyRound, Menu } from "lucide-vue-next";
import { getStudentProfile } from '@/stores/Student/StudentProfile';
import { useSidebar } from '@/components/ui/sidebar';
// import { getTeacherProfile } from '@/stores/Teacher/TeacherProfile';
// import { getHodProfile } from '@/stores/Hod/HodProfile';
import image from '@/assets/default-avatar.png';
const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const dropdownRef = ref(null);
const isDropdownOpen = ref(false);
const hoverTimeout = ref(null);
const error = ref(null);
const loading = ref(false);

// Get sidebar context - this might be undefined if outside SidebarProvider
const sidebar = useSidebar();

const emit = defineEmits(['toggleSidebar']);

const toggleSidebar = () => {
  // If sidebar context is available, use it
  if (sidebar && sidebar.toggleSidebar) {
    sidebar.toggleSidebar();
  } else {
    // Fallback to emit
    emit('toggleSidebar');
  }
};

const profile = reactive({
  name: '',
  photo:''
});

const khmerTextClass = computed(() => (locale.value === 'kh' ? 'khmer-text' : ''));
const roleDisplay = computed(() => t(authStore.userRole) || authStore.userRole);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const showDropdown = () => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
  isDropdownOpen.value = true;
};

const hideDropdown = () => {
  hoverTimeout.value = setTimeout(() => {
    isDropdownOpen.value = false;
  }, 150);
};

const viewProfile = () => {
  let profileRoute;
  if (authStore.userRole.toLowerCase() === 'student') { 
    profileRoute = `/${locale.value}/student/student-profile`;
  } 
  else if (authStore.userRole.toLowerCase() === 'teacher') {
    profileRoute = `/${locale.value}/teacher/teacher-profile`; 
  } 
  else if (authStore.userRole.toLowerCase() === 'hod') {
    profileRoute = `/${locale.value}/hod/profile`;
  }
  else if (authStore.userRole.toLowerCase() === 'admin') {
    profileRoute = `/${locale.value}/admin/admin-profile`;
  }
  router.push(profileRoute);
  isDropdownOpen.value = false;
};

const goToLibrary = () => {
  console.log('📚 Library button clicked!');
  try {
    authStore.redirectToLibrary();
    isDropdownOpen.value = false;
  } catch (error) {
    console.error('❌ Error redirecting to library:', error);
    alert('Please login first to access the library');
  }
};

const changePassword = () => {
  const currentLang = route.params.lang || "en";
  let changePasswordRoute;
  
  if (authStore.userRole.toLowerCase() === 'student') { 
    changePasswordRoute = `/${currentLang}/student/change-password`;
  } 
  else if (authStore.userRole.toLowerCase() === 'teacher') {
    changePasswordRoute = `/${currentLang}/teacher/change-password`; 
  } 
  else if (authStore.userRole.toLowerCase() === 'hod') {
    changePasswordRoute = `/${currentLang}/hod/change-password`;
  }
  else if (authStore.userRole.toLowerCase() === 'admin') {
    changePasswordRoute = `/${currentLang}/admin/change-password`;
  }
  
  console.log('🔑 Redirecting to:', changePasswordRoute);
  router.push(changePasswordRoute);
  isDropdownOpen.value = false;
};

const logout = () => {
  authStore.logout();
  const currentLang = route.params.lang || "en";
  router.push(`/${currentLang}/login`);
  isDropdownOpen.value = false;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);
  try {
    loading.value = true;
    const data = await getStudentProfile(); // Replace with role-based fetching if needed
    profile.name = data?.user?.name || '';
    profile.photo = data.user.user_detail?.profile_picture || '';
  } catch (err) {
    console.error('❌ Failed to fetch profile:', err);
    error.value = err.message || 'Unknown error';
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
});
</script>

