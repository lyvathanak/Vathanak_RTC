<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div
      class="flex flex-col items-center justify-center bg-[#E3E3E3] rounded-lg shadow-lg gap-5 p-13 w-full max-w-fit"
    >
      <!-- Header with Logo -->
      <div class="flex flex-col items-center gap-5">
        <img
          src="/logo.png"
          alt="Logo"
          width="120"
          height="120"
          class="mx-auto rounded-full mb-4"
        />

        <!-- Organization Name -->
        <div class="flex flex-col items-center text-center">
          <h1 class="text-sm font-medium text-[#235AA6] khmer-text-light">
            សាលាមធ្យមសិក្សា​សុខាភិបាល​ភូមិភាគបាត់ដំបង
          </h1>
          <h1
            class="text-xs text-[#235AA6] font-medium tracking-wide uppercase"
          >
            BATTAMBANG REGIONAL TRAINING CENTER FOR HEALTH
          </h1>
        </div>
      </div>

      <!-- Login Title -->
      <h3
        :class="[
          'text-2xl font-bold text-[#235AA6]',
          locale === 'kh' ? 'khmer-text' : '',
        ]"
      >
        {{ t("login") }}
      </h3>

      <!-- Login Form -->
      <form
        @submit.prevent="handleSubmit"
        class="flex flex-col gap-3 w-full max-w-md"
      >
        <!-- Error Message -->
        <div
          v-if="loginError || authStore.error"
          class="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg"
        >
          {{ loginError || authStore.error }}
        </div>

        <!-- Email Field -->
        <div class="w-full">
          <label
            :class="[
              'text-sm font-medium',
              locale === 'kh' ? 'khmer-text' : '',
            ]"
            >{{ t("email_address") }}</label
          >
          <input
            type="email"
            v-model="email"
            :placeholder="t('enter_email')"
            :disabled="authStore.isLoading"
            :class="[
              'w-full p-4 border rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50',
              emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            ]"
            @blur="validateEmail"
            @input="emailError = ''"
          />
          <p v-if="emailError" class="text-red-500 text-sm mt-1">{{ emailError }}</p>
        </div>

        <!-- Password Field -->
        <div class="w-full">
          <label
            :class="[
              'text-sm font-medium',
              locale === 'kh' ? 'khmer-text' : '',
            ]"
            >{{ t("password") }}</label
          >
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              :placeholder="t('enter_password')"
              :disabled="authStore.isLoading"
              :class="[
                'w-full p-4 pr-12 border rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50',
                passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              ]"
              @blur="validatePassword"
              @input="passwordError = ''"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <Eye v-if="showPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <p v-if="passwordError" class="text-red-500 text-sm mt-1">{{ passwordError }}</p>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between w-full">
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="rememberMe"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span
              :class="[
                'ml-2 text-sm text-gray-600',
                locale === 'kh' ? 'khmer-text' : '',
              ]"
            >
              {{ t("remember_me") }}
            </span>
          </label>
          <a
            href="#"
            @click.prevent="handleForgotPassword"
            :class="[
              'text-sm text-blue-600 hover:text-blue-800',
              locale === 'kh' ? 'khmer-text' : '',
            ]"
          >
            {{ t("forgot_password") }}
          </a>
        </div>

        <!-- Language Dropdown -->
        <div class="flex items-center justify-center w-full">
          <ChangeLanguage />
        </div>

        <!-- Login Button -->
        <button
          type="submit"
          :disabled="authStore.isLoading"
          :class="[
            'w-full bg-[#235AA6] text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
            locale === 'kh' ? 'khmer-text' : '',
          ]"
        >
          <span v-if="authStore.isLoading">{{
            t("logging_in") || "Logging in..."
          }}</span>
          <span v-else>{{ t("login") }}</span>
        </button>
      </form>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/Authentication/authStore.js";
import ChangeLanguage from "@/components/language/ChangLanguage.vue";
import { Eye, EyeOff } from "lucide-vue-next";
import { showNotification } from "@/lib/notifications.js";

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const authStore = useAuthStore();

// Initialize locale from route path
onMounted(() => {
  const pathParts = route.path.split("/");
  const routeLang = pathParts[1]; // Get language from path like /en/login

  if (routeLang && ["en", "fr", "kh"].includes(routeLang)) {
    locale.value = routeLang;
  }

  // Set remember me checkbox based on stored preference
  rememberMe.value = authStore.isRememberMeEnabled();

  // Load saved email and password if remember me was previously enabled
  if (rememberMe.value) {
    email.value = authStore.getSavedEmail();
    password.value = authStore.getSavedPassword();
  }
});

const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);
const loginError = ref("");
const emailError = ref("");
const passwordError = ref("");

// Validation functions
const validateEmail = () => {
  emailError.value = "";
  if (!email.value.trim()) {
    emailError.value = "Email is required";
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    emailError.value = "Please enter a valid email address";
    return false;
  }
  return true;
};

const validatePassword = () => {
  passwordError.value = "";
  if (!password.value.trim()) {
    passwordError.value = "Password is required";
    return false;
  }
  if (password.value.length < 6) {
    passwordError.value = "Password must be at least 6 characters";
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  try {
    // Clear previous errors
    loginError.value = "";
    emailError.value = "";
    passwordError.value = "";
    
    // Validate fields
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (!isEmailValid || !isPasswordValid) {
      return; // Stop submission if validation fails
    }

    const result = await authStore.login(
      {
        email: email.value,
        password: password.value,
      },
      rememberMe.value
    );

    if (result.success) {
      const currentLang = route.params.lang || "en";
      const userRole = result.user.role;
      
      // Show success notification
      showNotification('Login successful !', 'success', 2000);
      
      // Safety check for teacher email pattern
      if (email.value.includes('teacher') && userRole !== authStore.USER_ROLES.TEACHER) {
        await router.push(`/${currentLang}/teacher/overview`);
        return;
      }
      
      // Redirect based on user role - Use constants for exact comparison
      if (userRole === authStore.USER_ROLES.ADMIN) {
        await router.push(`/${currentLang}/admin/overview`);
      } else if (userRole === authStore.USER_ROLES.HEAD_OF_DEPARTMENT) {
        await router.push(`/${currentLang}/hod/overview`);
      } else if (userRole === authStore.USER_ROLES.TEACHER) {
        await router.push(`/${currentLang}/teacher/overview`);
      } else if (userRole === authStore.USER_ROLES.STUDENT) {
        await router.push(`/${currentLang}/student/overview`);
      } else {
        // Check for common role variations
        const lowerRole = userRole?.toLowerCase();
        if (lowerRole === 'teacher' || lowerRole === 'teachers') {
          await router.push(`/${currentLang}/teacher/overview`);
        } else if (lowerRole === 'admin' || lowerRole === 'administrator') {
          await router.push(`/${currentLang}/admin/overview`);
        } else if (lowerRole === 'student' || lowerRole === 'students') {
          await router.push(`/${currentLang}/student/overview`);
        } else if (lowerRole?.includes('head') || lowerRole?.includes('department')) {
          await router.push(`/${currentLang}/hod/overview`);
        } else {
          if (email.value.includes('teacher')) {
            await router.push(`/${currentLang}/teacher/overview`);
          } else {
            loginError.value = "Unknown user role: " + userRole + ". Please contact support.";
            return;
          }
        }
      }
    } else {
      loginError.value = result.error;
    }
  } catch (error) {
    console.error('Login error:', error);
    loginError.value = "An unexpected error occurred. Please try again.";
  }
};

// Watch for changes to rememberMe checkbox to clear preference if unchecked
watch(rememberMe, (newValue) => {
  if (!newValue) {
    // If user unchecks remember me, clear the stored preference and saved credentials
    authStore.clearRememberMePreference();
    // Don't clear the fields immediately, let user decide
  } else {
    // If user checks remember me, load saved credentials if available
    const savedEmail = authStore.getSavedEmail();
    const savedPassword = authStore.getSavedPassword();
    if (savedEmail && !email.value) {
      email.value = savedEmail;
    }
    if (savedPassword && !password.value) {
      password.value = savedPassword;
    }
  }
});

const handleForgotPassword = () => {
  // Get current language from route
  const currentLang = route.params.lang || "en";
  // Navigate to forgot password page
  router.push(`/${currentLang}/forgot-password`);
};
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
