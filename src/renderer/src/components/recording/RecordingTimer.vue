<script setup lang="ts">
import type { RecordingTimerProps } from './types';

import { computed } from 'vue';

export interface TimerApi {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

interface Props extends RecordingTimerProps {
  api: TimerApi;
}

const { hours, minutes, seconds } = defineProps<Props>();

const stringTimer = (val) => `0${val}`.slice(-2);

const showTime = computed(() => {
  return `${stringTimer(hours)}:${stringTimer(minutes)}:${stringTimer(seconds)}`;
});
</script>

<template>
  <div class="text-xs text-white">
    {{ showTime }}
  </div>
</template>
