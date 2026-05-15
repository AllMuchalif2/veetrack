<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    default: 'Tambah'
  },
  showButton: {
    type: Boolean,
    default: true
  }
})

defineEmits(['action'])
</script>

<template>
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-3xl font-black uppercase border-b-[3px] border-black pb-2 inline-block">
      {{ title }}
    </h2>
    <button
      v-if="showButton"
      @click="$emit('action')"
      class="bg-accent text-white font-bold px-4 md:px-6 py-2 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all flex items-center"
    >
      <i class="fa-solid fa-plus" :class="{ 'md:mr-2': buttonText }"></i>
      <span v-if="buttonText" class="hidden md:inline">{{ buttonText }}</span>
    </button>
  </div>
</template>
