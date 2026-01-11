<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue';

import ShotBackground from './components/shotBackground.vue';
import ShotCanvas from './components/shotCanvas.vue';
import ShotOperations from './components/shotOperations.vue';
import useGetLoadedImage from './composable/useGetLoadedImage';
import { useRecorderShotsProvider } from './composable/useShotContext';

const canvasRef = useTemplateRef<typeof ShotCanvas>('canvasRef');

const winSize = computed(() => ({
  width: window.innerWidth,
  height: window.innerHeight,
}));

const imageUrl = ref<string>('');
const imageEl = useGetLoadedImage(imageUrl);

const { updateStore } = useRecorderShotsProvider({
  width: winSize.value.width,
  height: winSize.value.height,
  canvasRef,
  imageEl,
});

onMounted(() => {
  console.log('window.electronAPI', window.electronAPI);
  window.electronAPI.onRsSelectAreaShowWin((img) => {
    updateStore({ url: img });
    imageUrl.value = img;
  });
});
</script>

<template>
  <div
    class="size-full overflow-hidden"
    :style="{ width: winSize.width, height: winSize.height }"
    @contextmenu="updateStore({ bounds: null })"
  >
    <ShotBackground />
    <ShotCanvas ref="canvasRef" />
    <ShotOperations />
  </div>
</template>

<style>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
