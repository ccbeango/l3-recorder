<script setup lang="ts">
import {
  MicIcon,
  MicOffIcon,
  DiscIcon,
  PlayIcon,
  SquareIcon,
  SquarePauseIcon,
} from '@icons';
import { useTheme } from '@renderer/composables/useTheme';
import { ref } from 'vue';

import { Header } from '../../components/header';
import { useRecordTimer } from '../../components/recording';
import { L3MediaRecorder } from '../../media-recorder';
import Item from './components/Item.vue';
import ToggleItem from './components/ToggleItem.vue';

useTheme();

const [RecordingTimer, timerApi] = useRecordTimer();

const micOn = ref(true);

const isRecording = ref(false); // 是否开始录制，暂停也是正在录制中的状态
const setIsRecording = (val: boolean) => (isRecording.value = val);

const isPaused = ref(false);
const setIsPaused = (val: boolean) => (isPaused.value = val);

const worker = new Worker(new URL('./worker.js', import.meta.url), {
  name: 'Crop worker',
});

const mediaRecorder3 = ref<L3MediaRecorder>(); // 媒体录制器对象

async function startRecording() {
  console.log('开始录制');

  // 通知其它窗口已开启录制
  window.electronAPI.sendRsNotifyRecordingState(true);

  const { source, width, height, scaleFactor } =
    await window.electronAPI.invokeRfsGetDesktopCapturerSource();
  const constraints: any = {
    audio: {
      mandatory: {
        chromeMediaSource: 'desktop', // 指定音频来源为桌面
      },
    },
    video: {
      mandatory: {
        chromeMediaSource: 'desktop', // 指定视频来源为桌面
        chromeMediaSourceId: source.id, // 指定具体的桌面源ID

        // 根据屏幕信息设置最优参数
        minWidth: Math.round(width * scaleFactor),
        maxWidth: Math.round(width * scaleFactor),
        minHeight: Math.round(height * scaleFactor),
        maxHeight: Math.round(height * scaleFactor),
        minFrameRate: 60,
        maxFrameRate: 60,
        // 可选：捕获鼠标光标
        cursor: 'always', // 'always', 'motion', 'never'
      },
    },
    micMute: !micOn.value,
  };

  mediaRecorder3.value = new L3MediaRecorder('crop', {
    ...constraints,
    recorder: {},
  });

  await mediaRecorder3.value.create();

  await cropStream();

  mediaRecorder3.value.onerror((err) => {
    console.log('err', err);
  });

  mediaRecorder3.value.onstop(() => {
    exportRecording();
  });

  mediaRecorder3.value.ondataavailable((blobEvent) => {
    console.log('Data available:', blobEvent.data.size);
  });

  mediaRecorder3.value.start();

  setIsRecording(true);
  timerApi.start();
  console.log('开始录像...');
}

async function cropStream() {
  const { scaleFactor } =
    await window.electronAPI.invokeRfsGetDesktopCapturerSource();

  let size = await window.electronAPI?.invokeRsGetBoundsClip();

  size = {
    width: Math.round(size.width * scaleFactor),
    height: Math.round(size.height * scaleFactor),
    x: Math.round(size.x * scaleFactor),
    y: Math.round(size.y * scaleFactor),
  };

  const { readable, writable } =
    mediaRecorder3.value?.getCropMediaInfo() as any;

  worker.postMessage(
    {
      operation: 'crop',
      readable,
      writable,
      size,
      status: 'start',
    },
    [readable, writable],
  );

  worker.addEventListener('message', function (message) {
    console.log('worker message', message);
    worker.terminate();
  });
}

// 停止录制，并将录制的音频数据导出为 Blob 对象
async function handleStopRecord() {
  console.log('停止录制');
  mediaRecorder3.value?.stop();
  worker.postMessage({
    status: 'stop',
  });

  // 通知其它窗口已停止录制
  window.electronAPI.sendRsNotifyRecordingState(false);

  setIsRecording(false);
  setIsPaused(false);
  timerApi.reset();
  console.log('录像完成！');
}

function exportRecording() {
  const mediaBlobs = mediaRecorder3.value?.getMediaBlobs() || [];
  if (mediaBlobs?.length > 0) {
    const blob = new Blob(mediaBlobs, {
      type: mediaRecorder3.value?.getMediaRecorderMimeType(),
    });

    window.electronAPI.sendRsDownloadVideo({
      url: URL.createObjectURL(blob),
      filename: `l3-recorder_${+new Date()}.webm`,
    });
  }
}

// 暂停录制
function pauseRecording() {
  mediaRecorder3.value?.pause();
  setIsPaused(true);
  timerApi.pause();
  console.log('录像已暂停');
}

// 恢复录制
function resumeRecording() {
  mediaRecorder3.value?.resume();
  setIsPaused(false);
  timerApi.start();
  console.log('恢复录像...');
}

function switchRecord() {
  if (
    isPaused.value &&
    mediaRecorder3.value?.getMediaRecorderState() === 'recording'
  ) {
    pauseRecording();
  }

  if (
    !isPaused.value &&
    mediaRecorder3.value?.getMediaRecorderState() === 'paused'
  ) {
    resumeRecording();
  }
}

function toggleMic() {
  mediaRecorder3.value?.toggleMicMute(!micOn.value);
}
</script>

<template>
  <div
    class="bg-background text-foreground dark:bg-muted/30 fixed inset-0 overflow-hidden border shadow-2xl"
  >
    <Header from="recorderScreen" :disable-close="isRecording"></Header>
    <div class="flex h-22 w-full items-center space-x-9 pl-7">
      <div class="ml-6 flex flex-col items-center justify-center space-x-2">
        <DiscIcon
          :class="{ 'animate-record-flash': isRecording && !isPaused }"
          class="text-destructive size-7"
        />
        <RecordingTimer class="mt-1" />
      </div>
      <ToggleItem
        v-model="micOn"
        :icon="MicIcon"
        :off-icon="MicOffIcon"
        :text="'麦克风已开'"
        :off-text="'麦克风已关'"
        @click="toggleMic"
      />
      <div class="h-11 border"></div>

      <Item
        v-if="!isRecording"
        :icon="PlayIcon"
        :text="'开始'"
        @click="startRecording"
      />
      <template v-else>
        <ToggleItem
          v-model="isPaused"
          :icon="PlayIcon"
          :off-icon="SquarePauseIcon"
          :text="'恢复'"
          :off-text="'暂停'"
          @change="switchRecord"
        />
        <Item
          v-if="isRecording"
          :icon="SquareIcon"
          :text="'停止'"
          @click="handleStopRecord"
        />
      </template>
    </div>
  </div>
</template>

<style>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
