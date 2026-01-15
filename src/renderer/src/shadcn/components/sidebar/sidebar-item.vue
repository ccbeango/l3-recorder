<script setup lang="ts">
import { SidebarMenuButton, SidebarMenuItem } from '../../ui/sidebar';

defineProps<{
  isActive?: boolean;
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <SidebarMenuItem>
    <SidebarMenuButton :is-active="isActive" @click="$emit('click')">
      <slot />
    </SidebarMenuButton>
  </SidebarMenuItem>
</template>
