import type { ElectronIpcApi } from '../types';

declare global {
  interface Window {
    electronAPI: ElectronIpcApi;
    api: unknown;
  }
}
