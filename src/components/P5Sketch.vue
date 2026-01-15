<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import type { SketchDefinition, SketchContext, SketchInstance } from '@/sketches/types';

type P5Constructor = typeof import('p5').default;
let P5: P5Constructor | null = null;

async function getP5(): Promise<P5Constructor> {
  if (P5) return P5;
  const mod = await import('p5');
  P5 = mod.default;
  return P5;
}

const props = withDefaults(
  defineProps<{
    definition: SketchDefinition;
    overlayAlign?: 'center' | 'none';
    showLoadingOverlay?: boolean;
  }>(),
  {
    overlayAlign: 'center',
    showLoadingOverlay: true,
  }
);

const overlayClass = computed(() =>
  props.overlayAlign === 'center' ? 'overlay-center' : 'overlay-none'
);

const host = ref<HTMLDivElement | null>(null);
let inst: InstanceType<P5Constructor> | null = null;

let activeSketch: SketchInstance | null = null;

const emit = defineEmits<{
  (e: 'loading-change', value: boolean): void;
}>();

const loading = ref(true);

function setLoading(v: boolean) {
  loading.value = v;
  emit('loading-change', v);
}

function getHostSize() {
  const el = host.value!;
  return { width: el.clientWidth, height: el.clientHeight };
}

async function mount() {
  if (!host.value) return;

  setLoading(true);
  await nextTick();

  const p5 = await getP5();

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
        props.definition.renderer === 'webgl' ? p.WEBGL : p.P2D;

      p.createCanvas(Math.max(1, width), Math.max(1, height), renderer);
      p.pixelDensity(window.devicePixelRatio || 1);
      p.frameRate(60);

      activeSketch?.setup?.(ctx());
    };

    p.draw = () => {
      activeSketch?.draw(ctx());

      if (isFirstFrame) {
        isFirstFrame = false;
        setLoading(false);
      }
    };

    p.windowResized = resize;
  }, host.value);
}

function unmount() {
  activeSketch?.dispose?.();
  activeSketch = null;

  try {
    const canvas = host.value?.querySelector('canvas') as HTMLCanvasElement | null;
    const gl =
      (canvas?.getContext('webgl2') as WebGL2RenderingContext | null) ??
      (canvas?.getContext('webgl') as WebGLRenderingContext | null)

    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    // ignore
  }

  inst?.remove();
  inst = null;
}

onMounted(async () => {
  await nextTick();
  await mount();
});

onBeforeUnmount(unmount);
</script>

<template>
  <section
    class="sketch-hero sketch-root"
    :class="{ 'overlay-center-mode': props.overlayAlign === 'center' }"
  >
    <div ref="host" class="canvas-host">
      <div class="overlay" :class="overlayClass">
        <slot />
      </div>

      <div v-if="props.showLoadingOverlay && loading" class="loading">
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
  z-index: 0;
}

.sketch-hero.overlay-center-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
}

.canvas-host {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
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
  z-index: 2;
  overflow: hidden;
}

.overlay-center-mode .overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
}

.overlay-none {
  pointer-events: none;
}

.overlay :deep(*) {
  pointer-events: auto;
}

.overlay-center {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: clamp(16px, 3vh, 24px);
  padding-top: max(clamp(16px, 3vh, 24px), env(safe-area-inset-top));
  padding-bottom: max(clamp(16px, 3vh, 24px), env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* On short viewports, allow content to start from top and scroll */
@media (max-height: 700px) {
  .overlay-center {
    align-items: flex-start;
    padding-top: max(clamp(12px, 2vh, 16px), env(safe-area-inset-top));
  }

  .overlay-center :deep(.hero-overlay) {
    margin-top: clamp(8px, 1.5vh, 16px);
  }
}

.loading {
  position: absolute;
  inset: 0;
  z-index: 1;
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
