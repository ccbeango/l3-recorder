<script setup lang="ts">
import type { Point } from '../types';

import { onMounted, ref, useTemplateRef } from 'vue';

import { useRecorderShotsInjection } from '../composable/useShotContext';
import { getBoundsByPoints } from '../utils';
import ShotMagnifier from './shotMagnifier.vue';

const isMoved = ref<boolean>(false);
const startPosition = ref<Point | null>(null);
const endPosition = ref<Point | null>(null);
const shotBgRef = useTemplateRef<HTMLDivElement>('shotBgRef');

const { width, height, url, bounds, setBounds, imageEl } =
  useRecorderShotsInjection();

const updateBounds = (p1: Point, p2: Point) => {
  if (!shotBgRef.value) {
    return;
  }
  const { x, y } = shotBgRef.value.getBoundingClientRect();

  setBounds(
    getBoundsByPoints(
      { x: p1.x - x, y: p1.y - y },
      { x: p2.x - x, y: p2.y - y },
      width.value,
      height.value,
    ),
  );
};

const onMouseDown = (event: MouseEvent) => {
  if (startPosition.value || bounds.value || event.button !== 0) {
    return;
  }

  startPosition.value = { x: event.clientX, y: event.clientY };
  isMoved.value = false;
};

const onMouseMove = (event: MouseEvent) => {
  if (shotBgRef.value) {
    const rect = shotBgRef.value.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientY < rect.top ||
      event.clientX > rect.right ||
      event.clientY > rect.bottom
    ) {
      endPosition.value = null;
    } else {
      endPosition.value = {
        x: event.clientX - rect.x,
        y: event.clientY - rect.y,
      };
    }
  }

  if (!startPosition.value) {
    return;
  }
  updateBounds(startPosition.value, {
    x: event.clientX,
    y: event.clientY,
  });
  isMoved.value = true;
};
const onMouseUp = (event: MouseEvent) => {
  if (!startPosition.value) {
    return;
  }

  if (isMoved.value) {
    updateBounds(startPosition.value, {
      x: event.clientX,
      y: event.clientY,
    });
  }
  startPosition.value = null;
  isMoved.value = false;
};

onMounted(() => {
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});
</script>
<template>
  <div
    v-if="imageEl"
    ref="shotBgRef"
    role="shot-bg"
    class="relative size-full cursor-crosshair"
    @mousedown="onMouseDown"
  >
    <img :src="url" class="size-full border-none outline-none" />
    <div class="absolute top-0 right-0 bottom-0 left-0 bg-black/30"></div>
    <ShotMagnifier
      v-if="endPosition && !bounds"
      :x="endPosition.x"
      :y="endPosition.y"
    />
  </div>
</template>
