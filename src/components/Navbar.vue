<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const deferredPrompt = ref(null)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
  })
})

const installApp = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      deferredPrompt.value = null
    }
  }
}
</script>

<template>
  <div>
    <!-- Top Header -->
    <header
      class="bg-main border-b-[3px] border-black p-4 flex justify-between items-center shadow-neo z-10 sticky top-0"
    >
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-black uppercase tracking-wider">veetrack</h1>
        <button
          v-if="deferredPrompt"
          @click="installApp"
          class="hidden md:block ml-2 px-2 py-1 text-xs font-bold bg-white border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
          title="Install App"
        >
          <i class="fa-solid fa-download"></i> Install
        </button>
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex gap-4 font-bold items-center">
        <RouterLink
          to="/"
          class="px-4 py-2 bg-white border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
          >Home</RouterLink
        >
        <RouterLink
          to="/notes"
          class="px-4 py-2 bg-white border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
          >Notes</RouterLink
        >
        <RouterLink
          to="/todos"
          class="px-4 py-2 bg-white border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
          >Todos</RouterLink
        >
        <RouterLink
          to="/tasks"
          class="px-4 py-2 bg-white border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
          >Tasks</RouterLink
        >
        <RouterLink
          to="/finance"
          class="px-4 py-2 bg-white border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
          >Finance</RouterLink
        >
        <RouterLink
          to="/chat"
          class="px-4 py-2 bg-white border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
        >
          AI
        </RouterLink>
        <RouterLink
          to="/settings"
          class="px-3 py-2 bg-white border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
        >
          Settings
        </RouterLink>
      </nav>

      <!-- Mobile Settings & Chat Icons (Top Right) -->
      <div class="md:hidden flex gap-2">
        <button
          v-if="deferredPrompt"
          @click="installApp"
          class="px-3 py-2 bg-white border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-hover transition-all text-black"
          title="Install App"
        >
          <i class="fa-solid fa-download"></i>
        </button>
        <RouterLink
          to="/chat"
          class="px-3 py-2 bg-white border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-hover transition-all"
        >
          <i class="fa-solid fa-robot"></i>
        </RouterLink>
        <RouterLink
          to="/settings"
          class="px-3 py-2 bg-white border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-hover transition-all"
        >
          <i class="fa-solid fa-cog"></i>
        </RouterLink>
      </div>
    </header>

    <!-- Mobile Bottom Navigation -->
    <nav
      class="md:hidden fixed bottom-4 left-4 right-4 bg-white border-[3px] border-black shadow-neo flex justify-between items-center z-20"
    >
      <RouterLink
        to="/"
        exact-active-class="bg-main"
        class="flex-1 flex flex-col items-center py-2 font-black border-r-[3px] border-black hover:bg-main transition-colors"
      >
        <i class="fa-solid fa-home text-xl mb-1"></i>
        <span class="text-[10px] uppercase tracking-tighter">Home</span>
      </RouterLink>
      <RouterLink
        to="/notes"
        active-class="bg-main"
        class="flex-1 flex flex-col items-center py-2 font-black border-r-[3px] border-black hover:bg-main transition-colors"
      >
        <i class="fa-solid fa-note-sticky text-xl mb-1"></i>
        <span class="text-[10px] uppercase tracking-tighter">Notes</span>
      </RouterLink>
      <RouterLink
        to="/todos"
        active-class="bg-main"
        class="flex-1 flex flex-col items-center py-2 font-black border-r-[3px] border-black hover:bg-main transition-colors"
      >
        <i class="fa-solid fa-list-check text-xl mb-1"></i>
        <span class="text-[10px] uppercase tracking-tighter">Todos</span>
      </RouterLink>
      <RouterLink
        to="/tasks"
        active-class="bg-main"
        class="flex-1 flex flex-col items-center py-2 font-black border-r-[3px] border-black hover:bg-main transition-colors"
      >
        <i class="fa-solid fa-bolt text-xl mb-1"></i>
        <span class="text-[10px] uppercase tracking-tighter">Tasks</span>
      </RouterLink>
      <RouterLink
        to="/finance"
        active-class="bg-main"
        class="flex-1 flex flex-col items-center py-2 font-black hover:bg-main transition-colors"
      >
        <i class="fa-solid fa-wallet text-xl mb-1"></i>
        <span class="text-[10px] uppercase tracking-tighter">Finance</span>
      </RouterLink>
    </nav>
  </div>
</template>
