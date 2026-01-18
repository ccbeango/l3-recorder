import type { BrowserWindow } from 'electron';

import { screen } from 'electron';

import { IPC_CHANNELS } from '@/types';

let uIOhook: any = null;
let isListening = false;
let isKeyboardListening = false; // 跟踪键盘监听器状态
let overlayWin: BrowserWindow | null = null;
let keyboardOverlayWin: BrowserWindow | null = null;
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

  // 获取屏幕缩放因子
  const primaryDisplay = screen.getPrimaryDisplay();
  const scaleFactor = primaryDisplay.scaleFactor;

  // 将物理像素坐标转换为逻辑像素坐标进行比较
  const logicalX = x / scaleFactor;
  const logicalY = y / scaleFactor;

  const { x: boundsX, y: boundsY, width, height } = recordingBounds;
  return (
    logicalX >= boundsX &&
    logicalX <= boundsX + width &&
    logicalY >= boundsY &&
    logicalY <= boundsY + height
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

  // 清除所有现有的鼠标事件监听器，防止重复注册
  uIOhook.removeAllListeners('mousedown');

  // 监听鼠标按下事件
  uIOhook.on('mousedown', (event: any) => {
    const { x, y } = event;

    // 检查点击是否在录制区域内
    if (!isClickInRecordingArea(x, y)) {
      console.log('[GlobalMouseListener] Click outside recording area:', x, y);
      return;
    }

    console.log('[GlobalMouseListener] Mouse clicked at:', x, y);

    // 获取屏幕缩放因子进行坐标转换
    const primaryDisplay = screen.getPrimaryDisplay();
    const scaleFactor = primaryDisplay.scaleFactor;

    // 转换坐标：uIOhook 返回的是物理像素坐标，需要转换为逻辑像素坐标
    const logicalX = Math.round(x / scaleFactor);
    const logicalY = Math.round(y / scaleFactor);

    console.log('[GlobalMouseListener] Converted coordinates:', {
      physical: { x, y },
      logical: { x: logicalX, y: logicalY },
      scaleFactor,
    });

    // 广播到覆盖层窗口
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.webContents.send(
        IPC_CHANNELS.MOUSE_CLICK_OVERLAY.ON_MOUSE_CLICK,
        logicalX,
        logicalY,
      );
    }
  });

  // 启动监听
  uIOhook.start();
  isListening = true;

  console.log('[GlobalMouseListener] Global mouse listener started');
}

// 键盘按键名称映射
const keyCodeMap: Record<number, string> = {
  // 功能键
  1: 'Esc',
  59: 'F1',
  60: 'F2',
  61: 'F3',
  62: 'F4',
  63: 'F5',
  64: 'F6',
  65: 'F7',
  66: 'F8',
  67: 'F9',
  68: 'F10',
  87: 'F11',
  88: 'F12',

  // 数字行
  41: '`',
  2: '1',
  3: '2',
  4: '3',
  5: '4',
  6: '5',
  7: '6',
  8: '7',
  9: '8',
  10: '9',
  11: '0',
  12: '-',
  13: '=',
  14: 'Backspace',

  // 第一行字母
  15: 'Tab',
  16: 'Q',
  17: 'W',
  18: 'E',
  19: 'R',
  20: 'T',
  21: 'Y',
  22: 'U',
  23: 'I',
  24: 'O',
  25: 'P',
  26: '[',
  27: ']',
  43: '\\',

  // 第二行字母
  58: 'Caps Lock',
  30: 'A',
  31: 'S',
  32: 'D',
  33: 'F',
  34: 'G',
  35: 'H',
  36: 'J',
  37: 'K',
  38: 'L',
  39: ';',
  40: "'",
  28: 'Enter',

  // 第三行字母
  42: 'Shift',
  44: 'Z',
  45: 'X',
  46: 'C',
  47: 'V',
  48: 'B',
  49: 'N',
  50: 'M',
  51: ',',
  52: '.',
  53: '/',
  54: 'Shift',

  // 修饰键
  29: 'Ctrl',
  56: 'Alt',
  57: 'Space',
  3613: 'Ctrl', // Right Ctrl
  3640: 'Alt Gr', // Right Alt
  3675: 'Win',
  3677: 'Menu',

  // 小键盘
  69: 'Num Lock',
  55: 'Num *',
  74: 'Num -',
  78: 'Num +',
  82: 'Num 0',
  79: 'Num 1',
  80: 'Num 2',
  81: 'Num 3',
  75: 'Num 4',
  76: 'Num 5',
  77: 'Num 6',
  71: 'Num 7',
  72: 'Num 8',
  73: 'Num 9',
  83: 'Num .',
  3612: 'Num Enter',
  3637: 'Num /',

  // 方向键 (主要方向键区域)
  57419: '←', // Left Arrow
  57421: '→', // Right Arrow
  57416: '↑', // Up Arrow
  57424: '↓', // Down Arrow

  // 导航键
  3655: 'Home',
  3663: 'End',
  3657: '↑', // Page Up (备用)
  3664: '↓', // Page Down (备用)
  3653: 'Page Up',
  3665: 'Page Down',
  3666: 'Insert',
  3667: 'Delete',

  // 系统键
  70: 'Scroll Lock',
  3638: 'Print Screen',
  3639: 'Pause',

  // 多媒体键
  57376: 'Volume Up',
  57392: 'Volume Down',
  57360: 'Mute',
  57378: 'Play/Pause',
  57369: 'Previous',
  57368: 'Next',
  57380: 'Stop',
};

export async function startGlobalKeyboardListener(win: BrowserWindow | null) {
  if (!win) return;

  // 如果键盘监听器已经在运行，只更新窗口引用
  if (
    isKeyboardListening &&
    keyboardOverlayWin &&
    !keyboardOverlayWin.isDestroyed()
  ) {
    console.log(
      '[GlobalKeyboardListener] Keyboard listener already running, updating window reference...',
    );
    keyboardOverlayWin = win;
    return;
  }

  keyboardOverlayWin = win;

  // 加载 uiohook-napi
  if (!uIOhook) {
    uIOhook = await loadUIOhook();
    if (!uIOhook) {
      console.error('[GlobalKeyboardListener] uiohook-napi not available');
      return;
    }
  }

  console.log('[GlobalKeyboardListener] Starting global keyboard listener');

  // 清除所有现有的键盘事件监听器，防止重复注册
  uIOhook.removeAllListeners('keydown');
  uIOhook.removeAllListeners('keyup');

  // 跟踪修饰键状态
  const modifierKeys = {
    ctrl: false,
    alt: false,
    shift: false,
    win: false,
  };

  // 记录最后一次按键时间，用于防止重复触发
  let lastKeyTime = 0;
  let lastKeyCode = 0;

  // 监听键盘按下事件
  uIOhook.on('keydown', (event: any) => {
    const { keycode } = event;
    const keyName = keyCodeMap[keycode] || `Key ${keycode}`;
    const currentTime = Date.now();

    console.log('[GlobalKeyboardListener] Key pressed:', keyName, keycode);

    // 防止同一按键在短时间内重复触发（键盘重复）
    if (keycode === lastKeyCode && currentTime - lastKeyTime < 50) {
      return;
    }
    lastKeyTime = currentTime;
    lastKeyCode = keycode;

    // 检查是否是修饰键
    const isModifierKey =
      keycode === 29 ||
      keycode === 3613 || // Ctrl
      keycode === 56 ||
      keycode === 3640 || // Alt (包括右Alt)
      keycode === 42 ||
      keycode === 54 || // Shift
      keycode === 3675; // Win

    // 更新修饰键状态
    if (keycode === 29 || keycode === 3613) {
      // Ctrl
      modifierKeys.ctrl = true;
    } else if (keycode === 56 || keycode === 3640) {
      // Alt (包括右Alt)
      modifierKeys.alt = true;
    } else if (keycode === 42 || keycode === 54) {
      // Shift
      modifierKeys.shift = true;
    } else if (keycode === 3675) {
      // Win
      modifierKeys.win = true;
    }

    // 构建要显示的按键字符串
    let displayKey = '';

    if (isModifierKey) {
      // 如果是修饰键，直接显示修饰键名称
      displayKey = keyName;
    } else {
      // 非修饰键，检查是否有修饰键组合
      const hasModifiers =
        modifierKeys.ctrl ||
        modifierKeys.alt ||
        modifierKeys.shift ||
        modifierKeys.win;

      if (hasModifiers) {
        // 构建组合键字符串
        if (modifierKeys.ctrl) displayKey += 'Ctrl+';
        if (modifierKeys.alt) displayKey += 'Alt+';
        if (modifierKeys.shift) displayKey += 'Shift+';
        if (modifierKeys.win) displayKey += 'Win+';
        displayKey += keyName;
      } else {
        // 单独按键
        displayKey = keyName;
      }
    }

    // 如果是未知键码，记录调试信息
    if (keyName.startsWith('Key ')) {
      console.warn(
        `[GlobalKeyboardListener] Unknown keycode: ${keycode}, please add to keyCodeMap`,
      );
    }

    // 广播到键盘覆盖层窗口
    if (keyboardOverlayWin && !keyboardOverlayWin.isDestroyed()) {
      keyboardOverlayWin.webContents.send(
        IPC_CHANNELS.KEYBOARD_OVERLAY.ON_KEY_PRESS,
        displayKey,
      );
    }
  });

  // 监听键盘释放事件来重置修饰键状态
  uIOhook.on('keyup', (event: any) => {
    const { keycode } = event;

    // 重置修饰键状态
    if (keycode === 29 || keycode === 3613) {
      // Ctrl
      modifierKeys.ctrl = false;
    } else if (keycode === 56 || keycode === 3640) {
      // Alt (包括右Alt)
      modifierKeys.alt = false;
    } else if (keycode === 42 || keycode === 54) {
      // Shift
      modifierKeys.shift = false;
    } else if (keycode === 3675) {
      // Win
      modifierKeys.win = false;
    }
  });

  // 如果还没有启动 uIOhook，现在启动
  if (!isListening) {
    uIOhook.start();
    isListening = true;
  }

  // 设置键盘监听器状态
  isKeyboardListening = true;

  console.log('[GlobalKeyboardListener] Global keyboard listener started');
}

export function stopGlobalMouseListener() {
  if (!isListening || !uIOhook) return;

  console.log('[GlobalMouseListener] Stopping global mouse listener');

  // 清除鼠标事件监听器
  uIOhook.removeAllListeners('mousedown');

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

export function stopGlobalKeyboardListener() {
  console.log('[GlobalKeyboardListener] Stopping global keyboard listener');

  // 清除键盘事件监听器
  if (uIOhook) {
    uIOhook.removeAllListeners('keydown');
    uIOhook.removeAllListeners('keyup');
  }

  // 清除键盘覆盖窗口引用和状态标志
  keyboardOverlayWin = null;
  isKeyboardListening = false;

  // 注意：我们不在这里停止 uIOhook，因为鼠标监听器可能还在使用它
  // uIOhook 会在 stopGlobalMouseListener 中统一停止

  console.log('[GlobalKeyboardListener] Global keyboard listener stopped');
}
