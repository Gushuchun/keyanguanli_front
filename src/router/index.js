import { createRouter, createWebHashHistory } from 'vue-router'
import login from '@/views/login/login.vue'
import index from '@/views/index/index.vue'
import myinfo from '@/views/info/myinfo.vue'
import myteam from '@/views/team/myteam.vue'
import mycompetition from '@/views/competition/mycompetition.vue'
import competitiondetail from '@/views/competition/competitiondetail.vue'
import allteamcompetition from '@/views/team/allteamcompetition.vue'

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
    },
    {
      path: '/myinfo',
      name: 'myinfo',
      component: myinfo
    },
    {
      path: '/myteam',
      name: 'myteam',
      component: myteam
    },
    {
      path: '/team/detail/:id',
      name: 'TeamDetail',
      component: () => import('@/views/team/teamdetail.vue')
    },
    {
      path: '/mycompetition',
      name: 'mycompetition',
      component: mycompetition
    },
    {
      path: '/competition/detail/:id',
      name: 'competitionDetail',
      component: competitiondetail
    },
    {
      path: '/team/allteamcompetition',
      name: 'allteamcompetition',
      component: allteamcompetition
    }
  ]
})

export default router
