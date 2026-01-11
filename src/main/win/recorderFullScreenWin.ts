import { ipcMain, screen } from 'electron';

import BaseWin from './baseWin';
import { WINDOW_CONFIG } from '../constant';

export default class RecorderFullScreenWin extends BaseWin {
  isHide: boolean = true;
  animationInProgress: boolean = false;
  hideTimer: NodeJS.Timeout | null = null;

  isMouseEnter: boolean = false;

  constructor() {
    super();
    this.initOptions();

    this.registerEvents();

    this.init();
  }

  initOptions() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width } = primaryDisplay.workAreaSize;
    super.setOptions({
      ...WINDOW_CONFIG.recorderFullScreen,
      x: (width - WINDOW_CONFIG.recorderFullScreen.width!) / 2,
      y: -WINDOW_CONFIG.recorderFullScreen.height! + 5,
    });
  }

  private registerEvents() {
    this.win?.on('blur', () => {
      this.scheduleHide();
    });

    // 监听渲染进程发来的鼠标离开事件
    ipcMain.on('rfs:win-mouse-leave', () => {
      console.log('鼠标离开');
      this.hideWindow();
      // this.scheduleHide();
      // if (!this.isHide) {
      //   this.hideWindow();
      // }
    });

    // 监听鼠标进入窗口事件
    ipcMain.on('rfs:win-mouse-enter', () => {
      console.log('鼠标进入');
      this.showWindow();

      // if (this.isHide) {
      //   this.showWindow();
      // }
    });
  }

  showWindow() {
    if (this.animationInProgress) return;

    this.animationInProgress = true;
    this.isHide = false;
    this.cancelHide();

    // 让窗口可交互
    this.win?.setIgnoreMouseEvents(false);

    // 平滑下拉动画
    this.animationInProgress = false;

    this.win?.setPosition(this.win?.getPosition()[0], 0);
  }

  scheduleHide() {
    this.cancelHide();

    this.hideTimer = setTimeout(() => {
      if (!this.isHide && !this.animationInProgress) {
        this.hideWindow();
      }
    }, 300);
  }

  cancelHide() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  hideWindow() {
    if (this.animationInProgress) return;

    this.animationInProgress = true;
    this.isHide = true;

    // 启用鼠标穿透，但保留顶部5像素区域可检测
    this.win?.setIgnoreMouseEvents(false, {
      forward: false,
    });

    this.animationInProgress = false;
    // 动画完成后设置为鼠标穿透，但保留顶部区域
    this.win?.setIgnoreMouseEvents(true, {
      forward: true,
    });

    this.win?.setPosition(this.win?.getPosition()[0], -55);
  }
}
