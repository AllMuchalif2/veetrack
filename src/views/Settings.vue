<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../services/db'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()
const apiKey = ref('')
const configTime = ref('15:00')
const notificationsEnabled = ref(false)

const activeSections = ref({
  general: true,
  data: false,
})

const toggleSection = (section) => {
  activeSections.value[section] = !activeSections.value[section]
}

onMounted(async () => {
  const storedKey = await db.settings.get('API_KEY')
  if (storedKey) apiKey.value = storedKey.value

  const storedTime = await db.settings.get('config_time')
  if (storedTime) configTime.value = storedTime.value

  const storedNotif = await db.settings.get('notifications_enabled')
  if (storedNotif) notificationsEnabled.value = storedNotif.value
})

const handleNotificationToggle = async () => {
  if (notificationsEnabled.value) {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        notificationsEnabled.value = false
        showToast('Izin notifikasi ditolak oleh browser.', 'error')
      }
    } else {
      notificationsEnabled.value = false
      showToast('Browser Anda tidak mendukung notifikasi.', 'error')
    }
  }
}

const saveSettings = async () => {
  await db.settings.put({ key: 'API_KEY', value: apiKey.value })
  await db.settings.put({ key: 'config_time', value: configTime.value })
  await db.settings.put({ key: 'notifications_enabled', value: notificationsEnabled.value })
  showToast('Pengaturan berhasil disimpan!', 'success')
}

const exportData = async () => {
  try {
    const data = {
      notes: await db.notes.toArray(),
      todos: await db.todos.toArray(),
      tasks: await db.tasks.toArray(),
      finance: await db.finance.toArray(),
      settings: await db.settings.toArray(),
      chat_history: await db.chat_history.toArray(),
      export_date: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `veetrack_backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data berhasil diekspor!', 'success')
  } catch (err) {
    showToast('Gagal ekspor data: ' + err.message, 'error')
  }
}

const importData = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result)
      
      if (confirm('Import data akan menimpa data yang sudah ada. Lanjutkan?')) {
        // Clear all tables first
        await Promise.all([
          db.notes.clear(),
          db.todos.clear(),
          db.tasks.clear(),
          db.finance.clear(),
          db.settings.clear(),
          db.chat_history.clear()
        ])

        // Add imported data
        if (data.notes) await db.notes.bulkAdd(data.notes)
        if (data.todos) await db.todos.bulkAdd(data.todos)
        if (data.tasks) await db.tasks.bulkAdd(data.tasks)
        if (data.finance) await db.finance.bulkAdd(data.finance)
        if (data.settings) await db.settings.bulkAdd(data.settings)
        if (data.chat_history) await db.chat_history.bulkAdd(data.chat_history)

        showToast('Data berhasil diimpor! Silakan refresh halaman.', 'success')
        setTimeout(() => location.reload(), 1500)
      }
    } catch (err) {
      showToast('Gagal impor data: Format file tidak valid.', 'error')
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="max-w-xl mx-auto">
    <h2 class="text-3xl font-black mb-6 uppercase border-b-[3px] border-black pb-2 inline-block">
      Settings
    </h2>

    <div class="flex flex-col gap-6">
      <!-- Section 1: General & AI -->
      <div class="border-[3px] border-black shadow-neo">
        <button 
          @click="toggleSection('general')"
          class="w-full bg-main p-4 flex justify-between items-center font-black uppercase tracking-wider border-b-[3px] border-black hover:bg-yellow-300 transition-colors"
        >
          <span><i class="fa-solid fa-cog mr-2"></i>Pengaturan Umum & AI</span>
          <i class="fa-solid" :class="activeSections.general ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </button>
        
        <div v-show="activeSections.general" class="bg-white p-6">
          <div class="mb-4">
            <label class="block font-bold mb-2">Groq API Key</label>
            <input
              v-model="apiKey"
              type="password"
              class="w-full border-[3px] border-black p-3 outline-none focus:bg-main transition-colors"
              placeholder="gsk_..."
            />
          </div>

          <div class="mb-6 border-[3px] border-black p-4 bg-gray-50">
            <div class="flex items-center justify-between mb-4">
              <div>
                <label class="block font-bold text-lg uppercase tracking-tight">Status Notifikasi</label>
                <p class="text-xs font-bold text-gray-text mt-1">
                  Master switch untuk semua pengingat aplikasi.
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  v-model="notificationsEnabled"
                  @change="handleNotificationToggle"
                  class="sr-only peer"
                />
                <div
                  class="w-16 h-8 bg-white border-[3px] border-black rounded-none peer peer-focus:outline-none peer-checked:bg-success transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                ></div>
                <div
                  class="absolute top-1 left-1 w-6 h-6 bg-black transition-all peer-checked:translate-x-8 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)]"
                ></div>
              </label>
            </div>

            <div class="space-y-4 pt-4 border-t-2 border-black border-dashed">
              <div class="flex items-start gap-3">
                <div class="bg-main border-2 border-black p-2 mt-1">
                  <i class="fa-solid fa-list-check"></i>
                </div>
                <div>
                  <p class="font-black uppercase text-sm">Notifikasi To-Do</p>
                  <p class="text-xs font-bold text-gray-text">Muncul otomatis pada hari deadline (sekali sehari).</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="bg-accent text-white border-2 border-black p-2 mt-1">
                  <i class="fa-solid fa-bolt"></i>
                </div>
                <div>
                  <p class="font-black uppercase text-sm">Notifikasi Tasks/Streaks</p>
                  <p class="text-xs font-bold text-gray-text">Muncul setiap hari jika ada tugas yang belum selesai pada jam yang ditentukan.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <label class="block font-bold mb-2 uppercase text-sm tracking-wide">
              <i class="fa-solid fa-clock mr-2"></i>Waktu Pengingat Tasks
            </label>
            <input
              v-model="configTime"
              type="time"
              :disabled="!notificationsEnabled"
              class="w-full border-[3px] border-black p-3 outline-none font-black text-xl focus:bg-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-neo"
            />
          </div>
          
          <button
            @click="saveSettings"
            class="w-full bg-accent text-white font-black uppercase tracking-wider px-6 py-3 border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>

      <!-- Section 2: Data Management -->
      <div class="border-[3px] border-black shadow-neo">
        <button 
          @click="toggleSection('data')"
          class="w-full bg-main p-4 flex justify-between items-center font-black uppercase tracking-wider border-b-[3px] border-black hover:bg-yellow-300 transition-colors"
        >
          <span><i class="fa-solid fa-database mr-2"></i>Manajemen Data</span>
          <i class="fa-solid" :class="activeSections.data ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </button>
        
        <div v-show="activeSections.data" class="bg-white p-6 space-y-6">
          <div class="p-4 border-[3px] border-black border-dashed bg-gray-50">
            <h4 class="font-black uppercase text-sm mb-2">Cadangkan Data (Export)</h4>
            <p class="text-xs font-bold text-gray-text mb-4">Unduh semua data Anda (Catatan, To-Do, Tasks, Finance) dalam format JSON.</p>
            <button 
              @click="exportData"
              class="w-full bg-white font-black uppercase py-3 border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] transition-all hover:bg-main"
            >
              <i class="fa-solid fa-file-export mr-2"></i>Export ke JSON
            </button>
          </div>

          <div class="p-4 border-[3px] border-black border-dashed bg-gray-50">
            <h4 class="font-black uppercase text-sm mb-2">Pulihkan Data (Import)</h4>
            <p class="text-xs font-bold text-gray-text mb-4 text-danger-text uppercase">Peringatan: Ini akan menimpa data yang sudah ada!</p>
            <label class="block w-full bg-white font-black uppercase py-3 border-[3px] border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] transition-all hover:bg-danger text-center cursor-pointer">
              <i class="fa-solid fa-file-import mr-2"></i>Pilih File JSON
              <input type="file" accept=".json" class="hidden" @change="importData" />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
