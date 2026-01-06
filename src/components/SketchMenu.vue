<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);

const props = defineProps<{
  onReload: () => void;
  onRandom: () => void;
  onHome: () => void;
}>();
</script>

<template>
  <div class="menu" @keydown.esc="open = false">
    <button
      class="menu-button"
      type="button"
      :aria-expanded="open"
      aria-controls="sketch-menu-panel"
      @click="open = !open"
    >
      <font-awesome-icon v-if="!open" :icon="['fa', 'bars']" />
      <font-awesome-icon v-else :icon="['fa', 'x']" />
      <span class="sr-only">Menu</span>
    </button>
    <div
      v-show="open"
      id="sketch-menu-panel"
      class="panel"
      role="menu"
    >
      <button class="item" role="menuitem" type="button" @click="onReload">
        Reload sketch
      </button>

      <button class="item" role="menuitem" type="button" @click="onRandom">
        New sketch
      </button>

      <button class="item" role="menuitem" type="button" @click="onHome">
        Back home
      </button>
    </div>
  </div>
</template>

<style scoped>
.menu {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  display: inline-block;
}

.menu-button {
  position: relative;
  z-index: 3;

  border: 0;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;

  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.35);
  color: white;
}

.panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;

  width: min(240px, 80vw);
  border-radius: 14px;
  padding: 10px;

  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.45);
  color: white;
  
  display: flex;
  flex-direction: column;
  gap: 8px;

  transform-origin: top right;
  animation: menu-in 120ms ease-out;
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.item {
  border: 0;
  border-radius: 10px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;

  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.item:over {
  background: rgba(255, 255, 255, 0.14);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>