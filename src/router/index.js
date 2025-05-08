import { createRouter, createWebHashHistory } from 'vue-router'
import login from '@/views/login/login.vue'
import index from '@/views/index/index.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/index',
      name: 'index',
      component: index // 主页
    }
  ]
})

export default router
