<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, defineExpose, computed } from "vue";
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

function getHostSize() {
  const el = host.value!;
  return { width: el.clientWidth, height: el.clientHeight };
}

function mount() {
  if (!host.value) return;

  inst = new p5((p) => {
    activeSketch = props.definition.create();

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
    };

    p.windowResized = resize;
  }, host.value);
}

function unmount() {
  activeSketch?.dispose?.();
  activeSketch = null;
  inst?.remove();
  inst = null;
}

function reload() {
  unmount();
  nextTick().then(mount);
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
    unmount();
    await nextTick();
    mount();
  }
);
</script>


<template>
  <section class="sketch-hero">
    <div ref="host" class="canvas-host"></div>

    <div class="overlay" :class="overlayClass">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.sketch-hero {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background-color: black;
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

</style>
