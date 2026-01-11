import type { Bounds, RecorderShotsContext } from '../types';
import type { Ref } from 'vue';

import { computed, ref, watchEffect } from 'vue';

import { createContext } from '../utils/createContext';

export interface RecorderShotsContextWithActions {
  store: Ref<RecorderShotsContext>;
  updateStore: (updates: Partial<RecorderShotsContext>) => void;
}

export const [injectRecorderShotsContext, provideRecorderShotsContext] =
  createContext<RecorderShotsContextWithActions>('RecorderShots');

export function useRecorderShotsProvider({
  width,
  height,
  canvasRef,
  imageEl,
}) {
  const store = ref<RecorderShotsContext>({
    url: '',
    imageEl: null,
    width: width,
    height: height,
    canvasContextRef: null,
    history: { index: -1, stack: [] },
    bounds: null,
    cursor: 'move',
    operation: '',
  });

  watchEffect(() => {
    const canvasContext = canvasRef.value?.ctxRef;
    store.value.canvasContextRef = canvasContext;

    store.value.imageEl = imageEl;
  });

  const updateStore = (updates: Partial<RecorderShotsContext>) => {
    store.value = { ...store.value, ...updates };
  };

  const context: RecorderShotsContextWithActions = {
    store,
    updateStore,
  };

  provideRecorderShotsContext(context);

  return { ...context, canvasRef };
}

export const useRecorderShotsInjection = () => {
  const context = injectRecorderShotsContext();

  // 添加一些便捷方法
  const canvasContext = computed(
    () => context?.store.value?.canvasContextRef || null,
  );

  const width = computed(() => context?.store.value?.width || 0);
  const height = computed(() => context?.store.value?.height || 0);

  const url = computed(() => context?.store.value?.url || '');

  const imageEl = computed(() => context?.store.value?.imageEl);

  const cursor = computed(() => context.store.value.cursor);

  const operation = computed(() => context.store.value.operation);
  const setOperation = (operation: string) => {
    context?.updateStore({ operation });
  };

  const bounds = computed(() => context.store.value.bounds);
  const setBounds = (bounds: Bounds | null) => {
    context.updateStore({ bounds });
  };

  const history = computed(() => {
    const { index, stack } = context.store.value.history;
    return {
      index,
      stack,
      top: stack.slice(index, index + 1)[0],
    };
  });
  const setHistory = {
    push: () => {},
    pop: () => {},
    undo: () => {},
    redo: () => {},
    set: () => {},
    select: () => {},
    clearSelect: () => {},
    reset: () => {},
  };
  // const  = computed(() => context.);

  return {
    // 原始 context
    context,
    // store 引用
    store: context?.store,
    width,
    height,
    cursor,
    canvasContext,
    url,
    imageEl,

    operation,
    setOperation,

    bounds,
    setBounds,

    history,
    setHistory,
  };
};
