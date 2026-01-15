<script setup lang="ts">
import { ref } from 'vue';
import { L3Button } from '@shadcn';

const shortcuts = ref([
  {
    name: '开始/暂停录制',
    key: 'Ctrl + Shift + R',
    description: '快速开始或暂停当前录制',
  },
  {
    name: '停止录制',
    key: 'Ctrl + Shift + S',
    description: '停止当前录制并保存文件',
  },
  {
    name: '截图',
    key: 'Ctrl + Shift + A',
    description: '截取当前屏幕画面',
  },
  {
    name: '打开设置',
    key: 'Ctrl + ,',
    description: '快速打开设置窗口',
  },
  {
    name: '显示/隐藏主窗口',
    key: 'Ctrl + Shift + H',
    description: '切换主窗口显示状态',
  },
]);

const editingIndex = ref<number | null>(null);

function startEdit(index: number) {
  editingIndex.value = index;
}

function saveEdit() {
  editingIndex.value = null;
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="mb-4 text-lg font-semibold">快捷键设置</h2>
      <div class="text-muted-foreground mb-4 text-sm">
        点击快捷键可以重新设置，按 Esc 取消
      </div>
      <div class="space-y-2">
        <div
          v-for="(shortcut, index) in shortcuts"
          :key="index"
          class="hover:bg-accent/50 flex items-center justify-between rounded-md border px-4 py-3 transition-colors"
        >
          <div class="flex-1">
            <div class="font-medium">{{ shortcut.name }}</div>
            <div class="text-muted-foreground text-sm">
              {{ shortcut.description }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <L3Button
              v-if="editingIndex !== index"
              variant="outline"
              class="font-mono"
              @click="startEdit(index)"
            >
              {{ shortcut.key }}
            </L3Button>
            <div
              v-else
              class="animate-pulse rounded-md border border-blue-300 bg-blue-50 px-4 py-2 font-mono text-sm"
            >
              按下新的快捷键...
            </div>
            <L3Button
              v-if="editingIndex === index"
              variant="ghost"
              size="sm"
              @click="saveEdit"
            >
              取消
            </L3Button>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t pt-4">
      <L3Button variant="outline"> 重置所有快捷键 </L3Button>
    </div>
  </div>
</template>
