<script setup lang="ts">
import { SvgAddIcon, SvgCloudVideoIcon } from '@icons';
import { cn } from '@shadcn/utils';

import StartItem from './StartItem.vue';

function handleClick() {
  window.electronAPI.sendRfsOpenWin();
}

// function handleRsClick() {
//   // window.electronAPI.sendRsOpenWin();
//   window.electronAPI.sendRsOpenWin();
// }

function handleRshClick() {
  window.electronAPI.sendMinWin('main');
  window.electronAPI.sendRsSelectAreaOpenWin();
}
</script>

<template>
  <div :class="cn('flex h-full w-full items-center justify-center space-x-4')">
    <StartItem :icon="SvgAddIcon" title="全屏录制" @click="handleClick" />
    <StartItem
      :icon="SvgCloudVideoIcon"
      title="截屏录制"
      @click="handleRshClick"
    />
  </div>
</template>
