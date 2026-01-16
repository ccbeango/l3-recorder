import type { MediaState, MediaType, VideoOptions } from './types';

import L3EventEmitter from './eventEmitter';
import { isUndefined } from './inference';

interface CropMeidaInfo {
  readable: any;
  writable: any;
}

export default class L3MediaRecorder extends L3EventEmitter {
  private originMediaStream: MediaStream | null = null;

  private mediaStream: MediaStream | null = null;

  private cropMeidaInfo: CropMeidaInfo | null = null;

  private mediaRecorder: MediaRecorder | null = null;

  private mediaBlobs: Blob[] = [];

  private mediaState: MediaState = 'inactive';

  private mediaStreamConstraints: MediaStreamConstraints | undefined =
    undefined;

  private mediaRecorderOptions: MediaRecorderOptions | undefined = undefined;

  private mediaType: MediaType | null = null;

  private timeSlice: number | undefined = undefined;

  // private sysMute: boolean = false;

  private micMute: boolean = false;
  private micStream: MediaStream | null = null;
  private micGainNode: GainNode | null = null;

  constructor(mediaType: MediaType, options?: VideoOptions) {
    super();
    this.setMediaType(mediaType).setConfig(options);
  }

  //#region 属性设置、获取
  setMediaType(mediaType: MediaType) {
    this.mediaType = mediaType;
    return this;
  }

  getMediaState() {
    return this.mediaState;
  }

  setMediaState(state: MediaState) {
    this.mediaState = state;
    return this;
  }

  setMicMute(isMute: boolean) {
    this.micMute = isMute;
  }

  // setSysMute(isMute: boolean) {
  //   this.sysMute = isMute;
  // }

  setConfig(options?: VideoOptions) {
    switch (this.mediaType) {
      case 'screen':
      case 'desktop':
      case 'crop':
        console.log('set audio config');
        this.setVideoConfig(options as VideoOptions);
        break;
    }
  }

  setVideoConfig(options: VideoOptions) {
    const { audio, video, recorder, timeSlice, micMute } = options;

    this.setMediaStreamConstraints({ audio, video });

    this.mediaRecorderOptions = recorder;

    !isUndefined(timeSlice) && this.setTimeSlice(timeSlice);
    !isUndefined(micMute) && this.setMicMute(micMute);
  }

  getMediaStreamConstraints() {
    return this.mediaStreamConstraints;
  }

  setMediaStreamConstraints(constraints?: MediaStreamConstraints) {
    const _constraints = {
      ...this.getMediaStreamConstraints(),
      ...constraints,
    };
    this.mediaStreamConstraints = _constraints;
    return this;
  }

  getTimeSlice() {
    return this.timeSlice;
  }
  setTimeSlice(timeSlice: number) {
    if (timeSlice) {
      this.timeSlice = timeSlice;
    }
    return this;
  }

  getMediaBlobs() {
    return this.mediaBlobs || [];
  }

  getMediaRecorderMimeType() {
    return this.mediaRecorder?.mimeType;
  }

  getMediaRecorderState() {
    return this.mediaRecorder?.state;
  }

  getCropMediaInfo() {
    return this.cropMeidaInfo;
  }
  //#endregion

  isReady() {
    const mediaState = this.getMediaState();
    if (mediaState === 'ready') {
      return true;
    } else {
      const err = `the cureent mediaState is ${mediaState}, Please use create function`;
      this.emit('error', { type: 'isReady', message: err });
      return false;
    }
  }

  async create() {
    if (this.getMediaState() === 'inactive') {
      const media = await this.setMediaStream();
      if (media) {
        const combineVideoSoundSteram = await this.setSoundMeter();

        const mediaStream = combineVideoSoundSteram || this.mediaStream;

        this.setMediaRecorder(mediaStream as MediaStream);
        this.emit('create');
      }
    } else {
      this.emit('error', {
        type: 'create',
        message: `already has mediaStream, now mediaState: ${this.getMediaState()}`,
      });
    }
  }

  getMediaStream() {
    return this.mediaStream;
  }

  async setMediaStream(constraints?: MediaStreamConstraints) {
    this.setMediaStreamConstraints(constraints);
    const _constraints = this.getMediaStreamConstraints();

    this.setMediaState('wait');
    try {
      if (this.mediaType === 'screen') {
        this.originMediaStream = this.mediaStream =
          await navigator.mediaDevices.getDisplayMedia(_constraints);
      } else if (this.mediaType === 'crop') {
        this.originMediaStream =
          await navigator.mediaDevices.getUserMedia(_constraints);

        const [track] = this.originMediaStream.getVideoTracks();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const processor = new MediaStreamTrackProcessor({ track });
        const { readable } = processor;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const generator = new MediaStreamTrackGenerator({ kind: 'video' });
        const { writable } = generator;
        const videoStream = new MediaStream([generator]);

        this.mediaStream = videoStream;

        this.cropMeidaInfo = {
          readable,
          writable,
          processor,
          generator,
        } as CropMeidaInfo;
      } else {
        this.originMediaStream = this.mediaStream =
          await navigator.mediaDevices.getUserMedia(_constraints);
      }

      this.setMediaState('ready');
      return this;
    } catch (error) {
      this.setMediaState('inactive');
      this.emit('error', { type: 'setMedisStream', message: error });
      return false;
    }
  }

  async setSoundMeter() {
    // 先检查是否有音频轨道
    const audioTrack = this.originMediaStream?.getAudioTracks();
    if (!audioTrack?.length) {
      return null; // 没有音频，直接返回null
    }

    const audioContext = new AudioContext();

    // 系统声音
    const systemSoundSource = audioContext.createMediaStreamSource(
      this.originMediaStream!,
    );
    const systemSoundDestination = audioContext.createMediaStreamDestination();
    systemSoundSource.connect(systemSoundDestination);

    // 获取麦克风流
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const micSoundSource = audioContext.createMediaStreamSource(this.micStream);
    this.micGainNode = audioContext.createGain();
    this.micGainNode.gain.value = this.micMute ? 0 : 1.0;

    micSoundSource.connect(this.micGainNode);
    this.micGainNode.connect(systemSoundDestination);

    // 关键修复：使用正确的视频流
    const videoStream = this.mediaStream || this.originMediaStream;

    // 合并音频流和视频流
    const combineSource = new MediaStream([
      ...videoStream!.getVideoTracks(),
      ...systemSoundDestination.stream.getAudioTracks(),
    ]);

    return combineSource;
  }

  async setSoundMeter2() {
    // const audioTrack = this.mediaStream?.getAudioTracks();
    // if (audioTrack?.length) {
    const audioContext = new AudioContext();

    // 系统声音
    const systemSoundSource = audioContext.createMediaStreamSource(
      this.originMediaStream!,
    );
    const systemSoundDestination = audioContext.createMediaStreamDestination();
    systemSoundSource.connect(systemSoundDestination);

    // 获取麦克风流
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true, // 回声消除
        noiseSuppression: true, // 降噪
        autoGainControl: true, // 音量自动控制
      },
    });
    const micSoundSource = audioContext.createMediaStreamSource(this.micStream);
    // 使用 GainNode 控制音量
    this.micGainNode = audioContext.createGain();
    this.micGainNode.gain.value = this.micMute ? 0 : 1.0;

    // 连接麦克风
    micSoundSource.connect(this.micGainNode);
    this.micGainNode.connect(systemSoundDestination);

    // 合并音频流和视频流
    const combineSource = new MediaStream([
      ...this.mediaStream!.getVideoTracks(),
      ...systemSoundDestination.stream.getAudioTracks(),
    ]);

    return combineSource;
    // }

    // return false;
  }

  setMediaRecorder(medisStream: MediaStream) {
    // 创建MediaRecorder
    const mimeType = this.getBestMimeType();
    const settings = this.mediaStream!.getVideoTracks()[0].getSettings();

    // 录制配置
    const config = {
      ...this.mediaRecorderOptions,
      mimeType: mimeType,
      videoBitsPerSecond: this.calculateOptimalBitrate(settings),
      audioBitsPerSecond: 320000, // 高质量音频
      bitsPerSecond: undefined, // 让浏览器自动管理总比特率
    };

    this.mediaRecorder = new MediaRecorder(medisStream, config);

    this.mediaRecorder.onerror = (err: any) => {
      console.log('onerror', err);
      this.emit('error', { type: 'mediaRecorder', message: err });
    };

    // 将 stream 转成 blob 来存放
    this.mediaRecorder.ondataavailable = (blobEvent: BlobEvent) => {
      this.mediaBlobs.push(blobEvent.data);
      this.emit('dataavailable', blobEvent);
    };

    this.mediaRecorder.onstart = (event: Event) => {
      this.mediaBlobs = [];
      this.emit('start', event);
    };

    this.mediaRecorder.onstop = (event: Event) => {
      this.emit('stop', event);
    };

    this.mediaRecorder.onpause = (event: Event) => {
      this.emit('pause', event);
    };

    this.mediaRecorder.onresume = (event: Event) => {
      this.emit('resume', event);
    };
  }

  // 计算最优比特率
  calculateOptimalBitrate(settings) {
    const { width = 1920, height = 1080, frameRate = 30 } = settings;

    // 高质量比特率表（单位：bps）aspectRatio
    const qualityProfiles = {
      '2160p60': 50000000, // 50 Mbps - 4K 60fps
      '2160p30': 30000000, // 30 Mbps - 4K 30fps
      '1440p60': 25000000, // 25 Mbps - 2.5K 60fps
      '1440p30': 16000000, // 16 Mbps - 2.5K 30fps
      '1080p60': 12000000, // 12 Mbps - 1080p 60fps
      '1080p30': 8000000, // 8 Mbps - 1080p 30fps
      '720p60': 6000000, // 6 Mbps - 720p 60fps
      '720p30': 4000000, // 4 Mbps - 720p 30fps
    };

    // 根据分辨率选择
    const resolution = `${height}p${Math.round(frameRate)}`;

    if (qualityProfiles[resolution]) {
      return qualityProfiles[resolution];
    }

    // 通用计算公式（高质量）
    const pixels = width * height;
    const fps = frameRate;
    return Math.floor(pixels * fps * 0.1); // 高质量系数
  }

  // 获取最佳 MIME 类型
  getBestMimeType() {
    // 测试支持的最高质量编码
    const codecTests = [
      // AV1 最高质量但编码慢
      { mime: 'video/webm;codecs=av01.0.13M.10,opus', name: 'AV1' },
      { mime: 'video/webm;codecs=av1,opus', name: 'AV1' },

      // VP9 高质量
      { mime: 'video/webm;codecs=vp9.2,opus', name: 'VP9.2' },
      { mime: 'video/webm;codecs=vp9,opus', name: 'VP9' },

      // H.264 兼容性好
      { mime: 'video/webm;codecs=h264.1f40001f,opus', name: 'H.264 High' },
      { mime: 'video/webm;codecs=h264,opus', name: 'H.264' },

      // VP8 兼容性最好
      { mime: 'video/webm;codecs=vp8,opus', name: 'VP8' },
    ];

    for (const test of codecTests) {
      if (MediaRecorder.isTypeSupported(test.mime)) {
        return test.mime;
      }
    }

    // 默认
    return 'video/webm';
  }

  //#region 录制操作
  ondataavailable(callback?: (blobEvent: BlobEvent) => void) {
    callback && this.on('dataavailable', callback);
    return this;
  }

  onerror(callback?: (err: any) => void) {
    callback && this.on('error', callback);
    return this;
  }

  /**
   * 开始录制
   */
  start(timeSlice?: number) {
    if (!this.isReady()) return;

    try {
      timeSlice && this.setTimeSlice(timeSlice);
      timeSlice = this.getTimeSlice();

      if (timeSlice) {
        this.mediaRecorder?.start(timeSlice);
      } else {
        this.mediaRecorder?.start();
      }

      // this.mediaRecorder?.start();
    } catch (error) {
      this.emit('error', { type: 'start', message: error });
    }
  }
  onstart(callback?: () => void) {
    callback && this.on('start', callback);
  }

  /**
   * 停止录制
   */
  stop() {
    if (!this.isReady()) return;

    try {
      this.originMediaStream?.getTracks().forEach((track) => track.stop());
      this.mediaStream?.getTracks().forEach((track) => track.stop());
      this.micStream?.getTracks().forEach((track) => track.stop());

      this.mediaRecorder?.stop();

      this.mediaBlobs = [];
      this.mediaStream = null;
      this.mediaRecorder = null;
      this.micGainNode = null;
      this.cropMeidaInfo = null; // 清理 crop 信息

      this.setMediaState('inactive');
    } catch (error) {
      this.emit('error', { type: 'start', message: error });
    }
  }
  onstop(callback?: (event?: Event) => void) {
    callback && this.on('stop', callback);
    return this;
  }

  /**
   * 暂停录制
   */
  pause() {
    if (!this.isReady()) return;

    try {
      this.mediaRecorder?.pause();
    } catch (err) {
      this.emit('error', { type: 'pause', message: err });
    }
  }
  onpause(callback?: (event: Event) => void) {
    callback && this.on('pause', callback);
    return this;
  }

  /**
   * 继续/恢复录制
   */
  resume() {
    if (!this.isReady()) return;
    try {
      this.mediaRecorder?.resume();
    } catch (err) {
      this.emit('error', { type: 'resume', message: err });
    }
  }
  onresume(callback?: (event: Event) => void) {
    callback && this.on('resume', callback);
    return this;
  }

  /**
   * 系统音开关
   * @param isMute
   */
  toggleSysMute(isMute: boolean) {
    this.mediaStream
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !isMute));

    // this.setSysMute(isMute);
  }

  /**
   * 麦克风开关
   * @param isMute
   */
  toggleMicMute(isMute: boolean) {
    if (isMute) {
      this.micGainNode!.gain.value = 0;
    } else {
      this.micGainNode!.gain.value = 1.0;
    }

    this.setMicMute(isMute);
  }

  /**
   * 截图
   * @param canvas
   * @param video
   * @returns
   */
  snapshot(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas
      .getContext('2d')
      ?.drawImage(video, 0, 0, canvas.width, canvas.height);
    return this;
  }
  //#endregion
}
