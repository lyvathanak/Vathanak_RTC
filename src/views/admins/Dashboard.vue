<script lang="ts">
export const description = "A sidebar that collapses to icons.";
export const iframeHeight = "800px";
export const containerClass = "w-full h-full";
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import AdminSideBar from "@/components/admins/AdminSideBar.vue";
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

const handleToggleSidebar = () => {
  console.log('🟢 Dashboard: Received toggle event, current state:', sidebarOpen.value);
  sidebarOpen.value = !sidebarOpen.value;
  console.log('🟢 Dashboard: New state:', sidebarOpen.value);
}

// Check screen size and update sidebar behavior
const checkScreenSize = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 768 // md breakpoint
  
  // Only auto-close/open when transitioning between mobile and desktop
  if (wasMobile !== isMobile.value) {
    sidebarOpen.value = !isMobile.value
  }
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
  <div class="flex flex-col h-screen overflow-x-hidden">
    <!-- Header Section -->
    <Header />
    
    <!-- Main Content with Sidebar -->
    <div class="flex flex-1 w-full">
      <SidebarProvider 
        class="w-full h-full"
        v-model:open="sidebarOpen"
        :default-open="true"
      >
        <div class="h-full w-full flex min-w-0">
          <AdminSideBar 
            class="h-full flex-shrink-0" 
            :collapsible="isMobile ? 'offcanvas' : 'icon'"
          />
          
          <SidebarInset
            class="flex-1 min-w-0 flex flex-col
              transition-[padding] duration-300 ease-in-out
              md:pl-[--sidebar-width]
              md:peer-data-[collapsible=icon]/sidebar:pl-[--sidebar-width-icon]"
          >
            <div class="sticky top-0 z-40 bg-[#235AA6]">
              <HeaderControl class="h-auto flex w-full" />
            </div>
            <main class="flex-1 overflow-auto">
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
