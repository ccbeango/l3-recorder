import type { ThemeColor } from '@/types';

import { ref, onMounted, onUnmounted, watch } from 'vue';

export function useTheme() {
  const theme = ref<'light' | 'dark' | 'system'>('system');

  const themeColor = ref<ThemeColor>('violet');

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = window.document.documentElement;
    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const applyThemeColor = (newThemeColor: ThemeColor) => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', newThemeColor);
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    theme.value = newTheme;
  };

  const setThemeColor = (newThemeColor: ThemeColor) => {
    themeColor.value = newThemeColor;
  };

  watch(theme, (newTheme) => {
    window.electronAPI.sendThemeSet(newTheme);
    applyTheme(newTheme);
  });

  watch(themeColor, (newThemeColor) => {
    window.electronAPI.sendThemeColorSet(newThemeColor);
    applyThemeColor(newThemeColor);
  });

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    if (theme.value !== newTheme) {
      theme.value = newTheme;
      applyTheme(newTheme);
    }
  };

  const handleThemeColorChange = (newThemeColor: ThemeColor) => {
    if (themeColor.value !== newThemeColor) {
      themeColor.value = newThemeColor;
      applyThemeColor(newThemeColor);
    }
  };

  onMounted(async () => {
    // 获取当前主题
    const currentTheme = await window.electronAPI.invokeThemeGet();

    theme.value = currentTheme;
    applyTheme(currentTheme);

    // 获取当前主题颜色
    const currentThemeColor = await window.electronAPI.invokeThemeColorGet();
    themeColor.value = currentThemeColor;
    applyThemeColor(currentThemeColor);

    // 监听主题变化
    window.electronAPI.onThemeChange(handleThemeChange);

    // 监听主题颜色变化
    window.electronAPI.onThemeColorChange(handleThemeColorChange);

    // 监听系统主题变化（如果是跟随系统模式）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (theme.value === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', listener);

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', listener);
    });
  });

  return {
    theme,
    setTheme,
    themeColor,
    setThemeColor,
  };
}
