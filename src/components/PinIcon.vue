<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    :class="[`transition-all duration-300 ease-in-out`, isPinned ? 'fill-current text-amber-500 transform scale-110' : 'fill-current text-gray-500 hover:text-amber-400']"
  >
    <path
      v-if="isPinned"
      d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"
    />
    <path
      v-else
      d="M14 4v5c0 1.12.37 2.16 1 3H9c.65-.86 1-1.9 1-3V4h4m3-2H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3V4h1c.55 0 1-.45 1-1s-.45-1-1-1z"
      stroke="currentColor"
      stroke-width="1"
      fill="none"
    />
  </svg>
</template>

<script setup>
defineProps({
  isPinned: {
    type: Boolean,
    default: false
  },
  size: {
    type: [Number, String],
    default: 20
  }
});
</script>