/// <reference types="vite/client" />

import type { ElectronIpcApi } from '@types';

export {};

declare global {
  // interface InteractAPI {

  // }

  interface Window {
    electronAPI: ElectronIpcApi;
  }
}
