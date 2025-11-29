<template>
  <SidebarProvider :default-collapsed="false" :collapsible="'icon'">
    <div class="relative min-h-screen flex">
      
      <HODSidebar />

      <div class="flex-1 min-w-0 flex flex-col">
        <Header />
        
        <main class="flex-1 overflow-y-auto">
          <router-view />
        </main>
        
        <Footer />
      </div>
    </div>
  </SidebarProvider>
</template>

<script setup>
import { useRoute } from "vue-router";
import HODSidebar from "@/components/head-of-departments/HODSidebar.vue";
import Header from "@/components/features/Header.vue";
import Footer from "@/components/features/Footer.vue";
// FIX: Import the SidebarProvider to wrap the entire layout and provide the context
import { SidebarProvider } from "@/components/ui/sidebar"; 

const route = useRoute();
</script>