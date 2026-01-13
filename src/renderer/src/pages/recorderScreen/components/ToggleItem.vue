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

const emits = defineEmits<{
  change: [on: boolean];
}>();

function handleClick() {
  on.value = !on.value;
  emits('change', on.value);
}
</script>

<template>
  <div class="flex cursor-pointer flex-col items-center" @click="handleClick">
    <!-- <DiscIcon class="text-primary size-7" />
    <div class="mt-0.5">录像</div> -->
    <component
      :is="on ? icon : offIcon"
      class="size-7"
      :class="[on ? 'text-primary' : 'text-destructive']"
      :title="on ? text : offText"
    ></component>
    <div
      class="mt-1 text-xs"
      :class="[on ? 'text-primary' : 'text-destructive']"
    >
      {{ on ? text : offText }}
    </div>
  </div>
</template>
