import type { BrowserWindow } from 'electron';

import { IPC_CHANNELS } from '@/types';

let uIOhook: any = null;
let isListening = false;
let overlayWin: BrowserWindow | null = null;
let recordingBounds: {
  x: number;
  y: number;
  width: number;
  height: number;
} | null = null;

// 动态导入 uiohook-napi
async function loadUIOhook() {
  try {
    const module = await import('uiohook-napi');
    return module.uIOhook;
  } catch (error) {
    console.error('[GlobalMouseListener] Failed to load uiohook-napi:', error);
    return null;
  }
}

// 检查点击位置是否在录制区域内
function isClickInRecordingArea(x: number, y: number): boolean {
  if (!recordingBounds) {
    // 如果没有设置边界（全屏录制），则允许所有点击
    return true;
  }

  const { x: boundsX, y: boundsY, width, height } = recordingBounds;
  return (
    x >= boundsX &&
    x <= boundsX + width &&
    y >= boundsY &&
    y <= boundsY + height
  );
}

export async function startGlobalMouseListener(
  win: BrowserWindow | null,
  bounds?: { x: number; y: number; width: number; height: number } | null,
) {
  if (isListening || !win) return;

  overlayWin = win;
  recordingBounds = bounds || null;

  // 加载 uiohook-napi
  if (!uIOhook) {
    uIOhook = await loadUIOhook();
    if (!uIOhook) {
      console.error('[GlobalMouseListener] uiohook-napi not available');
      return;
    }
  }

  console.log('[GlobalMouseListener] Starting global mouse listener', {
    bounds: recordingBounds,
  });

  // 监听鼠标按下事件
  uIOhook.on('mousedown', (event: any) => {
    const { x, y } = event;

    // 检查点击是否在录制区域内
    if (!isClickInRecordingArea(x, y)) {
      console.log('[GlobalMouseListener] Click outside recording area:', x, y);
      return;
    }

    console.log('[GlobalMouseListener] Mouse clicked at:', x, y);

    // 广播到覆盖层窗口
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.webContents.send(
        IPC_CHANNELS.MOUSE_CLICK_OVERLAY.ON_MOUSE_CLICK,
        x,
        y,
      );
    }
  });

  // 启动监听
  uIOhook.start();
  isListening = true;

  console.log('[GlobalMouseListener] Global mouse listener started');
}

export function stopGlobalMouseListener() {
  if (!isListening || !uIOhook) return;

  console.log('[GlobalMouseListener] Stopping global mouse listener');

  try {
    uIOhook.stop();
  } catch (error) {
    console.error('[GlobalMouseListener] Error stopping listener:', error);
  }

  isListening = false;
  overlayWin = null;
  recordingBounds = null;

  console.log('[GlobalMouseListener] Global mouse listener stopped');
}
