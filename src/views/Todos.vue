<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../services/db'
import { useToast } from '../composables/useToast'
import PageHeader from '../components/PageHeader.vue'
import BaseModal from '../components/BaseModal.vue'

const { showToast } = useToast()
const todos = ref([])
const title = ref('')
const deadline = ref('')
const showModal = ref(false)
const editingId = ref(null)

const loadTodos = async () => {
  const allTodos = await db.todos.toArray()
  todos.value = allTodos.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
}

onMounted(loadTodos)

const openModal = (todo = null) => {
  if (todo) {
    editingId.value = todo.id
    title.value = todo.title
    deadline.value = todo.deadline
  } else {
    editingId.value = null
    title.value = ''
    deadline.value = ''
  }
  showModal.value = true
}

const saveTodo = async () => {
  if (!title.value || !deadline.value) {
    showToast('Tugas dan deadline harus diisi!', 'error')
    return
  }

  if (editingId.value) {
    await db.todos.update(editingId.value, { 
      title: title.value, 
      deadline: deadline.value 
    })
    showToast('To-Do berhasil diperbarui!', 'success')
  } else {
    await db.todos.add({ 
      title: title.value, 
      deadline: deadline.value, 
      is_completed: false, 
      created_at: new Date() 
    })
    showToast('To-Do berhasil ditambahkan!', 'success')
  }
  
  if (Notification.permission !== 'granted') {
    Notification.requestPermission()
  }
  
  showModal.value = false
  await loadTodos()
}

const toggleTodo = async (todo) => {
  await db.todos.update(todo.id, { is_completed: !todo.is_completed })
  if (!todo.is_completed) {
    showToast('To-Do diselesaikan!', 'success')
  }
  await loadTodos()
}

const deleteTodo = async (id) => {
  await db.todos.delete(id)
  showToast('To-Do dihapus.', 'success')
  await loadTodos()
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <PageHeader 
      title="To-Do" 
      @action="openModal()" 
    />

    <BaseModal 
      :show="showModal" 
      :title="editingId ? 'Edit To-Do' : 'To-Do Baru'"
      @close="showModal = false"
    >
      <div class="flex flex-col">
        <label class="font-bold mb-1">Nama Tugas</label>
        <input v-model="title" class="w-full border-[3px] border-black p-3 mb-4 font-bold outline-none focus:bg-main transition-colors" placeholder="Cth: Beli Kopi" />
        
        <label class="font-bold mb-1">Batas Waktu (Deadline)</label>
        <input v-model="deadline" type="datetime-local" class="w-full border-[3px] border-black p-3 mb-6 font-bold outline-none focus:bg-main transition-colors" />
      </div>

      <template #actions>
        <button @click="saveTodo" class="w-full bg-main text-black font-black uppercase tracking-wider px-6 py-3 border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] transition-all">
          {{ editingId ? 'Perbarui To-Do' : 'Simpan To-Do' }}
        </button>
      </template>
    </BaseModal>

    <transition-group name="list" tag="div" class="flex flex-col gap-4">
      <div v-for="todo in todos" :key="todo.id" class="bg-white border-[3px] border-black shadow-neo p-4 flex justify-between items-center transition-colors" :class="{ 'bg-gray-light': todo.is_completed }">
        <div class="flex items-center gap-4 grow">
          <input type="checkbox" :checked="todo.is_completed" @change="toggleTodo(todo)" class="w-6 h-6 border-[3px] border-black accent-main cursor-pointer" />
          <div class="grow">
            <h3 class="font-bold text-lg" :class="{ 'line-through text-gray-text': todo.is_completed }">{{ todo.title }}</h3>
            <p class="text-sm font-medium">{{ new Date(todo.deadline).toLocaleString('id-ID') }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="openModal(todo)" class="bg-main font-bold px-4 py-2 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"><i class="fa-solid fa-pen-to-square"></i></button>
          <button @click="deleteTodo(todo.id)" class="bg-danger font-bold px-4 py-2 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <div v-if="todos.length === 0" class="text-center font-bold text-gray-text py-10 border-[3px] border-black border-dashed bg-white">
        Belum ada To-Do.
      </div>
    </transition-group>
  </div>
</template>
