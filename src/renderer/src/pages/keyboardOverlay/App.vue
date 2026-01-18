<template>
  <div
    class="pointer-events-none fixed inset-0 flex items-end justify-start p-4"
    :style="{ background: 'transparent' }"
  >
    <Transition name="panel-fade" appear>
      <div
        v-show="displayedKeys.length > 0"
        class="flex flex-col-reverse items-start gap-3 overflow-hidden rounded-2xl border p-6 px-8 backdrop-blur-xl"
        :style="{
          ...overlayPanelStyle,
          minWidth: '180px',
          maxWidth: '100%',
          width: 'auto',
          maxHeight: '180px',
        }"
      >
        <TransitionGroup
          name="key-fade"
          tag="div"
          class="flex w-full flex-col gap-3"
        >
          <Badge
            v-for="key in displayedKeys"
            :key="key.id"
            variant="secondary"
            class="shrink-0 justify-center overflow-hidden rounded-xl text-center font-[system-ui] font-bold tracking-wide break-all backdrop-blur-sm hover:-translate-y-0.5"
            :class="getKeyClasses(key.name)"
            :style="{
              ...keyBadgeStyle,
              opacity: key.opacity,
              fontSize: getKeyFontSize(key.name),
              wordBreak: 'break-all',
              whiteSpace: 'normal',
              lineHeight: '1.2',
              ...getKeyDimensions(key.name),
            }"
          >
            <span :style="keyTextStyle">{{ key.name }}</span>
          </Badge>
        </TransitionGroup>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@renderer/composables/useTheme';
import { Badge } from '@shadcn/ui/badge';
import { ref, onMounted, computed } from 'vue';

interface KeyPress {
  id: number;
  name: string;
  opacity: number;
  timer?: number;
}

const displayedKeys = ref<KeyPress[]>([]);
let keyIdCounter = 0;

// 使用主题系统
const { theme, themeColor } = useTheme();

// 计算样式
const overlayPanelStyle = computed(() => {
  const isDark =
    theme.value === 'dark' ||
    (theme.value === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    return {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      boxShadow:
        '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      borderRadius: '16px', // 确保圆角
      overflow: 'hidden', // 确保内容不会超出圆角边界
    };
  } else {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      boxShadow:
        '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      borderRadius: '16px', // 确保圆角
      overflow: 'hidden', // 确保内容不会超出圆角边界
    };
  }
});

const keyBadgeStyle = computed(() => {
  const isDark =
    theme.value === 'dark' ||
    (theme.value === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  // 获取主题颜色
  const primaryColor = getThemeColor();

  if (isDark) {
    return {
      backgroundColor: `${primaryColor}20`, // 20% opacity
      borderColor: `${primaryColor}40`,
      color: '#ffffff',
      boxShadow:
        '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      borderRadius: '12px', // 确保按键圆角
      overflow: 'hidden', // 确保文字不会超出圆角边界
    };
  } else {
    return {
      backgroundColor: `${primaryColor}15`,
      borderColor: `${primaryColor}30`,
      color: '#000000',
      boxShadow:
        '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      borderRadius: '12px', // 确保按键圆角
      overflow: 'hidden', // 确保文字不会超出圆角边界
    };
  }
});

const keyTextStyle = computed(() => {
  const isDark =
    theme.value === 'dark' ||
    (theme.value === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return {
    textShadow: isDark
      ? '0 1px 2px rgba(0, 0, 0, 0.5)'
      : '0 1px 2px rgba(255, 255, 255, 0.8)',
  };
});

// 获取主题颜色的RGB值
function getThemeColor(): string {
  const colorMap: Record<string, string> = {
    violet: '#8b5cf6',
    pink: '#ec4899',
    rose: '#f43f5e',
    'sky-blue': '#0ea5e9',
    'deep-blue': '#3b82f6',
    green: '#10b981',
    'deep-green': '#059669',
    orange: '#f97316',
    yellow: '#eab308',
    zinc: '#71717a',
    neutral: '#737373',
    slate: '#64748b',
    gray: '#6b7280',
  };

  return colorMap[themeColor.value] || colorMap['violet'];
}

// 根据按键长度动态调整字体大小
function getKeyFontSize(keyName: string): string {
  const length = keyName.length;

  if (length <= 3) {
    return '24px'; // 短按键，如 A, F1, Esc
  } else if (length <= 8) {
    return '20px'; // 中等长度，如 Ctrl+C, Alt+Tab
  } else if (length <= 15) {
    return '18px'; // 长按键，如 Ctrl+Shift+A
  } else {
    return '16px'; // 超长按键，如 Ctrl+Shift+Alt+X
  }
}

// 根据按键长度决定样式类
function getKeyClasses(keyName: string): string {
  const length = keyName.length;

  if (length <= 1) {
    // 单个字符 - 正方形
    return 'px-4 py-4';
  } else if (length <= 3) {
    // 短按键 - 小长方形
    return 'px-5 py-4';
  } else {
    // 长按键 - 长方形
    return 'px-7 py-4';
  }
}

// 根据按键长度决定尺寸
function getKeyDimensions(keyName: string): Record<string, string> {
  const length = keyName.length;

  if (length <= 1) {
    // 单个字符 - 正方形 (56x56px)
    return {
      minWidth: '56px',
      minHeight: '56px',
      width: '56px',
      height: '56px',
    };
  } else if (length <= 3) {
    // 短按键 - 小长方形
    return {
      minWidth: '72px',
      minHeight: '56px',
      height: '56px',
    };
  } else {
    // 长按键 - 长方形
    return {
      minWidth: '96px',
      maxWidth: '240px',
      minHeight: '56px',
      height: '56px',
    };
  }
}

// 监听键盘按键事件
onMounted(() => {
  window.electronAPI.onKeyPress((keyName: string) => {
    console.log('[KeyboardOverlay] Key pressed:', keyName);
    console.log(
      '[KeyboardOverlay] Current displayed keys:',
      displayedKeys.value.length,
    );

    // 创建新的按键显示
    const keyPress: KeyPress = {
      id: keyIdCounter++,
      name: keyName,
      opacity: 1,
    };

    // 将新按键添加到数组末尾，这样在flex-col布局中会显示在底部（最新位置）
    displayedKeys.value.push(keyPress);
    console.log(
      '[KeyboardOverlay] Added key, total keys:',
      displayedKeys.value.length,
    );

    // 动态管理显示的按键数量，确保不超出窗口高度
    const maxKeys = getMaxDisplayKeys();
    if (displayedKeys.value.length > maxKeys) {
      // 移除最旧的按键（数组开头的按键）
      const removed = displayedKeys.value.splice(
        0,
        displayedKeys.value.length - maxKeys,
      );
      console.log('[KeyboardOverlay] Removed excess keys:', removed.length);
    }

    // 1.5 秒后开始淡出
    setTimeout(() => {
      const index = displayedKeys.value.findIndex((k) => k.id === keyPress.id);
      if (index !== -1) {
        displayedKeys.value[index].opacity = 0;
        console.log('[KeyboardOverlay] Fading out key:', keyPress.name);
      }
    }, 1500);

    // 2.2 秒后移除（给透明度动画时间）
    setTimeout(() => {
      const index = displayedKeys.value.findIndex((k) => k.id === keyPress.id);
      if (index !== -1) {
        displayedKeys.value.splice(index, 1);
        console.log('[KeyboardOverlay] Removed key:', keyPress.name);
      }
    }, 2200);
  });
});

// 根据当前显示的按键估算最多能显示的数量
function getMaxDisplayKeys(): number {
  const containerMaxHeight = 200; // 容器最大高度 (增加了20px)
  const keyHeight = 62; // 估算每个按键的高度（包括间距，从56px + 6px gap）
  const padding = 48; // 容器内边距 (p-6 = 24px * 2)

  const availableHeight = containerMaxHeight - padding;
  const maxKeys = Math.floor(availableHeight / keyHeight);

  // 至少显示2个，最多显示4个
  return Math.max(2, Math.min(4, maxKeys));
}
</script>

<style>
body {
  background: transparent !important;
  overflow: hidden;
}

#app {
  background: transparent !important;
}
</style>

<style scoped>
/* 面板显示/隐藏动画 */
.panel-fade-enter-active {
  transition: all 0.3s ease-out;
}

.panel-fade-leave-active {
  transition: all 0.15s ease-in;
}

.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.panel-fade-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.panel-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

/* 按键动画 */
.key-fade-enter-active {
  transition: all 0.3s ease-out;
}

.key-fade-leave-active {
  transition: all 0.3s ease-out;
}

.key-fade-move {
  transition: transform 0.3s ease-out;
}

.key-fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.key-fade-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.key-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.key-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}

/* 确保容器和按键的圆角正确显示 */
.rounded-2xl {
  border-radius: 16px !important;
  overflow: hidden !important;
}

.rounded-xl {
  border-radius: 12px !important;
  overflow: hidden !important;
}

/* 确保Badge组件的圆角 */
:deep(.badge) {
  border-radius: 12px !important;
  overflow: hidden !important;
}
</style>
