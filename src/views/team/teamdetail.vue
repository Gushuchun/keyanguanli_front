<template>
  <div class="user-info-container" :class="{ 'dark': themeStore.isDark }">
    <div class="particles">
      <div v-for="i in 100" :key="i" class="particle"></div>
    </div>
    <!--   
      <div class="profile-header">
        <h1>{{ teamData.team_name }}</h1>
      </div> -->

    <div class="dynamic-divider">
      <div class="energy-wave"></div>
      <div class="glow-line"></div>
      <div class="particle-trail"></div>
    </div>

    <div class="info-panel">
      <!-- 团队信息 -->
      <div class="section-title">
        团队信息
        <button v-if="isCaptain && isUserInTeam" class="inline-edit-button cyber-button primary"
          @click="showEditTeamModal" data-text="修改团队信息">
          <span class="glow"></span>
          <span class="content">
            <img :src="changeInfoIconSrc" alt="修改团队信息" class="action-icon" />
          </span>
        </button>
      </div>
      <div class="team-detail-grid">
        <div class="team-field">
          <strong>ID:</strong> {{ teamData.id }}
        </div>
        <div class="team-field">
          <strong>名称:</strong> {{ teamData.name }}
        </div>
        <div class="team-field">
          <strong>创建时间:</strong> {{ formatDate(teamData.create_time) }}
        </div>
        <div class="team-field">
          <strong>队长:</strong> {{ teamData.cap_name }}
        </div>
      </div>

      <!-- 学生成员 -->
      <div class="section-title">
        学生成员
        <button v-if="isCaptain && isUserInTeam" class="inline-edit-button cyber-button primary"
          @click="showEditStudentsModal" data-text="编辑学生成员">
          <span class="glow"></span>
          <span class="content">
            <img :src="changeInfoIconSrc" alt="编辑学生成员" class="action-icon" />
          </span>
        </button>
      </div>
      <div class="members-grid">
        <div v-for="student in teamData.students" :key="student.name" class="member-card">
          <img :src="getAvatarUrl(student.avatar)" alt="头像" class="member-avatar" />
          <div class="member-info">
            <p><strong>姓名:</strong> {{ student.name }}</p>
            <p><strong>学院:</strong> {{ student.college }}</p>
            <p><strong>联系方式:</strong> {{ student.phone }}</p>
            <p><strong>邮箱:</strong> {{ student.email }}</p>
            <p><strong>加入时间:</strong> {{ formatDate(student.join_time) }}</p>
          </div>
        </div>
      </div>

      <Teleport to="body">
        <div v-if="isEditStudentsModalVisible" class="edit-members-modal" :class="{ 'dark': themeStore.isDark }">
          <div class="modal-overlay" @click.self="hideEditStudentsModal">
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
              <h2>学生成员管理</h2>

              <!-- 成员列表容器 -->
              <div class="members-list-container">
                <div class="members-list">
                  <div v-for="student in nonCaptainStudents" :key="student.name" class="member-item">
                    <img :src="getAvatarUrl(student.avatar)" alt="头像" class="member-avatar" />
                    <span class="member-name">{{ student.name }}</span>
                    <button class="remove-button cyber-button secondary" @click="removeStudent(student)">
                      <span class="content">
                        <img :src="removememberIconSrc" alt="移除" class="action-icon" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 添加成员按钮 -->
              <div class="add-member-button">
                <button class="cyber-button primary" @click="showStudentListModal">
                  <span class="content">
                    <img :src="invitenewstudentIconSrc" alt="添加" class="action-icon" />
                  </span>
                  <span class="tooltip">邀请新学生</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="isStudentListVisible" class="student-list-modal" :class="{ 'dark': themeStore.isDark }">
          <div class="modal-overlay" @click.self="hideStudentListModal">
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
              <h2>选择要邀请的学生</h2>

              <!-- 学生搜索 -->
              <div class="search-box">
                <input type="text" v-model="searchQuery" placeholder="按姓名或学号搜索..." @input="filterStudents" />
              </div>

              <!-- 学生列表 -->
              <div class="students-grid">
                <div v-for="student in filteredStudents" :key="student.id" class="student-card"
                  @click="selectStudent(student)">
                  <img :src="getAvatarUrl(student.avatar)" alt="头像" class="student-avatar" />
                  <div class="student-info">
                    <strong>{{ student.username }}</strong>
                    <p>{{ student.college }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- 教师成员 -->
      <div class="section-title">
        教师成员
        <button v-if="isCaptain && isUserInTeam" class="inline-edit-button cyber-button primary"
          @click="showEditTeachersModal" data-text="编辑教师成员">
          <span class="glow"></span>
          <span class="content">
            <img :src="changeInfoIconSrc" alt="编辑教师成员" class="action-icon" />
          </span>
        </button>
      </div>
      <div class="members-grid">
        <div v-for="teacher in teamData.teachers" :key="teacher.name" class="member-card">
          <img :src="getAvatarUrl(teacher.avatar)" alt="头像" class="member-avatar" />
          <div class="member-info">
            <p><strong>姓名:</strong> {{ teacher.name }}</p>
            <p><strong>学院:</strong> {{ teacher.college }}</p>
            <p><strong>联系方式:</strong> {{ teacher.phone }}</p>
            <p><strong>邮箱:</strong> {{ teacher.email }}</p>
            <p><strong>加入时间:</strong> {{ formatDate(teacher.join_time) }}</p>
          </div>
        </div>
      </div>

      <!-- 竞赛历史 -->
      <div class="section-title">竞赛历史</div>
      <div class="competition-grid">
        <div v-for="com in teamData.competitions" :key="com.title" class="competition-card"
          @click="goToCompetitionDetail(com.id)" style="cursor: pointer;">
          <h3>{{ com.title }}</h3>
          <p><strong>日期:</strong> {{ com.date }}</p>
          <p><strong>描述:</strong> {{ com.description }}</p>
          <p><strong>得分:</strong> {{ com.score }}</p>
          <p><strong>获奖时间:</strong> {{ formatDate(com.award_time) }}</p>
          <p :class="{
            'award-status success': com.score && com.score !== '无' && com.score !== '未评奖',
            'award-status warning': com.score === '无' || com.score === '未评奖'
          }">
            {{ com.score && com.score !== '无' && com.score !== '未评奖' ? '已获奖' : '未评奖' }}
          </p>
        </div>
      </div>

      <div class="team-action-buttons-container">
        <div v-if="isCaptain && isUserInTeam" class="team-action-buttons">
          <button class="cyber-button danger" @click="disbandTeam" data-text="解散团队">
            <span class="glow"></span>
            <span class="content">
              <img :src="dismissIconSrc" alt="解散团队" class="action-icon" />
            </span>
          </button>
        </div>

        <div v-if="isUserInTeam" class="team-action-buttons">
          <button class="cyber-button warning" @click="leaveTeam" data-text="退出团队">
            <span class="glow"></span>
            <span class="content">
              <img :src="quitIconSrc" alt="退出团队" class="action-icon" />
            </span>
          </button>
        </div>
      </div>

      <Teleport to="body">
        <div v-if="isEditTeamModalVisible" class="edit-team-modal" :class="{ 'dark': themeStore.isDark }">
          <div class="modal-overlay" @click.self="hideEditTeamModal">
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
              <h2>修改团队信息</h2>
              <form @submit.prevent="updateTeamInfo">
                <div class="form-group">
                  <label for="teamName">团队名称:</label>
                  <input type="text" id="teamName" v-model="editTeamData.team_name" required />
                </div>
                <div class="modal-actions">
                  <button type="submit">保存</button>
                  <button type="button" @click="hideEditTeamModal">取消</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="isEditTeachersModalVisible" class="edit-members-modal" :class="{ 'dark': themeStore.isDark }">
          <div class="modal-overlay" @click.self="hideEditTeachersModal">
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
              <h2>教师成员管理</h2>

              <!-- 教师列表 -->
              <div class="members-list">
                <div v-for="teacher in nonCaptainTeachers" :key="teacher.id" class="member-item">
                  <img :src="getAvatarUrl(teacher.avatar)" alt="头像" class="member-avatar" />
                  <span class="member-name">{{ teacher.name }}</span>
                  <button class="remove-button cyber-button secondary" @click="removeTeacher(teacher)">
                    <span class="content">
                      <img :src="removememberIconSrc" alt="移除" class="action-icon" />
                    </span>
                  </button>
                </div>
              </div>

              <!-- 添加教师按钮 -->
              <div class="add-member-button">
                <button class="cyber-button primary" @click="showTeacherListModal">
                  <span class="content">
                    <img :src="invitenewstudentIconSrc" alt="添加" class="action-icon" />
                  </span>
                  <span class="tooltip">邀请新教师</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="isTeacherListVisible" class="student-list-modal" :class="{ 'dark': themeStore.isDark }">
          <div class="modal-overlay" @click.self="hideTeacherListModal">
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
              <h2>选择要邀请的教师</h2>

              <!-- 教师搜索 -->
              <div class="search-box">
                <input type="text" v-model="searchTeacherQuery" placeholder="按姓名或工号搜索..." @input="filterTeachers" />
              </div>

              <!-- 教师列表 -->
              <div class="students-grid">
                <div v-for="teacher in filteredTeachers" :key="teacher.id" class="student-card"
                  @click="selectTeacher(teacher)">
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router'
import { infoAPI } from '@/api/team'
import { ElMessageBox, ElMessage } from 'element-plus'


const themeStore = useThemeStore()
const authStore = useAuthStore()
const router = useRouter()

const route = useRoute()
const teamData = ref({})
const isEditTeamModalVisible = ref(false)
const editTeamData = ref({})

const isEditStudentsModalVisible = ref(false)

const isTeacherListVisible = ref(false)
const allTeachers = ref([])
const searchTeacherQuery = ref('')
const filteredTeachers = ref([])

// 获取所有教师并过滤掉自己
const fetchAllTeachers = async () => {
  try {
    // 获取当前登录用户信息
    const userStr = localStorage.getItem('user')
    let currentUsername = ''
    if (userStr) {
      try {
        const currentUser = JSON.parse(userStr)
        currentUsername = currentUser.username
      } catch (e) {
        console.error('解析当前用户失败:', e)
      }
    }

    // 获取所有教师
    const teachers = await infoAPI.getAllTeachers()

    // 过滤掉自己
    allTeachers.value = teachers.data
    filterTeachers()
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败，请刷新重试')
  }
}

// 过滤教师（根据搜索关键词）
const filterTeachers = () => {
  if (!searchTeacherQuery.value.trim()) {
    filteredTeachers.value = allTeachers.value
    return
  }

  const query = searchTeacherQuery.value.toLowerCase()
  filteredTeachers.value = allTeachers.value.filter(t =>
    t.username.toLowerCase().includes(query) ||
    t.sn.toLowerCase().includes(query)
  )
}

// 打开教师列表弹窗
const showTeacherListModal = () => {
  isTeacherListVisible.value = true
  fetchAllTeachers()
}

// 关闭教师列表弹窗
const hideTeacherListModal = () => {
  isTeacherListVisible.value = false
  searchTeacherQuery.value = ''
  filteredTeachers.value = []
}

// 点击教师
const selectTeacher = (teacher) => {
  sendInviteToTeacher(teacher)
}

// 发送邀请请求给教师
const sendInviteToTeacher = async (teacher) => {
  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(
      `确定要邀请教师 ${teacher.username} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    )

    const payload = {
      team_sn: teamData.value.sn,
      target_sn: teacher.sn
    }

    const response = await infoAPI.inviteNewTeacher(payload)

    if (response.data.code === 200) {
      ElMessage.success(`${teacher.username} 邀请已发送`)
      fetchTeamDetail() // 刷新数据
      hideTeacherListModal()
    } else {
      ElMessage.error(response.data.message || '邀请失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消邀请')
    } else {
      console.error('邀请新教师失败:', error)
      ElMessage.error(`邀请失败，请稍后再试。`)
    }
  }
}

const isEditTeachersModalVisible = ref(false)
const nonCaptainTeachers = computed(() => {
  return teamData.value.teachers?.filter(
    t => t.name !== teamData.value.cap_name
  ) || []
})

// 显示编辑教师弹窗
const showEditTeachersModal = () => {
  isEditTeachersModalVisible.value = true
}

// 隐藏编辑教师弹窗
const hideEditTeachersModal = () => {
  isEditTeachersModalVisible.value = false
}

// 移除教师
const removeTeacher = async (teacher) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除教师 ${teacher.name} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    )

    const payload = {
      team_sn: teamData.value.sn,
      teacher_sn: teacher.sn
    }

    const result = await infoAPI.removeTeacherFromTeam(payload)

    if (result.data.code === 200) {
      ElMessage.success(`${teacher.name} 已移除`)
      fetchTeamDetail()
    } else {
      ElMessage.error(result.data.message || `移除 ${teacher.name} 失败`)
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消移除')
    } else {
      console.error('移除教师失败:', error)
      ElMessage.error(`移除 ${teacher.name} 失败`)
    }
  }
}

const nonCaptainStudents = computed(() => {
  const userStr = localStorage.getItem('user')
  let currentUserId = ''
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      currentUserId = user.username
    } catch (e) {
      console.error('解析localStorage中的user失败:', e)
    }
  }

  // 过滤掉队长和当前用户自己
  return teamData.value.students.filter(s => s.name !== currentUserId && s.name !== teamData.value.cap_name)
})

const goToCompetitionDetail = (competitionId) => {
  router.push({
    name: 'competitionDetail',  // 假设路由名称为 CompetitionDetail
    params: { id: competitionId }
  });
};

const currentUserId = computed(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return ''
  try {
    const user = JSON.parse(userStr)
    return user.id
  } catch (e) {
    console.error('解析localStorage中的user失败:', e)
    return ''
  }
})

const disbandTeam = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要解散这个团队吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
        center: true
      }
    )

    const result = await infoAPI.dismissTeam(teamData.value.id)

    if (result.status === 204) {
      ElMessage.success('团队已解散')
      router.back() // 返回上一页或跳转至团队列表页
    } else {
      ElMessage.error(result.data.message || '解散团队失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消解散操作')
    } else {
      console.error('解散团队失败:', error)
      ElMessage.error('解散团队失败，请稍后再试。')
    }
  }
}

// 退出团队
const leaveTeam = async () => {
  await ElMessageBox.confirm(
    '确定要退出该团队吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    }
  )

  const result = await infoAPI.quitTeam(teamData.value.id)

  if (result.data.code === 200) {
    ElMessage.success('已成功退出团队')
    router.back()
  } else {
    ElMessage.error(result.data.message || '退出失败')
  }
}

const showEditStudentsModal = () => {
  isEditStudentsModalVisible.value = true
}

const hideEditStudentsModal = () => {
  isEditStudentsModalVisible.value = false
}


// 移除学生
const removeStudent = async (student) => {
  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(
      `确定要移除学生 ${student.name} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    )

    // 用户点击“确定”后才继续执行删除
    const payload = {
      team_sn: teamData.value.sn,
      student_sn: student.sn
    }

    const response = await infoAPI.removeStudentFromTeam(payload)


    if (response.data.code === 200) {
      ElMessage.success(`${student.name} 已移除`)
      fetchTeamDetail()
    } else {
      ElMessage.error(response.data.message || `移除 ${student.name} 失败`)
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消移除')
    } else {
      console.error('移除学生失败:', error)
      ElMessage.error(`移除 ${student.name} 失败`)
    }
  }
}


const dismissIconSrc = computed(() => {
  return themeStore.currentTheme === 'dark'
    ? new URL('@/assets/image/dismiss_team_dark.png', import.meta.url).href
    : new URL('@/assets/image/dismiss_team.png', import.meta.url).href
})

const quitIconSrc = computed(() => {
  return themeStore.currentTheme === 'dark'
    ? new URL('@/assets/image/quit_team_dark.png', import.meta.url).href
    : new URL('@/assets/image/quit_team.png', import.meta.url).href
})

// 当前用户是否为队长
const isCaptain = computed(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return false
  try {
    const user = JSON.parse(userStr)
    return user.sn === teamData.value.cap
  } catch (e) {
    console.error('解析localStorage中的user失败:', e)
    return false
  }
})

// 获取团队详情
const fetchTeamDetail = async () => {
  try {
    const response = await infoAPI.getTeamDetail(route.params.id)
    teamData.value = response.data
  } catch (error) {
    console.error('获取团队详情失败:', error)
  }
}

// 头像处理函数
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return new URL('@/assets/image/default_avatar.png', import.meta.url).href
  return avatarPath.startsWith('http') ? avatarPath : `http://${avatarPath}`
}

// 时间格式化函数
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
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
// 显示模态框
const showEditTeamModal = () => {
  editTeamData.value = {
    team_id: teamData.value.id,
    team_name: teamData.value.name,
    cap: teamData.value.cap,
    create_time: teamData.value.create_time
  }
  isEditTeamModalVisible.value = true
}

// 隐藏模态框
const hideEditTeamModal = () => {
  isEditTeamModalVisible.value = false
}

// 提交修改
const updateTeamInfo = async () => {
  try {
    const payload = {
      name: editTeamData.value.team_name // 注意：字段名从 team_name 改为 name
    }

    await infoAPI.updateTeamName(teamData.value.id, payload)

    ElMessage.success('团队名称更新成功！')
    fetchTeamDetail()
    hideEditTeamModal()
  } catch (error) {
    console.error('更新团队名称失败:', error)
    ElMessage.error('更新团队名称失败，请稍后再试。')
  }
}

const isStudentListVisible = ref(false)
const allStudents = ref([])
const searchQuery = ref('')
const filteredStudents = ref([])
const selectedStudent = ref(null)

// 获取所有学生
const fetchAllStudents = async () => {
  try {
    // 获取当前登录用户信息
    const userStr = localStorage.getItem('user')
    let currentUsername = ''
    if (userStr) {
      try {
        const currentUser = JSON.parse(userStr)
        currentUsername = currentUser.username
      } catch (e) {
        console.error('解析当前用户失败:', e)
      }
    }

    // 获取所有学生
    let response = await infoAPI.getAllStudents()
    let students = response.data || []

    // 过滤掉和当前用户 username 相同的学生
    allStudents.value = students.filter(s => s.username !== currentUsername)

    filterStudents() // 执行搜索过滤
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败，请刷新重试')
  }
}

// 过滤学生（根据搜索关键词）
const filterStudents = () => {
  if (!searchQuery.value.trim()) {
    filteredStudents.value = allStudents.value
    return
  }

  const query = searchQuery.value.toLowerCase()
  filteredStudents.value = allStudents.value.filter(s =>
    s.username.toLowerCase().includes(query) ||
    s.sn.toLowerCase().includes(query)
  )
}

// 打开学生列表弹窗
const showStudentListModal = () => {
  isStudentListVisible.value = true
  fetchAllStudents()
}

// 关闭学生列表弹窗
const hideStudentListModal = () => {
  isStudentListVisible.value = false
  searchQuery.value = ''
  filteredStudents.value = []
}

// 点击学生
const selectStudent = (student) => {
  selectedStudent.value = student
  sendInvite(student)
}

// 发送邀请请求
const sendInvite = async (student) => {
  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(
      `确定要邀请学生 ${student.username} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    )

    const payload = {
      team_sn: teamData.value.sn,
      target_sn: student.sn
    }

    const response = await infoAPI.inviteNewStudent(payload)

    if (response.data.code === 200) {
      ElMessage.success(`${student.username} 邀请已发送`)
      fetchTeamDetail() // 刷新团队信息
      hideStudentListModal()
    } else {
      ElMessage.error(response.data.message || '邀请失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消邀请')
    } else {
      console.error('邀请新学生失败:', error)
      ElMessage.error(`邀请失败，请稍后再试。`)
    }
  }
}

// 计算属性，判断用户是否在团队中
const isUserInTeam = computed(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return false
  try {
    const user = JSON.parse(userStr)
    const studentInTeam = teamData.value.students.some(s => s.sn === user.sn)
    const teacherInTeam = teamData.value.teachers.some(t => t.sn === user.sn)
    return studentInTeam || teacherInTeam
  } catch (e) {
    console.error('解析 localStorage 中的 user 失败:', e)
    return false
  }
})

onMounted(() => {
  fetchTeamDetail()
})
</script>

<style scoped>
.user-info-container {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at bottom, #eaeaee 0%, );
  position: relative;
  overflow: hidden;
  padding: 0.8rem;
}

.dark .user-info-container {
  background:
    radial-gradient(ellipse at bottom, #eaeaee 0%, );
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

  0%,
  100% {
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
  opacity: 1;
  /* 始终显示 */
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
  background: linear-gradient(90deg,
      transparent 25%,
      #00f2fe,
      #66f9ff,
      #aaf8ff,
      #7dfaff,
      transparent 75%);
  background-size: 200% 200%;
  animation: borderLineMove 4s linear infinite;
  pointer-events: none;
  z-index: 2;
  border-radius: 20px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  clip-path: inset(-2px -2px -2px -2px round 20px);
  /* 精确贴合圆角 */
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
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input {
  width: 95%;
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
  padding: 0; /* 移除内边距，由内部元素控制 */
  display: flex;
  flex-direction: column;
  max-height: 60vh; /* 固定高度 */
  overflow: hidden; /* 隐藏溢出内容 */
}

.edit-members-modal h2 {
  position: sticky;
  top: 0;
  background: inherit;
  padding: 1.5rem 1.5rem 1rem;
  z-index: 10; /* 确保标题在最上层 */
  margin: 0;
  border-bottom: 1px solid rgba(0, 242, 254, 0.2);
  text-align: center;
  backdrop-filter: blur(5px); /* 添加模糊效果增强可读性 */
}

.members-list-container {
  flex: 1;
  overflow-y: auto; /* 内容可滚动 */
  padding: 0 1.5rem 1.5rem; /* 添加内边距 */
  margin-top: -1rem; /* 抵消标题的底部内边距 */
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
  margin-top: 1rem;
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
  margin-bottom: 1.5rem;
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
  z-index: 3000;
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
  gap: 2rem;
  /* 控制按钮之间的间距 */
  margin-top: 3rem;
}
</style>