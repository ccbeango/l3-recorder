import type { Bounds, WinOptions } from '../types';

import BaseWin from './baseWin';
import { WINDOW_CONFIG } from '../constant';

export default class RecorderScreenWin extends BaseWin {
  lastValidBounds: Bounds | null = null;

  constructor(options?: WinOptions | Bounds) {
    super({ ...WINDOW_CONFIG.recorderScreen, ...options });
    this.init();
  }

  init() {
    super.init();

    this.win?.on('ready-to-show', () => {
      this.win?.setAlwaysOnTop(true, 'screen-saver');
      this.win?.show();
    });
  }
}
