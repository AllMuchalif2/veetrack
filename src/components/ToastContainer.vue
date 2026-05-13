<script setup>
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="fixed top-4 right-4 z-100 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="p-4 border-[3px] border-black shadow-neo font-bold flex justify-between items-start min-w-[250px] max-w-sm transition-all bg-white"
        :class="{
          'border-l-8 border-l-success-text': toast.type === 'success',
          'border-l-8 border-l-danger-text': toast.type === 'error',
        }"
      >
        <span class="whitespace-pre-wrap text-sm leading-relaxed">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="ml-4 active:translate-y-px">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
