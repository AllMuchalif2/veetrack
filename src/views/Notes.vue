<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../services/db'
import { fetchAI } from '../services/groq'
import { useToast } from '../composables/useToast'
import PageHeader from '../components/PageHeader.vue'
import BaseModal from '../components/BaseModal.vue'

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
    <PageHeader 
      title="Notes" 
      @action="openModal" 
    />

    <!-- Modal Form -->
    <BaseModal 
      :show="showModal" 
      :title="isEditing ? 'Edit Catatan' : 'Catat Baru'"
      @close="showModal = false"
    >
      <div class="flex flex-col">
        <input
          v-model="title"
          class="w-full border-[3px] border-black p-3 mb-4 font-bold outline-none focus:bg-main transition-colors"
          placeholder="Judul Catatan"
        />
        <textarea
          v-model="content"
          class="w-full border-[3px] border-black p-3 mb-2 h-40 outline-none focus:bg-main transition-colors"
          placeholder="Isi Catatan..."
        ></textarea>
      </div>

      <template #actions>
        <button
          @click="saveNote"
          class="w-full bg-main text-black font-black uppercase tracking-wider px-6 py-3 border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          {{ isEditing ? 'Simpan Perubahan' : 'Simpan Catatan' }}
        </button>
      </template>
    </BaseModal>

    <!-- AI Summary Modal -->
    <BaseModal 
      :show="showSummaryModal" 
      title="Ringkasan AI"
      @close="showSummaryModal = false"
    >
      <div class="flex flex-col max-h-[60vh]">
        <div class="overflow-y-auto whitespace-pre-wrap leading-relaxed font-medium mb-2 grow bg-gray-light/30 p-4 border-[3px] border-black border-dashed">
          {{ summaryContent }}
        </div>
      </div>

      <template #actions>
        <button
          @click="showSummaryModal = false"
          class="w-full bg-accent text-white font-black uppercase tracking-wider px-6 py-3 border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          Tutup
        </button>
      </template>
    </BaseModal>

    <transition-group 
      name="list" 
      tag="div" 
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
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
    </transition-group>
  </div>
</template>
