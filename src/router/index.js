import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/notes',
    name: 'Notes',
    component: () => import('../views/Notes.vue')
  },
  {
    path: '/todos',
    name: 'Todos',
    component: () => import('../views/Todos.vue')
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/Tasks.vue')
  },
  {
    path: '/finance',
    name: 'Finance',
    component: () => import('../views/Finance.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
