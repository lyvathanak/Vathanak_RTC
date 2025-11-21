<template>
  <div class="relative inline-block text-left" data-language-dropdown>
    <!-- Trigger -->
    <button
      type="button"
      @click.stop="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
      class="flex items-center px-3 py-1.5 rounded-full space-x-2 focus:outline-none"
    >
      <img
        :src="current.flag"
        :alt="current.label"
        class="w-8 rounded object-cover"
      />
  <span :class="['text-sm font-medium', current.code === 'kh' ? 'khmer-text' : '']">{{ current.label }}</span>
      <ChevronDown class="w-4 h-4 text-gray-800" />
    </button>

    <!-- Dropdown -->
    <transition name="fade" >
      <ul
        v-if="open"
        @click.stop
        class="absolute right-0 mt-2 w-36 bg-gray-300 rounded-md shadow-lg z-100"
      >
        <li
          v-for="lang in languages"
          :key="lang.code"
          @click="select(lang)"
          class="flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer space-x-2"
        >
          <img
            :src="lang.flag"
            :alt="lang.label"
            class="w-8 rounded object-cover"
          />
          <span :class="['text-sm', lang.code === 'kh' ? 'khmer-text' : '']">{{ lang.label }}</span>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'

// import your flag assets
import khFlag from '@/assets/Flag/CambodiaFlag.png'
import usFlag from '@/assets/Flag/UsFlag.png'
import frFlag from '@/assets/Flag/FrenchFlag.png'

const { locale } = useI18n()
const router = useRouter()
const route = useRoute()

// define your supported languages
const languages = [
  { code: 'kh', label: 'ខ្មែរ', flag: khFlag },
  { code: 'en', label: 'English', flag: usFlag },
  { code: 'fr', label: 'Français', flag: frFlag }
]

const open = ref(false) // Ensure dropdown starts closed

function toggle() {
  // Only toggle if this is an intentional user action
  open.value = !open.value
  console.log('Dropdown toggled:', open.value)
}

function select(lang) {
  console.log('Language selected:', lang.code)
  
  // Update locale
  locale.value = lang.code
  open.value = false // Close dropdown immediately
  
  // Navigate to the new language route
  const currentPath = route.path
  
  // Extract the current page from the path more comprehensively
  let currentPage = 'login' // default page
  
  if (currentPath.includes('/login')) {
    currentPage = 'login'
  } else if (currentPath.includes('/admin/dashboard')) {
    currentPage = 'admin/dashboard'
  } else if (currentPath.includes('/hod/dashboard')) {
    currentPage = 'hod/dashboard'
  } else if (currentPath.includes('/teacher/dashboard')) {
    currentPage = 'teacher/dashboard'
  } else if (currentPath.includes('/student/dashboard')) {
    currentPage = 'student/dashboard'
  } else if (currentPath.includes('/dashboard')) {
    currentPage = 'dashboard'
  } else if (currentPath.includes('/changelanguage')) {
    currentPage = 'changelanguage'
  }
  
  // Create the new path with the selected language
  const newPath = `/${lang.code}/${currentPage}`
  
  console.log('Navigating from', currentPath, 'to', newPath)
  
  // Use router.push with the path
  router.push(newPath).catch(err => {
    console.error('Navigation error:', err)
  })
}

// Handle click outside to close dropdown
function handleClickOutside(event) {
  // Ignore if the dropdown is already closed
  if (!open.value) return
  
  const dropdown = event.target.closest('[data-language-dropdown]')
  if (!dropdown) {
    open.value = false
  }
}

onMounted(() => {
  // Ensure dropdown is closed on mount
  open.value = false
  
  // Add click outside listener after a small delay to prevent immediate triggers
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 100)
  
  // Set initial locale based on route path
  const pathParts = route.path.split('/')
  const routeLang = pathParts[1] // Get language from path like /en/login
  
  if (routeLang && ['en', 'fr', 'kh'].includes(routeLang) && routeLang !== locale.value) {
    locale.value = routeLang
    console.log('Initial locale set from route:', routeLang)
  }
})

// Watch for route changes to sync locale
watch(() => route.path, (newPath) => {
  const pathParts = newPath.split('/')
  const routeLang = pathParts[1]
  
  if (routeLang && ['en', 'fr', 'kh'].includes(routeLang) && routeLang !== locale.value) {
    locale.value = routeLang
    console.log('Locale synced from route change:', routeLang)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// compute the currently selected language object
const current = computed(() => {
  // Get language from route path
  const pathParts = route.path.split('/')
  const currentLang = pathParts[1] || locale.value
  
  const found = languages.find((l) => l.code === currentLang)
  console.log('Current language:', found)
  return found || languages[1] // Default to English (index 1)
})
</script>

<style>
/* simple fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity .15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
