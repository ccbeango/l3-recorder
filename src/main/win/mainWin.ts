import BaseWin from './baseWin';
import { WINDOW_CONFIG } from '../constant';

let instance: MainWin | null;

export default class MainWin extends BaseWin {
  constructor() {
    super(WINDOW_CONFIG.main);

    this.init();
  }

  static getInstance() {
    if (!instance) {
      instance = new MainWin();
    }
    return instance;
  }

  static resetInstance() {
    if (instance) {
      instance = null;
    }
  }
}
