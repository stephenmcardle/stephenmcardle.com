<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import AppButton from '@/components/AppButton.vue';
import LoadingButton from '@/components/LoadingButton.vue';
import SocialIcons from '@/components/SocialIcons.vue';
import P5Sketch from '@/components/P5Sketch.vue';
import { defaultSketch } from '@/sketches';
import { useSketchController } from '@/composables/useSketchController';

const { reloadKey, isReloading, reloadCurrentSketch, onLoadingChange } = useSketchController();

const activeDefinition = ref(defaultSketch());

const userRequested = ref(false);

function handleNewBackgroundClick() {
  userRequested.value = true;
  reloadCurrentSketch();
}

watch(isReloading, (v) => {
  if (!v) userRequested.value = false;
});

onMounted(() => {
  import('@/views/SketchesPage.vue');
});
</script>

<template>
  <div class="home-page">
    <P5Sketch
      :key="reloadKey"
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
          <a href="/files/McArdle_Stephen_Resume.pdf"><AppButton size="md">My Resume</AppButton></a>
          <SocialIcons />
          <LoadingButton
            class="btn-left"
            size="md"
            :loading="isReloading && userRequested"
            :disabled="isReloading"
            @click="handleNewBackgroundClick"
          >
            New Background
          </LoadingButton>
          <RouterLink to="/sketches"><AppButton size="md">More Sketches</AppButton></RouterLink>
        </div>
      </div>
    </P5Sketch>
  </div>
</template>

<style scoped>
.home-page {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
}

.hero-overlay {
  width: min(500px, 80vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(12px, 2vh, 16px);

  padding: clamp(16px, 3vh, 24px);
  max-width: min(720px, 92vw);
}

.hero-image {
  width: clamp(200px, 60vw, 400px);
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
  padding: clamp(12px, 2vh, 18px);
  padding-top: clamp(6px, 1vh, 8px);
  max-width: 600px;
  backdrop-filter: blur(6px);
  background: rgba(200, 200, 200, 0.5);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.75);
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.hero-content h1 {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  margin: 0 0 clamp(8px, 1.5vh, 12px) 0;
}

.hero-content p {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
  margin: 0 0 clamp(12px, 2vh, 16px) 0;
}
</style>
