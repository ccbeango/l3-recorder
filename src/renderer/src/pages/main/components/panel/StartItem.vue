<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  title: string;
  icon: Component;
}

const { title, icon } = defineProps<Props>();

// const emits = defineEmits<{ click: [] }>();
</script>

<template>
  <div
    class="bg-card flex h-27.5 w-30 flex-col rounded-lg border shadow-xl duration-150 ease-in-out hover:-translate-y-1 hover:shadow-xl/20"
  >
    <!-- <SvgAddIcon class="mt-6 ml-6 size-10 rounded-md" /> -->
    <component :is="icon" class="mt-6 ml-6 size-10 rounded-md"></component>
    <span class="mt-2 ml-6 text-sm">{{ title }}</span>
  </div>
</template>
