<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useNotifications } from './composables/useNotifications'

useNotifications()
</script>

<template>
  <div class="min-h-screen flex flex-col pb-24 md:pb-6">
    <ToastContainer />
    <Navbar />

    <main class="grow p-4 md:p-6 w-full max-w-5xl mx-auto overflow-x-hidden">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>
