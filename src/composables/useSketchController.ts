import { ref } from 'vue';

export function useSketchController() {
  const reloadKey = ref(0);
  const isReloading = ref(false);

  async function reloadCurrentSketch() {
    reloadKey.value++;
  }

  function onLoadingChange(v: boolean) {
    isReloading.value = v;
  }

  return {
    reloadKey,
    isReloading,
    reloadCurrentSketch,
    onLoadingChange,
  };
};