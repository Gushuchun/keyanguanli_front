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
        <input type="file" accept="image/*" @change="handleFileChange" ref="fileInput" class="avatar-upload-input" />
      </div>

      <div class="profile-text">
        <h1 class="username">{{ userData.username }}</h1>
        <div class="role-badge">{{ userData.college || '计算机科学与工程' }}</div>
      </div>

      <!-- 修改信息模态框 -->
      <Teleport to="body">
        <div v-if="isEditInfoModalVisible" class="edit-info-modal" :class="{ 'dark': themeStore.isDark }">
          <div class="modal-overlay" @click.self="hideEditInfoModal">
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
              <h2>修改个人信息</h2>
              <form @submit.prevent="updateUserInfo">
                <div class="form-group">
                  <label for="username">姓名:</label>
                  <input type="text" id="username" v-model="editData.username">
                </div>
                <div class="form-group">
                  <label for="email">电子邮箱:</label>
                  <input type="email" id="email" v-model="editData.email">
                </div>
                <div class="form-group">
                  <label for="phone">联系电话:</label>
                  <input type="tel" id="phone" v-model="editData.phone">
                </div>
                <!-- 仅学生角色显示身份证输入框 -->
                <div v-if="userRole === 'student'" class="form-group">
                  <label for="cn_1">身份证号:</label>
                  <input type="text" id="cn_1" v-model="editData.cn_1">
                </div>
                <div class="form-group">
                  <label for="college">学院:</label>
                  <!-- 使用下拉选择框 -->
                  <select id="college" v-model="editData.collegeId" class="college-select">
                    <option v-for="college in colleges" :key="college.id" :value="college.id">
                      {{ college.name }}
                    </option>
                  </select>
                </div>
                <div class="modal-actions">
                  <button type="submit">保存</button>
                  <button type="button" @click="hideEditInfoModal">取消</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div :class="themeStore.currentTheme === 'dark' ? 'context-menu-dark' : 'context-menu'" v-if="isContextMenuVisible"
          :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px', zIndex: 10000 }">
          <ul>
            <li @click="updateAvatar">更新头像</li>
            <li @click="viewAvatar">查看头像</li>
          </ul>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="isAvatarPreviewVisible" class="avatar-preview" @click.self="hideAvatarPreview"
          :style="{ zIndex: 9999 }">
          <img :src="processedAvatar" alt="头像预览" class="preview-image">
          <div class="close-btn" @click="hideAvatarPreview">&times;</div>
        </div>
      </Teleport>
    </div>

    <div class="dynamic-divider">
      <div class="energy-wave"></div>
      <div class="glow-line"></div>
      <div class="particle-trail"></div>
    </div>

    <div class="info-panel">
      <transition-group v-if="userRole === 'student'" name="stats" tag="div" class="stats-grid">
        <div v-for="(stat, index) in studentStats" :key="stat.label" class="stat-card"
          :style="{ transitionDelay: `${index * 0.1}s` }">
          <div class="stat-icon" :class="stat.color">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <animated-number :value="stat.value" :duration="1000" class="stat-value" />
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </transition-group>

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

      <!-- 主按钮容器 -->
      <div class="action-buttons">
        <!-- 修改个人信息按钮 -->
        <button class="cyber-button primary" @click="showEditInfoModal" data-text="修改信息">
          <span class="glow"></span>
          <span class="content">
            <img :src="changeInfoIconSrc" alt="修改信息" class="action-icon" />
            <!-- <i class="icon-edit"></i> -->
          </span>
        </button>

        <!-- 设置按钮 -->
        <button class="cyber-button secondary" @click="goToSettings" data-text="系统设置">
          <span class="glow"></span>
          <span class="content">
            <img :src="settingsIconSrc" alt="系统设置" class="action-icon" />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter  } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme';
import { infoAPI } from '@/api/info'
import { infoAPI as index } from '@/api/index'
import gsap from 'gsap'
import { ElMessage } from 'element-plus';



const authStore = useAuthStore()
const themeStore = useThemeStore()
const route = useRoute()
const router = useRouter()
const userData = ref({})
const loading = ref(true)
const avatarError = ref(false)
const isCollegeLoading = ref(true)
// 新增的编辑信息相关变量
const isEditInfoModalVisible = ref(false)
const editData = ref({})

const maskIdNumber = (idNumber) => {
  if (!idNumber) return '无';
  return idNumber.replace(/(\d{4})\d{10}(\w{4})/, '$1****$2');
};

const changeInfoIconSrc = computed(() => {
  return themeStore.currentTheme == 'dark'
    ? new URL('@/assets/image/changeinfo_dark.png', import.meta.url).href
    : new URL('@/assets/image/changeinfo.png', import.meta.url).href;
});

const settingsIconSrc = computed(() => {
  return themeStore.currentTheme == 'dark'
    ? new URL('@/assets/image/setting_dark.png', import.meta.url).href
    : new URL('@/assets/image/setting.png', import.meta.url).href;
});

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
    { key: 'email', label: '电子邮箱', icon: 'email' },
    { key: 'phone', label: '联系电话', icon: 'phone' },
    { key: 'cn_1', label: '身份证号', icon: 'sn' },
    { key: 'college', label: '学院', icon: 'depart' },
    { key: 'prize_num', label: '获奖数量', icon: 'price' },
    { key: 'race_num', label: '竞赛参与数', icon: 'comp' }
  ],
  teacher: [
    { key: 'email', label: '电子邮箱', icon: 'email' },
    { key: 'phone', label: '联系电话', icon: 'phone' },
    { key: 'college', label: '学院', icon: 'depart' }
  ]
}
const getIconPath = (iconName) => {
  const themeSuffix = themeStore.currentTheme === 'dark' ? '_dark' : ''
  return new URL(`/src/assets/image/${iconName}${themeSuffix}.png`, import.meta.url).href
}

const filteredInfo = computed(() => {
  return infoConfig[userRole.value].map(item => ({
    ...item,
    value: userData.value[item.key]
  }))
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = userRole.value === 'teacher'
      ? await infoAPI.getTeacherInfo()
      : await infoAPI.getStudentInfo()

    userData.value = response.data
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

// 数字动画组件
const AnimatedNumber = {
  props: ['value', 'duration'],
  data() {
    return { displayValue: 0 }
  },
  watch: {
    value(newVal) {
      gsap.to(this, {
        duration: this.duration / 1000,
        displayValue: newVal,
        ease: 'circ.out'
      })
    }
  },
  render() {
    return Math.floor(this.displayValue)
  }
}

// 新增文件输入引用
const fileInput = ref(null)

// 处理文件选择
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 创建FormData对象并添加文件
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    // 声明response变量
    let response;

    // 调用更新头像API
    if (userRole.value === 'teacher') {
      response = await infoAPI.updateTeacherAvatar(formData);
    } else {
      response = await infoAPI.updateStudentAvatar(formData);
    }

    // 显示成功提示
    ElMessage.success(`头像上传成功！`);

    // 更新用户数据中的头像URL
    userData.value.avatar = response.data.avatar;

    // 强制刷新组件以显示新头像
    // 方法1：使用Vue的响应式系统自动触发更新
    // 方法2：强制重新加载用户信息
    await fetchUserInfo();

    // 重置文件输入
    fileInput.value.value = null;

    console.log('头像更新成功:', response);
  } catch (error) {
    console.error('更新头像失败:', error);
    // 重置文件输入
    fileInput.value.value = null;
    // 显示错误提示
    ElMessage.error(`头像上传失败！`);
  }
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

// 更新头像
const updateAvatar = () => {
  fileInput.value.click()
  hideContextMenu()
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

// 获取学院数据
const fetchColleges = async () => {
  console.log('开始获取学院数据...');
  try {
    const response = await index.getcollegepublic()
    colleges.value = response.data.data
    console.log('学院数据获取成功:', colleges.value)
  } catch (error) {
    console.error('获取学院数据失败:', error)
  } finally {
    isCollegeLoading.value = false
  }
}

// 显示修改信息模态框
const showEditInfoModal = () => {
  const currentCollege = colleges.value.find(college => college.name === userData.value.college)
  // 初始化编辑数据
  editData.value = {
    username: userData.value.username,
    email: userData.value.email,
    phone: userData.value.phone,
    cn_1: userData.value.cn_1,
    collegeId: currentCollege ? currentCollege.id : (colleges.value[0]?.id || null)
  };
  isEditInfoModalVisible.value = true;
}

// 隐藏修改信息模态框
const hideEditInfoModal = () => {
  isEditInfoModalVisible.value = false;
}

// 更新用户信息
const updateUserInfo = async () => {
  try {
    // 验证必填字段
    if (!editData.value.username || !editData.value.email ||
      !editData.value.phone || (userRole.value === 'student' && !editData.value.cn_1)) {
      ElMessage.error('所有必填字段都是必填项');
      return;
    }

    // 获取用户ID
    const userStr = localStorage.getItem('user');
    let userId = '';
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id;
      } catch (e) {
        console.error('解析localStorage中的user失败:', e);
      }
    }

    // 找到选中的学院名称
    const selectedCollege = colleges.value.find(college => college.id === editData.value.collegeId)

    // 构建更新数据
    const updateData = {
      username: editData.value.username,
      email: editData.value.email,
      phone: editData.value.phone,
      cn_1: editData.value.cn_1,
      college: selectedCollege ? selectedCollege.name : ''
    };

    // 调用API更新用户信息
    let response;
    if (userRole.value === 'teacher') {
      response = await infoAPI.updateTeacherInfo(userId, updateData);
    } else {
      response = await infoAPI.updateStudentInfo(userId, updateData);
    }

    // 更新本地数据
    userData.value = {
      ...userData.value,
      ...updateData
    };
    if (response.data.code==400){
      ElMessage.error(`更新个人信息失败：${response.data.message}`);
      return;
    }
    // 显示成功提示
    ElMessage.success(`个人信息更新成功！`);

    // 隐藏模态框
    hideEditInfoModal();
  } catch (error) {
    console.error('更新用户信息失败:', error);
    // 显示错误提示
    ElMessage.error({
      message: `更新个人信息失败：${error.message}`,
      zIndex: 99999
    });
  }
}


// 添加设置按钮的点击事件处理
const goToSettings = () => {
  router.push('/settings')
}

onMounted(() => {
  fetchUserInfo()
  fetchColleges()
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

.context-menu {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 242, 255, 0.3);
}

.context-menu {
  transition: all 0.3s ease;
}


.context-menu-dark {
  position: absolute;
  z-index: 30;
  background: #313641 !important;
  border: 1px solid rgba(0, 242, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.2);
  animation: menuFadeIn 0.2s ease-in-out;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.context-menu-dark ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.context-menu-dark li {
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #eaeaea;
}

.context-menu-dark li:hover {
  background-color: rgba(0, 242, 255, 0.1);
  transform: translateX(5px);
}

.context-menu-dark {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 242, 255, 0.3);
}

.context-menu-dark {
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