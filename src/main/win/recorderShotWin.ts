import { desktopCapturer, screen } from 'electron';

import BaseWin from './baseWin';
import { WINDOW_CONFIG } from '../constant';

import { IPC_CHANNELS } from '@/types';

export default class RecorderShotWin extends BaseWin {
  constructor() {
    super(WINDOW_CONFIG.recorderShot);

    this.init();
  }

  async show() {
    const { id, size, scaleFactor } = screen.getPrimaryDisplay();

    const sources = [
      ...(await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: size.width * scaleFactor,
          height: size.height * scaleFactor,
        },
      })),
    ];

    let source = sources.filter(
      (e: any) => parseInt(e.display_id, 10) == id,
    )[0];
    source || (source = sources[0]);
    const img = source.thumbnail.toDataURL();

    this.win?.on('ready-to-show', () => {
      this.win?.webContents.send(IPC_CHANNELS.RS_SELECT_AREA.ON_SHOW_WIN, img);
      this.win?.show();
    });
  }
}
