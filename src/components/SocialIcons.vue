<template>
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
</template>

<style scoped>
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