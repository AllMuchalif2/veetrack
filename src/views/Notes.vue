<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../services/db'
import { fetchAI } from '../services/groq'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()
const notes = ref([])
const title = ref('')
const content = ref('')
const isEditing = ref(false)
const editId = ref(null)
const showModal = ref(false)

const summaryContent = ref('')
const showSummaryModal = ref(false)

const loadNotes = async () => {
  notes.value = await db.notes.toArray()
}

onMounted(loadNotes)

const openModal = () => {
  title.value = ''
  content.value = ''
  isEditing.value = false
  editId.value = null
  showModal.value = true
}

const saveNote = async () => {
  if (!title.value || !content.value) {
    showToast('Judul dan isi catatan harus diisi!', 'error')
    return
  }

  if (isEditing.value) {
    await db.notes.update(editId.value, {
      title: title.value,
      content: content.value,
      updated_at: new Date(),
    })
    showToast('Catatan berhasil diupdate!', 'success')
  } else {
    await db.notes.add({
      title: title.value,
      content: content.value,
      created_at: new Date(),
      updated_at: new Date(),
    })
    showToast('Catatan berhasil ditambahkan!', 'success')
  }

  showModal.value = false
  await loadNotes()
}

const editNote = (note) => {
  title.value = note.title
  content.value = note.content
  isEditing.value = true
  editId.value = note.id
  showModal.value = true
}

const deleteNote = async (id) => {
  await db.notes.delete(id)
  showToast('Catatan berhasil dihapus.', 'success')
  await loadNotes()
}

const summarizeNote = async (note) => {
  try {
    const summary = await fetchAI(
      `Tolong ringkas catatan ini: ${note.content}`,
      'Kamu adalah asisten produktivitas.',
    )
    summaryContent.value = summary
    showSummaryModal.value = true
    showToast('Ringkasan berhasil dibuat!', 'success')
  } catch (error) {
    showToast('Gagal membuat ringkasan AI: ' + error.message, 'error')
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-black uppercase border-b-[3px] border-black pb-2 inline-block">
        Notes
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
        class="bg-white border-[3px] border-black shadow-neo p-6 w-full max-w-lg flex flex-col relative"
      >
        <button
          @click="showModal = false"
          class="absolute top-4 right-4 text-xl active:translate-y-[2px]"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h3 class="text-xl font-black uppercase mb-4">
          {{ isEditing ? 'Edit Catatan' : 'Catatan Baru' }}
        </h3>

        <input
          v-model="title"
          class="w-full border-[3px] border-black p-3 mb-4 font-bold outline-none focus:bg-main transition-colors"
          placeholder="Judul Catatan"
        />
        <textarea
          v-model="content"
          class="w-full border-[3px] border-black p-3 mb-6 h-40 outline-none focus:bg-main transition-colors"
          placeholder="Isi Catatan..."
        ></textarea>

        <button
          @click="saveNote"
          class="bg-main text-black font-black uppercase tracking-wider px-6 py-3 border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          {{ isEditing ? 'Simpan Perubahan' : 'Simpan Catatan' }}
        </button>
      </div>
    </div>

    <!-- AI Summary Modal -->
    <div
      v-if="showSummaryModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white border-[3px] border-black shadow-neo p-6 w-full max-w-lg flex flex-col relative max-h-[80vh]"
      >
        <button
          @click="showSummaryModal = false"
          class="absolute top-4 right-4 text-xl active:translate-y-[2px]"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="flex items-center gap-3 mb-4 border-b-[3px] border-black pb-2">
          <i class="fa-solid fa-robot text-2xl text-accent"></i>
          <h3 class="text-xl font-black uppercase">Ringkasan AI</h3>
        </div>

        <div class="overflow-y-auto whitespace-pre-wrap leading-relaxed font-medium mb-6 grow">
          {{ summaryContent }}
        </div>

        <button
          @click="showSummaryModal = false"
          class="bg-accent text-white font-black uppercase tracking-wider px-6 py-3 border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] transition-all mt-auto"
        >
          Tutup
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="note in notes"
        :key="note.id"
        class="bg-white border-[3px] border-black shadow-neo p-6 flex flex-col"
      >
        <h3 class="font-bold text-xl mb-2">{{ note.title }}</h3>
        <p class="mb-4 grow">{{ note.content }}</p>
        <div class="flex gap-2">
          <button
            @click="editNote(note)"
            class="bg-main font-bold px-4 py-2 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
          >
            <i class="fa-solid fa-pen"></i>
          </button>
          <button
            @click="deleteNote(note.id)"
            class="bg-danger font-bold px-4 py-2 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
          <button
            @click="summarizeNote(note)"
            class="bg-info font-bold px-4 py-2 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
            title="Ringkas dengan AI"
          >
            <i class="fa-solid fa-robot"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
