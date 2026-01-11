<script setup lang="ts">
import type { Bounds, Point } from '../types';

import { XIcon, CheckIcon, RefreshCcwIcon } from '@icons';
import { L3IconButton } from '@shadcn';
import { ref, useTemplateRef, watch } from 'vue';

import { useRecorderShotsInjection } from '../composable/useShotContext';

const elRef = useTemplateRef('elRef');
const operationsRect = ref<Bounds | null>(null);
const position = ref<Point | null>(null);

const { width, height, bounds, setBounds } = useRecorderShotsInjection();

watch(
  () => bounds.value,
  () => {
    if (!bounds.value || !elRef.value) {
      return;
    }

    const elRect = elRef.value.getBoundingClientRect();

    // 计算右下角位置
    let xBottomRight = bounds.value.x + bounds.value.width - elRect.width;
    let yBottomRight = bounds.value.y + bounds.value.height + 10;

    // 计算右上角位置
    let xTopRight = bounds.value.x + bounds.value.width - elRect.width;
    let yTopRight = bounds.value.y - elRect.height - 10;

    let x = xBottomRight;
    let y = yBottomRight;

    // 边界检查
    if (x < 0) {
      x = 0;
    }

    if (x > width.value - elRect.width) {
      x = width.value - elRect.width;
    }

    if (y < 0) {
      y = 0;
    }

    if (y > height.value - elRect.height) {
      y = height.value - elRect.height;
    }

    // 检查右下角是否会导致重叠
    const isOverlapBottomRight = y < bounds.value.y + bounds.value.height + 10;
    // 如果右下角会重叠，则使用右上角
    if (isOverlapBottomRight) {
      x = xTopRight;
      y = yTopRight;
    }

    // 小数存在精度问题
    if (
      !position.value ||
      Math.abs(position.value.x - x) > 1 ||
      Math.abs(position.value.y - y) > 1
    ) {
      position.value = {
        x,
        y,
      };
    }

    // 小数存在精度问题
    if (
      !operationsRect.value ||
      Math.abs(operationsRect.value.x - elRect.x) > 1 ||
      Math.abs(operationsRect.value.y - elRect.y) > 1 ||
      Math.abs(operationsRect.value.width - elRect.width) > 1 ||
      Math.abs(operationsRect.value.height - elRect.height) > 1
    ) {
      operationsRect.value = {
        x: elRect.x,
        y: elRect.y,
        width: elRect.width,
        height: elRect.height,
      };
    }
  },
);

function handleCancel() {
  window.electronAPI.sendRsSelectAreaClose();
  console.log('handleCancel');
}
function handleRetry() {
  setBounds(null);
}
function handleConfirm() {
  // 关闭区域选择窗口
  window.electronAPI.sendRsSelectAreaClose();
  // 打开区域录制窗口
  window.electronAPI.sendRsOpenWin({ ...(bounds.value as Bounds) });
}
</script>

<template>
  <div
    v-if="bounds"
    ref="elRef"
    role="operations"
    class="absolute top-0 left-0 will-change-transform"
    :style="{
      visibility: position ? 'visible' : 'hidden',
      transform: `translate(${position?.x ?? 0}px, ${position?.y ?? 0}px)`,
    }"
    @contextmenu.prevent.stop
    @dblclick.stop
  >
    <div
      role="buttons"
      class="flex items-center overflow-hidden rounded-xs border border-black/30 bg-white p-1"
    >
      <L3IconButton :rounded="false" @click="handleCancel">
        <XIcon class="size-5" />
      </L3IconButton>
      <L3IconButton :rounded="false" @click="handleRetry">
        <RefreshCcwIcon class="size-4" />
      </L3IconButton>
      <L3IconButton :rounded="false" @click="handleConfirm">
        <CheckIcon class="size-5" />
      </L3IconButton>
    </div>
  </div>
</template>
