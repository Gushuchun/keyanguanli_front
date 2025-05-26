<template>
  <nav class="navbar-enhanced" :class="{ 'collapsed': isNavbarCollapsed }">
    <div class="navbar-content-wrapper">
      <div class="navbar-section navbar-brand-section">
        <router-link to="/index" class="navbar-brand">
          <img src="@/assets/image/gdou_logo.png" alt="Logo" class="brand-logo" />
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
            <span class="time-segment city-name" :title="weatherData.city + '市'">{{ weatherData.city }}市</span>
          </div>
        </div>
        <button @click="handleThemeToggle" class="nav-button theme-toggle-button" :title="themeButtonTitle">
          <img v-if="themeStore.currentTheme === 'light'" src="@/assets/image/theme_dark.png" alt="切换到暗黑模式"
            class="theme-icon-img" />
          <img v-else src="@/assets/image/theme_light.png" alt="切换到白天模式" class="theme-icon-img" />
        </button>
      </div>

      <!-- <div class="navbar-section navbar-links-section">
      </div> -->

      <div class="navbar-section navbar-links-section">
        <div class="search-bar">
          <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="搜索竞赛、团队、学生或教师"
            class="search-input" />
          <img :src="searchIcon" alt="搜索图标" class="search-icon" />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search-button">
            x
          </button>
        </div>
        <div v-if="searchResults.length !== 0" class="search-results">
          <div v-if="searchResults" v-for="result in searchResults" :key="result.id" class="search-result-item"
            @click="navigateToPage(result)">
            <span v-html="result.highlightedName"></span>
          </div>
        </div>
        <template v-if="isUserLoggedIn && userRole">
          <div class="my-menu" @click="toggleMyMenu">
            <span>我的</span>
            <span class="arrow-icon">{{ isMyMenuVisible ? '▲' : '▼' }}</span>
          </div>
          <Teleport to="body">
            <div v-if="isMyMenuVisible" class="my-menu-dropdown"
              :style="{ top: myMenuTop + 'px', left: myMenuLeft + 'px' }">
              <router-link v-if="userRole === 'student' || userRole === '队长'" to="/myteam" class="nav-link">
                <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="团队"
                  class="nav-icon-img" /> 我的团队
              </router-link>
              <router-link v-if="userRole === 'student' || userRole === '队长'" to="/mycompetition" class="nav-link">
                <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="比赛"
                  class="nav-icon-img" /> 我的比赛
              </router-link>
              <router-link v-if="userRole === 'teacher'" to="/myteam" class="nav-link">
                <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="团队"
                  class="nav-icon-img" /> 我的团队
              </router-link>
              <router-link v-if="userRole === 'teacher'" to="/mycompetition" class="nav-link">
                <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="比赛"
                  class="nav-icon-img" /> 我的比赛
              </router-link>
              <router-link v-if="userRole === 'teacher'" to="/teacher/competition1" class="nav-link">
                <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="论文"
                  class="nav-icon-img" /> 我的论文
              </router-link>
            </div>
          </Teleport>
        </template>
      </div>

      <div class="navbar-section navbar-user-section">
        <template v-if="isUserLoggedIn && authStore.user">
          <div class="user-menu">
            <router-link :to="profileLink" class="nav-link user-profile-link">
              <img :src="displayAvatar" alt="用户头像" class="user-avatar-img" />
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
            <img :src="themeStore.currentTheme === 'light' ? iconButtonLight : iconButtonDark" alt="登录"
              class="nav-icon-img" />
            <span>登录</span>
          </router-link>
        </template>
      </div>
    </div>

    <div class="navbar-border-control">
      <button @click="toggleNavbarCollapse" class="collapse-toggle-button"
        :title="isNavbarCollapsed ? '展开导航栏' : '收起导航栏'">
        <span class="arrow-icon">{{ isNavbarCollapsed ? '▼' : '▲' }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import debounce from 'lodash/debounce';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { useRouter } from 'vue-router';
import axios from 'axios'
// 导入图片路径，以便在模板中动态绑定
import iconButtonLightPath from '@/assets/image/icon_button.png';
import iconButtonDarkPath from '@/assets/image/icon_button_dark.png';
import searchIconLight from '@/assets/image/search.png';
import searchIconDark from '@/assets/image/search_dark.png';
import { infoAPI } from '@/api/info';
import dayjs from 'dayjs'
import { infoAPI as indexAPI } from '@/api/index'

const searchIcon = computed(() => {
  return themeStore.currentTheme === 'light' ? searchIconLight : searchIconDark;
});

// 时间日期数据
const dateDay = ref('')
const dateYear = ref('')
const dateWeek = ref('')
const timer = ref(null)
const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const weatherData = ref({})

const isMyMenuVisible = ref(false);
const myMenuTop = ref(0);
const myMenuLeft = ref(0);

// 搜索功能
const searchQuery = ref('');
const searchResults = ref([]);

// 搜索函数
const search = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  try {
    const response = await indexAPI.search(searchQuery.value);
    if (response.data.code === 200) {
      // 解构赋值时设置默认值为空数组
      const {
        competitions = [],
        teams = [],
        students = [],
        teachers = []
      } = response.data.data;
      const combinedResults = [
        ...competitions.map(item => ({ type: '竞赛', name: item.name, id: item.id, sn: item.sn })),
        ...teams.map(item => ({ type: '团队', name: item.name, id: item.id, sn: item.sn })),
        ...students.map(item => ({ type: '学生', name: item.name, id: item.id, sn: item.sn })),
        ...teachers.map(item => ({ type: '教师', name: item.name, id: item.id, sn: item.sn }))
      ];
      // 添加 highlightedName 字段
      const highlightedResults = combinedResults.map(result => ({
        ...result,
        highlightedName: highlightKeyword(result.name, searchQuery.value)
      }));
      // 使用 slice 方法截取数组，最多显示 8 条结果
      searchResults.value = highlightedResults.slice(0, 8);
      if (searchResults.value.length === 0) {
        searchResults.value = [{
          type: '无结果',
          name: '无结果',
          id: 0,
          highlightedName: '无结果'
        }];
      }
    }
  } catch (error) {
    console.error('搜索失败:', error);
    searchResults.value = [];
  }
};

// 高亮搜索关键字的函数
const highlightKeyword = (text, keyword) => {
  if (!keyword) return text;
  // 使用正则表达式进行全局不区分大小写匹配
  const regex = new RegExp(keyword, 'gi');
  // 将匹配到的关键字用红色样式的 span 标签包裹
  return text.replace(regex, match => `<span style="color: red;">${match}</span>`);
};

const navigateToPage = (result) => {
  switch (result.type) {
    case '学生':
      router.push(`/student-info/${result.sn}`);
      break;
    case '教师':
      router.push(`/teacher-info/${result.sn}`);
      break;
    case '团队':
      router.push(`/team/detail/${result.id}`);
      break;
    case '竞赛':
      router.push(`/competition/detail/${result.id}`);
      break;
    default:
      break;
  }
  searchQuery.value = '';
  searchResults.value = [];
};


const debouncedSearch = debounce(search, 300);

// 定义清除搜索内容的函数
const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
};


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
const defaultAvatarUrl = new URL('@/assets/image/default_avatar.png', import.meta.url).href;
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

const displayAvatar = computed(() => {
  if (userAvatarUrl.value) {
    return userAvatarUrl.value.startsWith('http')
      ? userAvatarUrl.value
      : `http://${userAvatarUrl.value}`;
  }
  return defaultAvatarUrl;
});
const fetchUserAvatar = async () => {
  if (!isUserLoggedIn.value || !userRole.value) {
    userAvatarUrl.value = '';
    return;
  }

  try {
    // 根据用户角色调用不同的API方法
    const response = userRole.value === 'student' 
      ? await infoAPI.getstudentavatar()
      : await infoAPI.getteacheravatar();

    if (response.data && response.data.avatar_url) {
      userAvatarUrl.value = response.data.avatar_url.startsWith('127.0.0.1') 
        ? `http://${response.data.avatar_url}` 
        : response.data.avatar_url;
    } else {
      userAvatarUrl.value = '';
    }
  } catch (error) {
    console.error('获取用户头像时出错:', error);
    userAvatarUrl.value = '';
  }
};


const toggleMyMenu = (event) => {
  if (event) {
    const rect = event.currentTarget.getBoundingClientRect();
    myMenuTop.value = rect.bottom;
    myMenuLeft.value = rect.left;
  }
  isMyMenuVisible.value = !isMyMenuVisible.value;
};

// 点击页面其他地方关闭菜单
const handleClickOutside = (event) => {
  const myMenuElement = document.querySelector('.my-menu');
  const dropdownElement = document.querySelector('.my-menu-dropdown');
  if (
    myMenuElement &&
    dropdownElement &&
    !myMenuElement.contains(event.target) &&
    !dropdownElement.contains(event.target)
  ) {
    isMyMenuVisible.value = false;
  }
};

onMounted(() => {
  getWeather();
  updateTime();
  timer.value = setInterval(updateTime, 1000)
  // timer.value = setInterval(getWeather, 1000 * 60 * 120)
  fetchUserAvatar();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
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
  z-index: 200;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.08);
  transition: height 0.3s ease-in-out, padding-bottom 0.3s ease-in-out, background-color 0.3s, color 0.3s;
  border: 3px solid transparent;
  /* 为光效留出空间 */
  border-radius: 20px;
  /* 设置四个角为圆形 */
}

.navbar-enhanced::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  background: linear-gradient(90deg,
      transparent 25%,
      #00f2fe,
      #66f9ff,
      #aaf8ff,
      #7dfaff,
      #00f2fe,
      transparent 75%);
  background-size: 200% 200%;
  animation: borderMove 20s linear infinite;
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
  /* overflow: hidden; */
  transition: height 0.3s ease-in-out, opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  flex-direction: row;
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
  /* 确保子元素溢出时不会被裁剪 */
  overflow: visible;
}

.navbar-brand-section {
  gap: 15px;
  flex-shrink: 0;
  flex-grow: 1;
  max-width: 60%;
}

.navbar-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--navbar-brand-text-color, #2c3e50);
  font-size: 20px;
  font-weight: 600;
  gap: 10px; 
}

.brand-logo {
  height: 30px;
  width: auto;
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
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
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

.time-container,
.date-container {
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

.time-segment.day {
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
  0% {
    opacity: 1;
  }

  49% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
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
  flex-shrink: 1;
  justify-content: flex-end;
  gap: 4px;
  transition: opacity 0.2s ease-out;
  overflow-x: hidden;
  white-space: nowrap;
}

.navbar-links-section:hover {
  overflow-x: auto;
}

.nav-link,
.nav-button {
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

.nav-link:hover,
.nav-button:hover:not(.theme-toggle-button) {
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
  display: flex;
  align-items: center;
  flex-shrink: 0;
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
  border: 1px solid var(--border-color);
  /* 使用全局边框颜色变量 */
}

.logout-button,
.login-button {
  color: var(--action-button-text-color, #007bff);
}

.logout-button:hover,
.login-button:hover {
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
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
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

.my-menu {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: var(--nav-link-text-color, #4a5568);
  padding: 10px 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
  z-index: 1;
  margin-right: -100px;
  flex-shrink: 0;
  margin-right: 0;
}

.my-menu:hover {
  background-color: var(--nav-link-hover-bg, #e9edf2);
  color: var(--nav-link-hover-text-color, #2d3748);
}

.my-menu-dropdown {
  position: fixed;
  top: 100%;
  /* 紧挨着“我的”下方 */
  left: 0;
  /* 与“我的”左对齐 */
  background-color: var(--navbar-bg, #ffffff);
  border: 1px solid var(--nav-link-hover-bg, #e9edf2);
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 150px;
  display: flex;
  /* 使子元素竖着排列 */
  flex-direction: column;
  /* 子元素垂直排列 */
}

.my-menu-dropdown .nav-link {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  width: 100%;
  border-radius: 0;
  box-sizing: border-box;
}

.my-menu-dropdown .nav-link:hover {
  background-color: var(--nav-link-hover-bg, #e9edf2);
}

.arrow-icon {
  margin-left: 5px;
}

.city-name {
  /* 限制城市名称显示长度 */
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-bar {
  position: relative;
  margin-right: 15px;
  flex-shrink: 0;
}

.search-input {
  padding: 8px 10px;
  padding-left: 30px;
  border: 1px solid var(--nav-link-hover-bg, #343435);
  border-radius: 6px;
  font-size: 14px;
  width: 200px;
  transition: border-color 0.2s ease-in-out;
  color: var(--search-input-text-color);
}

.search-icon {
  position: absolute;
  left: 10px; /* Adjust the left position */
  top: 50%;
  transform: translateY(-50%);
  width: 16px; /* Set the icon width */
  height: 16px; /* Set the icon height */
  pointer-events: none; /* Make the icon non - clickable */
}

.search-input:focus {
  outline: none;
  border-color: var(--nav-link-active-bg, #007bff);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  color: var(--search-input-text-color);
}

.search-results {
  position: absolute;
  top: 66%;
  left: 0;
  margin-left: 1003px;
  width: 224px;
  max-height: 400px;
  background-color: var(--navbar-bg, #ffffff);
  border: 1px solid var(--nav-link-hover-bg, #e9edf2);
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 300;
}

.search-result-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  z-index: 300;
}

.search-result-item:hover {
  background-color: var(--nav-link-hover-bg, #e9edf2);
}

.search-results.no-results {
  padding: 10px 15px;
  text-align: center;
  color: #6c757d;
  z-index: 300;
}

.clear-search-button {
  position: absolute;
  right: 10px;
  /* 调整按钮位置，确保在搜索框内 */
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  /* 设置背景透明 */
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #6c757d;
  padding: 0;
  line-height: 1;
  z-index: 1;
  /* 确保按钮显示在输入框上层 */
}

.clear-search-button:hover {
  color: #333;
}

.search-bar-wrapper {
  flex-shrink: 0;
}


.search-bar .search-input[type="text"] {
  flex: 2;
  background-color: transparent;

}
</style>