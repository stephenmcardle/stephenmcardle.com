<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);

const props = defineProps<{
  onReload: () => void;
  onRandom: () => void;
  onHome: () => void;
}>();

function toggle() {
  open.value = !open.value;
}
function close() {
  open.value = false;
}

function handle(fn: () => void) {
  close();
  fn();
}

</script>

<template>
  <div class="menu" @keydown.esc="close">
    <button
      class="menu-button"
      type="button"
      :aria-expanded="open"
      aria-controls="sketch-menu-panel"
      @click="toggle"
    >
      <Transition name="icon" mode="out-in">
        <font-awesome-icon v-if="!open" :icon="['fa', 'bars']" class="icon" />
        <font-awesome-icon v-else :icon="['fa', 'x']" class="icon" />
      </Transition>
      <span class="sr-only">Menu</span>
    </button>
    <Transition name="panel">
      <div
        v-if="open"
        id="sketch-menu-panel"
        class="panel"
        role="menu"
      >
        <button class="item" role="menuitem" type="button" @click="() => handle(onReload)">
          Reload sketch
        </button>

        <button class="item" role="menuitem" type="button" @click="() => handle(onRandom)">
          New sketch
        </button>

        <button class="item" role="menuitem" type="button" @click="onHome">
          Back home
        </button>
      </div>
    </Transition>
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
}

@media (max-width: 640px) {
  .menu {
    right: 12px;
    left: 12px;

    display: flex;
    justify-content: flex-end;
  }

  .panel {
    width: min(520px, 95%);
  }
}

.panel-enter-active {
  transition: opacity 140ms ease, transform 140ms ease;
  transform-origin: top right;
}

.panel-enter-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}

.panel-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.panel-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
  transform-origin: top right;
}

.panel-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.panel-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
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

.icon {
  color: white;
  display: block;
  font-size: 18px;
}

.icon-enter-active,
.icon-leave-active {
  transition: opacity 140ms ease, transform 140ms ease;
}

.icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}
.icon-enter-to {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.icon-leave-from {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}
.icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
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