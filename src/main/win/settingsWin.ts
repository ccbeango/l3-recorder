import BaseWin from './baseWin';
import { WINDOW_CONFIG } from '../constant';

export default class SettingsWin extends BaseWin {
  constructor() {
    super(WINDOW_CONFIG.settings);
    this.init();
  }

  init() {
    super.init();

    this.win?.on('ready-to-show', () => {
      this.win?.show();
      this.win?.center();
    });
  }
}
