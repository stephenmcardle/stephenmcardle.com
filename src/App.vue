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
    <div class="hero-overlay">
      <img class="hero-image" src="/img/self.jpg" />
      <div class="hero-content">
        <h1>Stephen McArdle</h1>
        <p>Software Engineer</p>
        <!-- <p>Sketch: {{ active.id }} ({{ active.renderer }})</p> -->
        <!-- <button class="btn" @click="pickRandom">Random sketch</button> -->
        <!-- <button class="btn" @click="reloadCurrent">New Background</button> -->
        <div class="social-icons">
          <a href="https://github.com/stephenmcardle">
            <font-awesome-icon class="fa-3x icon" :icon="['fab', 'square-github']" />
          </a>
          <a href="https://www.linkedin.com/in/stephen-mcardle/">
            <font-awesome-icon class="fa-3x icon" :icon="['fab', 'square-linkedin']" />
          </a>
          <a href="https://instagram.com/generativeartworks">
            <font-awesome-icon class="fa-3x icon" :icon="['fab', 'square-instagram']" />
          </a>
          <a href="mailto:stephenwmcardle@gmail.com">
            <font-awesome-icon class="fa-3x icon" :icon="['fa', 'square-envelope']" />
          </a>
        </div>
      </div>
    </div>
  </P5Sketch>

  <!-- <section class="content">
    <h2>Content below</h2>
    <p>Scroll works normally.</p>
  </section> -->
</template>

<style>

.hero-overlay {
  width: min(500px, 80vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  padding: 24px;
  max-width: min(720px, 92vw);
}

.hero-image {
  /* width: clamp(200px, 22vw, 600px); */
  width: 90%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  display: block;
  object-fit: cover;

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.75);
  
  user-select: none;
  -webkit-user-drag: none;
}

.hero-content {
  width: 100%;
  color: black;
  text-align: center;
  padding: 18px;
  padding-top: 8px;
  max-width: 600px;
  backdrop-filter: blur(6px);
  background: rgba(200, 200, 200, 0.5);
  border-radius: 12px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.75);

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
