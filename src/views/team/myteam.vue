<template>
    <div class="user-info-container" :class="{ 'dark': themeStore.isDark }">
      <div class="particles">
        <div v-for="i in 100" :key="i" class="particle"></div>
      </div>
  
      <div class="profile-header">
        <h1>我的团队</h1>
        <button 
            v-if="role=='student'"
            class="simple-icon-only"
            @click="showCreateTeamModal"
            data-text="创建新团队"
        >
            <span class="glow"></span>
            <span class="content">
            <img :src="newteamIconSrc" alt="创建新团队" class="action-icon tiny" />
            </span>
        </button>
      </div>
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          @input="debouncedSearch"
          placeholder="搜索团队名称"
          class="search-input"
        />
      </div>
      <div class="dynamic-divider">
        <div class="energy-wave"></div>
        <div class="glow-line"></div>
        <div class="particle-trail"></div>
      </div>
  
      <div class="info-panel">
        <div class="team-list">
            <template v-if="teams.length > 0">
 <router-link
    v-for="(team, index) in teams"
    :key="team.id"
    :to="['pending', 'expired'].includes(team.status) ? '' : `/team/detail/${team.id}`"
    class="team-card"
    @click.native="handleTeamClick(team)"
  >
    <div class="border-effect"></div>
    <div class="team-content">
      <h3 class="team-name">{{ team.name }}</h3>
      <div class="team-info">队长: {{ team.cap_name }}</div>
      <div class="team-info">成员数: {{ team.people_num }}</div>
      <div class="team-info">教师数: {{ team.teacher_num }}</div>
      <div class="team-info">竞赛参与数: {{ team.race_num }}</div>
      <div class="team-info">获奖数量: {{ team.prize_num }}</div>
      <div class="team-info">创建时间: {{ formatDate(team.create_time) }}</div>
      
      <div v-if="team.status === 'pending'" class="status-badge warning">待确认</div>
      <div v-if="team.status === 'expired'" class="status-badge expired">已过期</div>
    </div>
  </router-link>
            </template>
             <!-- 空状态提示 -->
            <div v-else class="empty-state">
                <div class="empty-icon">
                    <img :src="emptyImageSrc" alt="空状态"/>
                </div>
                <h3 class="empty-title">暂时未加入团队</h3>
                <p class="empty-tip">点击右上角按钮创建你的第一个团队</p>
            </div>
        </div>
      </div>

      <Teleport to="body">
        <div v-if="isStatusModalVisible" class="team-status-modal" :class="{ 'dark': themeStore.isDark }">
            <div class="modal-overlay" @click.self="hideStatusModal">
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
                <h2>团队确认状态</h2>

                <!-- 学生列表 -->
                <div class="members-section">
                <h3>学生成员</h3>
                <div class="member-list">
                    <div v-for="student in statusData.students" :key="student.sn" class="member-item">
                        <img :src="getAvatarUrl(student.avatar)" alt="头像" class="member-avatar" />
                        <span class="member-name">{{ student.username }}</span>
                        <span 
                            v-if="!isCurrentUser(student) || ['confirmed', 'rejected', 'expired'].includes(student.status)"
                            :class="['status-tag', student.status]"
                            >
                            {{ getStatusText(student.status) }}
                        </span>


                        <!-- 如果是当前用户且状态为 pending -->
                        <div v-if="isCurrentUser(student) && student.status === 'pending'" class="action-buttons">
                            <button 
                            class="cyber-button success"
                            @click="updateStudentStatus('confirmed', student)"
                            >
                            <span class="content">确认</span>
                            </button>
                            <button 
                            class="cyber-button danger"
                            @click="updateStudentStatus('rejected', student)"
                            >
                            <span class="content">拒绝</span>
                            </button>
                        </div>
                    </div>
                </div>
                </div>

                <!-- 教师列表 -->
                <div class="members-section">
                <h3>教师成员</h3>
                <div class="member-list">
                    <div v-for="teacher in statusData.teachers" :key="teacher.sn" class="member-item">
                        <img :src="getAvatarUrl(teacher.avatar)" alt="头像" class="member-avatar" />
                        <span class="member-name">{{ teacher.username }}</span>
                        
                        <!-- 状态标签仅对非当前用户显示 -->
                        <span 
                            v-if="!isCurrentUser(teacher) || ['confirmed', 'rejected', 'expired'].includes(teacher.status)"
                            :class="['status-tag', teacher.status]"
                        >
                            {{ getStatusText(teacher.status) }}
                        </span>

                        <!-- 当前用户操作按钮 -->
                        <div 
                            v-if="isCurrentUser(teacher) && teacher.status === 'pending'" 
                            class="action-buttons"
                        >
                            <button 
                            class="cyber-button success"
                            @click="updateTeacherStatus('confirmed', teacher)"
                            >
                            <span class="content">确认</span>
                            </button>
                            <button 
                            class="cyber-button danger"
                            @click="updateTeacherStatus('rejected', teacher)"
                            >
                            <span class="content">拒绝</span>
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </Teleport>

        <Teleport to="body">
  <div v-if="isCreateTeamModalVisible" class="create-team-modal-container">
    <div class="modal-overlay" @click.self="hideCreateTeamModal">
      <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
        <h2>创建新团队</h2>

        <!-- 输入名字 -->
        <div class="form-group">
          <label for="newTeamName">团队名称:</label>
          <input type="text" id="newTeamName" v-model="newTeam.name" required />
        </div>

        <!-- 学生选择 -->
        <div class="form-group">
          <label>学生:</label>
          <div class="selected-members">
            <div 
              v-for="student in selectedStudents" 
              :key="student.id" 
              class="member-tag"
            >
              {{ student.username }}
              <span class="remove-btn" @click="removeStudent(student)">×</span>
            </div>
          </div>
          <button class="add-member-btn" @click="showStudentSelector = true">
            + 添加学生
          </button>
        </div>

        <!-- 教师选择 -->
        <div class="form-group">
          <label>教师:</label>
          <div class="selected-members">
            <div 
              v-for="teacher in selectedTeachers" 
              :key="teacher.id" 
              class="member-tag"
            >
              {{ teacher.username }}
              <span class="remove-btn" @click="removeTeacher(teacher)">×</span>
            </div>
          </div>
          <button class="add-member-btn" @click="showTeacherSelector = true">
            + 添加教师
          </button>
        </div>

        <!-- 提交按钮 -->
        <div class="modal-actions">
          <button type="submit" @click="createTeam">创建团队</button>
          <button type="button" @click="hideCreateTeamModal">取消</button>
        </div>
      </div>
    </div>
  </div>
</Teleport>

<!-- 学生选择弹窗 -->
<Teleport to="body">
  <div v-if="showStudentSelector" class="selector-modal">
    <div class="modal-overlay" @click.self="closeStudentSelector">
      <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
        <h3>选择学生</h3>
        <div class="search-box">
          <input 
            type="text" 
            v-model="studentSearchQuery" 
            placeholder="按姓名或学号搜索..."
            @input="filterStudents"
          />
        </div>
        <div class="members-grid">
          <div 
            v-for="student in filteredStudents" 
            :key="student.id" 
            class="member-card selectable"
            :class="{ selected: isStudentSelected(student) }"
            @click="toggleStudentSelection(student)"
          >
            <img :src="getAvatarUrl(student.avatar)" alt="头像" class="member-avatar" />
            <div class="member-info">
              <strong>{{ student.username }}</strong>
              <p>{{ student.college }}</p>
            </div>
          </div>
        </div>
        <div class="selector-actions">
          <!-- <button class="cyber-button success" @click="closeStudentSelector">确定</button> -->
        </div>
      </div>
    </div>
  </div>
</Teleport>

<!-- 教师选择弹窗 -->
<Teleport to="body">
  <div v-if="showTeacherSelector" class="selector-modal">
    <div class="modal-overlay" @click.self="closeTeacherSelector">
      <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
        <h3>选择教师</h3>
        <div class="search-box">
          <input 
            type="text" 
            v-model="teacherSearchQuery" 
            placeholder="按姓名或工号搜索..."
            @input="filterTeachers"
          />
        </div>
        <div class="members-grid">
          <div 
            v-for="teacher in filteredTeachers" 
            :key="teacher.id" 
            class="member-card selectable"
            :class="{ selected: isTeacherSelected(teacher) }"
            @click="toggleTeacherSelection(teacher)"
          >
            <img :src="getAvatarUrl(teacher.avatar)" alt="头像" class="member-avatar" />
            <div class="member-info">
              <strong>{{ teacher.username }}</strong>
              <p>{{ teacher.college }}</p>
            </div>
          </div>
        </div>
        <div class="selector-actions">
          <!-- <button class="cyber-button success" @click="closeTeacherSelector">确定</button> -->
        </div>
      </div>
    </div>
  </div>
</Teleport>
                        
      <div class="background-elements">
        <div class="cyber-circle"></div>
        <div class="hexagon-pattern"></div>
      </div>

        <div class="pagination">
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="handlePageChange"
    />
  </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import axios from 'axios'
import { ElMessageBox, ElMessage } from 'element-plus'
import { infoAPI } from '@/api/team'

const themeStore = useThemeStore()
const teams = ref([])
const isStatusModalVisible = ref(false)
const statusData = ref({
  students: [],
  teachers: []
})
const selectedTeam = ref(null)
let role = null

// 翻页
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const handlePageChange = (page) => {
  currentPage.value = page
  fetchTeamData(page, searchQuery.value)
}

// 处理团队点击事件
const handleTeamClick = async (team) => {
  if (['pending', 'expired'].includes(team.status)) {
    await fetchTeamConfirmStatus(team.sn)
    selectedTeam.value = team
    isStatusModalVisible.value = true
  } else {
    // 非 pending 和 expired 状态正常跳转
    router.push(`/team/detail/${team.id}`)
  }
}

const emptyImageSrc = computed(() => {
  return themeStore.currentTheme === 'dark'
    ? new URL('@/assets/image/empty_dark.png', import.meta.url).href
    : new URL('@/assets/image/empty.png', import.meta.url).href;
});

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'confirmed':
      return '已确认'
    case 'rejected':
      return '已拒绝'
    case 'pending':
      return '待确认'
    case 'expired':
      return '已过期'
    default:
      return '未知状态'
  }
}


// 获取团队确认状态
const fetchTeamConfirmStatus = async (team_sn) => {
  try {
    const response = await infoAPI.TeamConfirmStatus(team_sn)

    if (response.data.code === 200) {
      statusData.value = response.data.data
      console.log('团队状态:', response.data.data)
    } else {
      console.error('获取团队状态失败:', response.data.message)
      ElMessage.error('获取团队状态失败')
    }
  } catch (error) {
    console.error('请求失败:', error)
    ElMessage.error('无法获取团队状态')
  }
}

// 关闭弹窗
const hideStatusModal = () => {
  isStatusModalVisible.value = false
  statusData.value = {
    students: [],
    teachers: []
  }
}

// 获取头像路径
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return new URL('@/assets/image/default_avatar.png', import.meta.url).href
  return avatarPath.startsWith('http') ? avatarPath : `http://${avatarPath}`
}

// 获取团队信息
const fetchTeamData = async (page = 1, search = '') => {
  try {
    const response = search ? 
      await infoAPI.searchTeam(searchQuery.value, page) :
      await infoAPI.fetchTeamData(page)
      
    teams.value = response.data.results || []
    total.value = response.data.count
  } catch (error) {
    console.error('获取团队信息失败:', error)
  }
}

// 时间格式化函数
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const currentUserId = ref('')
const currentUserUsername = ref('')

// 判断是否是当前用户
const isCurrentUser = (user) => {
  return user.username === currentUserUsername.value
}

// 初始化当前用户信息
const initCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      currentUserId.value = user.id
      currentUserUsername.value = user.username
      role = user.role
    //   console.log(role)
    } catch (e) {
      console.error('解析localStorage中的user失败:', e)
    }
  }
}

// 更新学生状态
const updateStudentStatus = async (newStatus, student) => {
  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(
      newStatus === 'confirmed'
        ? '确定要确认加入该团队吗？'
        : '确定要拒绝加入该团队吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: newStatus === 'confirmed' ? 'success' : 'warning',
        center: true
      }
    )

    // 用户点击“确定”后才执行请求
    const response = await axios.put(
      `http://127.0.0.1:8105/api/team/confirm-student/${student.id}/`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    if (response.data.code === 200) {
      ElMessage.success(newStatus === 'confirmed' ? '已确认加入团队' : '已拒绝加入团队')
    } else {
      ElMessage.error(response.data.message || '操作失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消操作')
    } else {
      console.error('更新状态失败:', error)
      ElMessage.error('操作失败，请稍后再试。')
    }
  } finally {
    // 不论成功与否，都刷新状态
    fetchTeamConfirmStatus(selectedTeam.value.sn)
  }
}

const updateTeacherStatus = async (newStatus, teacher) => {
  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(
      newStatus === 'confirmed'
        ? '确定要确认加入该团队吗？'
        : '确定要拒绝加入该团队吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: newStatus === 'confirmed' ? 'success' : 'warning',
        center: true
      }
    )

    // 用户点击“确定”后才执行请求
    const response = await axios.put(
      `http://127.0.0.1:8105/api/team/confirm-teacher/${teacher.id}/`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    if (response.data.code === 200) {
      ElMessage.success(newStatus === 'confirmed' ? '已确认加入团队' : '已拒绝加入团队')
    } else {
      ElMessage.error(response.data.message || '操作失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消操作')
    } else {
      console.error('更新状态失败:', error)
      ElMessage.error('操作失败，请稍后再试。')
    }
  } finally {
    fetchTeamConfirmStatus(selectedTeam.value.sn)
  }
}


// 创建新团队模块

const newteamIconSrc = computed(() => {
  return themeStore.currentTheme === 'dark'
    ? new URL('@/assets/image/newteam_dark.png', import.meta.url).href
    : new URL('@/assets/image/newteam.png', import.meta.url).href;
});

const isCreateTeamModalVisible = ref(false)
const newTeam = ref({ name: '', member_ids: [], teacher_ids: [] })

// 学生相关
const studentSearchQuery = ref('')
const availableStudents = ref([])
const selectedStudents = ref([])
const filteredStudents = ref([])

// 教师相关
const teacherSearchQuery = ref('')
const availableTeachers = ref([])
const selectedTeachers = ref([])
const filteredTeachers = ref([])

// 显示/隐藏模态框
const showCreateTeamModal = () => {
  newTeam.value = { name: '', member_ids: [], teacher_ids: [] }
  fetchAvailableMembers()
  isCreateTeamModalVisible.value = true
}

const hideCreateTeamModal = () => {
  isCreateTeamModalVisible.value = false
}

// 获取所有学生和教师
const fetchAvailableMembers = async () => {
  try {
    const studentsRes = await infoAPI.getAllStudents()
    const teachersRes = await infoAPI.getAllTeachers()

    // 过滤掉当前用户自己
    const currentUser = JSON.parse(localStorage.getItem('user'));
    availableStudents.value = studentsRes.data.filter(s => s.id !== currentUser.id) || []
    availableTeachers.value = teachersRes.data || []

    filterStudents()
    filterTeachers()
  } catch (error) {
    console.error('获取成员列表失败:', error)
    ElMessage.error('无法加载成员列表')
  }
}

// 学生筛选
const filterStudents = () => {
  if (!studentSearchQuery.value.trim()) {
    filteredStudents.value = availableStudents.value
    return
  }

  const query = studentSearchQuery.value.toLowerCase()
  filteredStudents.value = availableStudents.value.filter(s => 
    s.username.toLowerCase().includes(query) || 
    s.sn.toLowerCase().includes(query)
  )
}

// 教师筛选
const filterTeachers = () => {
  if (!teacherSearchQuery.value.trim()) {
    filteredTeachers.value = availableTeachers.value
    return
  }

  const query = teacherSearchQuery.value.toLowerCase()
  filteredTeachers.value = availableTeachers.value.filter(t => 
    t.username.toLowerCase().includes(query) || 
    t.sn.toLowerCase().includes(query)
  )
}

// 切换学生选中状态
const toggleStudentSelection = (student) => {
  const index = selectedStudents.value.findIndex(s => s.id === student.id)
  if (index >= 0) {
    selectedStudents.value.splice(index, 1)
  } else {
    selectedStudents.value.push(student)
  }
}

// 判断学生是否已选中
const isStudentSelected = (student) => {
  return selectedStudents.value.some(s => s.id === student.id)
}

// 切换教师选中状态
const toggleTeacherSelection = (teacher) => {
  const index = selectedTeachers.value.findIndex(t => t.id === teacher.id)
  if (index >= 0) {
    selectedTeachers.value.splice(index, 1)
  } else {
    selectedTeachers.value.push(teacher)
  }
}

// 判断教师是否已选中
const isTeacherSelected = (teacher) => {
  return selectedTeachers.value.some(t => t.id === teacher.id)
}


const showStudentSelector = ref(false)
const showTeacherSelector = ref(false)

// 显示/隐藏选择器
const closeStudentSelector = () => {
  showStudentSelector.value = false
}

const closeTeacherSelector = () => {
  showTeacherSelector.value = false
}

// 移除成员
const removeStudent = (student) => {
  selectedStudents.value = selectedStudents.value.filter(s => s.id !== student.id)
}

const removeTeacher = (teacher) => {
  selectedTeachers.value = selectedTeachers.value.filter(t => t.id !== teacher.id)
}

// 创建新团队
const createTeam = async () => {
  try {
    // 检查团队名称是否为空
    if (!newTeam.value.name.trim()) {
      ElMessage.error('团队名称不能为空');
      return;
    }

    // 弹出确认对话框
    await ElMessageBox.confirm(
      '确定要创建该团队吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    )

    const response = await axios.post(
      'http://127.0.0.1:8105/api/team/',
      {
        name: newTeam.value.name,
        member_ids: selectedStudents.value.map(student => student.sn),
        teacher_ids: selectedTeachers.value.map(teacher => teacher.sn)
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    if (response.data.code === 200) {
      ElMessage.success('团队创建成功')
      hideCreateTeamModal()
      fetchTeamData() // 刷新团队列表
    } else {
      ElMessage.error(response.data.message || '创建团队失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消创建')
    } else {
      console.error('创建团队失败:', error)
      ElMessage.error('创建团队失败，请稍后再试。')
    }
  }
}

const searchQuery = ref('')
const isSearching = ref(false)
let searchTimeout = null

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    isSearching.value = true
    currentPage.value = 1
    fetchTeamData(1, searchQuery.value)
  }, 300)
}

onMounted(() => {
  initCurrentUser()
  fetchTeamData()
})
</script>
  
  <style scoped>
  /* 添加空状态样式 */
.empty-state {
  text-align: center;
  padding: 3rem 0;
  opacity: 0.8;
  animation: fadeIn 0.5s ease;
}

.empty-icon {
  width: 120px;
  margin: 0 auto 1.5rem;
  opacity: 0.6;
}

.empty-icon img {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 0 10px rgba(0, 242, 254, 0.3));
}

.empty-title {
  color: #00f2fe;
  font-size: 1.5rem;
  margin-bottom: 0.8rem;
  text-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
}

.empty-tip {
  color: #aaa;
  font-size: 0.95rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

  /* 基础样式 */
  .team-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.team-card {
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.8), rgba(0, 32, 53, 0.6));
  padding: 1.2rem;
  border-radius: 15px;
  border: 1px solid rgba(0, 242, 254, 0.2);
  transition: all 0.3s ease;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 242, 254, 0.1);
}

.team-name {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}

.team-info {
  font-size: 0.95rem;
  color: #ccc;
  margin-bottom: 0.3rem;
}

  .user-info-container {
    min-height: 100vh;
    background:
      radial-gradient(ellipse at bottom, #eaeaee 0%, ),
      url('@/assets/images/cyber-bg.jpg') center/cover;
    position: relative;
    overflow: hidden;
    padding: 0.8rem;
  }
  
  .dark .user-info-container {
    background:
      radial-gradient(ellipse at bottom, #eaeaee 0%, ),
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
    display: flex;
    align-items: center;
    justify-content: center;
    }
  
  .dynamic-divider {
    height: 2px;
    width: 80%;
    margin: 1.5rem auto;
    position: relative;
  }
  
  .energy-wave {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, #00f2fe 50%, transparent 100%);
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
    margin-bottom: 2rem;
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
  -webkit-mask:
    linear-gradient(#fff, #fff) content-box,
    linear-gradient(#fff, #fff);
  mask:
    linear-gradient(#fff, #fff) content-box,
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

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .stat-card {
    background: linear-gradient(145deg, rgba(0, 15, 26, 0.8), rgba(0, 32, 53, 0.6));
    padding: 1rem;
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
    height: 45px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
    background: linear-gradient(45deg, #00f2fe, #0056b3);
  }
  
  .stat-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .dark .stat-icon img {
    filter: brightness(0.8);
  }
  
  .stat-content {
    color: #fff;
  }
  
  .stat-label {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
  
  .stat-value {
    font-size: 0.9rem;
    color: #ccc;
    margin-bottom: 0.3rem;
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

  .team-card.clickable {
  cursor: pointer;
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: bold;
  background: rgba(255, 200, 0, 0.6);
  color: #fff;
  border: 1px solid rgba(255, 200, 0, 0.8);
  box-shadow: 0 0 8px rgba(255, 200, 0, 0.5);
}

.status-badge.warning {
  background: rgba(255, 200, 0, 0.6);
  border-color: rgba(255, 200, 0, 0.8);
}

.team-status-modal .modal-content,
.team-status-modal .modal-content-dark {
  max-width: 600px;
  width: 90%;
  padding: 1.5rem;
  color: #fff;
}

.members-section {
  margin-bottom: 1.5rem;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 0.5rem;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 0.6rem;
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.6), rgba(0, 32, 53, 0.5));
  border-radius: 10px;
  border: 1px solid rgba(0, 242, 254, 0.2);
}

.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-right: 1rem;
}

.member-name {
  font-size: 1rem;
  color: #fff;
  flex: 1;
}

.status-tag {
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 0.8rem;
  text-align: center;
  min-width: 60px;
}

.status-tag.confirmed {
  background: rgba(0, 242, 254, 0.2);
  border: 1px solid rgba(0, 242, 254, 0.5);
  color: #00f2fe;
}

.status-tag.pending {
  background: rgba(255, 200, 0, 0.2);
  border: 1px solid rgba(255, 200, 0, 0.5);
  color: #ffc800;
}

.team-card.non-clickable {
  pointer-events: none;
  opacity: 0.8;
  cursor: not-allowed;
}

.team-status-modal .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.team-status-modal .modal-content,
.team-status-modal .modal-content-dark {
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.8), rgba(0, 32, 53, 0.6));
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.3);
  animation: fadeInUp 0.3s ease-in-out;
  position: relative;
}

.team-status-modal .modal-content-dark {
  background: linear-gradient(145deg, rgba(10, 25, 40, 0.9), rgba(0, 10, 20, 0.7));
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.members-section {
  margin-bottom: 1.5rem;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 0.5rem;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 0.6rem;
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.6), rgba(0, 32, 53, 0.5));
  border-radius: 10px;
  border: 1px solid rgba(0, 242, 254, 0.2);
}

.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-right: 1rem;
}

.member-name {
  font-size: 1rem;
  color: #fff;
  flex: 1;
}

.status-tag {
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 0.8rem;
  text-align: center;
  min-width: 60px;
}

.status-tag.confirmed {
  background: rgba(0, 242, 254, 0.2);
  border: 1px solid rgba(0, 242, 254, 0.5);
  color: #00f2fe;
}

.status-tag.pending {
  background: rgba(255, 200, 0, 0.2);
  border: 1px solid rgba(255, 200, 0, 0.5);
  color: #ffc800;
}

.status-tag.rejected {
  background: rgba(255, 65, 50, 0.2);
  border: 1px solid rgba(255, 65, 50, 0.5);
  color: #ff4132;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  margin-left: auto; 
}

.action-buttons .cyber-button {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  border-radius: 10px;
}

.cyber-button.success {
  background: linear-gradient(45deg, rgba(0, 242, 254, 0.2), rgba(0, 86, 179, 0.2));
  border: 1px solid rgba(0, 242, 254, 0.5);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3), inset 0 0 10px rgba(0, 242, 254, 0.2);
}

.cyber-button.danger {
  background: linear-gradient(45deg, rgba(255, 65, 50, 0.2), rgba(179, 0, 85, 0.2));
  border: 1px solid rgba(255, 65, 50, 0.5);
  box-shadow: 0 0 10px rgba(255, 65, 50, 0.3), inset 0 0 10px rgba(255, 65, 50, 0.2);
}

.selectable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.selectable.selected {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
  border-color: #00f2fe;
}

.create-team-section {
  margin-bottom: 2rem;
  text-align: center;
}

.edit-team-modal .modal-content,
.edit-team-modal .modal-content-dark {
  max-width: 600px;
  width: 90%;
  padding: 2rem;
}

.form-group {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.search-box input {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 242, 254, 0.3);
  background: rgba(128, 128, 128, 0.2);
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #00f2fe;
  background: rgba(128, 128, 128, 0.3);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}

.members-grid {
  display: flex;
  gap: 1rem;
  max-height: 200px;
  margin-bottom: 1.5rem;
}

.selectable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.selectable.selected {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
  border-color: #00f2fe;
}



.cyber-button {
  position: relative;
  width: 60px;
  height: 40px; /* 调整高度 */
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: visible;
  background: transparent;
  border: 1px solid rgba(0, 242, 254, 0.3);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.cyber-button.success,
.cyber-button.danger {
  background: linear-gradient(45deg, rgba(0, 242, 254, 0.2), rgba(0, 86, 179, 0.2));
  border: 1px solid rgba(0, 242, 254, 0.5);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3), inset 0 0 10px rgba(0, 242, 254, 0.2);
}

.cyber-button.danger {
  background: linear-gradient(45deg, rgba(255, 65, 50, 0.2), rgba(179, 0, 85, 0.2));
  border: 1px solid rgba(255, 65, 50, 0.5);
  box-shadow: 0 0 10px rgba(255, 65, 50, 0.3), inset 0 0 10px rgba(255, 65, 50, 0.2);
}

.action-buttons .cyber-button {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
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

.cyber-button.warning {
  background: linear-gradient(45deg, rgba(255, 200, 0, 0.2), rgba(179, 110, 0, 0.2));
  border: 1px solid rgba(255, 200, 0, 0.5);
  box-shadow: 0 0 10px rgba(255, 200, 0, 0.3), inset 0 0 10px rgba(255, 200, 0, 0.2);
}

.cyber-button.warning:hover {
  transform: translateY(-5px) rotateX(10deg) rotateY(10deg);
  box-shadow: 0 0 20px rgba(255, 200, 0, 0.5), inset 0 0 15px rgba(255, 200, 0, 0.3);
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(0.8); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.6; }
}

.action-icon.tiny {
    margin-top:8px;
    margin-left:10px;
  width: 30px;
  height: 30px;
  object-fit: contain;
  filter: brightness(0.9);
  transition: transform 0.3s ease;
}

.cyber-button:hover .action-icon.tiny {
  transform: rotate(10deg) scale(1.1);
}

.simple-icon-only {
  background: transparent;
  border: none;
  padding: 0;
  margin-left: 0.5rem;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s ease, opacity 0.3s ease;
  vertical-align: middle;
  width:70px;
}

.simple-icon-only:hover {
  transform: scale(1.1) rotate(5deg);
}

/* 自定义提示框 */
.simple-icon-only::before {
  content: attr(data-text);
  position: absolute;
  bottom: calc(100% + 16px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: transparent;
  color: #fff;
  padding: 4px 8px;
  font-size: 0.85rem;
  border-radius: 4px;
  opacity: 0.9; /* 略微降低透明度 */
  filter: blur(0.3px); /* 添加轻微模糊 */
  font-weight: normal; /* 可选：去掉粗体增强柔和感 */
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 10;
  margin-bottom: -20px;
}

.simple-icon-only:hover::before {
  opacity: 1;
  visibility: visible;
  bottom: calc(100% + 14px);
}

.create-team-modal-container .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.create-team-modal-container .modal-content,
.create-team-modal-container .modal-content-dark {
  max-width: 500px; /* 缩小宽度 */
  width: 90%;
  padding: 1.5rem;
  /* overflow-y: auto; */
  max-height: 80vh; /* 控制最大高度 */
  color: #fff;
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.8), rgba(0, 32, 53, 0.6)); /* 暗色背景渐变 */
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.3);
  animation: fadeInUp 0.3s ease-in-out;
  position: relative;
}

.dark .create-team-modal-container .modal-content-dark {
  background: linear-gradient(145deg, rgba(10, 25, 40, 0.9), rgba(0, 10, 20, 0.7));
}

.light .create-team-modal-container .modal-content {
  background: #ffffffcc; /* 白色背景带一点透明度 */
  color: #000;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.selected-members {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  min-height: 30px;
}

.member-tag {
  background: rgba(0, 242, 254, 0.2);
  border-radius: 20px;
  padding: 0.3rem 0.8rem;
  font-size: 0.9rem;
  position: relative;
  transition: all 0.3s ease;
}

.remove-btn {
  position: absolute;
  right: -8px;
  top: -8px;
  background: #ff4c4c;
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  text-align: center;
  line-height: 18px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: transform 0.2s ease;
}

.remove-btn:hover {
  transform: scale(1.2);
}

.add-member-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, rgba(0, 242, 254, 0.2), rgba(0, 86, 179, 0.2));
  border: 1px solid rgba(0, 242, 254, 0.5);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3), inset 0 0 10px rgba(0, 242, 254, 0.2);
  color: #fff; /* 始终保持白色文字 */
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
  background: linear-gradient(45deg, rgba(0, 242, 254, 0.3), rgba(0, 86, 179, 0.3));
  border: 1px solid rgba(0, 242, 254, 0.5);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3), inset 0 0 10px rgba(0, 242, 254, 0.2);
  color: #fff; /* 始终保持白色文字 */
}

.selector-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .selector-modal .modal-content,
  .selector-modal .modal-content-dark {
    max-width: 500px;
    width: 90%;
    padding: 1.5rem;
    /* overflow-y: auto; */
    max-height: 70vh;
    color: #fff;
    background: linear-gradient(145deg, rgba(0, 15, 26, 0.8), rgba(0, 32, 53, 0.6));
    border-radius: 20px;
    box-shadow: 0 0 30px rgba(0, 242, 254, 0.3);
    animation: fadeInUp 0.3s ease-in-out;
    position: relative;
    margin-bottom: 2rem;
  }
  
  .dark .selector-modal .modal-content-dark {
    background: linear-gradient(145deg, rgba(10, 25, 40, 0.9), rgba(0, 10, 20, 0.7));
  }
  
  .selector-modal .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.selector-modal .modal-content,
.selector-modal .modal-content-dark {
  max-width: 600px;
  width: 90%;
  padding: 2rem;
  max-height: 80vh;
  color: #fff;
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.9), rgba(0, 32, 53, 0.7));
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.3);
  animation: fadeInUp 0.3s ease-in-out;
  position: relative;
}

.dark .selector-modal .modal-content-dark {
  background: linear-gradient(145deg, rgba(10, 25, 40, 0.95), rgba(0, 10, 20, 0.85));
}

.light .selector-modal .modal-content {
  background: #ffffffdd;
  color: #000;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.selector-modal .modal-content .search-box {
  margin-bottom: 1.5rem; /* 增加搜索框与上方标题的距离 */
}

.members-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

/* 美化团队名称输入框 */
.form-group input[type="text"] {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 242, 254, 0.5);
  background: rgba(0, 242, 254, 0.1);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input[type="text"]:focus {
  outline: none;
  border-color: #00f2fe;
  background: rgba(0, 242, 254, 0.2);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}

.selector-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.modal-content::after,
.modal-content-dark::after {
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
  clip-path: inset(-2px -2px -2px -2px round 20px);
  -webkit-mask:
    linear-gradient(#fff, #fff) content-box,
    linear-gradient(#fff, #fff);
  mask:
    linear-gradient(#fff, #fff) content-box,
    linear-gradient(#fff, #fff);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
}

.status-badge.expired {
  background: rgba(255, 65, 50, 0.6);
  border-color: rgba(255, 65, 50, 0.8);
}

.status-tag.expired {
  background: rgba(255, 65, 50, 0.2);
  border: 1px solid rgba(255, 65, 50, 0.5);
  color: #ff4132;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 40px;
}

.el-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.el-pagination .btn-prev,
.el-pagination .btn-next {
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.8), rgba(0, 32, 53, 0.6));
  border: 1px solid rgba(0, 242, 254, 0.2);
  border-radius: 6px;
  color: #fff;
  transition: all 0.3s ease;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-pagination .btn-prev:hover,
.el-pagination .btn-next:hover {
  color: #00f2fe;
  border-color: #00f2fe;
  transform: translateY(-2px);
}

.el-pagination .btn-prev.is-disabled,
.el-pagination .btn-next.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.el-pagination .btn-prev.is-disabled:hover,
.el-pagination .btn-next.is-disabled:hover {
  transform: translateY(0);
}

.el-pagination .el-pager {
  display: flex;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.el-pagination .el-pager li.number {
  background: linear-gradient(145deg, rgba(0, 15, 26, 0.8), rgba(0, 32, 53, 0.6));
  border: 1px solid rgba(0, 242, 254, 0.2);
  border-radius: 6px;
  color: #fff;
  transition: all 0.3s ease;
  padding: 6px 12px;
  cursor: pointer;
}

.el-pagination .el-pager li.number:hover {
  color: #00f2fe;
  border-color: #00f2fe;
  transform: translateY(-2px);
}

.el-pagination .el-pager li.number.is-active {
  background: #00f2fe;
  border-color: #00f2fe;
  color: #000;
  font-weight: bold;
}

.search-bar {
  margin-left: 37.5rem;
  position: relative;
}

.search-input {
  padding: 12px 16px;
  border: 2px solid rgba(0, 242, 254, 0.6);
  border-radius: 8px;
  font-size: 16px; /* Larger font size */
  width: 250px; /* Wider search box */
  transition: border-color 0.2s ease-in-out;
  background: transparent;
}

.search-input:focus {
  outline: none;
  border-color: #00f2fe;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}
</style>