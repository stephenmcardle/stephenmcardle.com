<script setup lang="ts">
import { ref, onMounted } from "vue";
import AppButton from '@/components/AppButton.vue';
import LoadingButton from '@/components/LoadingButton.vue';
import P5Sketch from "@/components/P5Sketch.vue";
import { defaultSketch } from "@/sketches";
import { useSketchController } from "@/composables/useSketchController";

const { sketchRef, isReloading, reloadCurrentSketch, onLoadingChange } = useSketchController();

const activeDefinition = ref(defaultSketch());

onMounted(() => {
  import('@/views/SketchesPage.vue');
});

</script>

<template>
    <P5Sketch
      ref="sketchRef"
      :definition="activeDefinition"
      overlayAlign="center"
      :showLoadingOverlay="false"
      @loading-change="onLoadingChange"
    >
      <div class="hero-overlay">
        <img class="hero-image" src="/img/self.jpg" />
        <div class="hero-content">
          <h1>Stephen McArdle</h1>
          <p>Software Engineer • Generative Artist</p>
          <a href=""><AppButton size="md">My Resume</AppButton></a>
          <div class="social-icons">
            <a href="https://github.com/stephenmcardle">
              <font-awesome-icon class="fa-3x fa-width-auto icon" :icon="['fab', 'square-github']" />
            </a>
            <a href="https://www.linkedin.com/in/stephen-mcardle/">
              <font-awesome-icon class="fa-3x fa-width-auto icon" :icon="['fab', 'square-linkedin']" />
            </a>
            <a href="https://instagram.com/generativeartworks">
              <font-awesome-icon class="fa-3x fa-width-auto icon" :icon="['fab', 'square-instagram']" />
            </a>
            <a href="mailto:stephenwmcardle@gmail.com">
              <font-awesome-icon class="fa-3x fa-width-auto icon" :icon="['fa', 'square-envelope']" />
            </a>
          </div>
          <LoadingButton class="btn-left" size="md" :loading="isReloading" @click="reloadCurrentSketch">
            New Background
          </LoadingButton>
          <RouterLink to="/sketches"><AppButton size="md">More Sketches</AppButton></RouterLink>
        </div>
      </div>
    </P5Sketch>
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
  color: #0b0b0f;
}

.social-icons {
  max-width: 600px;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}
</style>
