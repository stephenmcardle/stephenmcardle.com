<script setup lang="ts">
import AppButton from '@/components/AppButton.vue';

type ButtonType = 'button' | 'submit' | 'reset';
type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    loading: boolean;
    loadingText?: string;
    disabled?: boolean;
    type?: ButtonType;
    variant?: Variant;
    size?: Size;
    block?: boolean;
  }>(),
  {
    disabled: false,
    type: 'button',
    variant: 'secondary',
    size: 'md',
    block: false,
  }
);

const emit = defineEmits<{
  (e: 'click', ev: MouseEvent): void;
}>();

function onClick(ev: MouseEvent) {
  if (props.disabled || props.loading) {
    ev.preventDefault();
    ev.stopPropagation();
    return;
  }
  emit("click", ev);
}
</script>

<template>
  <AppButton
    :type="type"
    :variant="variant"
    :size="size"
    :block="block"
    :disabled="disabled || loading"
    class="loading-btn"
    :aria-busy="loading ? 'true' : 'false'"
    @click="onClick"
  >
    <span class="btn-content">
      <span class="btn-label" :class="{ hidden: loading }">
        <slot />
      </span>

      <span class="btn-spinner" :class="{ visible: loading }" aria-hidden="true" />

      <span v-if="loadingText" class="btn-loading-text" :class="{ visible: loading }">
        {{ loadingText }}
      </span>
    </span>
  </AppButton>
</template>

<style>
.loading-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 12px;
  cursor: pointer;
}

.loading-btn:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.btn-content {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
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
  border: 2px solid rgba(100, 100, 100, 0.55);
  border-top-color: #0b0b0f;

  opacity: 0;
  animation: spin 0.8s linear infinite;
}

.btn-spinner.visible {
  opacity: 1;
}

.btn-loading-text {
  position: absolute;
  opacity: 0;
  transition: opacity 120ms ease;
}

.btn-loading-text.visible {
  opacity: 1;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn-spinner {
    animation: none;
  }
}
</style>