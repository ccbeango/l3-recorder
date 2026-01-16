<script setup lang="ts">
import { MoveIcon } from '@icons';
import { useTheme } from '@renderer/composables/useTheme';
import { cn } from '@shadcn';
import { onMounted, ref, useTemplateRef } from 'vue';

useTheme();

const isRecording = ref(false);

function onMouseover() {
  window.electronAPI.sendRsIgnoreMouseEvent(false);
}

const elRef = useTemplateRef('elRef');
onMounted(() => {
  elRef.value?.addEventListener('mouseover', (e: MouseEvent) => {
    if (e.target === elRef.value) {
      window.electronAPI.sendRsIgnoreMouseEvent(true);
    }
  });

  // 监听录制状态变化
  window.electronAPI.onRsRecordingStateChange((recording: boolean) => {
    isRecording.value = recording;
  });
});

const corners = ['br', 'bl', 'tl', 'tr'];
</script>

<template>
  <div class="backgr fixed inset-0 overflow-hidden">
    <div
      ref="elRef"
      class="border-ring dark:border-ring/50 h-[calc(100%-1px)] w-[calc(100%-1px)] border"
    >
      <div
        v-for="co in corners"
        v-show="!isRecording"
        :key="co"
        role="rb-move"
        :class="
          cn('bg-ring dark:bg-ring/80 absolute z-40 overflow-hidden', {
            'top-0 left-0 rounded-br-sm': co === 'br',
            'top-0 right-0 rounded-bl-sm': co === 'bl',
            'right-0 bottom-0 rounded-tl-sm': co === 'tl',
            'bottom-0 left-0 rounded-tr-sm': co === 'tr',
          })
        "
        @mouseover="onMouseover"
      >
        <MoveIcon class="webkit-app-region-drag m-px size-4 text-amber-100" />
      </div>
    </div>
  </div>
</template>

<style>
body {
  background: transparent;
}
#app {
  width: 100vw;
  height: 100vh;
}
</style>
