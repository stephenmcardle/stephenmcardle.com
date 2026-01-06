<script setup lang="ts">
import { ref } from "vue";
import P5Sketch from "@/components/P5Sketch.vue";
import { randomSketch } from "@/sketches";

const active = ref(randomSketch());
const reloadKey = ref(0);

function pickRandom() {
  let sketch = randomSketch();
  while (sketch.id === active.value.id) {
    sketch = randomSketch();
  }
  active.value = sketch;
  reloadKey.value++;
}

function reloadCurrent() {
  reloadKey.value++;
}
</script>

<template>
  <P5Sketch
    :key="reloadKey"
    :definition="active"
  >
    <div class="hero-content">
      <h1>Stephen McArdle</h1>
      <p>Software Engineer</p>
      <!-- <p>Sketch: {{ active.id }} ({{ active.renderer }})</p> -->
      <!-- <button class="btn" @click="pickRandom">Random sketch</button> -->
      <button class="btn" @click="reloadCurrent">New Background</button>
      <div class="social-icons">
        <a href="https://github.com/stephenmcardle">
          <font-awesome-icon class="fa-4x icon" :icon="['fab', 'square-github']" />
        </a>
        <a href="https://www.linkedin.com/in/stephen-mcardle/">
          <font-awesome-icon class="fa-4x icon" :icon="['fab', 'square-linkedin']" />
        </a>
        <a href="https://instagram.com/generativeartworks">
          <font-awesome-icon class="fa-4x icon" :icon="['fab', 'square-instagram']" />
        </a>
      </div>
    </div>
  </P5Sketch>

  <section class="content">
    <h2>Content below</h2>
    <p>Scroll works normally.</p>
  </section>
</template>

<style>
.hero-content {
  color: black;
  max-width: 600px;
  padding: 1.5rem;
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.55);
  border-radius: 12px;
}

.icon {
  color: #111;
}

.social-icons {
  max-width: 600px;
  margin-top: 1.5rem;
}

.btn {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  border-color: #555;
  cursor: pointer;
  background-color: #111;
  color: #f9f9f9;
}

.content {
  padding: 2rem;
}
</style>
