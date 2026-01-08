import { ref, watch } from 'vue';

export function usePersistentRef<T>(key: string, initial: T) {
  const stored = localStorage.getItem(key);

  const state = ref<T>(
    stored != null ? (JSON.parse(stored) as T) : initial
  ) as { value: T };

  watch(
    state,
    (v) => {
      localStorage.setItem(key, JSON.stringify(v));
    },
    { deep: true }
  );

  return state;
}