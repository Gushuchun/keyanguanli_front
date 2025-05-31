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
      <!-- 论文信息 -->
      <div class="section-title">
        论文信息
        <button class="inline-edit-button cyber-button primary" @click="isEditModalVisible = true" data-text="修改论文信息">
          <span class="glow"></span>
          <span class="content">
            <img :src="changeInfoIconSrc" alt="修改论文信息" class="action-icon" />
          </span>
        </button>
      </div>
      <div class="team-detail-grid">
        <div class="team-field">
          <strong>论文标题:</strong> {{ paper.title }}
        </div>
        <div class="team-field">
          <strong>论文编号:</strong> {{ paper.number }}
        </div>
        <div class="team-field">
          <strong>期刊:</strong> {{ paper.journal }}
        </div>
        <div class="team-field">
          <strong>发表日期:</strong> {{ paper.publish_date }}
        </div>
        <div class="team-field">
          <strong>文件:</strong>
          <a :href="getFullFileUrl(paper.file)" target="_blank" rel="noopener noreferrer" v-if="paper.file">查看文件</a>
          <span v-else>无文件</span>
        </div>
        <div class="team-field">
          <strong>关键词:</strong> {{ paper.keywords }}
        </div>
        <div class="team-field description-field">
          <strong>摘要:</strong> {{ paper.abstract }}
        </div>
      </div>


      <div class="section-title">
        作者
        <button class="inline-edit-button cyber-button primary" @click="showEditAuthorsModal" data-text="编辑作者">
          <span class="glow"></span>
          <span class="content">
            <img :src="changeInfoIconSrc" alt="编辑作者" class="action-icon" />
          </span>
        </button>
      </div>
      <div class="members-grid">
        <div v-for="author in paper.authors" :key="author.id" class="member-card">
          <div class="member-info">
            <p><strong>姓名:</strong> {{ author.name }}</p>
            <p><strong>联系方式:</strong> {{ author.phone }}</p>
            <p><strong>邮箱:</strong> {{ author.email }}</p>
          </div>
        </div>
      </div>


      <Teleport to="body">
        <div v-if="isEditAuthorsModalVisible" class="edit-members-modal" :class="{ 'dark': themeStore.isDark }">
          <div class="modal-overlay" @click.self="hideEditAuthorsModal">
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
              <h2>作者管理</h2>
              <div class="members-list-container">
                <div class="members-list">
                  <div v-for="author in paper.authors" :key="author.id" class="member-item">
                    <span class="member-name">{{ author.name }}</span>
                    <div class="member-actions">
                      <button class="remove-button cyber-button secondary" @click="showEditAuthorModal(author)">
                        <span class="content">
                          <img :src="editIconSrc" alt="编辑" class="action-icon" />
                        </span>
                      </button>
                      <button class="remove-button cyber-button secondary" @click="deleteAuthor(author)">
                        <span class="content">
                          <img :src="removememberIconSrc" alt="移除" class="action-icon" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="add-member-button">
                <button class="cyber-button primary" @click="isAuthorModalVisible = true">
                  <span class="content">
                    <img :src="invitenewstudentIconSrc" alt="添加" class="action-icon" />
                  </span>
                  <span class="tooltip">添加新作者</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="isEditAuthorModalVisible" class="edit-team-modal" :class="{ 'dark': themeStore.isDark }">
          <div class="modal-overlay" @click.self="hideEditAuthorModal">
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
              <h2>编辑作者</h2>
              <form @submit.prevent="updateAuthor">
                <div class="form-group">
                  <label for="authorName">姓名:</label>
                  <input type="text" id="authorName" v-model="editAuthorData.name" required />
                </div>
                <div class="form-group">
                  <label for="authorPhone">电话:</label>
                  <input type="text" id="authorPhone" v-model="editAuthorData.phone" required />
                </div>
                <div class="form-group">
                  <label for="authorEmail">邮箱:</label>
                  <input type="email" id="authorEmail" v-model="editAuthorData.email" required />
                </div>
                <div class="modal-actions">
                  <button type="submit">保存</button>
                  <button type="button" @click="hideEditAuthorModal">取消</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Teleport>


      <!-- 编辑专利模态框 -->
      <Teleport to="body">
        <div v-if="isEditModalVisible" class="edit-team-modal" :class="{ 'dark': themeStore.isDark }">
          <div class="modal-overlay" @click.self="isEditModalVisible = false">
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
              <h2>编辑论文信息</h2>
              <form @submit.prevent="updatePaper">
                <div class="form-group">
                  <label>论文标题:</label>
                  <input type="text" v-model="editPaperData.title" required />
                </div>
                <div class="form-group">
                  <label>论文编号:</label>
                  <input type="text" v-model="editPaperData.number" required />
                </div>
                <div class="form-group">
                  <label>期刊:</label>
                  <input type="text" v-model="editPaperData.journal" required />
                </div>
                <div class="form-group">
                  <label>发表日期:</label>
                  <input type="date" v-model="editPaperData.publish_date" required />
                </div>
                <div class="form-group">
                  <label>摘要:</label>
                  <textarea v-model="editPaperData.abstract" required class="form-input"></textarea>
                </div>
                <div class="form-group">
                  <label>关键词:</label>
                  <input type="text" v-model="editPaperData.keywords" required />
                </div>
                <div class="form-group">
                  <label>论文文件:</label>
                  <input type="file" @change="handleFileChange" accept=".pdf,.doc,.docx" />
                  <small v-if="editPaperData.file">当前文件: {{ editPaperData.file.name || editPaperData.file }}</small>
                </div>
                <div class="modal-actions">
                  <button type="submit">保存</button>
                  <button type="button" @click="isEditModalVisible = false">取消</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="isAuthorModalVisible" class="edit-team-modal" :class="{ 'dark': themeStore.isDark }">
          <div class="modal-overlay" @click.self="isAuthorModalVisible = false">
            <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'">
              <h2>添加作者</h2>
              <form @submit.prevent="addAuthor">
                <div class="form-group">
                  <label>姓名:</label>
                  <input type="text" v-model="newAuthor.name" required />
                </div>
                <div class="form-group">
                  <label>电话:</label>
                  <input type="text" v-model="newAuthor.phone" required />
                </div>
                <div class="form-group">
                  <label>邮箱:</label>
                  <input type="email" v-model="newAuthor.email" required />
                </div>
                <div class="modal-actions">
                  <button type="submit">添加</button>
                  <button type="button" @click="isAuthorModalVisible = false">取消</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Teleport>

      <div class="background-elements">
        <div class="cyber-circle"></div>
        <div class="hexagon-pattern"></div>
      </div>

      <div class="team-action-buttons-container">
        <div class="team-action-buttons">
          <button class="cyber-button danger" @click="deletePaper" data-text="删除论文">
            <span class="glow"></span>
            <span class="content">
              <img :src="dismissIconSrc" alt="删除论文" class="action-icon" />
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { paperAPI } from '@/api/paper'
import { useThemeStore } from '@/stores/theme'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const paper = ref({
  id: null,
  sn: '',
  number: '',
  title: '',
  journal: '',
  publish_date: '',
  abstract: '',
  keywords: '',
  file: '',
  applicant_name: '',
  applicant_email: '',
  applicant_sn: '',
  authors: []
})

const loading = ref(false)
const isEditModalVisible = ref(false)
const editPaperData = ref({})
const isAuthorModalVisible = ref(false)
const newAuthor = ref({ name: '', phone: '', email: '' })
const editApplicantData = ref({ name: '', email: '' })
const isEditAuthorsModalVisible = ref(false)
const isEditAuthorModalVisible = ref(false)
const editAuthorData = ref({})


// 获取论文详情
const fetchPaperDetail = async () => {
  try {
    loading.value = true
    const response = await paperAPI.get_paper_detail(route.params.id)
    paper.value = response.data
    editPaperData.value = { ...response.data }
    editApplicantData.value = {
      name: response.data.applicant_name,
      email: response.data.applicant_email
    }
  } catch (error) {
    console.error('获取论文详情失败:', error)
    ElMessage.error('获取论文详情失败')
  } finally {
    loading.value = false
  }
}


// 更新论文信息
const updatePaper = async () => {
  try {
    const formData = new FormData()
    formData.append('title', editPaperData.value.title)
    formData.append('number', editPaperData.value.number)
    formData.append('journal', editPaperData.value.journal)
    formData.append('publish_date', editPaperData.value.publish_date)
    formData.append('abstract', editPaperData.value.abstract)
    formData.append('keywords', editPaperData.value.keywords)

    // 如果有新文件则添加
    if (editPaperData.value.file instanceof File) {
      formData.append('file', editPaperData.value.file)
    }

    response = await paperAPI.update_paper(paper.value.id, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    if (response.status == 200) {
      ElMessage.success('论文信息更新成功')
      isEditModalVisible.value = false
    } else {
      // console.log(response.data.message)
      ElMessage.error('论文信息更新失败')
    }

    fetchPaperDetail()
  } catch (error) {
    console.error('更新论文信息失败:', error)
    ElMessage.error('更新论文信息失败')
  }
}


// 删除论文
const deletePaper = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这篇论文吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
        center: true
      }
    )

    await paperAPI.delete_paper(paper.value.id)
    ElMessage.success('论文已删除')
    router.back()
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消删除操作')
    } else {
      console.error('删除论文失败:', error)
      ElMessage.error('删除论文失败，请稍后再试。')
    }
  }
}

// 添加作者
const addAuthor = async () => {
  try {
    const data = {
      ...newAuthor.value
    }
    await paperAPI.create_paper_inventors(paper.value.id, data)
    ElMessage.success('作者添加成功')
    fetchPaperDetail()
    isAuthorModalVisible.value = false
    newAuthor.value = { name: '', phone: '', email: '' }
  } catch (error) {
    console.error('添加作者失败:', error)
    ElMessage.error('添加作者失败')
  }
}


// 删除作者
const deleteAuthor = async (author) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除作者 ${author.name} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    )
    await paperAPI.delete_paper_inventors(paper.value.id, { data: { id: author.id } })
    ElMessage.success('作者删除成功')
    fetchPaperDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除作者失败:', error)
      ElMessage.error('删除作者失败')
    }
  }
}

const changeInfoIconSrc = computed(() => {
  return themeStore.currentTheme === 'dark'
    ? new URL('@/assets/image/changeinfo_dark.png', import.meta.url).href
    : new URL('@/assets/image/changeinfo.png', import.meta.url).href;
});

const getFullFileUrl = (filePath) => {
  if (!filePath) return ''
  // 如果已经是完整URL则直接返回
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  // 否则添加http://前缀
  return `http://${filePath}`
}

// 显示/隐藏作者管理弹窗
const showEditAuthorsModal = () => {
  isEditAuthorsModalVisible.value = true
}
const hideEditAuthorsModal = () => {
  isEditAuthorsModalVisible.value = false
}

// 显示/隐藏编辑作者弹窗
const showEditAuthorModal = (author) => {
  editAuthorData.value = { ...author }
  isEditAuthorModalVisible.value = true
}
const hideEditAuthorModal = () => {
  isEditAuthorModalVisible.value = false
}

// 更新作者信息
const updateAuthor = async () => {
  try {
    const payload = {
      id: editAuthorData.value.id,
      name: editAuthorData.value.name,
      phone: editAuthorData.value.phone,
      email: editAuthorData.value.email
    }
    const response = await paperAPI.update_paper_inventors(paper.value.id, payload)
    if (response.data.code == 200) {
      ElMessage.success('作者信息更新成功')
    } else {
      console.log('更新作者信息失败:', response.data.message)
      ElMessage.error('更新作者信息失败')
    }
    fetchPaperDetail()
    hideEditAuthorModal()
  } catch (error) {
    console.error('更新作者失败:', error)
    ElMessage.error('更新作者失败')
  }
}


// 添加编辑图标路径
const editIconSrc = computed(() => {
  // return themeStore.currentTheme === 'dark'
  //  ? new URL('@/assets/image/update_inventor_dark.png', import.meta.url).href
  //   : new URL('@/assets/image/update_inventor.png', import.meta.url).href;
  return new URL('@/assets/image/update_inventor_dark.png', import.meta.url).href
})

const removememberIconSrc = computed(() => {
  // return themeStore.currentTheme === 'dark'
  //   ? new URL('@/assets/image/remove_student_dark.png', import.meta.url).href
  //   : new URL('@/assets/image/remove_student.png', import.meta.url).href;
  return new URL('@/assets/image/remove_student_dark.png', import.meta.url).href
});

const invitenewstudentIconSrc = computed(() => {
  return themeStore.currentTheme === 'dark'
    ? new URL('@/assets/image/team_invite_student_dark.png', import.meta.url).href
    : new URL('@/assets/image/team_invite_student.png', import.meta.url).href;
});


const dismissIconSrc = computed(() => {
  return themeStore.currentTheme === 'dark'
    ? new URL('@/assets/image/dismiss_team_dark.png', import.meta.url).href
    : new URL('@/assets/image/dismiss_team.png', import.meta.url).href
})

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    editPaperData.value.file = file
  }
}



onMounted(() => {
  fetchPaperDetail()
})
</script>

<style scoped>
.member-actions {
  display: flex;
  /* gap: 1px; */
}

.edit-button {
  background: linear-gradient(45deg, rgba(0, 200, 254, 0.2), rgba(0, 86, 179, 0.2));
  border: 1px solid rgba(0, 200, 254, 0.5);
}

.edit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 10px rgba(0, 200, 254, 0.3);
}

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
  z-index: 300;
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

.modal-content,
.modal-content-dark {
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border-radius: 20px;
  width: 400px;
  max-width: 90%;
  max-height: 80vh;
  /* 限制最大高度 */
  overflow-y: auto;
  /* 添加垂直滚动 */
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.3);
  position: relative;
  animation: fadeIn 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
}

.modal-content h2,
.modal-content-dark h2 {
  text-align: center;
  margin-bottom: 1rem;
  position: sticky;
  top: 0;
  background: inherit;
  padding: 0.5rem 0;
  z-index: 2;
}

.modal-content form,
.modal-content-dark form {
  flex: 1;
  overflow-y: auto;
  /* padding-top: 0.5rem; */
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
  padding: 1rem;
  display: flex;
  flex-direction: column;
  max-height: 60vh;
}

.edit-members-modal h2 {
  position: sticky;
  top: 0;
  background: inherit;
  padding: 1rem 0;
  z-index: 2;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 242, 254, 0.2);
}

.members-list-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 0.5rem; /* 减小底部间距 */
  max-height: calc(60vh - 150px); /* 限制列表最大高度 */
  z-index: 300;
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
  gap: 2rem;
  /* 控制按钮之间的间距 */
  margin-top: 3rem;
}

input[type="text"],
input[type="date"],
input[type="email"],
input[type="file"],
select,
textarea {
  width: 90%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 242, 254, 0.3);
  background: #c7c3c3;
  /* 灰白色背景 */
  color: #333;
  /* 深色文字 */
  transition: none;
  resize: vertical;
}

select {
  width: 96.5%;
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  background-size: 1rem;
}

select:focus {
  outline: none;
  border-color: #00f2fe;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}

.form-group textarea {
  width: 90%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 242, 254, 0.3);
  background: #c7c3c3;
  /* 与其他输入框相同的灰白色背景 */
  color: #333;
  /* 深色文字 */
  transition: none;
  resize: vertical;
  min-height: 100px;
  /* 设置最小高度 */
}

/* 白天模式下的样式 */
.modal-content .form-group textarea {
  background: #c7c3c3 !important;
  color: #333 !important;
}

/* 夜间模式下的样式 */
.modal-content-dark .form-group textarea {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

.description-field {
  grid-column: 1 / -1;
  margin-bottom: 0.5rem;
}

</style>