<script setup lang="ts">
import { MoveIcon } from '@icons';
import { cn } from '@shadcn';
import { onMounted, useTemplateRef } from 'vue';

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
});

const corners = ['br', 'bl', 'tl', 'tr'];
</script>

<template>
  <div class="backgr fixed inset-0 overflow-hidden">
    <div
      ref="elRef"
      class="h-[calc(100%-1px)] w-[calc(100%-1px)] border border-blue-300"
    >
      <div
        v-for="co in corners"
        :key="co"
        role="rb-move"
        :class="
          cn('absolute z-40 overflow-hidden bg-blue-300', {
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
#app {
  width: 100vw;
  height: 100vh;
}
</style>
