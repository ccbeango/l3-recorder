<script setup lang="ts">
import type { WinName } from '@/types';

import { MinusIcon, SquareIcon, XIcon, CopyIcon } from '@icons';
import { L3IconButton } from '@shadcn';
import { ref } from 'vue';

interface Props {
  closable?: boolean;
  maxable?: boolean;
  minable?: boolean;
  from?: WinName;
}

const {
  maxable = false,
  minable = true,
  closable = true,
  from,
} = defineProps<Props>();

const emits = defineEmits<{
  maximize: [];
  unmaximize: [];
  minimize: [];
  close: [];
}>();

const isMax = ref(false);

function handleMaximize() {
  if (isMax.value) {
    emits('maximize');
  } else {
    emits('unmaximize');
  }

  if (from) {
    window.electronAPI.sendMaxWin(from, !isMax.value);
  }

  isMax.value = !isMax.value;
}

function handleMinimize() {
  emits('minimize');
  window.electronAPI.sendMinWin(from);
}

function handleClose() {
  window.electronAPI.sendCloseWin(from);
  emits('close');
}
</script>

<template>
  <div class="webkit-app-region-drag flex h-7 items-end justify-end px-4">
    <div
      class="webkit-app-region-no-drag flex w-20 items-center justify-end space-x-2"
    >
      <L3IconButton
        v-if="minable"
        class="size-5 rounded-xs"
        @click="handleMinimize"
      >
        <MinusIcon class="size-4" />
      </L3IconButton>
      <L3IconButton
        v-if="maxable && !isMax"
        class="size-5 rounded-xs"
        @click="handleMaximize"
      >
        <SquareIcon class="size-3.5" />
      </L3IconButton>

      <L3IconButton
        v-if="maxable && isMax"
        class="size-5 rounded-xs"
        @click="handleMaximize"
      >
        <CopyIcon class="size-3.5" />
      </L3IconButton>
      <L3IconButton
        v-if="closable"
        class="size-5 rounded-xs"
        @click="handleClose"
      >
        <XIcon class="size-4" />
      </L3IconButton>
    </div>
  </div>
</template>
