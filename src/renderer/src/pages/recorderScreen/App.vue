<script setup lang="ts">
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, DiscIcon } from '@icons';
import { L3Button } from '@shadcn';
import { ref } from 'vue';

import { Header } from '../../components/header';
import { RecordingIcon, useRecordTimer } from '../../components/recording';
import { L3MediaRecorder } from '../../media-recorder';

const [RecordingTimer, timerApi] = useRecordTimer();

const videoOn = ref(false);
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
  if (
    !isPaused.value &&
    mediaRecorder3.value?.getMediaRecorderState() === 'recording'
  ) {
    mediaRecorder3.value.pause();
    setIsPaused(true);
    timerApi.pause();
    console.log('录像已暂停');
  }
}

// 恢复录制
function resumeRecording() {
  if (
    isPaused.value &&
    mediaRecorder3.value?.getMediaRecorderState() === 'paused'
  ) {
    mediaRecorder3.value.resume();
    setIsPaused(false);
    timerApi.start();
    console.log('恢复录像...');
  }
}

function toggleMic() {
  mediaRecorder3.value?.toggleMicMute(!micOn.value);
}
</script>

<template>
  <div class="fixed inset-0 overflow-hidden">
    <Header from="recorderScreen"></Header>
    <div class="h-full w-full">
      <div class="content p-4">
        <div class="ml-6 flex items-center space-x-2">
          <DiscIcon
            :class="{ 'animate-record-flash': isRecording && !isPaused }"
            class="text-destructive size-5"
          />
          <RecordingTimer />
        </div>
        <div class="flex gap-4">
          <RecordingIcon
            v-model="micOn"
            :icon="MicIcon"
            :off-icon="MicOffIcon"
            :text="'麦克风已开'"
            :off-text="'麦克风已关'"
            @click="toggleMic"
          />
          <RecordingIcon
            v-model="videoOn"
            :icon="VideoIcon"
            :off-icon="VideoOffIcon"
            :text="'摄像头已开'"
            :off-text="'摄像头已关'"
          />
        </div>
        <div class="mb-4 space-x-4">
          <L3Button @click="startRecording"> 开始录制 </L3Button>
          <L3Button
            v-if="isPaused"
            :rounded="false"
            variant="link"
            @click="resumeRecording"
          >
            恢复录制
          </L3Button>
          <L3Button @click="pauseRecording"> 暂停录制 </L3Button>
          <L3Button @click="handleStopRecord"> 停止录制 </L3Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
