<script setup lang="ts">
import { defineProps, withDefaults, computed } from "vue";
import { useRoute } from "vue-router";
import NavMain from "@/components/features/NavMain.vue";

import {
  Sidebar,
  SidebarContent,

} from "@/components/ui/sidebar";
import {

  Book,
  CalendarDays,
  Gauge,
  HomeIcon,
  User,
  Clock,
} from "lucide-vue-next";
import SidebarTrigger from "../ui/sidebar/SidebarTrigger.vue";

const props = withDefaults(
  defineProps<{
    collapsible?: "offcanvas" | "icon" | "none";
    isOpen?: boolean;
  }>(),
  {
    collapsible: "icon",
    isOpen: false,
  }
);

const route = useRoute();

const data = computed(() => {
  const currentLang = route.params.lang || 'en';
  const currentPath = route.path;
  
  return {
    navMain: [
      {
        title: "Overview",
        url: `/${currentLang}/student/overview`,
        icon: Gauge,
        isActive: currentPath.includes('/student/overview'),
      },
      {
        title: "Academic Information",
        url: `/${currentLang}/student/academic-info`,
        icon: Book,
        isActive: currentPath.includes('/student/academic-info'),
      },
      {
        title: "Leave Request",
        url: `/${currentLang}/student/leave-request`,
        icon: Clock,
        isActive: currentPath.includes('/student/leave-request'),
      },
    ],
  };
});
</script>

<template>
  <Sidebar 
    :collapsible="props.collapsible"
    :default-open="false"
    variant="sidebar"
    class="border-r border-gray-200 min-w-0 flex-shrink-0"
  >
    <SidebarContent class="bg-[#235AA6]">
      <!-- Sidebar Header -->
      <div class="flex items-center p-3 border-b border-white/20">
        <SidebarTrigger class="text-white hover:bg-white/10" />
        <!-- Show title when sidebar is expanded -->
        <div class="text-white text-xl font-semibold pl-2">
          Your Information
        </div>
      </div>
      
      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto">
        <NavMain :items="data.navMain" />
      </div>
    </SidebarContent>
  </Sidebar>
</template>
