<script setup>
import { Menu } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { useSidebar } from "./utils";

const props = defineProps({
  class: { type: null, required: false },
});

const { toggleSidebar } = useSidebar();
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    variant="ghost"
    size="icon"
    :class="cn('w-7', props.class)"
    @click="toggleSidebar"
  >
    <Menu/>
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
