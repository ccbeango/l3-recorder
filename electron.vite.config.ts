import { resolve } from 'path';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': resolve('src'),
        '@types': resolve('src/types/index.ts'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': resolve('src'),
        '@types': resolve('src/types/index.ts'),
      },
    },
    // build: {
    //   rollupOptions: {
    //     input: {
    //       // browser: resolve(__dirname, 'src/preload/index.js'),
    //       keyboardMouseVisualizer: resolve(__dirname, 'src/preload/pre2.js'),
    //     },
    //   },
    // },
  },
  renderer: {
    server: {
      port: 19099,
    },
    resolve: {
      alias: {
        '@types': resolve('src/types'),
        '@renderer': resolve('src/renderer/src'),
        '@shadcn': resolve('src/renderer/src/shadcn'),
        '@icons': resolve('src/renderer/src/icons'),
      },
    },
    plugins: [vue(), tailwindcss()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/renderer/main.html'),
          recorderFullScreen: resolve(
            __dirname,
            'src/renderer/recorderFullScreen.html',
          ),
          recorderScreen: resolve(
            __dirname,
            'src/renderer/recorderScreen.html',
          ),
          recorderShot: resolve(__dirname, 'src/renderer/recorderShot.html'),
          recorderSourceClip: resolve(
            __dirname,
            'src/renderer/recorderSourceClip.html',
          ),
          mouseClickOverlay: resolve(
            __dirname,
            'src/renderer/mouseClickOverlay.html',
          ),
          settings: resolve(__dirname, 'src/renderer/settings.html'),
        },
      },
    },
  },
});
