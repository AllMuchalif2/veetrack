<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

defineEmits(['close'])
</script>

<template>
  <transition name="modal">
    <div 
      v-if="show" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
      @click.self="$emit('close')"
    >
      <div class="bg-white border-[3px] border-black shadow-neo p-6 w-full max-w-md flex flex-col relative transition-all">
        <!-- Close Button -->
        <button 
          @click="$emit('close')" 
          class="absolute top-4 right-4 text-xl hover:scale-110 active:translate-y-[2px] transition-all"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
        
        <!-- Modal Title -->
        <h3 v-if="title" class="text-xl font-black uppercase mb-4 pr-8">{{ title }}</h3>
        
        <!-- Modal Body -->
        <div class="modal-body">
          <slot></slot>
        </div>
        
        <!-- Modal Actions -->
        <div v-if="$slots.actions" class="mt-6">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .shadow-neo,
.modal-leave-active .shadow-neo {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .shadow-neo {
  transform: scale(0.9) translateY(20px);
}

.modal-leave-to .shadow-neo {
  transform: scale(0.95);
}
</style>
