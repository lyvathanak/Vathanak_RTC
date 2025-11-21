<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-gray-300">404</h1>
        <h2 class="text-2xl font-bold text-gray-900 mt-4">Page Not Found</h2>
        <p class="text-gray-600 mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div class="space-y-4">
        <button
          @click="goBack"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Go Back
        </button>

        <button
          v-if="isAuthenticated"
          @click="logout"
          class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/Authentication/authStore.js";
import { computed } from "vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

const goBack = () => {
  // First try to go back in history
  try {
    if (window.history.length > 1) {
      router.go(-1);
    } else {
      // If no history, go to login
      goHome();
    }
  } catch (error) {
    console.error("Error going back:", error);
    // If router.go(-1) fails, go to login
    goHome();
  }
};

const logout = () => {
  authStore.logout();
  goHome();
};

const goHome = () => {
  const currentLang = route.params.lang || "en";
  router.push(`/${currentLang}/login`);
};
</script>
