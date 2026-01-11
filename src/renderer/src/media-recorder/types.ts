type MediaType = 'screen' | 'desktop' | 'crop';

type MediaState = 'inactive' | 'wait' | 'ready';

interface VideoOptions {
  audio: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
  recorder?: MediaRecorderOptions;
  /**
   * 间隔采样(ms)
   */
  timeSlice?: number;
  /**
   * 麦克风静音
   */
  micMute?: boolean;
}

export type { MediaType, MediaState, VideoOptions };
