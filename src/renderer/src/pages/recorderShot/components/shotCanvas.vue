<script setup lang="ts">
import type { Bounds, Point } from '../types';

import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';

import { useRecorderShotsInjection } from '../composable/useShotContext';
import { getPoints, getBoundsByPoints2 } from '../utils';

enum ResizePoints {
  ResizeTop = 'top',
  ResizetopRight = 'top-right',
  ResizeRight = 'right',
  ResizeRightBottom = 'right-bottom',
  ResizeBottom = 'bottom',
  ResizeBottomLeft = 'bottom-left',
  ResizeLeft = 'left',
  ResizeLeftTop = 'left-top',
  Move = 'move',
}

enum Borders {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

const borders = [Borders.Top, Borders.Right, Borders.Bottom, Borders.Left];

const resizePoints = [
  ResizePoints.ResizeTop,
  ResizePoints.ResizetopRight,
  ResizePoints.ResizeRight,
  ResizePoints.ResizeRightBottom,
  ResizePoints.ResizeBottom,
  ResizePoints.ResizeBottomLeft,
  ResizePoints.ResizeLeft,
  ResizePoints.ResizeLeftTop,
];

const {
  url,
  width,
  height,
  imageEl,
  bounds,
  setBounds,
  cursor,
  history,
  operation,
} = useRecorderShotsInjection();

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef');
const ctxRef = ref<CanvasRenderingContext2D | null>(null);

const resizeOrMoveRef = ref<string>();
const mouseDownPoint = ref<Point | null>(null);
const mouseDownBounds = ref<Bounds | null>(null);

const isCanResize = computed(
  () => bounds.value && !history.value.stack.length && !operation.value,
);

const updateBounds = (event: MouseEvent) => {
  if (
    !resizeOrMoveRef.value ||
    !mouseDownPoint.value ||
    !mouseDownBounds.value ||
    !bounds.value
  ) {
    return;
  }
  const points = getPoints(
    event,
    resizeOrMoveRef.value,
    mouseDownPoint.value,
    mouseDownBounds.value,
  );

  setBounds(
    getBoundsByPoints2(
      points[0],
      points[1],
      bounds.value,
      width.value,
      height.value,
      resizeOrMoveRef.value,
    ),
  );
};

const onMousedown = (e: MouseEvent, resizeOrMove: string) => {
  if (e.button !== 0 || !bounds.value) {
    return;
  }
  if (!operation.value) {
    resizeOrMoveRef.value = resizeOrMove;
    mouseDownPoint.value = {
      x: e.clientX,
      y: e.clientY,
    };
    mouseDownBounds.value = {
      x: bounds.value.x,
      y: bounds.value.y,
      width: bounds.value.width,
      height: bounds.value.height,
    };
  }
};

const onMouseMove = (event: MouseEvent) => {
  if (!operation.value) {
    if (
      !resizeOrMoveRef.value ||
      !mouseDownPoint.value ||
      !mouseDownBounds.value
    ) {
      return;
    }
    updateBounds(event);
  } else {
    // console.log('onMouseMove', operation.value);
  }
};
const onMouseUp = (event: MouseEvent) => {
  if (!operation.value) {
    if (
      !resizeOrMoveRef.value ||
      !mouseDownPoint.value ||
      !mouseDownBounds.value
    ) {
      return;
    }
    updateBounds(event);
    resizeOrMoveRef.value = undefined;
    mouseDownPoint.value = null;
    mouseDownBounds.value = null;
  } else {
    // console.log('onMouseUp', operation.value);
  }
};

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
});

watch([bounds, imageEl], () => {
  if (!bounds.value) {
    ctxRef.value = null;
    return;
  }

  if (!ctxRef.value && canvasRef.value) {
    ctxRef.value = canvasRef.value.getContext('2d');
  }
});

defineExpose({
  ctxRef: ctxRef.value,
});
</script>

<template>
  <div
    class="absolute top-0 left-0 will-change-[width,height,transform]"
    :style="{
      width: bounds ? `${bounds.width}px` : 0,
      height: bounds ? `${bounds.height}px` : 0,
      transform: bounds ? `translate(${bounds.x}px, ${bounds.y}px)` : 'none',
    }"
  >
    <div role="body" class="absolute inset-0 size-full overflow-hidden">
      <img
        class="image-rendering-optimize max-w-[unset] border-none will-change-transform outline-none"
        :src="url"
        :style="{
          width: `${width}px`,
          height: `${height}px`,
          transform: bounds
            ? `translate(${-bounds.x}px, ${-bounds.y}px)`
            : 'none',
        }"
      />
      <canvas
        ref="canvasRef"
        class="absolute inset-0 size-full will-change-[width,height]"
        :width="bounds?.width || 0"
        :height="bounds?.height || 0"
      />
    </div>
    <div
      role="mask"
      class="absolute inset-0 size-full overflow-hidden"
      :style="{ cursor }"
      @mousedown="(e) => onMousedown(e, 'move')"
    >
      <div
        v-if="isCanResize"
        role="size-show"
        class="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-xs bg-black/80 px-1 py-0.75 text-xs whitespace-nowrap text-white"
      >
        {{ bounds?.width }} X {{ bounds?.height }}
      </div>
    </div>

    <template v-if="isCanResize">
      <div
        v-for="border in borders"
        :key="border"
        role="canvas-boder"
        :class="`shot-border-${border}`"
      ></div>
      <div
        v-for="point in resizePoints"
        :key="point"
        role="canvas-point"
        :class="`shot-point-${point}`"
        @mousedown="(e) => onMousedown(e, point)"
      ></div>
    </template>
  </div>
</template>
