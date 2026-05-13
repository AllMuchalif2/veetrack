<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '../services/db'

const todos = ref([])
const tasks = ref([])

onMounted(async () => {
  todos.value = await db.todos.toArray()
  tasks.value = await db.tasks.toArray()
})

const todayTodos = computed(() => {
  const today = new Date().toDateString()
  return todos.value
    .filter((t) => !t.is_completed && new Date(t.deadline).toDateString() === today)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
})

const totalStreaks = computed(() => {
  return tasks.value.reduce((sum, task) => sum + (task.current_streak || 0), 0)
})

const quickLinks = [
  { name: 'Notes', path: '/notes', icon: 'fa-note-sticky', color: 'bg-main', textWhite: false },
  { name: 'To-Do', path: '/todos', icon: 'fa-list-check', color: 'bg-white', textWhite: false },
  { name: 'Tasks', path: '/tasks', icon: 'fa-fire', color: 'bg-white', textWhite: false },
  { name: 'Finance', path: '/finance', icon: 'fa-wallet', color: 'bg-white', textWhite: false },
  { name: 'AI Chat', path: '/chat', icon: 'fa-robot', color: 'bg-accent', textWhite: true },
]
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="flex items-center gap-4 border-b-[3px] border-black pb-4">
      <h2 class="text-4xl font-black uppercase">Dashboard</h2>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white border-[3px] border-black shadow-neo p-6 flex flex-col">
        <h3 class="font-bold text-gray-dark uppercase mb-4">
          <i class="fa-solid fa-clock text-danger mr-2"></i>Deadline Hari Ini
        </h3>

        <div v-if="todayTodos.length > 0" class="flex flex-col gap-3 grow">
          <div
            v-for="todo in todayTodos"
            :key="todo.id"
            class="border-[3px] border-black p-3 bg-main font-bold flex justify-between items-center transition-all hover:bg-yellow-300"
          >
            <span class="truncate pr-2">{{ todo.title }}</span>
            <span class="text-xs bg-white px-2 py-1 border-[3px] border-black whitespace-nowrap">{{
              new Date(todo.deadline).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })
            }}</span>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center grow py-4 border-[3px] border-black border-dashed bg-gray-50"
        >
          <p class="text-2xl font-black text-success-text">Bebas Tugas! 🎉</p>
          <p class="text-sm font-bold text-gray-text mt-1">Tidak ada deadline tersisa hari ini.</p>
        </div>
      </div>

      <div
        class="bg-white border-[3px] border-black shadow-neo p-6 flex flex-col justify-center items-center text-center"
      >
        <h3 class="font-bold text-gray-dark uppercase mb-2">
          <i class="fa-solid fa-fire text-warning mr-2"></i>Total Streak Aktif
        </h3>
        <p class="text-7xl font-black text-accent mt-4 drop-shadow-md">
          {{ totalStreaks }} <i class="fa-solid fa-fire text-warning text-6xl"></i>
        </p>
        <p class="font-bold text-gray-text mt-4">Terus pertahankan konsistensi Anda!</p>
      </div>
    </div>

    <!-- Quick Links -->
    <div>
      <h3 class="text-2xl font-black uppercase mb-4 border-b-[3px] border-black pb-2 inline-block">
        Menu Cepat
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <router-link
          v-for="link in quickLinks"
          :key="link.name"
          :to="link.path"
          class="border-[3px] border-black shadow-neo p-4 flex flex-col items-center justify-center text-center hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
          :class="[link.color, link.textWhite ? 'text-white' : 'text-black']"
        >
          <i class="fa-solid text-3xl mb-2" :class="link.icon"></i>
          <span class="font-black uppercase text-sm tracking-wide">{{ link.name }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>
