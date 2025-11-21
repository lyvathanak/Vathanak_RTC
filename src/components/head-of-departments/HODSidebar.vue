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
  FileText,
  GraduationCap,
  CheckCircle,
  DollarSign,
  BarChart3,
  Users,
  UserCheck,
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
        url: `/${currentLang}/hod/overview`,
        icon: Gauge,
        isActive: currentPath.includes('/hod/overview'),
      },
      {
        title: "Student Management",
        url: `/${currentLang}/hod/student-management`,
        icon: Users,
        isActive: currentPath.includes('/hod/student-management'),
      },
      {
        title: "Teacher Management",
        url: `/${currentLang}/hod/teacher-management`,
        icon: UserCheck,
        isActive: currentPath.includes('/hod/teacher-management'),
      },
      {
        title: "Time Table",
        url: `/${currentLang}/hod/timetable`,
        icon: CalendarDays,
        isActive: currentPath.includes('/hod/timetable'),
      },
      {
        title: "Leave Requests",
        url: `/${currentLang}/hod/leave-requests`,
        icon: Clock,
        isActive: currentPath.includes('/hod/leave-requests'),
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
          HOD Portal
        </div>
      </div>
      
      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto">
        <NavMain :items="data.navMain" />
      </div>
    </SidebarContent>
  </Sidebar>
</template>
