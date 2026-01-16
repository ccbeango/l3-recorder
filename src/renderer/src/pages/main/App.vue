<script setup lang="ts">
import { SettingsIcon } from '@icons';
import { useTheme } from '@renderer/composables/useTheme';
import { L3IconButton } from '@shadcn';

import StartPanel from './components/panel/StartPanel.vue';
import { Header } from '../../components/header';

useTheme();

function openSettings() {
  window.electronAPI.sendSettingsOpenWin();
}
</script>

<template>
  <div class="size-full">
    <Header from="main" maxable></Header>
    <div
      class="relative h-[calc(100%-28px)] w-full bg-[url(@renderer/assets/wavy-lines.svg)] bg-cover select-none dark:bg-none"
    >
      <StartPanel />
      <L3IconButton
        class="absolute bottom-2 left-2 size-6 rounded-sm"
        @click="openSettings"
      >
        <SettingsIcon class="size-4" />
      </L3IconButton>
    </div>
  </div>
</template>
