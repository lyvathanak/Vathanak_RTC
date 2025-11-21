<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

import { ChevronRight, type LucideIcon } from 'lucide-vue-next'

defineProps<{
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    class?: string
    items?: {
      title: string
      url: string
    }[]
  }[]
}>()
</script>

<template>
  <SidebarGroup>
    <SidebarMenu>
      <template v-for="item in items" :key="item.title">
        <!-- Collapsible item (has sub-items) -->
        <Collapsible
          v-if="item.items && item.items.length"
          as-child
          :default-open="item.isActive"
          class="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger as-child>
              <SidebarMenuButton :tooltip="item.title">
                <component
                  :is="item.icon"
                  v-if="item.icon"
                  class="w-5 h-5 shrink-0"
                  :class="item.isActive ? 'text-white' : 'text-white/80'"
                />
                <span
                  class="truncate"
                  :class="[item.isActive ? 'text-white font-medium' : 'text-white/80', item.class]"
                >
                  {{ item.title }}
                </span>
                <ChevronRight
                  class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 w-4 h-4 shrink-0"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem
                  v-for="subItem in item.items"
                  :key="subItem.title"
                >
                  <SidebarMenuSubButton as-child>
                    <router-link
                      :to="subItem.url"
                      class="text-white/80 hover:text-white hover:bg-white/10 px-2 py-1 block rounded transition-colors truncate"
                    >
                      <span>{{ subItem.title }}</span>
                    </router-link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        <!-- Regular item (no sub-items) -->
        <SidebarMenuItem v-else>
          <SidebarMenuButton :tooltip="item.title" as-child>
            <router-link
              :to="item.url"
              class="flex items-center gap-3 w-full px-3 py-2 rounded transition-colors group"
              :class="item.isActive ? 'bg-white/20' : 'hover:bg-white/10'"
            >
              <component
                :is="item.icon"
                v-if="item.icon"
                class="w-5 h-5 shrink-0 text-white"
              />
              <span
                class="truncate transition-opacity duration-200 text-white"
                :class="[
                  item.isActive ? 'font-semibold' : 'font-normal',
                  item.class,
                  'group-data-[collapsible=icon]/sidebar:opacity-0'
                ]"
              >
                {{ item.title }}
              </span>
            </router-link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
