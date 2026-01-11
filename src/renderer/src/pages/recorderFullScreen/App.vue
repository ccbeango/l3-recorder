<script setup lang="ts">
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PlayIcon,
  SquareIcon,
  SquarePauseIcon,
  XIcon,
  DiscIcon,
} from '@icons';
import { L3IconButton } from '@shadcn';
import { onMounted, ref } from 'vue';

import { RecordingIcon, useRecordTimer } from '../../components/recording';
import { L3MediaRecorder } from '../../media-recorder';

const [RecordingTimer, timerApi] = useRecordTimer();

const videoOn = ref(false);
const micOn = ref(true);

const isRecording = ref(false); // 是否开始录制，暂停也是正在录制中的状态
const setIsRecording = (val: boolean) => (isRecording.value = val);

const isPaused = ref(false);
const setIsPaused = (val: boolean) => (isPaused.value = val);

const mediaRecorder = ref<L3MediaRecorder>(); // 媒体录制器对象

// 开始录制
async function startRecording() {
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

  mediaRecorder.value = new L3MediaRecorder('desktop', {
    ...constraints,
    recorder: {},
  });

  await mediaRecorder.value.create();

  mediaRecorder.value.start();

  mediaRecorder.value.onerror(() => {
    exportRecording();
  });

  mediaRecorder.value.onstop(() => {
    exportRecording();
  });

  setIsRecording(true);
  timerApi.start();
  console.log('开始录像...');
}

// 导出录制的音频文件
function exportRecording() {
  const mediaBlobs = mediaRecorder.value?.getMediaBlobs() || [];
  if (mediaBlobs?.length > 0) {
    const blob = new Blob(mediaBlobs, {
      type: mediaRecorder.value?.getMediaRecorderMimeType(),
    });

    window.electronAPI.sendRfsDownloadVideo({
      url: URL.createObjectURL(blob),
      filename: `l3-recorder_${+new Date()}.webm`,
    });
  }
}

// 暂停录制
function pauseRecording() {
  if (
    !isPaused.value &&
    mediaRecorder.value?.getMediaRecorderState() === 'recording'
  ) {
    mediaRecorder.value.pause();
    setIsPaused(true);
    timerApi.pause();
    console.log('录像已暂停');
  }
}

// 恢复录制
function resumeRecording() {
  if (
    isPaused.value &&
    mediaRecorder.value?.getMediaRecorderState() === 'paused'
  ) {
    mediaRecorder.value.resume();
    setIsPaused(false);
    timerApi.start();
    console.log('恢复录像...');
  }
}

function stopRecording() {
  if (isRecording.value && mediaRecorder.value) {
    mediaRecorder.value.stop();

    setIsRecording(false);
    setIsPaused(false);
    timerApi.reset();
    console.log('录像完成！');
  }
}

function toggleMic() {
  mediaRecorder.value?.toggleMicMute(!micOn.value);
}

function closeWin() {
  window.electronAPI.sendRfsClose();
}

onMounted(() => {
  // 鼠标事件监听
  document.addEventListener('mouseenter', () => {
    // isMouseInWindow = true;
    // 通知主进程鼠标进入
    console.log('通知主进程鼠标进入');
    window.electronAPI.sendRfsMouseEnter();
  });

  document.addEventListener('mouseleave', () => {
    // 检查是否真的离开了窗口
    // isMouseInWindow = false;
    // 通知主进程鼠标离开
    console.log('通知主进程鼠标离开');
    window.electronAPI.sendRfsMouseLeave();
  });

  document.addEventListener('blur', () => {
    console.log('通知主进程失去焦点');
    window.electronAPI.sendRfsMouseLeave();
  });
});
</script>

<template>
  <div class="flex size-full items-center bg-[#232628]">
    <div class="ml-6 flex items-center space-x-2">
      <DiscIcon
        :class="{ 'animate-record-flash': isRecording && !isPaused }"
        class="text-destructive size-5"
      />
      <RecordingTimer />
      <!-- <div class="text-xs text-white">暂停中...</div> -->
    </div>

    <div class="mx-4 h-7 border-x border-white/8"></div>
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
    <div class="mx-4 h-7 border-x border-white/8"></div>
    <div class="flex space-x-1">
      <L3IconButton
        v-if="!isRecording"
        title="开始"
        :rounded="false"
        variant="link"
        size="sm"
        @click="startRecording"
      >
        <PlayIcon class="text-success size-5" />
      </L3IconButton>

      <template v-else>
        <L3IconButton
          v-if="isPaused"
          title="恢复"
          :rounded="false"
          variant="link"
          @click="resumeRecording"
        >
          <PlayIcon class="text-success size-5" />
        </L3IconButton>
        <L3IconButton
          v-else
          title="暂停"
          :rounded="false"
          variant="link"
          @click="pauseRecording"
        >
          <SquarePauseIcon class="text-action size-5" />
        </L3IconButton>

        <!-- <L3Button variant="destructive" size="sm" @click="reset">
          结束录制
        </L3Button> -->
        <L3IconButton
          title="结束录制"
          :rounded="false"
          variant="link"
          size="sm"
          @click="stopRecording"
        >
          <SquareIcon class="text-destructive size-5" />
        </L3IconButton>
      </template>

      <L3IconButton
        v-if="!isRecording"
        title="退出"
        :rounded="false"
        variant="link"
        @click="closeWin"
      >
        <XIcon class="text-warning size-5" />
      </L3IconButton>
    </div>
  </div>
</template>

<style scoped>
body {
  background: transparent;
}
</style>
