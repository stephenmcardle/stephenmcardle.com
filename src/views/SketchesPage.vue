<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePersistentRef } from '@/composables/usePersistentRef';
import P5Sketch from '@/components/P5Sketch.vue';
import { SKETCHES, getSketchById } from '@/sketches';
import type { SketchDefinition } from '@/sketches/types';

const route = useRoute();
const router = useRouter();

const reloadKey = ref(0);
const fallbackId = SKETCHES[0]?.id ?? ''
const selectedId = usePersistentRef<string>('selectedSketchId', fallbackId);

function normalizeId(id: string) {
  return SKETCHES.some(s => s.id === id) ? id : fallbackId;
}

const sketchIdFromQuery = typeof route.query.sketch === 'string' ? route.query.sketch : null;
selectedId.value = normalizeId(sketchIdFromQuery || selectedId.value);

watch(
  () => selectedId.value,
  (id) => {
    const normalized = normalizeId(id);
    if (normalized !== id) {
      selectedId.value = normalized;
      return;
    }

    router.replace({
      query: { ...route.query, sketch: normalized,
      },
    });
  },
  { immediate: true }
);

if (SKETCHES.length === 0) {
  throw new Error('No sketches registered in SKETCHES.');
}
const fallbackDefinition: SketchDefinition = SKETCHES[0]!;
const activeDefinition = computed(() => getSketchById(selectedId.value) ?? fallbackDefinition);

function reloadCurrent() {
  reloadKey.value++;
}

function onSelectChange(e: Event) {
  selectedId.value = (e.target as HTMLSelectElement).value;
}

function goHome() {
  router.push('/');
}
</script>

<template>
  <main class="sketches-page">
    <section class="sketch-card">
      <header class="controls top">
        <label class="label">
          Sketch
          <select class="select" :value="selectedId" @change="onSelectChange">
            <option class="option" v-for="s in SKETCHES" :key="s.id" :value="s.id">
              {{ s.name ?? s.id }} ({{ s.renderer }})
            </option>
          </select>
        </label>
      </header>
      <div class="stage-wrapper">
        <div class="stage">
          <P5Sketch :key="reloadKey" :definition="activeDefinition" overlayAlign="none" />
        </div>
      </div>
      <footer class="controls bottom">
        <button class="btn" @click="reloadCurrent">Reload</button>
        <button class="btn" @click="goHome">Home</button>
      </footer>
    </section>
  </main>
</template>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

.sketches-page {
  height: 100dvh;
  display: grid;
  place-items: center;
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top));
  padding-bottom: calc(16px + env(safe-area-inset-bottom));

  background:
    radial-gradient(
      circle at 50% 20%,
      rgba(255, 255, 255, 0.06),
      transparent 70%,
      #888
    );
}

.sketch-card {
  width: min(800px, calc(100dvw - 32px));
  max-height: calc(100dvh - 32px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 18px;

  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);

  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.45),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.stage-wrapper {
  flex: 1;
  min-height: 0;
  display: grid;
  place-items: center;
}

.stage {
  width: min(100%, 720px);
  max-height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  overflow: hidden;

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.45),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.stage :deep(.sketch-root) {
  width: 100%;
  height: 100%
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.label {
  width: 100%;
  display: grid;
  gap: 6px;
  font-size: 12px;
  opacity: 0.95;
}

.select {
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 10px 12px;
  color: #111;
  outline: none;
}

.btn {
  border: 0;
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  color: #111;
  box-shadow:
    0 0 3px rgba(16, 16, 16, 0.5);
  display: block;
}

.primary {
  background: rgba(255, 255, 255, 0.16);
  font-weight: 600;
}

.btn:hover {
  box-shadow:
    0 0 3px rgba(16, 16, 16, 0.9);
}
</style>