<script setup lang="ts">
import { ref } from 'vue';
import {
  L3Select,
  L3Option,
  L3Switch,
  L3Input,
  L3Button,
  L3Label,
} from '@shadcn';

const quality = ref('high');
const fps = ref('60');
const audioSource = ref('system');
const savePath = ref('C:/Users/用户名/Videos');
const showCursor = ref(true);
const highlightClicks = ref(false);

const qualityOptions = [
  { label: '标清', value: 'low' },
  { label: '高清', value: 'medium' },
  { label: '超清', value: 'high' },
  { label: '原画', value: 'ultra' },
];

const fpsOptions = [
  { label: '30 FPS', value: '30' },
  { label: '60 FPS', value: '60' },
];

const audioSourceOptions = [
  { label: '系统声音', value: 'system' },
  { label: '麦克风', value: 'mic' },
  { label: '系统+麦克风', value: 'both' },
  { label: '静音', value: 'none' },
];
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="mb-4 text-lg font-semibold">录制设置</h2>
      <div class="space-y-2">
        <div
          class="hover:bg-accent/50 flex items-center justify-between rounded-md border px-4 py-3 transition-colors"
        >
          <L3Label class="flex flex-col items-start gap-1 text-left">
            <span class="font-medium">视频质量</span>
            <span class="text-muted-foreground text-sm font-normal">
              选择录制视频的画质
            </span>
          </L3Label>
          <L3Select
            v-model="quality"
            class="w-[180px]"
            placeholder="选择视频质量"
            :options="qualityOptions"
          />
        </div>

        <div
          class="hover:bg-accent/50 flex items-center justify-between rounded-md border px-4 py-3 transition-colors"
        >
          <L3Label class="flex flex-col items-start gap-1 text-left">
            <span class="font-medium">帧率</span>
            <span class="text-muted-foreground text-sm font-normal">
              设置录制帧率
            </span>
          </L3Label>
          <L3Select
            v-model="fps"
            class="w-[180px]"
            placeholder="选择帧率"
            :options="fpsOptions"
          />
        </div>

        <div
          class="hover:bg-accent/50 flex items-center justify-between rounded-md border px-4 py-3 transition-colors"
        >
          <L3Label class="flex flex-col items-start gap-1 text-left">
            <span class="font-medium">音频源</span>
            <span class="text-muted-foreground text-sm font-normal">
              选择录制的音频来源
            </span>
          </L3Label>
          <L3Select
            v-model="audioSource"
            class="w-[180px]"
            placeholder="选择音频源"
            :options="audioSourceOptions"
          />
        </div>

        <div
          class="hover:bg-accent/50 flex items-center justify-between rounded-md border px-4 py-3 transition-colors"
        >
          <L3Label class="flex flex-col items-start gap-1 text-left">
            <span class="font-medium">保存路径</span>
            <span class="text-muted-foreground text-sm font-normal">
              录制文件的保存位置
            </span>
          </L3Label>
          <div class="flex items-center gap-2">
            <L3Input v-model="savePath" readonly class="w-64" />
            <L3Button variant="outline">浏览</L3Button>
          </div>
        </div>

        <div
          class="hover:bg-accent/50 flex items-center justify-between rounded-md border px-4 py-3 transition-colors"
        >
          <L3Label class="flex flex-col items-start gap-1 text-left">
            <span class="font-medium">显示鼠标光标</span>
            <span class="text-muted-foreground text-sm font-normal">
              录制时是否显示鼠标
            </span>
          </L3Label>
          <L3Switch v-model:checked="showCursor" />
        </div>

        <div
          class="hover:bg-accent/50 flex items-center justify-between rounded-md border px-4 py-3 transition-colors"
        >
          <L3Label class="flex flex-col items-start gap-1 text-left">
            <span class="font-medium">鼠标点击效果</span>
            <span class="text-muted-foreground text-sm font-normal">
              高亮显示鼠标点击位置
            </span>
          </L3Label>
          <L3Switch v-model:checked="highlightClicks" />
        </div>
      </div>
    </div>
  </div>
</template>
