import { ref } from 'vue';
import type { P5SketchExposed } from '@/components/p5/types';

export function useSketchController() {
  const sketchRef = ref<P5SketchExposed | null>(null);
  const isReloading = ref(false);

  async function reloadCurrentSketch() {
    await sketchRef.value?.reload();
  }

  function onLoadingChange(v: boolean) {
    isReloading.value = v;
  }

  return {
    sketchRef,
    isReloading,
    reloadCurrentSketch,
    onLoadingChange,
  };
};