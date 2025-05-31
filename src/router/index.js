import { createRouter, createWebHashHistory } from 'vue-router'
import login from '@/views/login/login.vue'
import index from '@/views/index/index.vue'
import myinfo from '@/views/info/myinfo.vue'
import myteam from '@/views/team/myteam.vue'
import mycompetition from '@/views/competition/mycompetition.vue'
import competitiondetail from '@/views/competition/competitiondetail.vue'
import allteamcompetition from '@/views/team/allteamcompetition.vue'
import settings from '@/views/info/settings.vue'
import studentinfo from '@/views/info/studentinfo.vue'
import teacherinfo from '@/views/info/teacherinfo.vue'
import mypatent from '@/views/patent/mypatent.vue'
import patentdetail from '@/views/patent/patentdetail.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
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
    },
    {
      path: '/settings',
      name: 'settings',
      component: settings
    },
    {
      path: '/student-info/:sn',
      name: 'student-info',
      component: studentinfo
    },
    {
      path: '/teacher-info/:sn',
      name: 'teacher-info',
      component: teacherinfo
    },
    {
      path: '/mypatent/',
      name: 'mypatent',
      component: mypatent
    },
    {
      path: '/patent/detail/:id',
      name: 'patentDetail',
      component: patentdetail
    }
  ]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.name !== 'login' && !token) {
    // 如果不是登录页面且没有 token，跳转到登录页面
    next({ name: 'login' });
  } else {
    // 其他情况正常跳转
    next();
  }
});

export default router
