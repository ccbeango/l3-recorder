import type { RecordingTimerProps } from './types';

import { defineComponent, h, ref, watch } from 'vue';

import RecordingTimer from './RecordingTimer.vue';

export default function useRecordTimer() {
  const startTime = ref(0);
  const setStartTime = (val) => (startTime.value = val);
  const elapsedTime = ref(0);
  const setElapsedTime = (val) => (elapsedTime.value = val);
  const pausedTime = ref(0);
  const setPausedTime = (val) => (pausedTime.value = val);

  const isRunning = ref(false);
  const setIsRunning = (val) => (isRunning.value = val);
  const isPaused = ref(false);
  const setIsPaused = (val) => (isPaused.value = val);

  const hours = ref(0);
  const minutes = ref(0);
  const seconds = ref(0);

  watch([isRunning, startTime], (val, _, onCleanup) => {
    let timerInterval: NodeJS.Timeout;

    const [isRunningVal, startTimeVal] = val;
    if (isRunningVal) {
      timerInterval = setInterval(() => {
        setElapsedTime(Date.now() - startTimeVal + pausedTime.value);
      }, 1000);
    }

    onCleanup(() => clearInterval(timerInterval));
  });

  watch(elapsedTime, (val) => {
    hours.value = Math.floor((val / (60 * 60 * 1000)) % 24);
    minutes.value = Math.floor((val / (1000 * 60)) % 60);
    seconds.value = Math.floor((val / 1000) % 60);
    // console.log(val, hours.value, minutes.value, seconds.value);
  });

  watch(isPaused, (val) => {
    val ? setPausedTime(elapsedTime.value) : setPausedTime(0);
  });

  function start() {
    setIsRunning(true);
    setStartTime(Date.now());
  }

  function pause() {
    setIsPaused(true);
    setPausedTime(elapsedTime.value);
    setIsRunning(false);
  }

  function resume() {
    setIsPaused(false);
    setStartTime(Date.now());
    setIsRunning(true);
  }

  function reset() {
    setIsRunning(false);
    setElapsedTime(0);
    setPausedTime(0);
  }

  const Timer = defineComponent(
    (props: RecordingTimerProps, { attrs, slots }) => {
      const timerApi = {
        start,
        pause,
        resume,
        reset,
      };

      return () =>
        h(
          RecordingTimer,
          {
            ...props,
            ...attrs,
            api: timerApi,
            hours: hours.value,
            minutes: minutes.value,
            seconds: seconds.value,
          },
          slots,
        );
    },
    { name: 'RecordingTimer', inheritAttrs: false },
  );

  return [
    Timer,
    {
      isRunning,
      start,
      pause,
      resume,
      reset,
    },
  ] as const;
}
