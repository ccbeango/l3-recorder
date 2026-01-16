<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  icon: Component;
  offIcon: Component;
  text: string;
  offText: string;
}

const { icon, offIcon, text, offText } = defineProps<Props>();

const on = defineModel<boolean>({ default: true });
</script>

<template>
  <!-- class="rounded-lg px-1 py-2 hover:bg-(--primary)/30" -->
  <div class="flex cursor-pointer flex-col items-center" @click="on = !on">
    <component
      :is="on ? icon : offIcon"
      class="size-5 transition-colors"
      :class="[on ? 'text-primary' : 'text-destructive']"
      :title="on ? text : offText"
    ></component>
    <div v-if="false" class="mt-1 text-xs text-white">
      {{ on ? text : offText }}
    </div>
  </div>
</template>

<style scoped>
body {
  background: transparent;
}
</style>
