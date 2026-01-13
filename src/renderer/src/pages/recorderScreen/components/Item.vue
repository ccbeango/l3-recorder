<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  icon: Component;
  text: string;
}
const { icon, text } = defineProps<Props>();
</script>

<template>
  <div class="flex cursor-pointer flex-col items-center">
    <component
      :is="icon"
      class="size-7"
      :class="['text-primary']"
      :title="text"
    ></component>
    <div class="mt-1 text-xs" :class="['text-primary']">
      {{ text }}
    </div>
  </div>
</template>
