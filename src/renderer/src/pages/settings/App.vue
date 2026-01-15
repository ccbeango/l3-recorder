<script setup lang="ts">
import { ref } from 'vue';
import {
  L3SidebarProvider,
  L3Sidebar,
  L3SidebarItem,
  L3SidebarInset,
} from '@shadcn';
import { Header } from '../../components/header';
import GeneralPanel from './components/GeneralPanel.vue';
import RecordingPanel from './components/RecordingPanel.vue';
import ShortcutsPanel from './components/ShortcutsPanel.vue';

const activeTab = ref('general');
</script>

<template>
  <div class="flex size-full flex-col">
    <Header from="settings"></Header>
    <div class="flex flex-1 overflow-hidden">
      <L3SidebarProvider
        class="h-full min-h-0 w-full"
        :default-open="true"
        :style="{ '--sidebar-width': '12rem' }"
      >
        <L3Sidebar class="h-full border-r pt-0" collapsible="none">
          <L3SidebarItem
            :is-active="activeTab === 'general'"
            @click="activeTab = 'general'"
          >
            <span>常规</span>
          </L3SidebarItem>
          <L3SidebarItem
            :is-active="activeTab === 'recording'"
            @click="activeTab = 'recording'"
          >
            <span>录制</span>
          </L3SidebarItem>
          <L3SidebarItem
            :is-active="activeTab === 'shortcuts'"
            @click="activeTab = 'shortcuts'"
          >
            <span>快捷键</span>
          </L3SidebarItem>
        </L3Sidebar>

        <L3SidebarInset class="bg-background flex-1 overflow-auto p-6">
          <GeneralPanel v-if="activeTab === 'general'" />
          <RecordingPanel v-if="activeTab === 'recording'" />
          <ShortcutsPanel v-if="activeTab === 'shortcuts'" />
        </L3SidebarInset>
      </L3SidebarProvider>
    </div>
  </div>
</template>

<style scoped>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
