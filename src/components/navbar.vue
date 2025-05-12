<template>
  <nav class="navbar-enhanced" :class="{ 'collapsed': isNavbarCollapsed }">
    <div class="navbar-content-wrapper">
      <div class="navbar-section navbar-brand-section">
        <router-link to="/index" class="navbar-brand">
          <span class="brand-text">科研管理平台</span>
        </router-link>
        <div class="time-date-display">
          <span class="icon-clock">🕒</span>
          <div class="time-container">
              <span class="time-segment">{{ dateWeek }}</span>
              <span class="time-segment day">{{ dateDay }}</span>
              <span class="time-segment">{{ dateYear }}</span>
          </div>
          <div class="date-container">
            <span class="time-segment">{{ weatherData.tem }}°</span>
            <span class="time-segment">{{ weatherData.wea }}</span>
            <span class="time-segment">{{ weatherData.win }}{{ weatherData.win_speed }}</span>
            <span class="time-segment">{{ weatherData.city }}市</span>
          </div>
        </div>
        <button @click="handleThemeToggle" class="nav-button theme-toggle-button" :title="themeButtonTitle">
          <img v-if="themeStore.currentTheme === 'light'" src="@/assets/image/theme_dark.png" alt="切换到暗黑模式" class="theme-icon-img" />
          <img v-else src="@/assets/image/theme_light.png" alt="切换到白天模式" class="theme-icon-img" />
        </button>
      </div>

      <div class="navbar-section navbar-links-section">
        <template v-if="isUserLoggedIn && userRole">
          <router-link v-if="userRole === 'student' || userRole === '队长'" to="/myteam" class="nav-link">
            <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="团队" class="nav-icon-img" /> 我的团队
          </router-link>
          <router-link v-if="userRole === 'student' || userRole === '队长'" to="/mycompetition" class="nav-link">
            <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="比赛" class="nav-icon-img" /> 我的比赛
          </router-link>

          <router-link v-if="userRole === 'teacher'" to="/myteam" class="nav-link">
            <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="团队" class="nav-icon-img" /> 我的团队
          </router-link>
          <router-link v-if="userRole === 'teacher'" to="/mycompetition" class="nav-link">
            <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="比赛" class="nav-icon-img" /> 我的比赛
          </router-link>
          <router-link v-if="userRole === 'teacher'" to="/teacher/competition1" class="nav-link">
            <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="论文" class="nav-icon-img" /> 我的论文
          </router-link>
          <!-- <router-link v-if="userRole === 'teacher'" to="/teacher/competition2" class="nav-link">
            <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="专利" class="nav-icon-img" /> 我的专利
          </router-link> -->
        </template>
      </div>

      <div class="navbar-section navbar-user-section">
        <template v-if="isUserLoggedIn && authStore.user">
          <div class="user-menu">
            <router-link :to="profileLink" class="nav-link user-profile-link">
              <img v-if="userAvatarUrl" :src="userAvatarUrl" alt="用户头像" class="user-avatar-img" />
              <img v-else :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="个人中心" class="nav-icon-img" />
              <span>{{ authStore.user.username || '个人中心' }}</span>
            </router-link>
            <button @click="handleLogout" class="nav-button logout-button" title="退出登录">
              <img src="@/assets/image/logout.png" alt="退出" class="logout-icon-img" />
              <span>退出</span>
            </button>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-button login-button">
            <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="登录" class="nav-icon-img" />
            <span>登录</span>
          </router-link>
        </template>
      </div>
    </div>

    <div class="navbar-border-control">
      <button @click="toggleNavbarCollapse" class="collapse-toggle-button" :title="isNavbarCollapsed ? '展开导航栏' : '收起导航栏'">
        <span class="arrow-icon">{{ isNavbarCollapsed ? '▼' : '▲' }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { useRouter } from 'vue-router';
import axios from 'axios'
// 导入图片路径，以便在模板中动态绑定
import iconButtonLightPath from '@/assets/image/icon_button.png';
import iconButtonDarkPath from '@/assets/image/icon_button_dark.png';
import { infoAPI } from '@/api/info';
import dayjs from 'dayjs'

// 时间日期数据
const dateDay = ref('')
const dateYear = ref('')
const dateWeek = ref('')
const timer = ref(null)
const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const weatherData = ref({})
// 获取天气数据
const getWeather = async () => {
  try {
    const response = await axios.get('http://gfeljm.tianqiapi.com/api1', {
      params: {
        appid: '23562228',
        appsecret: 'eFu7G5yq',
        version: 'v63'
      }
    })
    
    if (response.data) {
      weatherData.value = response.data
    }
  } catch (err) {
    console.error('天气数据获取失败:', err)
    weatherData.value = {
      tem: '28',
      wea: '晴',
      win: '东南风',
      win_speed: '3级',
      city: '北京'
    }
  }
}
// 更新时间函数
const updateTime = () => {
  const date = dayjs()
  dateDay.value = date.format('HH:mm:ss')
  dateYear.value = date.format('YYYY-MM-DD')
  dateWeek.value = weekday[date.day()]
}


const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();

// 将导入的图片路径赋值给 ref 或直接在模板中使用
const iconButtonLight = ref(iconButtonLightPath);
const iconButtonDark = ref(iconButtonDarkPath);
const userAvatarUrl = ref('');

const isUserLoggedIn = computed(() => !!authStore.token && !!authStore.user);
const userRole = computed(() => authStore.user?.role);

const isNavbarCollapsed = ref(false);

const toggleNavbarCollapse = () => {
  isNavbarCollapsed.value = !isNavbarCollapsed.value;
};

const profileLink = computed(() => {
  if (!isUserLoggedIn.value) return '/login';
  return '/myinfo';
});


let intervalId = null;

const fetchUserAvatar = async () => {
  if (!isUserLoggedIn.value || !userRole.value) {
    userAvatarUrl.value = '';
    return;
  }
  let apiUrl = '';
  if (userRole.value === 'student') {
    apiUrl = 'http://127.0.0.1:8105/api/student/info/get_avatar/';
  } else if (userRole.value === 'teacher') {
    apiUrl = 'http://127.0.0.1:8105/api/teacher/info/get_avatar/';
  } else {
    userAvatarUrl.value = '';
    return;
  }
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`获取头像失败: ${response.status}`);
    const data = await response.json();
    if (data && data.avatar_url) {
      userAvatarUrl.value = data.avatar_url.startsWith('127.0.0.1') ? `http://${data.avatar_url}` : data.avatar_url;
    } else {
      userAvatarUrl.value = '';
    }
  } catch (error) {
    console.error('获取用户头像时出错:', error);
    userAvatarUrl.value = '';
  }
};

onMounted(() => {
  getWeather();
  updateTime();
  timer.value = setInterval(updateTime, 1000)
  // timer.value = setInterval(getWeather, 1000 * 60 * 120)
  fetchUserAvatar();
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const handleThemeToggle = () => {
  location.reload();
  themeStore.toggleTheme();
};

const themeButtonTitle = computed(() => {
  return themeStore.currentTheme === 'light' ? '切换到暗黑模式' : '切换到白天模式';
});

</script>


<style scoped>
/* 导航栏基础样式，使用CSS变量以便主题化 */
.navbar-enhanced {
  /* overflow: hidden; */
  background-color: var(--navbar-bg, #ffffff);
  color: var(--navbar-text-color, #333);
  font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.08);
  transition: height 0.3s ease-in-out, padding-bottom 0.3s ease-in-out, background-color 0.3s, color 0.3s;
  border: 3px solid transparent; /* 为光效留出空间 */
  border-radius: 20px; /* 设置四个角为圆形 */
}

.navbar-enhanced::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  background: linear-gradient(
    90deg,
    transparent 25%,
    #00f2fe,
    #66f9ff,
    #aaf8ff,
    #7dfaff,
    #00f2fe,
    transparent 75%
  );
  background-size: 200% 200%;
  animation: borderMove 4s linear infinite;
  z-index: -1;
  border-radius: 8px;
  box-shadow:
    0 0 6px #00f2fe,
    0 0 12px #66f9ff,
    0 0 18px #aaf8ff;
}

@keyframes borderMove {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
}

.navbar-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 64px;
  overflow: hidden;
  transition: height 0.3s ease-in-out, opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
}

.navbar-enhanced.collapsed .navbar-content-wrapper {
  height: 0;
  opacity: 0;
  visibility: hidden;
  padding-top: 0;
  padding-bottom: 0;
}

.navbar-enhanced.collapsed {
   min-height: 12px;
}

.navbar-section {
  display: flex;
  align-items: center;
}

.navbar-brand-section {
  gap: 15px;
  flex-shrink: 0;
}

.navbar-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--navbar-brand-text-color, #2c3e50);
  font-size: 20px;
  font-weight: 600;
}
.navbar-brand .brand-text {
  transition: opacity 0.2s ease-out;
}
.navbar-enhanced.collapsed .navbar-brand .brand-text {
  opacity: 0;
  pointer-events: none;
}

.nav-icon-img {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  vertical-align: middle;
}

.brand-icon-img {
  width: 22px;
  height: 22px;
}

.time-date-display {
  display: flex;
  align-items: center;
  background-color: var(--time-display-bg, #f8f9fa);
  color: var(--time-display-text-color, #333);
  padding: 6px 12px;
  border-radius: 6px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
  transition: opacity 0.2s ease-out, background-color 0.3s, color 0.3s;
}
.navbar-enhanced.collapsed .time-date-display {
  opacity: 0;
  pointer-events: none;
}

.icon-clock {
  font-size: 18px;
  margin-right: 10px;
  color: var(--icon-clock-color, #007bff);
}

.time-container, .date-container {
  margin-right: 12px;
  display: flex;
  align-items: baseline;
  gap: 1em;
}

.time-segment {
  font-family: 'AlimamaShuHeiTi-Bold', 'DS-Digital', 'Courier New', Courier, monospace;
  font-size: 18px;
  color: var(--time-segment-color, #343a40);
  padding: 0 1px;
  text-align: center;
  display: inline-block;
  margin-right: 5px;
}

.time-segment.day{
  width: 80px;
}

.time-separator {
  font-size: 18px;
  font-weight: bold;
  color: var(--time-separator-color, #6c757d);
  padding: 0 1px;
  animation: blink-animation 1s infinite alternate;
}
.time-separator:first-of-type {
  animation: none;
}

@keyframes blink-animation {
  0% { opacity: 1; }
  49% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 0; }
}

.date-separator {
  margin: 0 8px;
  color: var(--date-separator-color, #ced4da);
  font-size: 16px;
}

.theme-toggle-button {
  padding: 6px;
  margin-left: 10px;
  background-color: transparent;
  border: 1px solid var(--theme-button-border-color, #ccc);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  transition: background-color 0.2s, border-color 0.2s;
}
.theme-toggle-button:hover {
  background-color: var(--theme-button-hover-bg, #e9ecef);
}
.theme-icon-img {
  width: 20px;
  height: 20px;
}
.navbar-enhanced.collapsed .theme-toggle-button {
  opacity: 0;
  pointer-events: none;
}


.navbar-links-section {
  flex-grow: 1;
  justify-content: center;
  gap: 4px;
  transition: opacity 0.2s ease-out;
  overflow-x: hidden;
  white-space: nowrap;
}

.navbar-links-section:hover {
  overflow-x: auto;
}

.nav-link, .nav-button {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: var(--nav-link-text-color, #4a5568);
  padding: 10px 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  flex: 0 0 auto;
  min-width: max-content;
}
.nav-link:hover, .nav-button:hover:not(.theme-toggle-button) {
  background-color: var(--nav-link-hover-bg, #e9edf2);
  color: var(--nav-link-hover-text-color, #2d3748);
}

.nav-link.router-link-exact-active {
  position: relative;
  color: inherit !important;
}

.nav-link.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: var(--nav-link-active-bg, #007bff);
}

.logout-icon-img {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  vertical-align: middle;
  transform: translateY(1px);
}

.navbar-user-section {
  gap: 15px;
  transition: opacity 0.2s ease-out;
}
.navbar-enhanced.collapsed .navbar-user-section {
  opacity: 0;
  pointer-events: none;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-button:not(.theme-toggle-button) {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.user-avatar-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 8px;
  object-fit: cover;
  border: 1px solid var(--border-color); /* 使用全局边框颜色变量 */
}

.logout-button, .login-button {
  color: var(--action-button-text-color, #007bff);
}
.logout-button:hover, .login-button:hover {
  background-color: var(--action-button-hover-bg, rgba(0, 123, 255, 0.1));
}

.navbar-border-control {
  position: relative;
  height: 12px;
}

.collapse-toggle-button {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 24px;
  background-color: var(--navbar-collapse-button-bg);
  border: none;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 1002;
  transition: bottom 0.3s ease-in-out;
}

.collapse-toggle-button .arrow-icon {
  font-size: 16px;
  line-height: 1;
  transition: transform 0.3s ease-in-out;
}



</style>