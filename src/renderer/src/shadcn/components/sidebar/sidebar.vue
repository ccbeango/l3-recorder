<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from '../../ui/sidebar';

defineProps<{
  collapsible?: 'offcanvas' | 'icon' | 'none';
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
}>();
</script>

<template>
  <Sidebar :collapsible="collapsible" :side="side" :variant="variant">
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <slot />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <slot name="footer" />
  </Sidebar>
</template>
