<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import P5Sketch from '@/components/P5Sketch.vue';
import { SKETCHES, getSketchById } from '@/sketches';
import SketchMenu from '@/components/SketchMenu.vue';

type P5SketchExposed = { reload: () => void };

const router = useRouter();
const sketchRef = ref<P5SketchExposed | null>(null);
const selectedId = ref(SKETCHES[0]?.id ?? '');
const activeDefinition = computed(() => getSketchById(selectedId.value));

function reloadCurrent() {
  sketchRef.value?.reload();
}

function selectSketch(id: string) {
  selectedId.value = id;
}

function goHome() {
  router.push('/');
}
</script>

<template>
  <P5Sketch
    ref="sketchRef"
    :definition="activeDefinition"
    overlayAlign="none"
  >
    <SketchMenu
      :sketches="SKETCHES"
      :selectedSketchId="selectedId"
      :onSelectSketch="selectSketch"
      :onReload="reloadCurrent"
      :onHome="goHome"
    />
  </P5Sketch>
</template>

<style scoped>
.hero-overlay {
  width: min(720px, 92vw);
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;

  padding: 14px 16px;
  border-radius: 14px;

  backdrop-filter: blur(8px);
  background: rgba(200, 200, 200, 0.5);
  border-radius: 12px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.75);

    margin-bottom: env(safe-area-inset-bottom);
}

.btn {
  margin-top: 6px;
  padding: 10px 14px;
  border-radius: 4px;
  border: 2px solid #111;
  background-color: rgba(0, 0, 0, 0.0);
  cursor: pointer;
  color: #111;
  box-shadow:
    0 0 2px rgba(16, 16, 16, 0.5);
  display: block;
}

.btn:hover {
  box-shadow:
    0 0 3px rgba(16, 16, 16, 0.9);
}

.btn-left {
  margin-right: 10px;
}

.primary {
  font-weight: 600;
}
</style>