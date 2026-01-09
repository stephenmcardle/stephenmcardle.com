<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from "vue";
import p5 from "p5";
import type { SketchDefinition, SketchContext, SketchInstance } from "@/sketches/types";

const props = withDefaults(
  defineProps<{
    definition: SketchDefinition;
    overlayAlign?: 'center' | 'none';
  }>(),
  { overlayAlign: 'center' }
);

const overlayClass = computed(() => 
  props.overlayAlign === 'center' ? 'overlay-center': 'overlay-none'
);

const host = ref<HTMLDivElement | null>(null);
let inst: p5 | null = null;

let activeSketch: SketchInstance | null = null;

const loading = ref(true);

function getHostSize() {
  const el = host.value!;
  return { width: el.clientWidth, height: el.clientHeight };
}

function mount() {
  if (!host.value) return;

  inst = new p5((p) => {
    activeSketch = props.definition.create();
    let isFirstFrame = true;

    const ctx = (): SketchContext => ({
      p,
      width: p.width,
      height: p.height,
      renderer: props.definition.renderer,
    });

    const resize = () => {
      const { width, height } = getHostSize();
      if (width > 0 && height > 0) {
        p.resizeCanvas(width, height);
        p.pixelDensity(window.devicePixelRatio || 1);
        activeSketch?.windowResized?.(ctx());
      }
    };

    p.setup = () => {
      const { width, height } = getHostSize();
      const renderer =
        props.definition.renderer === "webgl" ? p.WEBGL : p.P2D;

      p.createCanvas(Math.max(1, width), Math.max(1, height), renderer);
      p.pixelDensity(window.devicePixelRatio || 1);
      p.frameRate(60);

      activeSketch?.setup?.(ctx());
    };

    p.draw = () => {
      activeSketch?.draw(ctx());

      if (isFirstFrame) {
        isFirstFrame = false;
        loading.value = false;
      }
    };

    p.windowResized = resize;
  }, host.value);
}

function unmount() {
  activeSketch?.dispose?.();
  activeSketch = null;

  try {
    const canvas = host.value?.querySelector("canvas") as HTMLCanvasElement | null;
    const gl =
      (canvas?.getContext("webgl2") as WebGL2RenderingContext | null) ??
      (canvas?.getContext("webgl") as WebGLRenderingContext | null);

    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    // ignore
  }

  inst?.remove();
  inst = null;
}

async function restart() {
  loading.value = true;
  await nextTick();
  inst?.noLoop();

  unmount();
  await nextTick();
  mount();
}

async function reload() {
  await restart();
}
defineExpose({ reload });

onMounted(async () => {
  await nextTick();
  mount();
});

onBeforeUnmount(unmount);

watch(
  () => props.definition,
  async () => {
    await restart();
  }
);
</script>


<template>
  <section class="sketch-hero">
    <div ref="host" class="canvas-host">
      <div class="overlay" :class="overlayClass">
        <slot />
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner" aria-label="Loading" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.sketch-hero {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.canvas-host {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.canvas-host :deep(canvas) {
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.overlay :deep(*) {
  pointer-events: auto;
}

.overlay-center {
  display: grid;
  place-items: center;
}

.loading {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: #0b0b0f;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}

.spinner {
  width: 44px;
  height: 44px;
  border-radius: 100%;
  border: 4px solid rgba(255, 255, 255, 0.25);
  border-top-color: #f9f9f9;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .spinner { animation: none; }
}

</style>
