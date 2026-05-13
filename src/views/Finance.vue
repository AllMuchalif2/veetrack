<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '../services/db'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()
const finances = ref([])
const name = ref('')
const amount = ref('')
const type = ref('expense')
const showModal = ref(false)
const editingId = ref(null)

const loadFinances = async () => {
  const allFinances = await db.finance.toArray()
  finances.value = allFinances.sort((a, b) => new Date(b.date) - new Date(a.date))
}

onMounted(loadFinances)

const openModal = (item = null) => {
  if (item) {
    editingId.value = item.id
    name.value = item.name
    amount.value = item.amount
    type.value = item.type
  } else {
    editingId.value = null
    name.value = ''
    amount.value = ''
    type.value = 'expense'
  }
  showModal.value = true
}

const saveFinance = async () => {
  if (!name.value || !amount.value) {
    showToast('Keterangan dan jumlah harus diisi!', 'error')
    return
  }

  if (editingId.value) {
    await db.finance.update(editingId.value, {
      name: name.value,
      amount: Number(amount.value),
      type: type.value
    })
    showToast('Transaksi diperbarui!', 'success')
  } else {
    await db.finance.add({ 
      name: name.value, 
      amount: Number(amount.value), 
      date: new Date().toISOString(), 
      type: type.value, 
      created_at: new Date() 
    })
    showToast('Transaksi berhasil dicatat!', 'success')
  }
  
  showModal.value = false
  await loadFinances()
}

const deleteFinance = async (id) => {
  await db.finance.delete(id)
  showToast('Transaksi dihapus.', 'success')
  await loadFinances()
}

const totalIncome = computed(() => {
  return finances.value.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0)
})

const totalExpense = computed(() => {
  return finances.value.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0)
})

const balance = computed(() => totalIncome.value - totalExpense.value)
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-black uppercase border-b-[3px] border-black pb-2 inline-block">Finance</h2>
      <button @click="openModal" class="bg-accent text-white font-bold px-6 py-2 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all">
        <i class="fa-solid fa-plus mr-2"></i>Catat
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white border-[3px] border-black shadow-neo p-6 text-center">
        <h3 class="font-bold text-gray-dark mb-2 uppercase">Total Income</h3>
        <p class="text-3xl font-black text-success-text">Rp {{ totalIncome.toLocaleString('id-ID') }}</p>
      </div>
      <div class="bg-white border-[3px] border-black shadow-neo p-6 text-center">
        <h3 class="font-bold text-gray-dark mb-2 uppercase">Total Expense</h3>
        <p class="text-3xl font-black text-danger-text">Rp {{ totalExpense.toLocaleString('id-ID') }}</p>
      </div>
      <div class="border-[3px] border-black shadow-neo p-6 text-center" :class="balance >= 0 ? 'bg-main' : 'bg-danger'">
        <h3 class="font-bold text-black mb-2 uppercase">Balance</h3>
        <p class="text-3xl font-black text-black">Rp {{ balance.toLocaleString('id-ID') }}</p>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white border-[3px] border-black shadow-neo p-6 w-full max-w-md flex flex-col relative">
        <button @click="showModal = false" class="absolute top-4 right-4 text-xl active:translate-y-[2px]"><i class="fa-solid fa-xmark"></i></button>
        <h3 class="text-xl font-black uppercase mb-4">{{ editingId ? 'Edit Transaksi' : 'Catat Transaksi' }}</h3>
        
        <label class="font-bold mb-1">Keterangan</label>
        <input v-model="name" class="w-full border-[3px] border-black p-3 mb-4 font-bold outline-none focus:bg-main transition-colors" placeholder="Cth: Beli Makan Siang" />
        
        <label class="font-bold mb-1">Jumlah (Rp)</label>
        <input v-model="amount" type="number" class="w-full border-[3px] border-black p-3 mb-4 font-bold outline-none focus:bg-main transition-colors" placeholder="Cth: 25000" />
        
        <label class="font-bold mb-1">Jenis</label>
        <select v-model="type" class="w-full border-[3px] border-black p-3 mb-6 font-bold outline-none focus:bg-main bg-white cursor-pointer transition-colors">
          <option value="expense">Pengeluaran (-)</option>
          <option value="income">Pemasukan (+)</option>
        </select>
        
        <button @click="saveFinance" class="bg-main text-black font-black uppercase tracking-wider px-6 py-3 border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] transition-all">
          {{ editingId ? 'Perbarui Transaksi' : 'Simpan Transaksi' }}
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <div v-for="item in finances" :key="item.id" class="bg-white border-[3px] border-black shadow-neo p-4 flex justify-between items-center transition-all">
        <div>
          <h3 class="font-bold text-lg">{{ item.name }}</h3>
          <p class="text-sm font-medium text-gray-dark">{{ new Date(item.date).toLocaleDateString('id-ID') }}</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="font-black text-xl" :class="item.type === 'income' ? 'text-success-text' : 'text-danger-text'">
            {{ item.type === 'income' ? '+' : '-' }}Rp {{ item.amount.toLocaleString('id-ID') }}
          </span>
          <div class="flex gap-2">
            <button @click="openModal(item)" class="bg-main font-bold px-4 py-2 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"><i class="fa-solid fa-pen-to-square"></i></button>
            <button @click="deleteFinance(item.id)" class="bg-danger font-bold px-4 py-2 border-[3px] border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
      <div v-if="finances.length === 0" class="text-center font-bold text-gray-text py-10 border-[3px] border-black border-dashed bg-white">
        Belum ada riwayat transaksi.
      </div>
    </div>
  </div>
</template>
