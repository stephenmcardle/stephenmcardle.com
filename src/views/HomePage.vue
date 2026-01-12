<script setup lang="ts">
import { ref, onMounted } from "vue";
import P5Sketch from "@/components/P5Sketch.vue";
import { defaultSketch } from "@/sketches";

const active = ref(defaultSketch());
const reloadKey = ref(0);
const isReloading = ref(false);

function reloadBackground() {
  reloadKey.value++;
}


onMounted(() => {
  import('@/views/SketchesPage.vue');
});

</script>

<template>
  <div class="bg">
    <P5Sketch
      :key="reloadKey"
      :definition="active"
      overlayAlign="center"
      :showLoadingOverlay="false"
      @loading-change="isReloading = $event"
    >
      <div class="hero-overlay">
        <img class="hero-image" src="/img/self.jpg" />
        <div class="hero-content">
          <h1>Stephen McArdle</h1>
          <p>Software Engineer • Generative Artist</p>
          <a href=""><button class="btn">My Resume</button></a>
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
          <button class="btn btn-left reload-btn" @click="reloadBackground" :disabled="isReloading" :aria-busy="isReloading">
            <span class="btn-content">
              <span class="btn-label" :class="{ hidden: isReloading }">
                New Background
              </span>

              <span class="btn-spinner" :class="{ visible: isReloading }" aria-hidden="true" />
            </span>
          </button>
          <RouterLink to="/sketches"><button class="btn">More Sketches</button></RouterLink>
        </div>
      </div>
    </P5Sketch>
  </div>
</template>

<style>
.bg {
  width: 100%;
  height: 100%;
  background-color: #0b0b0f;;
}

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
  width: 80%;
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
  margin-bottom: 1rem;
}

.btn {
  margin-top: 6px;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #111;
  background-color: rgba(0, 0, 0, 0.0);
  cursor: pointer;
  color: #111;
  box-shadow:
    0 0 2px rgba(16, 16, 16, 0.5);
}

.btn:hover {
  box-shadow:
    0 0 3px rgba(16, 16, 16, 0.9);
}

.btn-left {
  margin-right: 10px;
}

.reload-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 12px;
  cursor: pointer;
}

.btn-content {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-label {
  transition: opacity 120ms ease;
}

.btn-label.hidden {
  opacity: 0;
}

.btn-spinner {
  position: absolute;
  width: 16px;
  height: 16px;

  border-radius: 999px;
  border: 2px solid rgba(200, 200, 200, 0.25);
  border-top-color: #111;

  opacity: 0;

  animation: spin 0.8s linear infinite;
}

.btn-spinner.visible {
  opacity: 1;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
