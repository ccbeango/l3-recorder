<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface ClickEffect {
  id: number;
  x: number;
  y: number;
}

const clickEffects = ref<ClickEffect[]>([]);
let clickId = 0;

// 处理全局鼠标点击
const handleGlobalClick = (x: number, y: number) => {
  const effect: ClickEffect = {
    id: clickId++,
    x,
    y,
  };

  clickEffects.value.push(effect);

  // 动画结束后移除效果
  setTimeout(() => {
    clickEffects.value = clickEffects.value.filter(
      (item) => item.id !== effect.id,
    );
  }, 600);
};

onMounted(() => {
  // 监听来自主进程的全局鼠标点击事件
  if (window.electronAPI && window.electronAPI.onMouseClick) {
    window.electronAPI.onMouseClick((x: number, y: number) => {
      handleGlobalClick(x, y);
    });
  }
});

onUnmounted(() => {
  clickEffects.value = [];
});
</script>

<template>
  <div class="mouse-click-overlay">
    <div
      v-for="effect in clickEffects"
      :key="effect.id"
      class="click-ripple"
      :style="{
        left: `${effect.x}px`,
        top: `${effect.y}px`,
      }"
    />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: transparent;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
}
</style>

<style scoped>
.mouse-click-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.click-ripple {
  position: absolute;
  width: 50px;
  height: 50px;
  margin-left: -25px;
  margin-top: -25px;
  border-radius: 50%;
  border: 4px solid rgba(59, 130, 246, 0.9);
  background: rgba(59, 130, 246, 0.25);
  animation: ripple-animation 0.6s ease-out;
  pointer-events: none;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
}

@keyframes ripple-animation {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}
</style>
