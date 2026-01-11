import type { Ref } from 'vue';

import { ref, watch, onWatcherCleanup } from 'vue';

export default function useGetLoadedImage(url: Ref<string>) {
  const imageEl = ref<HTMLImageElement | null>(null);

  watch(url, (val) => {
    imageEl.value = null;
    if (!val) {
      return;
    }

    const $image = document.createElement('img');

    const onLoad = () => (imageEl.value = $image);
    const onError = () => (imageEl.value = null);

    $image.addEventListener('load', onLoad);
    $image.addEventListener('error', onError);
    $image.src = val;

    onWatcherCleanup(() => {
      $image.removeEventListener('load', onLoad);
      $image.removeEventListener('error', onError);
    });
  });

  return imageEl;
}
