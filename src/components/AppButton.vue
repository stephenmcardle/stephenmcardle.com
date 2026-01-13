<script setup lang="ts">
type ButtonType = 'button' | 'submit' | 'reset';
type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    type?: ButtonType;
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    block?: boolean;
  }>(),
  {
    type: "button",
    variant: "secondary",
    size: "md",
    disabled: false,
    block: false,
  }
);

const emit = defineEmits<{
  (e: 'click', ev: MouseEvent): void;
}>();

function onClick(ev: MouseEvent) {
  if (props.disabled) {
    ev.preventDefault();
    ev.stopImmediatePropagation();
    return;
  }

  emit('click', ev);
}
</script>

<template>
  <button
    class="app-btn"
    :class="[variant, size, { block }]"
    :type="type"
    :disabled="disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  margin-top: 6px;
  border-radius: 8px;
  border: 1px solid #0b0b0f;
  cursor: pointer;
  color: #0b0b0f;
  box-shadow:
    0 0 2px rgba(16, 16, 16, 0.5);
}

.app-btn:hover {
  box-shadow:
    0 0 3px rgba(16, 16, 16, 0.9);
}

.app-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.app-btn.sm { min-height: 36px; padding: 0 12px; }
.app-btn.md { min-height: 44px; padding: 0 16px; }
.app-btn.lg { min-height: 52px; padding: 0 18px; }

.app-btn.primary { background: rgba(255, 255, 255, 0.48); font-weight: 600; }
.app-btn.secondary { background: rgba(255, 255, 255, 0.2); }
.app-btn.ghost { background: rgba(255, 255, 255, 0.08); }

.app-btn.block { width: 100%; }

.btn-left {
  margin-right: 10px;
}
</style>