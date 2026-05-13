import { onMounted, onUnmounted } from 'vue'
import { db } from '../services/db'

export function useNotifications() {
  let interval = null

  const checkTodosNotification = async () => {
    const isEnabled = await db.settings.get('notifications_enabled')
    if (!isEnabled || !isEnabled.value) return

    const lastNotified = localStorage.getItem('last_todo_notif_date')
    const todayStr = new Date().toDateString()

    if (lastNotified === todayStr) return

    const todos = await db.todos.toArray()
    const todayTodos = todos.filter(
      (t) => !t.is_completed && new Date(t.deadline).toDateString() === todayStr,
    )

    if (todayTodos.length > 0) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Deadline Hari Ini!', {
          body: `Anda memiliki ${todayTodos.length} To-Do yang harus diselesaikan hari ini.`,
          icon: '/pwa-192x192.png',
        })
        localStorage.setItem('last_todo_notif_date', todayStr)
      }
    }
  }

  const checkTasksNotification = async () => {
    const isEnabled = await db.settings.get('notifications_enabled')
    if (!isEnabled || !isEnabled.value) return

    const configTimeSetting = await db.settings.get('config_time')
    const configTime = configTimeSetting ? configTimeSetting.value : '15:00'

    const now = new Date()
    const currentHours = String(now.getHours()).padStart(2, '0')
    const currentMinutes = String(now.getMinutes()).padStart(2, '0')
    const currentTime = `${currentHours}:${currentMinutes}`

    if (currentTime === configTime) {
      const lastNotified = localStorage.getItem('last_task_notif_date')
      const todayStr = new Date().toDateString()

      if (lastNotified === todayStr) return

      const tasks = await db.tasks.toArray()

      const uncompletedTasks = tasks.filter((t) => {
        if (!t.last_completed_at) return true
        return new Date(t.last_completed_at).toDateString() !== todayStr
      })

      if (uncompletedTasks.length > 0) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Jangan Patahkan Streak!', {
            body: `Ada ${uncompletedTasks.length} tugas/streak yang belum Anda selesaikan hari ini.`,
            icon: '/pwa-192x192.png',
          })
          localStorage.setItem('last_task_notif_date', todayStr)
        }
      }
    }
  }

  onMounted(() => {
    checkTodosNotification()
    checkTasksNotification()

    interval = setInterval(() => {
      checkTodosNotification()
      checkTasksNotification()
    }, 60000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })
}
