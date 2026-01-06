<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import P5Sketch from '@/components/P5Sketch.vue';
import { randomSketch } from '@/sketches';
import SketchMenu from '@/components/SketchMenu.vue';

type P5SketchExposed = { reload: () => void };
const sketchRef = ref<P5SketchExposed | null>(null);

const active = ref(randomSketch());

function pickRandom() {
  let sketch = randomSketch();
  while (sketch.id === active.value.id) {
    sketch = randomSketch();
  }
  active.value = sketch;
}

function reloadCurrent() {
  sketchRef.value?.reload();
}

const router = useRouter();
function goHome() {
  router.push('/');
}
</script>

<template>
  <P5Sketch
    ref="sketchRef"
    :definition="active"
    overlayAlign="none"
  >
    <SketchMenu
      :onReload="reloadCurrent"
      :onRandom="pickRandom"
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