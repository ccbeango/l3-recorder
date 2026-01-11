import type { Bounds, WinOptions } from '../types';

import { screen } from 'electron';

import BaseWin from './baseWin';
import { WINDOW_CONFIG } from '../constant';

export default class RecorderSourceClipWin extends BaseWin {
  isMoving: boolean;
  lastValidBounds: Bounds | null = null;

  constructor(options?: WinOptions | Bounds) {
    super({ ...WINDOW_CONFIG.recorderSourceClip, ...options });
    this.init();
    this.isMoving = false;
    this.setupConstraints();
  }

  init() {
    super.init();

    this.win?.on('ready-to-show', () => {
      this.win?.setAlwaysOnTop(true, 'screen-saver');
      this.win?.show();
    });
  }

  ignoreMouseEvents(flag: boolean) {
    this.win?.setIgnoreMouseEvents(flag, {
      forward: flag,
    });
  }

  getAreaBounds() {
    return this.win?.getBounds();
  }

  setupConstraints() {
    if (!this.win) return;

    this.win.on('will-move', (event, newBounds) => {
      if (this.isMoving) return;

      const displays = screen.getAllDisplays();
      const [winWidth, winHeight] = this.win!.getSize();

      // 检查是否在任何显示器的工作区域内
      let isWithinBounds = false;

      for (const display of displays) {
        const displayBounds = display.bounds;

        // 检查窗口是否完全在边界内
        const windowRight = newBounds.x + winWidth;
        const windowBottom = newBounds.y + winHeight;

        const displayRight = displayBounds.x + displayBounds.width;
        const displayBottom = displayBounds.y + displayBounds.height;

        if (
          newBounds.x >= displayBounds.x &&
          newBounds.y >= displayBounds.y &&
          windowRight <= displayRight &&
          windowBottom <= displayBottom
        ) {
          isWithinBounds = true;
          break;
        }
      }

      if (!isWithinBounds) {
        event.preventDefault();
        this.isMoving = true;

        // 约束到最近的边界
        const primaryDisplay = screen.getPrimaryDisplay();
        const displayBounds = primaryDisplay.bounds;

        // 计算约束位置
        const constrainedX = Math.max(
          displayBounds.x,
          Math.min(
            newBounds.x,
            displayBounds.x + displayBounds.width - winWidth,
          ),
        );
        const constrainedY = Math.max(
          displayBounds.y,
          Math.min(
            newBounds.y,
            displayBounds.y + displayBounds.height - winHeight,
          ),
        );

        // 立即设置新位置
        this.win!.setBounds({
          x: constrainedX,
          y: constrainedY,
        });

        this.isMoving = false;
      }
    });
  }
}
