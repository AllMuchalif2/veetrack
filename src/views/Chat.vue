<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { fetchAI } from '../services/groq'
import { db } from '../services/db'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()
const inputMsg = ref('')
const inputRef = ref(null)

const prependCatat = () => {
  inputMsg.value = '/catat ' + inputMsg.value
  inputRef.value?.focus()
}
const messages = ref([])
const scrollRef = ref(null)

const loadHistory = async () => {
  const history = await db.chat_history.toArray()
  if (history.length === 0) {
    messages.value = [
      {
        role: 'assistant',
        content:
          'Halo! Ada yang bisa saya bantu hari ini? (Gunakan /catat untuk mencatat keuangan otomatis)',
      },
    ]
  } else {
    messages.value = history.map((h) => ({ role: h.role, content: h.message }))
  }
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
  })
}

const clearHistory = async () => {
  if (confirm('Hapus semua riwayat chat?')) {
    await db.chat_history.clear()
    await loadHistory()
    showToast('Riwayat chat dihapus.', 'success')
  }
}

onMounted(loadHistory)

const sendMessage = async () => {
  if (!inputMsg.value) return
  const msg = inputMsg.value

  await db.chat_history.add({
    role: 'user',
    message: msg,
    created_at: new Date(),
  })

  messages.value.push({ role: 'user', content: msg })
  inputMsg.value = ''
  scrollToBottom()

  try {
    const systemPrompt = `Kamu adalah asisten produktivitas yang santai dan ramah.
Aturan ketat untuk fitur pencatatan keuangan otomatis (/catat):
1. Jika pengguna mencatat keuangan (contoh: "beli kopi 25rb" atau diawali "/catat"), kamu WAJIB mengembalikan HANYA sebuah objek JSON tanpa markdown, tanpa teks lain, dengan format: {"action": "finance", "name": "nama barang", "amount": angka_bulat_positif, "type": "expense" atau "income"}.
2. "type" HARUS "expense" secara default (terutama jika hanya angka positif seperti "10k", "/catat 5000", dll). Gunakan "income" HANYA jika pengguna eksplisit menyebutkan itu pemasukan (gaji, bonus, dapet uang, dll).
3. Jika input ambigu atau ada tanda negatif (misal: "-100k"), WAJIB anggap sebagai "expense" dan jadikan "amount" positif.
4. "amount" minimal 100. Jika input di bawah itu, bulatkan ke 100.
5. "name" harus bersih dan deskriptif.
6. Jika pesan BUKAN soal keuangan, jawablah dengan santai dan natural layaknya manusia. JANGAN PERNAH memberikan kode pemrograman atau skrip.`

    const reply = await fetchAI(msg, systemPrompt)

    try {
      const parsed = JSON.parse(reply)
      if (parsed.action === 'finance') {
        const finalAmount = Math.max(100, Math.abs(Number(parsed.amount) || 0))
        const finalType = parsed.type || 'expense'

        await db.finance.add({
          name: parsed.name,
          amount: finalAmount,
          date: new Date().toISOString(),
          type: finalType,
          created_at: new Date(),
        })

        const aiMsg = `Dicatat! ${finalType === 'expense' ? 'Pengeluaran' : 'Pemasukan'}: ${parsed.name} sebesar Rp ${finalAmount.toLocaleString('id-ID')}`
        await db.chat_history.add({
          role: 'assistant',
          message: aiMsg,
          created_at: new Date(),
        })

        messages.value.push({
          role: 'assistant',
          content: aiMsg,
        })
        showToast('Transaksi keuangan berhasil dicatat!', 'success')
      } else {
        await db.chat_history.add({
          role: 'assistant',
          message: reply,
          created_at: new Date(),
        })
        messages.value.push({ role: 'assistant', content: reply })
      }
    } catch {
      await db.chat_history.add({
        role: 'assistant',
        message: reply,
        created_at: new Date(),
      })
      messages.value.push({ role: 'assistant', content: reply })
    }
    scrollToBottom()
  } catch (err) {
    messages.value.push({ role: 'assistant', content: `Error: ${err.message}` })
    showToast('Gagal memproses pesan AI.', 'error')
  }
}
</script>

<template>
  <div
    class="h-[calc(100vh-180px)] flex flex-col bg-white border-[3px] border-black shadow-neo mb-2"
  >
    <div
      class="bg-accent text-white font-black p-4 border-b-[3px] border-black flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <i class="fa-solid fa-robot text-2xl"></i>
        <h2 class="text-xl uppercase">AI Assistant</h2>
      </div>
      <button
        @click="clearHistory"
        class="text-white hover:text-danger transition-colors"
        title="Hapus Riwayat"
      >
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
    <div ref="scrollRef" class="grow p-4 overflow-y-auto flex flex-col gap-4 bg-dot">
      <div
        v-for="(m, i) in messages"
        :key="i"
        class="p-3 border-[3px] border-black max-w-[85%] font-bold shadow-neo mb-1 mr-1"
        :class="m.role === 'user' ? 'bg-main self-end' : 'bg-white self-start'"
      >
        {{ m.content }}
      </div>
    </div>
    <div class="p-4 border-t-[3px] border-black bg-white flex items-center gap-2">
      <button
        @click="prependCatat"
        class="flex-none bg-success text-black font-black px-4 py-3 border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] transition-all mr-1 mb-1"
        title="Catat Transaksi"
      >
        <i class="fa-solid fa-receipt text-xl"></i>
      </button>
      <input
        ref="inputRef"
        v-model="inputMsg"
        @keyup.enter="sendMessage"
        class="grow min-w-0 border-[3px] border-black p-3 font-bold outline-none focus:bg-main transition-colors mb-1"
        placeholder="Ketik pesan..."
      />
      <button
        @click="sendMessage"
        class="flex-none bg-main text-black font-black px-6 py-3 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all mr-1 mb-1"
      >
        <i class="fa-solid fa-paper-plane text-xl"></i>
      </button>
    </div>
  </div>
</template>
