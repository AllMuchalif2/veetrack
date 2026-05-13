<script setup>
import { ref } from 'vue'
import { fetchAI } from '../services/groq'
import { db } from '../services/db'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()
const inputMsg = ref('')
const messages = ref([
  {
    role: 'assistant',
    content:
      'Halo! Ada yang bisa saya bantu hari ini? (Gunakan /catat untuk mencatat keuangan otomatis)',
  },
])

const sendMessage = async () => {
  if (!inputMsg.value) return
  const msg = inputMsg.value
  messages.value.push({ role: 'user', content: msg })
  inputMsg.value = ''

  try {
    const systemPrompt = `Kamu adalah asisten produktivitas yang santai dan ramah.
Aturan ketat:
1. Jika pengguna mengirim pesan diawali "/catat" atau mencatat pengeluaran/pemasukan keuangan (contoh: "beli kopi 25rb"), kamu WAJIB mengembalikan HANYA sebuah objek JSON tanpa markdown, tanpa teks lain, dengan format pasti: {"action": "finance", "name": "nama barang", "amount": angka_bulat_tanpa_titik, "type": "expense" atau "income"}.
2. Jika pesan pengguna BUKAN soal mencatat keuangan, jawablah dengan santai dan natural layaknya manusia. JANGAN PERNAH memberikan kode pemrograman atau skrip.`

    const reply = await fetchAI(msg, systemPrompt)

    try {
      const parsed = JSON.parse(reply)
      if (parsed.action === 'finance') {
        await db.finance.add({
          name: parsed.name,
          amount: parsed.amount,
          date: new Date().toISOString(),
          type: parsed.type,
          created_at: new Date(),
        })
        messages.value.push({
          role: 'assistant',
          content: `Dicatat! ${parsed.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}: ${parsed.name} sebesar Rp ${parsed.amount.toLocaleString('id-ID')}`,
        })
        showToast('Transaksi keuangan berhasil dicatat!', 'success')
      } else {
        messages.value.push({ role: 'assistant', content: reply })
      }
    } catch {
      messages.value.push({ role: 'assistant', content: reply })
    }
  } catch (err) {
    messages.value.push({ role: 'assistant', content: `Error: ${err.message}` })
    showToast('Gagal memproses pesan AI.', 'error')
  }
}
</script>

<template>
  <div class="h-[calc(100vh-180px)] flex flex-col bg-white border-[3px] border-black shadow-neo">
    <div
      class="bg-accent text-white font-black p-4 border-b-[3px] border-black flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <i class="fa-solid fa-robot text-2xl"></i>
        <h2 class="text-xl uppercase">AI Assistant</h2>
      </div>
    </div>
    <div class="grow p-4 overflow-y-auto flex flex-col gap-4 bg-dot">
      <div
        v-for="(m, i) in messages"
        :key="i"
        class="p-3 border-[3px] border-black max-w-[85%] font-bold shadow-neo"
        :class="m.role === 'user' ? 'bg-main self-end' : 'bg-white self-start'"
      >
        {{ m.content }}
      </div>
    </div>
    <div class="p-4 border-t-[3px] border-black bg-white flex gap-2">
      <button
        @click="inputMsg = '/catat ' + inputMsg"
        class="bg-success text-black font-black px-4 border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] transition-all"
        title="Catat Transaksi"
      >
        <i class="fa-solid fa-receipt text-xl"></i>
      </button>
      <input
        v-model="inputMsg"
        @keyup.enter="sendMessage"
        class="grow border-[3px] border-black p-3 font-bold outline-none focus:bg-main transition-colors"
        placeholder="Ketik pesan..."
      />
      <button
        @click="sendMessage"
        class="bg-main text-black font-black px-6 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
      >
        <i class="fa-solid fa-paper-plane text-xl"></i>
      </button>
    </div>
  </div>
</template>
