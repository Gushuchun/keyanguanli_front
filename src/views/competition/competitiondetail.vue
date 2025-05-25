<template>
  <div class="user-info-container" :class="{ 'dark': themeStore.isDark }">
    <div class="particles">
      <div v-for="i in 100" :key="i" class="particle"></div>
    </div>

    <div class="dynamic-divider">
      <div class="energy-wave"></div>
      <div class="glow-line"></div>
      <div class="particle-trail"></div>
    </div>

    <div class="info-panel">
      <!-- 比赛状态标识 -->
      <div v-if="competitionData.status === 'pending'" class="status-tag">
        待确认
      </div>
      <!-- 比赛信息 -->
      <div class="section-title">
        比赛信息
        <button 
          v-if="canEditCompetition" 
          class="inline-edit-button cyber-button primary"
          @click="showEditCompetitionModal"
          data-text="修改比赛信息"
        >
          <span class="glow"></span>
          <span class="content">
            <img :src="changeInfoIconSrc" alt="修改比赛信息" class="action-icon" />
          </span>
        </button>
      </div>
      <div class="team-detail-grid">
        <!--        <div class="team-field">-->
        <!--          <strong>比赛编号:</strong> {{ competitionData.sn }}-->
        <!--        </div>-->
        <div class="team-field">
          <strong>比赛名称:</strong> {{ competitionData.title }}
        </div>
        <div class="team-field">
          <strong>比赛日期:</strong> {{ formatDate(competitionData.date) }}
        </div>
        <div class="team-field">
          <strong>比赛描述:</strong> {{ competitionData.description }}
        </div>
        <div class="team-field">
          <strong>比赛得分:</strong> {{ competitionData.score }}
        </div>
        <div class="team-field">
          <strong>参赛团队:</strong> {{ competitionData.team_name }}
        </div>
        <div class="team-field">
          <strong>比赛文件:</strong>
          <span
              class="view-file-link"
              @click="viewImage(competitionData.file)"
          >
            查看比赛文件
          </span>
          <Teleport to="body">
            <div
                v-if="isFilePreviewVisible"
                class="file-preview"
                @click.self="hideFilePreview"
                :style="{ zIndex: 1000 }"
            >
              <img
                  :src="getImageUrl(competitionData.file)"
                  alt="比赛文件预览"
                  class="preview-image"
              />
              <div class="close-btn" @click="hideFilePreview">&times;</div>
            </div>
          </Teleport>
        </div>
      </div>

      <!-- 教师信息 -->
      <div class="section-title">
        指导教师
        <button 
          v-if="canEditTeachers" 
          class="inline-edit-button cyber-button primary"
          @click="showEditTeachersModal"
          data-text="编辑指导教师"
        >
          <span class="glow"></span>
          <span class="content">
            <img :src="changeInfoIconSrc" alt="编辑指导教师" class="action-icon" />
          </span>
        </button>
      </div>
      <div class="teachers-grid">
        <div v-for="teacher in competitionData.teachers_info" :key="teacher.id" class="teacher-item">
          <img :src="getAvatarUrl(teacher.avatar)" alt="头像" class="teacher-avatar"/>
          <span class="teacher-name">{{ teacher.name }}</span>
        </div>
      </div>

      <!-- 编辑教师模态框 -->
      <Teleport to="body">
        <div 
          v-if="isEditTeachersModalVisible" 
          class="edit-members-modal" 
          :class="{ 'dark': themeStore.isDark }"
          @click.self="hideEditTeachersModal"
        >
          <div 
            class="modal-overlay" 
            @click.stop
          >
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
              <div class="modal-header">
                <h2>指导教师管理</h2>
                <button 
                  class="close-modal-btn" 
                  @click="hideEditTeachersModal"
                >
                  &times;
                </button>
              </div>

              <!-- 教师列表 -->
              <div class="members-list">
                <div 
                  v-for="teacher in competitionData.teachers_info" 
                  :key="teacher.id" 
                  class="member-item"
                >
                  <img :src="getAvatarUrl(teacher.avatar)" alt="头像" class="member-avatar" />
                  <span class="member-name">{{ teacher.name }}</span>
                  <button 
                    class="remove-button cyber-button secondary"
                    @click.stop="removeTeacher(teacher)"
                  >
                    <span class="content">
                      <img 
                        :src="removememberIconSrc" 
                        alt="移除"
                        class="action-icon"
                      />
                    </span>
                  </button>
                </div>
              </div>

              <!-- 添加教师按钮 -->
              <div class="add-member-button">
                <button 
                  class="cyber-button primary"
                  @click.stop="showTeacherListModal"
                >
                  <span class="content">
                    <img 
                      :src="invitenewstudentIconSrc" 
                      alt="添加"
                      class="action-icon"
                    />
                  </span>
                  <span class="tooltip">邀请新教师</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- 教师列表模态框 -->
      <Teleport to="body">
        <div v-if="isTeacherListVisible" class="student-list-modal" :class="{ 'dark': themeStore.isDark }">
          <div class="modal-overlay" @click.self="hideTeacherListModal">
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
              <h2>选择要邀请的教师</h2>
              
              <!-- 教师搜索 -->
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="searchTeacherQuery" 
                  placeholder="按姓名或工号搜索..."
                  @input="filterTeachers"
                />
              </div>

              <!-- 教师列表 -->
              <div class="students-grid">
                <div 
                  v-for="teacher in filteredTeachers" 
                  :key="teacher.id" 
                  class="student-card"
                  @click.stop="selectTeacher(teacher)"
                >
                  <img :src="getAvatarUrl(teacher.avatar)" alt="头像" class="student-avatar" />
                  <div class="student-info">
                    <strong>{{ teacher.username }}</strong>
                    <p>{{ teacher.college }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <div class="background-elements">
        <div class="cyber-circle"></div>
        <div class="hexagon-pattern"></div>
      </div>
    </div>
    </div>
    <!-- 编辑比赛信息模态框 -->
    <Teleport to="body">
      <div v-if="isEditCompetitionModalVisible" class="edit-competition-modal" :class="{ 'dark': themeStore.isDark }">
        <div class="modal-overlay" @click.self="hideEditCompetitionModal">
          <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
            <h2>修改比赛信息</h2>
            <form @submit.prevent="updateCompetitionInfo">
              <div class="form-group">
                <label for="competitionName">比赛名称:</label>
                <input type="text" id="competitionName" v-model="editCompetitionData.title" required />
              </div>
              <div class="form-group">
                <label for="competitionDate">比赛日期:</label>
                <input type="date" id="competitionDate" v-model="editCompetitionData.date" required />
              </div>
              <div class="form-group">
                <label for="competitionScore">比赛得分:</label>
                <input type="number" id="competitionScore" v-model="editCompetitionData.score" step="0.01" />
              </div>
              <div class="form-group">
                <label for="competitionFile">比赛文件:</label>
                <input type="file" id="competitionFile" @change="handleFileChange" />
              </div>
              <div class="form-group">
                <label for="competitionDescription">比赛描述:</label>
                <textarea id="competitionDescription" v-model="editCompetitionData.description" required></textarea>
              </div>
              <div class="modal-actions">
                <button type="submit">保存</button>
                <button type="button" @click="hideEditCompetitionModal">取消</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
    
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router'
import { infoAPI } from '@/api/competition'
import { ElMessageBox, ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const competitionData = ref({})
const isFilePreviewVisible = ref(false)
const isEditCompetitionModalVisible = ref(false)
const editCompetitionData = ref({})
const selectedFile = ref(null)

const isEditTeachersModalVisible = ref(false)
const isTeacherListVisible = ref(false)
const searchTeacherQuery = ref('')
const filteredTeachers = ref([])
const allTeachers = ref([])


// 获取当前用户的 sn
const currentUserSn = computed(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return ''
  try {
    const user = JSON.parse(userStr)
    return user.sn
  } catch (e) {
    console.error('解析localStorage中的user失败:', e)
    return ''
  }
})

// 判断是否可以编辑比赛信息
const canEditCompetition = computed(() => {
  return competitionData.value.status === 'pending' && competitionData.value.captain_id === currentUserSn.value
})

// 获取比赛详情
const fetchCompetitionDetail = async () => {
  try {
    const response = await infoAPI.getCompetitionDetail(route.params.id)
    competitionData.value = response.data
  } catch (error) {
    console.error('获取比赛详情失败:', error)
  }
}

// 获取所有教师列表
const fetchAllTeachers = async () => {
  try {
    const response = await infoAPI.getAllTeachers()
    allTeachers.value = response.data
    filterTeachers()
  } catch (error) {
    console.error('获取教师列表失败:', error)
  }
}

// 过滤教师列表
const filterTeachers = () => {
  const query = searchTeacherQuery.value.toLowerCase()
  filteredTeachers.value = allTeachers.value.filter(teacher => {
    return teacher.username.toLowerCase().includes(query) || teacher.sn.toLowerCase().includes(query)
  })
}

// 头像处理函数
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return new URL('@/assets/image/default_avatar.png', import.meta.url).href
  return avatarPath.startsWith('http') ? avatarPath : `http://${avatarPath}`
}

// 图片处理函数
const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  return imagePath.startsWith('http') ? imagePath : `http://${imagePath}`
}

// 查看图片
const viewImage = (imageUrl) => {
  isFilePreviewVisible.value = true
}

const hideFilePreview = () => {
  isFilePreviewVisible.value = false
}

// 时间格式化函数
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// 显示编辑比赛信息模态框
const showEditCompetitionModal = () => {
  editCompetitionData.value = {
    title: competitionData.value.title,
    date: competitionData.value.date,
    score: competitionData.value.score,
    description: competitionData.value.description
  }
  selectedFile.value = null
  isEditCompetitionModalVisible.value = true
}

// 隐藏编辑比赛信息模态框
const hideEditCompetitionModal = () => {
  isEditCompetitionModalVisible.value = false
}

// 处理文件选择
const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

// 提交修改
const updateCompetitionInfo = async () => {
  try {
    const formData = new FormData()
    formData.append('title', editCompetitionData.value.title)
    formData.append('date', editCompetitionData.value.date)
    formData.append('score', editCompetitionData.value.score)
    formData.append('description', editCompetitionData.value.description)
    if (selectedFile.value) {
      formData.append('certificate_image', selectedFile.value)
    }

    await infoAPI.updateCompetitionInfo(route.params.id, formData)

    ElMessage.success('比赛信息更新成功！')
    fetchCompetitionDetail()
    hideEditCompetitionModal()
  } catch (error) {
    console.error('更新比赛信息失败:', error)
    ElMessage.error('更新比赛信息失败，请稍后再试。')
  }
}

const hideEditTeachersModal = () => {
  console.log('尝试关闭编辑教师模态框');
  isEditTeachersModalVisible.value = false;
};

// 选择教师
const selectTeacher = async (teacher) => {
  console.log('选择教师:', teacher)
  try {
    // 弹出确认弹窗
    await ElMessageBox.confirm(
      `确定要邀请 ${teacher.username} 作为指导老师吗？`,
      '确认邀请',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    const payload = {
      competition_sn: competitionData.value.sn,
      target_sn: teacher.sn
    }
    const response = await infoAPI.inviteNewTeacher(payload)
    if (response.data.code !== 200) {
      ElMessage.error(response.data.message || '邀请失败')
      return
    }
    ElMessage.success('邀请教师成功')
    hideTeacherListModal()
    fetchCompetitionDetail()
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消操作，不做处理
      return
    }
    console.error('邀请教师失败:', error)
    ElMessage.error('邀请教师失败，请稍后再试')
  }
}

// 隐藏教师列表模态框
const hideTeacherListModal = () => {
  isTeacherListVisible.value = false
}

// 显示教师列表模态框
const showTeacherListModal = async () => {
  await fetchAllTeachers()
  isTeacherListVisible.value = true
}

// 显示编辑教师模态框
const showEditTeachersModal = () => {
  isEditTeachersModalVisible.value = true
}

// 判断是否可以编辑教师信息
const canEditTeachers = computed(() => {
  return competitionData.value.status === 'pending' && competitionData.value.captain_id === currentUserSn.value
})


// 移除教师
const removeTeacher = async (teacher) => {
  try {
    // 弹出确认弹窗
    await ElMessageBox.confirm(
      `确定要移除 ${teacher.name} 指导老师吗？`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    const payload = {
      competition_sn: competitionData.value.sn,
      teacher_sn: teacher.sn
    }
    const response = await infoAPI.removeTeacherFromCompetition(payload)
    if (response.data.code !== 200) {
      ElMessage.error(response.data.message || '移除教师失败')
      return
    }
    ElMessage.success('移除教师成功')
    fetchCompetitionDetail()
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消操作，不做处理
      return
    }
    console.error('移除教师失败:', error)
    ElMessage.error('移除教师失败，请稍后再试')
  }
}


// 修改图标路径
const changeInfoIconSrc = computed(() => {
  return themeStore.currentTheme === 'dark'
    ? new URL('@/assets/image/changeinfo_dark.png', import.meta.url).href
    : new URL('@/assets/image/changeinfo.png', import.meta.url).href;
});

const removememberIconSrc = computed(() => {
  return themeStore.currentTheme === 'dark'
    ? new URL('@/assets/image/remove_student_dark.png', import.meta.url).href
    : new URL('@/assets/image/remove_student.png', import.meta.url).href;
});

const invitenewstudentIconSrc = computed(() => {
  return themeStore.currentTheme === 'dark'
    ? new URL('@/assets/image/team_invite_student_dark.png', import.meta.url).href
    : new URL('@/assets/image/team_invite_student.png', import.meta.url).href;
});

onMounted(() => {
  fetchCompetitionDetail()
})
</script>

<style scoped>
.user-info-container {
  min-height: 100vh;
  background: radial-gradient(ellipse at bottom, #eaeaee 0%,);
  position: relative;
  overflow: hidden;
  padding: 0.8rem;
}

.dark .user-info-container {
  background: radial-gradient(ellipse at bottom, #eaeaee 0%,),
  url('@/assets/images/cyber-bg-dark.jpg') center/cover;
}

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
  0%, 100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-20px) scale(0.9);
  }
}

.profile-header {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 1.5rem 0;
}

.section-title {
  font-size: 1.5rem;
  margin-top: 2rem;
  /* margin-left: 10px; */
  margin-bottom: 3rem;
  color: #00f2fe;
  text-align: center;
  position: relative;
}

.inline-edit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: auto;
  padding: 0.4rem 0.8rem;
  margin-left: 1rem;
  font-size: 0.9rem;
  background: linear-gradient(45deg, rgba(0, 242, 254, 0.2), rgba(0, 86, 179, 0.2));
  border: 1px solid rgba(0, 242, 254, 0.5);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3), inset 0 0 10px rgba(0, 242, 254, 0.2);
  transition: all 0.3s ease;
  vertical-align: middle;
  cursor: pointer;
}

.inline-edit-button:hover {
  transform: translateY(-2px) rotateX(10deg) rotateY(10deg);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.5), inset 0 0 15px rgba(0, 242, 254, 0.3);
}

.inline-edit-button .content {
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.inline-edit-button::before {
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
  opacity: 1; /* 始终显示 */
  min-width: 80px;
  pointer-events: none;
}

.team-detail-grid,
.members-grid,
.competition-grid {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.member-card,
.competition-card {
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.8), rgba(0, 32, 53, 0.6));
  padding: 1.2rem;
  border-radius: 15px;
  border: 1px solid rgba(0, 242, 254, 0.2);
  transition: all 0.3s ease;
  color: #fff;
}

.member-card:hover,
.competition-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 242, 254, 0.1);
}

.member-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
  margin-right: 1rem;
}

.member-info p {
  margin: 0.3rem 0;
}

.info-panel {
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 1rem;
  position: relative;
  background: rgba(0, 0, 0, 0.07);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: visible;
}

/* 边框流动光效 */
.info-panel::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
      90deg,
      transparent 25%,
      #00f2fe,
      #66f9ff,
      #aaf8ff,
      #7dfaff,
      transparent 75%
  );
  background-size: 200% 200%;
  animation: borderLineMove 4s linear infinite;
  pointer-events: none;
  z-index: 2;
  border-radius: 20px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  clip-path: inset(-2px -2px -2px -2px round 20px); /* 精确贴合圆角 */
  -webkit-mask: linear-gradient(#fff, #fff) content-box,
  linear-gradient(#fff, #fff);
  mask: linear-gradient(#fff, #fff) content-box,
  linear-gradient(#fff, #fff);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  padding: 2px;
}

@keyframes borderLineMove {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
}

.background-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.cyber-circle {
  position: absolute;
  width: 450px;
  height: 450px;
  border: 5px solid rgba(39, 170, 177, 0.1);
  border-radius: 50%;
  left: -200px;
  top: -200px;
  animation: rotate 20s infinite linear;
}

.hexagon-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/hex-pattern.svg');
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

.section-title {
  font-size: 1.5rem;
  margin-top: 3rem;
  color: #00f2fe;
  text-align: center;
}

.team-detail-grid,
.members-grid,
.competition-grid {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.member-card,
.competition-card {
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.8), rgba(0, 32, 53, 0.6));
  padding: 1.2rem;
  border-radius: 15px;
  border: 1px solid rgba(0, 242, 254, 0.2);
  transition: all 0.3s ease;
  color: #fff;
}

.member-card:hover,
.competition-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 242, 254, 0.1);
}

.member-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
  margin-right: 1rem;
}

.member-info p {
  margin: 0.3rem 0;
}

.edit-team-button {
  text-align: center;
  margin-top: 2rem;
}

.tooltip {
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
}

.cyber-button:hover .tooltip {
  opacity: 1;
  bottom: calc(100% + 15px);
}

.award-status {
  font-weight: bold;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.award-status.success {
  background-color: rgba(0, 255, 0, 0.2);
  color: #00ff66;
}

.award-status.warning {
  background-color: rgba(255, 165, 0, 0.2);
  color: #ffa500;
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
  bottom: -50px;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(0, 242, 254, 0.2) 0%, transparent 70%);
  animation: particle-rotate 8s linear infinite;
  filter: blur(20px);
}

.action-buttons {
  position: relative;
  display: flex;
  transform-style: preserve-3d;
  justify-content: center;
  gap: 4rem;
  flex-wrap: wrap;
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
  background: radial-gradient(circle, rgba(0, 242, 254, 0.8) 0%, transparent 70%);
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

.cyber-button.primary {
  background: linear-gradient(45deg, rgba(0, 242, 254, 0.2), rgba(0, 86, 179, 0.2));
  border: 1px solid rgba(0, 242, 254, 0.5);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.3), inset 0 0 10px rgba(0, 242, 254, 0.2);
}

.cyber-button.primary:hover {
  transform: translateY(-5px) rotateX(15deg) rotateY(15deg);
  box-shadow: 0 0 40px rgba(0, 242, 254, 0.5), inset 0 0 15px rgba(0, 242, 254, 0.3);
}

.edit-team-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
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
  z-index: 600;
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

/* 缩小修改比赛信息模态框 */
.edit-competition-modal .modal-content,
.edit-competition-modal .modal-content-dark {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  padding: 1.5rem; /* 减少内边距 */
  max-width: 400px; /* 减小最大宽度 */
  margin: 0 auto;
  z-index: 10;
}

/* 确保白天模式下标题文字为白色 */
.edit-competition-modal .modal-content h2 {
  color: #fff;
  text-align: center;
  margin-bottom: 1.5rem;
}

.edit-competition-modal .modal-content-dark h2 {
  color: #00f2fe; /* 黑夜模式下保持原有颜色 */
  text-align: center;
  margin-bottom: 1.5rem;
}

.edit-competition-modal .form-group {
  margin-bottom: 1rem;
}

.edit-competition-modal label {
  display: block;
  margin-bottom: 0.5rem;
  color: #fff;
}

.edit-competition-modal input,
.edit-competition-modal textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(0, 242, 254, 0.5);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  border-radius: 5px;
  /* 限制最大宽度和高度 */
  max-width: 100%; 
  max-height: 200px; 
  resize: vertical; /* 仅允许垂直拉伸 */
}
.edit-competition-modal .modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.edit-competition-modal button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-competition-modal button[type="submit"] {
  background: rgba(0, 242, 254, 0.8);
  color: #fff;
}

.edit-competition-modal button[type="button"] {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;

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

.dark .modal-content,
.dark .modal-content-dark {
  background: rgba(30, 30, 30, 0.98) !important;
  color: #eaeaea;
  border: 1px solid rgba(0, 242, 254, 0.2) !important;
}

.modal-content h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
  margin-right: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 242, 254, 0.3);
  background: rgba(128, 128, 128, 0.2);
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #00f2fe;
  background: rgba(128, 128, 128, 0.3);
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

@keyframes glow-pulse {
  0%, 100% {
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

.action-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.edit-members-modal .modal-content,
.edit-members-modal .modal-content-dark {
  max-width: 400px;
  width: 90%;
  padding: 1.5rem;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.8), rgba(0, 32, 53, 0.6));
  border-radius: 15px;
  padding: 0.8rem;
  border: 1px solid rgba(0, 242, 254, 0.2);
  transition: all 0.3s ease;
}

.member-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 242, 254, 0.1);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-right: 1rem;
}

.member-name {
  font-size: 1rem;
  color: #fff;
  flex: 1;
  margin-left: 1rem;
}

.remove-button {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-button .action-icon {
  width: 24px;
  height: 24px;
  filter: brightness(0.9);
  transition: transform 0.3s ease;
}

.remove-button:hover .action-icon {
  transform: scale(1.1) rotate(90deg);
}

.add-member-button {
  margin-top: 1.5rem;
  text-align: center;
}

.add-member-button button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(0, 242, 254, 0.2), rgba(0, 86, 179, 0.2));
  border: 1px solid rgba(0, 242, 254, 0.5);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3), inset 0 0 10px rgba(0, 242, 254, 0.2);
}

.add-member-button button:hover {
  transform: translateY(-5px) rotateX(15deg) rotateY(15deg);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.5), inset 0 0 15px rgba(0, 242, 254, 0.3);
}

.student-list-modal .modal-content,
.student-list-modal .modal-content-dark {
  max-width: 600px;
  width: 90%;
  padding: 1.5rem;
}

.search-box input {
  width: 95%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 242, 254, 0.3);
  background: rgba(128, 128, 128, 0.2);
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  margin-right: 200px;
}

.students-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.student-card {
  display: flex;
  align-items: center;
  padding: 0.8rem;
  border-radius: 15px;
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.8), rgba(0, 32, 53, 0.6));
  border: 1px solid rgba(0, 242, 254, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.student-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 242, 254, 0.1);
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-right: 1rem;
}

.student-info strong {
  display: block;
  color: #fff;
}

.student-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #ccc;
}

.team-action-buttons {
  display: flex;
  justify-content: center;
}

.cyber-button.danger {
  background: linear-gradient(45deg, rgba(255, 65, 50, 0.2), rgba(179, 0, 85, 0.2));
  border: 1px solid rgba(255, 65, 50, 0.5);
  box-shadow: 0 0 10px rgba(255, 65, 50, 0.3), inset 0 0 10px rgba(255, 65, 50, 0.2);
}

.cyber-button.danger:hover {
  transform: translateY(-5px) rotateX(15deg) rotateY(15deg);
  box-shadow: 0 0 20px rgba(255, 65, 50, 0.5), inset 0 0 15px rgba(255, 65, 50, 0.3);
}

.cyber-button.warning {
  background: linear-gradient(45deg, rgba(255, 200, 0, 0.2), rgba(179, 110, 0, 0.2));
  border: 1px solid rgba(255, 200, 0, 0.5);
  box-shadow: 0 0 10px rgba(255, 200, 0, 0.3), inset 0 0 10px rgba(255, 200, 0, 0.2);
}

.cyber-button.warning:hover {
  transform: translateY(-5px) rotateX(10deg) rotateY(10deg);
  box-shadow: 0 0 20px rgba(255, 200, 0, 0.5), inset 0 0 15px rgba(255, 200, 0, 0.3);
}

.team-action-buttons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem; /* 控制按钮之间的间距 */
  margin-top: 3rem;
}

.teachers-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5rem; /* 增大间距 */
  justify-content: center;
  margin-top: 1rem;
}

.teacher-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 5rem;
}

.teacher-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.teacher-name {
  font-size: 1rem;
  color: var(--text-color); /* 使用主题变量 */
}

.competition-file-image {
  max-width: 200px;
  max-height: 200px;
  cursor: pointer;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.competition-file-image:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.5);
}

.view-file-link {
  color: #00f2fe;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.view-file-link:hover {
  color: #66f9ff;
}

.file-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  animation: previewFadeIn 0.3s ease-in-out;
  cursor: pointer;
}

.preview-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 15px;
  box-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
  border: 5px solid rgba(0, 242, 255, 0.3);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.preview-image:hover {
  transform: scale(1.05);
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

.status-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ffcc00;
  color: #000;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: bold;
  z-index: 1;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  text-align: center; 
  position: relative;
}

.modal-header h2 {
  flex-grow: 1; /* 让标题占据剩余空间 */
  margin: 0; /* 移除默认外边距 */
}

.close-modal-btn {
  background: transparent;
  border: none;
  font-size: 2.5rem;
  color: #00f2fe;
  cursor: pointer;
  transition: color 0.3s ease;
  margin-left: -3rem;
}

.close-modal-btn:hover {
  color: #66f9ff;
}
</style>