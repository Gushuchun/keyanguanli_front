<template>
  <div class="user-info-container" :class="{ 'dark': themeStore.isDark }">
    <div class="particles">
      <div v-for="i in 100" :key="i" class="particle"></div>
    </div>

    <div class="profile-header">
      <div class="avatar-wrapper" @mouseenter="startHover" @mouseleave="endHover"
        @contextmenu.prevent="showContextMenu">
        <div class="avatar-glow"></div>
        <img :src="processedAvatar" class="avatar-image" alt="用户头像" @error="handleAvatarError" @click="viewAvatar" />
        <div class="holographic-overlay"></div>
        <input type="file" accept="image/*" ref="fileInput" class="avatar-upload-input" />
      </div>

      <div class="profile-text">
        <h1 class="username">{{ userData.username }}</h1>
        <div class="role-badge">{{ userData.college || '计算机科学与工程' }}</div>
      </div>
    </div>

    <div class="dynamic-divider">
      <div class="energy-wave"></div>
      <div class="glow-line"></div>
      <div class="particle-trail"></div>
    </div>

    <div class="info-panel">
            <div class="info-grid">
        <div v-for="(item, index) in filteredInfo" :key="item.label" class="info-card"
          :style="{ transitionDelay: `${index * 0.2}s` }">
          <div class="deco-line"></div>
          <div class="info-icon">
            <img :src="getIconPath(item.icon)" :alt="item.label + '图标'" class="info-icon-image">
          </div>
          <div class="info-content">
            <h3 class="info-label">{{ item.label }}</h3>
            <div class="info-value">{{ item.key === 'cn_1' ? maskIdNumber(item.value) : item.value || '无' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="background-elements">
      <div class="cyber-circle"></div>
      <div class="hexagon-pattern"></div>
    </div>

    <!-- 修改信息按钮 -->
    <div class="action-buttons-container">
      <!-- 环形粒子特效容器 -->
      <div class="particles-ring"></div>

    </div>
    
      <Teleport to="body">
        <div v-if="isAvatarPreviewVisible" class="avatar-preview" @click.self="hideAvatarPreview"
          :style="{ zIndex: 9999 }">
          <img :src="processedAvatar" alt="头像预览" class="preview-image">
          <div class="close-btn" @click="hideAvatarPreview">&times;</div>
        </div>
      </Teleport>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter  } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme';
import { infoAPI } from '@/api/info'
import gsap from 'gsap'



const authStore = useAuthStore()
const themeStore = useThemeStore()
const route = useRoute()
const router = useRouter()
const userData = ref({})
const loading = ref(true)
const avatarError = ref(false)
const isCollegeLoading = ref(true)
// 新增从路由获取sn参数
const sn = route.params.sn


// 处理头像URL
const processedAvatar = computed(() => {
  if (!userData.value.avatar){
    console.log('没有头像')
    return  new URL('@/assets/image/default_avatar.png', import.meta.url).href
  } 
  if (avatarError.value) return '@/assets/image/default_avatar.png'
  const avatar = userData.value.avatar
  return avatar?.startsWith('http') ? avatar : `http://${avatar}`
})

// 用户角色判断 - 修改为从localStorage获取用户信息
const userRole = computed(() => {
  // 从localStorage获取用户信息
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.role;
    } catch (e) {
      console.error('解析localStorage中的user失败:', e);
    }
  }

  // 回退到路由判断
  return route.path.includes('teacher') ? 'teacher' : 'student';
})

// 信息显示配置
const infoConfig = {
  student: [
    { key: 'college', label: '学院', icon: 'depart' },
    { key: 'prize_num', label: '获奖数量', icon: 'price' },
    { key: 'race_num', label: '竞赛参与数', icon: 'comp' }
  ],
}
const getIconPath = (iconName) => {
  const themeSuffix = themeStore.currentTheme === 'dark' ? '_dark' : ''
  return new URL(`/src/assets/image/${iconName}${themeSuffix}.png`, import.meta.url).href
}

const filteredInfo = computed(() => {
  return infoConfig['student'].map(item => ({
    ...item,
    value: userData.value[item.key]
  }))
})

// 获取用户信息
const fetchUserInfo = async () => {
  console.log("sn", sn)
  try {
    // 调整参数格式
    const response = await infoAPI.getstudentinfo({
      "sn": sn
    });
    userData.value = response.data
    console.log("userData", userData.value)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAvatarError = () => {
  avatarError.value = true
}

const startHover = () => {
  gsap.to('.avatar-glow', {
    duration: 0.5,
    scale: 1.2,
    opacity: 0.8,
    ease: 'power2.out'
  })
}

const endHover = () => {
  gsap.to('.avatar-glow', {
    duration: 0.3,
    scale: 1,
    opacity: 0.4,
    ease: 'power2.in'
  })
}


// 新增的响应式变量
const isContextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const isAvatarPreviewVisible = ref(false)

// 显示右键菜单
const showContextMenu = (event) => {
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  isContextMenuVisible.value = true
}

// 隐藏右键菜单
const hideContextMenu = () => {
  isContextMenuVisible.value = false
}

// 查看头像（显示大图）
const viewAvatar = () => {
  isAvatarPreviewVisible.value = true
  hideContextMenu()
}

// 隐藏头像预览
const hideAvatarPreview = () => {
  isAvatarPreviewVisible.value = false
}

// 处理点击文档隐藏右键菜单
const handleDocumentClick = () => {
  if (isContextMenuVisible.value) {
    hideContextMenu()
  }
}

const colleges = ref([])

watch(() => route.params.sn, (newSn) => {
  if (newSn) {
    loading.value = true;
    location.reload();
    fetchUserInfo(newSn);
  }
});

onMounted(() => {
  fetchUserInfo()
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

</script>

<style scoped>
/* 基础样式 */
.user-info-container {
  min-height: 100vh;
  /* 保持全屏高度，但内部元素会上移 */
  background:
    radial-gradient(ellipse at bottom, #eaeaee 0%, );
  position: relative;
  overflow: hidden;
  /* 如果内容确实溢出，这将隐藏滚动条，但目标是让内容不溢出 */
  padding: 0.8rem;
  /* 减少了上下内边距 */
}

.dark .user-info-container {
  background:
    radial-gradient(ellipse at bottom, #eaeaee 0%, );
}

/* 粒子特效 - 不影响布局 */
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: rgba(80, 49, 49, 0.5);
  border-radius: 50%;
  animation: float 3s infinite ease-in-out;
  filter: blur(1px);
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-20px) scale(0.9);
  }
}

/* 头像区域 */
.profile-header {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 1.5rem 0;
  /* 减少了上下内边距 */
}

.avatar-wrapper {
  width: 250px;
  /* 略微减小头像尺寸 */
  height: 250px;
  /* 略微减小头像尺寸 */
  margin: 0 auto;
  position: relative;
  perspective: 1000px;
}

.avatar-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #00f2fe 0%, transparent 70%);
  opacity: 0.4;
  border-radius: 50%;
  filter: blur(30px);
  transition: all 0.5s ease;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}

.holographic-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg,
      transparent 0%,
      rgba(0, 242, 254, 0.1) 50%,
      transparent 100%);
  border-radius: 50%;
  animation: hologram 3s infinite linear;
}

@keyframes hologram {
  0% {
    opacity: 0.3;
    transform: rotate(0deg);
  }

  100% {
    opacity: 0.7;
    transform: rotate(360deg);
  }
}

/* 添加点击效果 */
.avatar-image:hover {
  cursor: pointer;
  transform: scale(1.05) rotate(2deg);
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
}

.avatar-image:active {
  transform: scale(0.95) rotate(-2deg);
  box-shadow: 0 0 30px rgba(0, 242, 255, 0.7);
}

/* 动态分割线 */
.dynamic-divider {
  height: 2px;
  width: 80%;
  margin: 1.5rem auto;
  /* 减少了上下外边距 */
  position: relative;
}

.energy-wave {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent 0%,
      #00f2fe 50%,
      transparent 100%);
  animation: wave 2s infinite linear;
  filter: blur(1px);
}

.glow-line {
  position: absolute;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 20px #00f2fe;
  opacity: 0.5;
}

@keyframes wave {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

/* 信息面板 */
.info-panel {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  background: rgba(0, 0, 0, 0.07);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: visible;
}

.info-panel::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
      rgba(0, 242, 254, 0) 25%,
      #00f2fe 50%,
      rgba(0, 242, 254, 0) 75%);
  background-size: 200% 100%;
  animation: borderLineMove 4s linear infinite;
  pointer-events: none;
  z-index: -1;
  border-radius: 20px;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  padding: 1px;
}

@keyframes borderLineMove {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  /* 可以略微减小minmax的第一值 */
  gap: 1rem;
  /* 减少了网格间距 */
  margin-bottom: 1.5rem;
  /* 减少了下方外边距 */
}

.stat-card {
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.8), rgba(0, 32, 53, 0.6));
  padding: 1rem;
  /* 减少了内边距 */
  border-radius: 15px;
  border: 1px solid rgba(0, 242, 254, 0.2);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 242, 254, 0.1);
}

.stat-icon {
  width: 45px;
  /* 略微减小图标容器 */
  height: 45px;
  /* 略微减小图标容器 */
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  /* 略微减小图标字体大小 */
  margin-bottom: 0.8rem;
  /* 减少了下方外边距 */
  background: linear-gradient(45deg, #00f2fe, #0056b3);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  /* 可以略微减小minmax的第一值 */
  gap: 2rem;
  /* 减少了网格间距 */
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.info-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.deco-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #00f2fe, transparent);
}

/* 入场动画 - 不影响布局 */
.stats-enter-active,
.info-enter-active {
  transition: all 0.5s ease;
}

.stats-enter-from,
.info-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* 背景装饰 */
.cyber-circle {
  position: absolute;
  width: 450px;
  /* 略微减小尺寸 */
  height: 450px;
  /* 略微减小尺寸 */
  border: 5px solid rgba(39, 170, 177, 0.1);
  border-radius: 50%;
  left: -200px;
  /* 调整位置，减少下方延申 */
  top: -200px;
  /* 调整位置，减少下方延申 */
  animation: rotate 20s infinite linear;
}

.hexagon-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.05;
  pointer-events: none;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 头像上传输入 */
.avatar-upload-input {
  display: none;
}

/* 右键菜单样式 */
.context-menu {
  position: absolute;
  z-index: 30;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 242, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.2);
  animation: menuFadeIn 0.2s ease-in-out;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.context-menu ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.context-menu li {
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.context-menu li:hover {
  background-color: rgba(0, 242, 255, 0.1);
  transform: translateX(5px);
}

/* 修改右键菜单样式 */
.context-menu {
  background: rgba(255, 255, 255, 0.95);
  /* 白天模式背景 */
  border: 1px solid rgba(0, 242, 255, 0.3);
  /* 其他样式保持不变... */
}

/* 暗夜模式适配 */
.dark .context-menu {
  background: rgba(30, 30, 30, 0.98) !important;
  /* 深色背景 */
  border-color: rgba(0, 242, 255, 0.15) !important;
  box-shadow: 0 2px 15px rgba(0, 242, 255, 0.1) !important;
}

.dark .context-menu li {
  color: #e0e0e0 !important;
  /* 浅灰色文字 */
}

.dark .context-menu li:hover {
  background: rgba(0, 242, 255, 0.08) !important;
  color: #00f2fe !important;
  /* 荧光蓝文字 */
}

/* 添加过渡动画 */
.context-menu {
  transition: all 0.3s ease;
}

/* 头像预览 */
.avatar-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
  animation: previewFadeIn 0.3s ease-in-out;
}

.preview-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 15px;
  box-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
  border: 5px solid rgba(0, 242, 255, 0.3);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 30px;
  font-size: 30px;
  color: #00f2fe;
  cursor: pointer;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
}

.edit-info-modal.dark .modal-content {
  background: rgba(30, 30, 30, 0.95) !important;
  color: #eaeaea;
}

.edit-info-modal.dark .form-group input {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(0, 242, 254, 0.2) !important;
  color: #fff !important;
}

.edit-info-modal.dark .modal-actions button:last-child {
  background: rgba(0, 242, 254, 0.1) !important;
  color: #00f2fe !important;
}

/* 修改信息按钮样式 */
.edit-info-button {
  text-align: center;
  margin: 2rem 0 3rem 0;
}



.edit-info-button button {
  background: linear-gradient(45deg, #00f2fe, #0056b3);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 30px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
  margin: 0 1rem;
}

.edit-info-button button:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.7);
}

/* 修改信息模态框样式 */
.edit-info-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 20px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.3);
  position: relative;
  animation: fadeIn 0.3s ease-in-out;
}

.dark .modal-content {
  background: rgba(40, 40, 40, 0.95) !important;
  color: #eaeaea;
}

.modal-content h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-content-dark {
  background: rgba(30, 30, 30, 0.98) !important;
  border: 1px solid rgba(0, 242, 254, 0.2) !important;
  color: #eaeaea !important;
  padding: 2rem;
  border-radius: 20px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.3);
  position: relative;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-content-dark .form-group label {
  color: #00f2fe !important;
}

.modal-content-dark .form-group input {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 242, 254, 0.3) !important;
  color: #fff !important;
}

.modal-content-dark .form-group input:focus {
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.4) !important;
}

.modal-content-dark .modal-actions button:first-child {
  background: linear-gradient(45deg, #0056b3, #003366) !important;
}

.modal-content-dark .modal-actions button:last-child {
  background: rgba(0, 242, 254, 0.15) !important;
  color: #00f2fe !important;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input {
  width: 90%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 242, 254, 0.3);
  background: rgba(128, 128, 128, 0.2);
  /* 改为灰色背景 */
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #00f2fe;
  background: rgba(128, 128, 128, 0.3);
  /* 改为灰色背景 */
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.modal-actions button {
  flex: 1;
  margin: 0 0.5rem;
  padding: 0.8rem;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.modal-actions button:first-child {
  background: linear-gradient(45deg, #00f2fe, #0056b3);
  color: white;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}

.modal-actions button:first-child:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.7);
}

.modal-actions button:last-child {
  background: rgba(0, 242, 254, 0.2);
  color: #00f2fe;
}

.modal-actions button:last-child:hover {
  background: rgba(0, 242, 254, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes previewFadeIn {
  from {
    opacity: 0;
    transform: scale(0.85);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.info-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  background: linear-gradient(45deg, #00f2fe, #0056b3);
}

/* 替换为图片图标 */
.info-icon {
  background: none;
  padding: 0;
  width: 30px;
  height: 30px;
}

.info-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 暗夜模式适配 */
.dark .info-icon img {
  filter: brightness(0.8);
}

/* 信息面板中的图标 */
.stat-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dark .stat-icon img {
  filter: brightness(0.8);
}

.info-icon-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: drop-shadow(0 0 2px rgba(0, 242, 254, 0.3));
  transition: all 0.3s ease;
}

/* 暗夜模式图标调整 */
.dark .info-icon-image {
  filter: drop-shadow(0 0 3px rgba(0, 242, 254, 0.5));
}

/* 调整原有info-icon样式 */
.info-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.username {
  margin-top: 1.5rem;
  font-size: 2.5rem;
}

.action-buttons-container {
  margin-top: 4rem;
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.particles-ring {
  position: absolute;
  width: 180px;
  height: 180px;
  left: 50%;
  /* 粒子效果居中 */
  bottom: -50px;
  transform: translateX(-50%);
  /* 水平居中 */
  background: radial-gradient(circle,
      rgba(0, 242, 254, 0.2) 0%,
      transparent 70%);
  animation: particle-rotate 8s linear infinite;
  filter: blur(20px);
}

.action-buttons {
  position: relative;
  display: flex;
  transform-style: preserve-3d;
  justify-content: center;
  /* 水平居中按钮 */
  gap: 4rem;
  flex-wrap: wrap;
}


@keyframes tooltipFade {
  from {
    opacity: 0;
    transform: translate(-50%, 5px);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}


.cyber-button {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: visible;
  background: transparent;
  border: 1px solid rgba(0, 242, 254, 0.3);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.cyber-button::before {
  animation: tooltipFade 0.3s ease-out forwards;
  content: attr(data-text);
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: transparent;
  padding: 6px 12px;
  border-radius: 4px;
  z-index: 1000;
  opacity: 0;
  transition: all 0.3s ease;
  min-width: 80px;
  pointer-events: none;
}


.cyber-button:hover::before {
  opacity: 1;
  bottom: calc(100% + 15px);
}

.cyber-button .glow {
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle,
      rgba(0, 242, 254, 0.8) 0%,
      transparent 70%);
  opacity: 0.3;
  animation: glow-pulse 2s infinite;
}

.cyber-button .content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.cyber-button i {
  font-size: 24px;
  color: #fff;
  transition: all 0.3s ease;
}

/* 主按钮样式 */
.cyber-button.primary {
  background: linear-gradient(45deg,
      rgba(0, 242, 254, 0.2),
      rgba(0, 86, 179, 0.2));
  border: 1px solid rgba(0, 242, 254, 0.5);
  box-shadow:
    0 0 20px rgba(0, 242, 254, 0.3),
    inset 0 0 10px rgba(0, 242, 254, 0.2);
}

.cyber-button.primary:hover {
  transform:
    translateY(-5px) rotateX(15deg) rotateY(15deg);
  box-shadow:
    0 0 40px rgba(0, 242, 254, 0.5),
    inset 0 0 15px rgba(0, 242, 254, 0.3);
}

/* 设置按钮样式 */
.cyber-button.secondary {
  background: linear-gradient(45deg,
      rgba(255, 65, 50, 0.2),
      rgba(179, 0, 85, 0.2));
  border: 1px solid rgba(255, 65, 50, 0.5);
  box-shadow:
    0 0 20px rgba(255, 65, 50, 0.3),
    inset 0 0 10px rgba(255, 65, 50, 0.2);
}

.cyber-button.secondary:hover {
  transform:
    translateY(-5px) rotateX(-15deg) rotateY(-15deg);
  box-shadow:
    0 0 40px rgba(255, 65, 50, 0.5),
    inset 0 0 15px rgba(255, 65, 50, 0.3);
}

/* 动画效果 */
@keyframes glow-pulse {

  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.3;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
}

@keyframes particle-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 添加图标字体 */
@font-face {
  font-family: 'iconfont';
}

.icon-edit::before {
  content: "\e606";
  font-family: 'iconfont';
}

.icon-settings::before {
  content: "\e609";
  font-family: 'iconfont';
}

.action-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
  transition: all 0.3s ease;
}


.cyber-button.primary:hover .action-icon {
  transform: scale(1.1) rotate(5deg);
}

.team-action-buttons {
  display: flex;
  justify-content: center;
}

.form-group select {
  width: 96%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 242, 254, 0.3);
  background: rgba(128, 128, 128, 0.2);
  transition: all 0.3s ease;
}

.form-group select:focus {
  outline: none;
  border-color: #00f2fe;
  background: rgba(128, 128, 128, 0.3);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}

.college-select {
  width: 100%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 242, 254, 0.3);
  background: rgba(128, 128, 128, 0.2);
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
  appearance: none; /* 移除默认样式 */
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1rem;
}

/* 下拉框聚焦样式 */
.college-select:focus {
  outline: none;
  border-color: #00f2fe;
  background-color: rgba(128, 128, 128, 0.3);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}

/* 白天模式样式 */
.modal-content .college-select {
  background-color: rgb(227, 224, 224);
  color: black;
}

.modal-content .college-select:focus {
  background-color: #f0f0f0;
}

.modal-content-dark .college-select {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgb(255, 255, 255);
}

.modal-content-dark .college-select:focus {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 暗夜模式下拉选项样式 */
.modal-content-dark .college-select option {
  background-color: #2e2d2d;
  color: white; 
}

.modal-content-dark .college-select option:hover {
  background-color: #333;
}
</style>