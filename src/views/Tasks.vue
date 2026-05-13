<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../services/db'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()
const tasks = ref([])
const title = ref('')
const frequency = ref('daily')
const showModal = ref(false)
const editingId = ref(null)

const loadTasks = async () => {
  tasks.value = await db.tasks.toArray()
  checkStreaks()
}

onMounted(loadTasks)

const checkStreaks = async () => {
  const now = new Date()
  let updated = false
  for (const task of tasks.value) {
    if (task.last_completed_at) {
      const last = new Date(task.last_completed_at)
      const diffTime = Math.abs(now - last)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let reset = false
      if (task.frequency === 'daily' && diffDays > 1) reset = true
      if (task.frequency === 'weekly' && diffDays > 7) reset = true
      if (task.frequency === 'monthly' && diffDays > 30) reset = true

      if (reset && task.current_streak > 0) {
        await db.tasks.update(task.id, { current_streak: 0 })
        updated = true
      }
    }
  }
  if (updated) tasks.value = await db.tasks.toArray()
}

const openModal = (task = null) => {
  if (task) {
    editingId.value = task.id
    title.value = task.title
    frequency.value = task.frequency
  } else {
    editingId.value = null
    title.value = ''
    frequency.value = 'daily'
  }
  showModal.value = true
}

const saveTask = async () => {
  if (!title.value) {
    showToast('Nama task harus diisi!', 'error')
    return
  }

  if (editingId.value) {
    await db.tasks.update(editingId.value, {
      title: title.value,
      frequency: frequency.value,
    })
    showToast('Task berhasil diperbarui!', 'success')
  } else {
    await db.tasks.add({
      title: title.value,
      frequency: frequency.value,
      current_streak: 0,
      longest_streak: 0,
      last_completed_at: null,
    })
    showToast('Task berhasil ditambahkan!', 'success')
  }

  showModal.value = false
  await loadTasks()
}

const isTaskDone = (task) => {
  if (!task.last_completed_at) return false
  const last = new Date(task.last_completed_at)
  const now = new Date()
  
  if (task.frequency === 'daily') {
    return last.toDateString() === now.toDateString()
  }
  
  const diffTime = Math.abs(now - last)
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  
  if (task.frequency === 'weekly') return diffDays < 7
  if (task.frequency === 'monthly') return diffDays < 30
  
  return false
}

const completeTask = async (task) => {
  if (isTaskDone(task)) {
    showToast('Task ini sudah selesai untuk periode ini!', 'info')
    return
  }
  
  const newStreak = task.current_streak + 1
  const longest = newStreak > task.longest_streak ? newStreak : task.longest_streak
  await db.tasks.update(task.id, {
    current_streak: newStreak,
    longest_streak: longest,
    last_completed_at: new Date().toISOString(),
  })
  showToast(`Streak meningkat! Total: ${newStreak} 🔥`, 'success')
  await loadTasks()
}

const deleteTask = async (id) => {
  await db.tasks.delete(id)
  showToast('Task dihapus.', 'success')
  await loadTasks()
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-black uppercase border-b-[3px] border-black pb-2 inline-block">
        Tasks & Streaks
      </h2>
      <button
        @click="openModal"
        class="bg-accent text-white font-bold px-6 py-2 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
      >
        <i class="fa-solid fa-plus mr-2"></i>Tambah
      </button>
    </div>

    <!-- Modal Form -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white border-[3px] border-black shadow-neo p-6 w-full max-w-md flex flex-col relative"
      >
        <button
          @click="showModal = false"
          class="absolute top-4 right-4 text-xl active:translate-y-[2px]"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h3 class="text-xl font-black uppercase mb-4">
          {{ editingId ? 'Edit Task' : 'Task Baru' }}
        </h3>

        <label class="font-bold mb-1">Nama Task (Habit)</label>
        <input
          v-model="title"
          class="w-full border-[3px] border-black p-3 mb-4 font-bold outline-none focus:bg-main transition-colors"
          placeholder="Cth: Olahraga Pagi"
        />

        <label class="font-bold mb-1">Frekuensi</label>
        <select
          v-model="frequency"
          class="w-full border-[3px] border-black p-3 mb-6 font-bold outline-none focus:bg-main bg-white cursor-pointer transition-colors"
        >
          <option value="daily">Harian (Daily)</option>
          <option value="weekly">Mingguan (Weekly)</option>
          <option value="monthly">Bulanan (Monthly)</option>
        </select>

        <button
          @click="saveTask"
          class="bg-main text-black font-black uppercase tracking-wider px-6 py-3 border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          {{ editingId ? 'Perbarui Task' : 'Simpan Task' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="bg-white border-[3px] border-black shadow-neo p-6 flex flex-col items-center text-center"
      >
        <h3 class="font-bold text-xl mb-2">{{ task.title }}</h3>
        <span
          class="bg-main font-bold px-3 py-1 border-[3px] border-black text-xs mb-4 uppercase"
          >{{ task.frequency }}</span
        >
        <div class="text-5xl font-black mb-2 text-accent">
          {{ task.current_streak }} <i class="fa-solid fa-fire text-warning text-4xl"></i>
        </div>
        <p class="font-bold text-gray-dark mb-6">Longest: {{ task.longest_streak }}</p>

        <div class="flex flex-col gap-3 w-full mt-auto">
          <button
            @click="completeTask(task)"
            :disabled="isTaskDone(task)"
            class="w-full font-bold px-4 py-2 border-[3px] border-black shadow-neo transition-all"
            :class="isTaskDone(task) ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-75' : 'bg-success hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover'"
          >
            <i class="fa-solid" :class="isTaskDone(task) ? 'fa-check-double' : 'fa-check'"></i>
            {{ isTaskDone(task) ? ' Sudah Selesai' : ' Done' }}
          </button>
          <div class="flex gap-2 w-full">
            <button
              @click="openModal(task)"
              class="grow bg-main font-bold px-4 py-2 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
            >
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button
              @click="deleteTask(task.id)"
              class="bg-danger font-bold px-4 py-2 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="tasks.length === 0"
        class="sm:col-span-2 md:col-span-3 text-center font-bold text-gray-text py-10 border-[3px] border-black border-dashed bg-white"
      >
        Belum ada Task.
      </div>
    </div>
  </div>
</template>
