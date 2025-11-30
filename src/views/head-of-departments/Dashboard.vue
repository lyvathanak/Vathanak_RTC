<script lang="ts">
export const description = "A sidebar that collapses to icons.";
export const iframeHeight = "800px";
export const containerClass = "w-full h-full";
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import HODSidebar from "@/components/head-of-departments/HODSidebar.vue";
import HeaderControl from "@/components/features/HeaderControl.vue";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

// Responsive sidebar state
const isMobile = ref(false)
const sidebarOpen = ref(true)

// Check screen size and update sidebar behavior
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768 // md breakpoint
  // On mobile, start with collapsed sidebar, on desktop start expanded
  sidebarOpen.value = !isMobile.value
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <div class="flex flex-1 w-full">
      <SidebarProvider 
        class="w-full h-full"
        v-model:open="sidebarOpen"
        :default-open="true"
      >
        <div class="h-full w-full flex min-w-0">
          <HODSidebar 
            class="h-full flex-shrink-0" 
            :collapsible="isMobile ? 'offcanvas' : 'icon'"
          />
          <SidebarInset class="flex-1 min-w-0">
            <div class="sticky top-0 z-40 bg-[#235AA6]"> 
              <HeaderControl class="h-auto flex w-full" />
            </div>
            <main class="h-full">
              <router-view />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>

    </div>
</template>