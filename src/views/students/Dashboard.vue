<script lang="ts">
export const description = "A sidebar that collapses to icons.";
export const iframeHeight = "800px";
export const containerClass = "w-full h-full";
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import StudentSidebar from "@/components/students/StudentSidebar.vue";
import Header from "@/components/features/Header.vue";
import Footer from "@/components/features/Footer.vue";
import HeaderControl from "@/components/features/HeaderControl.vue";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
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
    <!-- Header Section -->
    <Header />
    <HeaderControl class="h-auto flex w-full" />

    <!-- Main Content with Sidebar -->
    <div class="flex flex-1 w-full">
      <SidebarProvider 
        class="w-full h-full"
        :default-open="sidebarOpen"
      >
        <div class="h-full w-full flex min-w-0">
          <StudentSidebar 
            class="h-full flex-shrink-0" 
            collapsible="icon"
          />
          <SidebarInset class="flex-1 min-w-0">
            <main class="h-full">
              <router-view />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>

    <!-- Footer Section -->
    <Footer />
  </div>
</template>
