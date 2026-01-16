<script setup lang="ts">
import { useTheme } from '@renderer/composables/useTheme';
import { L3Select, L3Switch, L3Label } from '@shadcn';
import { ref } from 'vue';

const language = ref('zh-CN');
const { theme, themeColor } = useTheme();
const autoStart = ref(false);

const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
];

const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '跟随系统', value: 'system' },
];

const themeColorOptions = [
  { label: '紫罗兰', value: 'violet' },
  { label: '粉色', value: 'pink' },
  { label: '玫瑰', value: 'rose' },
  { label: '天蓝', value: 'sky-blue' },
  { label: '深蓝', value: 'deep-blue' },
  { label: '绿色', value: 'green' },
  { label: '深绿', value: 'deep-green' },
  { label: '橙色', value: 'orange' },
  { label: '黄色', value: 'yellow' },
  { label: '锌灰', value: 'zinc' },
  { label: '中性灰', value: 'neutral' },
  { label: '石板灰', value: 'slate' },
  { label: '灰色', value: 'gray' },
];
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="mb-4 text-lg font-semibold">常规设置</h2>
      <div class="space-y-2">
        <div
          class="hover:bg-accent/50 dark:border-border dark:bg-muted/30 dark:hover:bg-muted/50 flex items-center justify-between rounded-md border px-4 py-3 transition-colors"
        >
          <L3Label class="flex flex-col items-start gap-1 text-left">
            <span class="font-medium">语言</span>
            <span class="text-muted-foreground text-sm font-normal">
              选择应用显示语言
            </span>
          </L3Label>
          <L3Select
            v-model="language"
            class="w-[180px]"
            placeholder="选择语言"
            :options="languageOptions"
          />
        </div>

        <div
          class="hover:bg-accent/50 dark:border-border dark:bg-muted/30 dark:hover:bg-muted/50 flex items-center justify-between rounded-md border px-4 py-3 transition-colors"
        >
          <L3Label class="flex flex-col items-start gap-1 text-left">
            <span class="font-medium">主题</span>
            <span class="text-muted-foreground text-sm font-normal">
              选择应用外观主题
            </span>
          </L3Label>
          <L3Select
            v-model="theme"
            class="w-[180px]"
            placeholder="选择主题"
            :options="themeOptions"
          />
        </div>

        <div
          class="hover:bg-accent/50 dark:border-border dark:bg-muted/30 dark:hover:bg-muted/50 flex items-center justify-between rounded-md border px-4 py-3 transition-colors"
        >
          <L3Label class="flex flex-col items-start gap-1 text-left">
            <span class="font-medium">主题颜色</span>
            <span class="text-muted-foreground text-sm font-normal">
              选择应用主题颜色
            </span>
          </L3Label>
          <L3Select
            v-model="themeColor"
            class="w-[180px]"
            placeholder="选择主题颜色"
            :options="themeColorOptions"
          />
        </div>

        <div
          class="hover:bg-accent/50 dark:border-border dark:bg-muted/30 dark:hover:bg-muted/50 flex items-center justify-between rounded-md border px-4 py-3 transition-colors"
        >
          <L3Label class="flex flex-col items-start gap-1 text-left">
            <span class="font-medium">开机自启动</span>
            <span class="text-muted-foreground text-sm font-normal">
              开机时自动启动应用
            </span>
          </L3Label>
          <L3Switch v-model:checked="autoStart" />
        </div>
      </div>
    </div>
  </div>
</template>
