<script setup lang="ts">
import type { Point } from '../types';

import { onMounted, ref, useTemplateRef, watch } from 'vue';

import { useRecorderShotsInjection } from '../composable/useShotContext';

interface Props {
  x: number;
  y: number;
}

const { x, y } = defineProps<Props>();

// 基础大小
const magnifierWidth = 100;
const magnifierHeight = 80;
// const magnification = 2; // 放大比例

const { width, height, imageEl } = useRecorderShotsInjection();

const position = ref<Point | null>(null);
const rgb = ref('000000');

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef');
const ctxRef = ref<CanvasRenderingContext2D | null>(null);
const elRef = useTemplateRef<HTMLDivElement>('elRef');

// 计算后的画布大小
// const canvasWidth = computed(() => magnifierWidth * magnification);
// const canvasHeight = computed(() => magnifierHeight * magnification);

// 计算位置
const updatePosition = () => {
  if (!elRef.value) {
    return;
  }

  const elRect = elRef.value.getBoundingClientRect();
  let tx = x + 20;
  let ty = y + 20;

  if (tx + elRect.width > width.value) {
    tx = x - elRect.width - 20;
  }
  if (ty + elRect.height > height.value) {
    ty = y - elRect.height - 20;
  }

  if (tx < 0) {
    tx = 0;
  }
  if (ty < 0) {
    ty = 0;
  }

  position.value = {
    x: tx,
    y: ty,
  };
};

// 更新画布和颜色
const updateCanvas = () => {
  if (!imageEl.value || !canvasRef.value) {
    ctxRef.value = null;
    return;
  }

  if (!ctxRef.value) {
    ctxRef.value = canvasRef.value.getContext('2d');
  }
  if (!ctxRef.value) {
    return;
  }

  const ctx = ctxRef.value;

  // 缩放比例
  const rx = imageEl.value.naturalWidth / width.value;
  const ry = imageEl.value.naturalHeight / height.value;

  /** 原图大小绘制 */
  ctx.clearRect(0, 0, magnifierWidth, magnifierHeight);
  ctx.drawImage(
    imageEl.value,
    x * rx - magnifierWidth / 2,
    y * ry - magnifierHeight / 2,
    magnifierWidth,
    magnifierHeight,
    0,
    0,
    magnifierWidth,
    magnifierHeight,
  );
  // 颜色
  const { data } = ctx.getImageData(
    Math.floor(magnifierWidth / 2),
    Math.floor(magnifierHeight / 2),
    1,
    1,
  );

  /** 放大两倍大小绘制 */
  // ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
  // // 计算源图像区域的尺寸（缩小以在画布上显示时被放大
  // const sourceWidth = magnifierWidth / magnification;
  // const sourceHeight = magnifierHeight / magnification;
  // // 绘制放大后的图像
  // ctx.drawImage(
  //   imageEl.value,
  //   x * rx - sourceWidth / 2, // 源图像x坐标
  //   y * ry - sourceHeight / 2, // 源图像y坐标
  //   sourceWidth, // 源图像宽度（原图的1/2）
  //   sourceHeight, // 源图像高度（原图的1/2）
  //   0, // 画布x坐标
  //   0, // 画布y坐标
  //   canvasWidth.value, // 画布宽度（放大2倍）
  //   canvasHeight.value, // 画布高度（放大2倍）
  // );

  // // 获取中心点的颜色（调整坐标，因为画布尺寸变了）
  // const centerX = Math.floor(canvasWidth.value / 2);
  // const centerY = Math.floor(canvasHeight.value / 2);
  // const { data } = ctx.getImageData(centerX, centerY, 1, 1);

  const hex = Array.from(data.slice(0, 3))
    .map((val) => (val >= 16 ? val.toString(16) : `0${val.toString(16)}`))
    .join('')
    .toUpperCase();

  rgb.value = hex;
};

// 监听位置变化
watch(
  () => [width.value, height.value, x, y],
  () => {
    updatePosition();
  },
  { immediate: true },
);

// 监听图像和位置变化以更新画布
watch(
  () => [width.value, height.value, imageEl.value, x, y],
  () => {
    updateCanvas();
  },
  { immediate: true },
);

// 组件挂载后确保位置正确
onMounted(() => {
  updatePosition();
  updateCanvas();
});
</script>

<template>
  <div
    ref="elRef"
    role="magnifier"
    class="absolute top-0 left-0 w-25 bg-amber-50 shadow-md select-none"
    :style="{
      transform: `translate(${position?.x}px, ${position?.y}px)`,
    }"
  >
    <div role="body" class="shot-magnifier-cross">
      <canvas
        ref="canvasRef"
        role="magnifier-canvas"
        :width="magnifierWidth"
        :height="magnifierHeight"
      />
    </div>
    <div
      role="footer"
      class="h-10 overflow-hidden bg-gray-500 p-1 text-center text-xs whitespace-nowrap text-white"
    >
      <div role="item" class="">pos: ({{ x }},{{ y }})</div>
      <div role="item" class="">rgb: #{{ rgb }}</div>
    </div>
  </div>
</template>
