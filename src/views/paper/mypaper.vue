<template>
    <div class="user-info-container" :class="{ 'dark': themeStore.isDark }">
        <div class="particles">
            <div v-for="i in 100" :key="i" class="particle"></div>
        </div>

        <div class="profile-header">
            <h1>我的论文</h1>
            <button v-if="role == 'student'" class="simple-icon-only" @click="showCreatePatentModal" data-text="创建新论文">
                <span class="glow"></span>
                <span class="content">
                    <img :src="newteamIconSrc" alt="创建新论文" class="action-icon tiny" />
                </span>
            </button>
        </div>
        <div class="search-bar">
            <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="搜索论文名称"
                class="search-input" />
        </div>
        <div class="dynamic-divider">
            <div class="energy-wave"></div>
            <div class="glow-line"></div>
            <div class="particle-trail"></div>
        </div>

        <div class="info-panel">
            <div class="team-list">
                <template v-if="papers.length > 0">
                    <router-link v-for="paper in papers" :key="paper.id" :to="`/paper/detail/${paper.id}`"
                        class="team-card">
                        <div class="border-effect"></div>
                        <div class="team-content">
                            <h3 class="team-name">{{ paper.title }}</h3>
                            <div class="team-info">期刊: {{ paper.journal }}</div>
                            <div class="team-info">发表日期: {{ paper.publish_date }}</div>
                            <div class="team-info">作者: {{paper.authors.map(a => a.name).join(', ')}}</div>
                        </div>
                    </router-link>
                </template>
                <div v-else class="empty-state">
                    <div class="empty-icon">
                        <img :src="emptyImageSrc" alt="空状态" />
                    </div>
                    <h3 class="empty-title">暂无论文数据</h3>
                    <p class="empty-tip">点击右上角按钮创建你的第一个论文</p>
                </div>
            </div>
        </div>

        <!-- 创建专利模态框 -->
        <Teleport to="body">
            <div v-if="isCreateModalVisible" class="create-team-modal-container">
                <div class="modal-overlay" @click.self="closeModal">
                    <div class="modal-content-dark">
                        <h2>创建新论文</h2>
                        <div class="modal-scroll-container">
                            <form @submit.prevent="submitPatent">
                                <div class="form-group">
                                    <label for="paperTitle">论文标题:</label>
                                    <input type="text" id="paperTitle" v-model="newPaper.title" required />
                                </div>
                                <div class="form-group">
    <label for="paperNumber">论文编号:</label>
    <input type="text" id="paperNumber" v-model="newPaper.number" required />
</div>
                                <div class="form-group">
                                    <label for="paperJournal">期刊名称:</label>
                                    <input type="text" id="paperJournal" v-model="newPaper.journal" required />
                                </div>

                                <div class="form-group">
                                    <label for="paperPublishDate">发表日期:</label>
                                    <input type="date" id="paperPublishDate" v-model="newPaper.publish_date" required />
                                </div>

                                <div class="form-group">
                                    <label for="paperAbstract">摘要:</label>
                                    <textarea id="paperAbstract" v-model="newPaper.abstract" required></textarea>
                                </div>

                                <div class="form-group">
                                    <label for="paperKeywords">关键词(用逗号分隔):</label>
                                    <input type="text" id="paperKeywords" v-model="newPaper.keywords" required />
                                </div>

                                <div class="form-group">
                                    <label for="paperFile">论文文件(PDF):</label>
                                    <input type="file" id="paperFile" @change="handleFileUpload" accept=".pdf"
                                        required />
                                </div>

                                <!-- 作者列表 -->
                                <div class="form-group">
                                    <label>作者:</label>
                                    <div class="selected-members">
                                        <div v-for="(author, index) in newPaper.authors" :key="index"
                                            class="member-tag">
                                            {{ author.name }}
                                            <span class="remove-btn" @click="removeAuthor(index)">×</span>
                                        </div>
                                    </div>
                                    <button class="add-member-btn" @click="addAuthor">
                                        + 添加作者
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div class="modal-actions">
                            <button type="submit" @click="submitPaper">提交</button>
                            <button type="button" @click="closeModal">取消</button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <Teleport to="body">
            <div v-if="isAuthorModalVisible" class="create-team-modal-container">
                <div class="modal-overlay" @click.self="hideInventorModal">
                    <div class="modal-content-dark">
                        <h2>添加作者</h2>
                        <div class="modal-scroll-container">
                            <div class="form-group">
                                <label for="inventorName">作者姓名:</label>
                                <input type="text" id="inventorName" v-model="newInventor.name" required />
                            </div>
                            <div class="form-group">
                                <label for="inventorPhone">作者电话:</label>
                                <input type="text" id="inventorPhone" v-model="newInventor.phone" required />
                            </div>
                            <div class="form-group">
                                <label for="inventorEmail">作者邮箱:</label>
                                <input type="text" id="inventorEmail" v-model="newInventor.email" required />
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button type="button" @click="confirmAddInventor">确认</button>
                            <button type="button" @click="hideInventorModal">取消</button>
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
            <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total"
                layout="prev, pager, next" @current-change="handlePageChange" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { paperAPI } from '@/api/paper'
import { useThemeStore } from '@/stores/theme'
// import { get_my_patent, create_patent } from '@/api/patent'
import { ElMessageBox, ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const patents = ref({})
const searchQuery = ref('')
const isCreateModalVisible = ref(false)
const newPatent = ref({
    name: '',
    number: '',
    date: '',
    patent_type: '发明专利',
    description: '',
    file: null,
    inventors: []
})
const role = ref('student') // 根据实际用户角色设置

const papers = ref([])
const newPaper = ref({
  title: '',
  number: '',
  journal: '',
  publish_date: '',
  abstract: '',
  keywords: '',
  file: null,
  authors: []
})

// 获取专利列表
const fetchPapers = async (page = 1) => {
  try {
    const response = await paperAPI.get_my_paper(page)
    papers.value = response.data.results
    total.value = response.data.count
  } catch (error) {
    console.error('获取论文列表失败:', error)
    ElMessage.error('获取论文列表失败')
  }
}

const handlePageChange = (page) => {
    currentPage.value = page
    fetchPapers(page)
}

// 显示创建专利模态框
const showCreatePatentModal = () => {
    isCreateModalVisible.value = true
}

const isAuthorModalVisible = ref(false)
// 添加作者
const addAuthor = () => {
    isAuthorModalVisible.value = true
    newInventor.value = { name: '', phone: '', email: '' }
}

const removeAuthor = (index) => {
  newPaper.value.authors.splice(index, 1)
}


// 关闭模态框
const closeModal = () => {
    isCreateModalVisible.value = false
    resetForm()
}

const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)


// 重置表单
const resetForm = () => {
    newPatent.value = {
        name: '',
        number: '',
        date: '',
        patent_type: '发明专利',
        description: '',
        file: null,
        inventors: []
    }
}

// 处理文件上传
const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
        newPaper.value.file = file
    } else {
        ElMessage.error('请上传PDF格式的文件')
        event.target.value = '' // 清空文件输入
    }
}

// 提交专利
const submitPaper = async () => {
  try {
    const formData = new FormData()
    formData.append('title', newPaper.value.title)
    formData.append('number', newPaper.value.number)
    formData.append('journal', newPaper.value.journal)
    formData.append('publish_date', newPaper.value.publish_date)
    formData.append('abstract', newPaper.value.abstract)
    formData.append('keywords', newPaper.value.keywords)
    
    if (newPaper.value.file) {
      formData.append('file', newPaper.value.file)
    }
    
    // 确保authors数组正确传递
    formData.append('authors', JSON.stringify(newPaper.value.authors))

    const response = await paperAPI.create_paper(formData)
    if (response.data.code === 200) {
      ElMessage.success('论文创建成功')
      closeModal()
      fetchPapers()
    } else {
      ElMessage.error(response.data.message || '论文创建失败')
    }
  } catch (error) {
    console.error('创建论文失败:', error)
    ElMessage.error('创建论文失败')
  }
}
const newteamIconSrc = computed(() => {
    return themeStore.currentTheme === 'dark'
        ? new URL('@/assets/image/newteam_dark.png', import.meta.url).href
        : new URL('@/assets/image/newteam.png', import.meta.url).href;
});

const isInventorModalVisible = ref(false)
const newInventor = ref({
    name: '',
    phone: '',
    email: ''
})

const showInventorModal = () => {
    isInventorModalVisible.value = true
}

const hideInventorModal = () => {
    isAuthorModalVisible.value = false
    newInventor.value = { name: '', phone: '', email: '' }
}

const confirmAddInventor = () => {
    newPaper.value.authors.push({
        name: newInventor.value.name,
        phone: newInventor.value.phone,
        email: newInventor.value.email
    })
    hideInventorModal()
}

const emptyImageSrc = computed(() => {
    return themeStore.currentTheme === 'dark'
        ? new URL('@/assets/image/empty_dark.png', import.meta.url).href
        : new URL('@/assets/image/empty.png', import.meta.url).href;
});

const addInventor = () => {
    showInventorModal()
}

onMounted(() => {
    fetchPapers()
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
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
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
    z-index: 300;
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
    height: 40px;
    /* 调整高度 */
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

.action-icon.tiny {
    margin-top: 8px;
    margin-left: 10px;
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
    width: 70px;
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
    opacity: 0.9;
    /* 略微降低透明度 */
    filter: blur(0.3px);
    /* 添加轻微模糊 */
    font-weight: normal;
    /* 可选：去掉粗体增强柔和感 */
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
    max-width: 500px;
    width: 90%;
    padding: 1.5rem;
    max-height: 80vh;
    color: #fff;
    background: linear-gradient(145deg, rgba(10, 25, 40, 0.9), rgba(0, 10, 20, 0.7));
    border-radius: 20px;
    box-shadow: 0 0 30px rgba(0, 242, 254, 0.3);
    animation: fadeInUp 0.3s ease-in-out;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
}

.dark .create-team-modal-container .modal-content-dark {
    background: linear-gradient(145deg, rgba(10, 25, 40, 0.9), rgba(0, 10, 20, 0.7));
}

.light .create-team-modal-container .modal-content {
    background: #ffffffcc;
    /* 白色背景带一点透明度 */
    color: #000;
}

.modal-scroll-container {
    overflow-y: auto;
    padding-right: 8px;
    flex: 1;
}

.inventors-scroll-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
    min-height: 30px;
}

.inventor-item {
    background: rgba(0, 242, 254, 0.2);
    border-radius: 20px;
    padding: 0.3rem 0.8rem;
    font-size: 0.9rem;
    position: relative;
    transition: all 0.3s ease;
}

.inventor-name {
    font-size: 0.95rem;
    color: #fff;
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

.remove-btn.cyber-button .action-icon {
    width: 16px;
    height: 16px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 15px;
    border-top: 1px solid rgba(0, 242, 254, 0.2);
}

/* 滚动条样式 */
.modal-scroll-container::-webkit-scrollbar,
.inventors-scroll-container::-webkit-scrollbar {
    width: 6px;
}

.modal-scroll-container::-webkit-scrollbar-track,
.inventors-scroll-container::-webkit-scrollbar-track {
    background: rgba(0, 242, 254, 0.1);
    border-radius: 3px;
}

.modal-scroll-container::-webkit-scrollbar-thumb,
.inventors-scroll-container::-webkit-scrollbar-thumb {
    background: rgba(0, 242, 254, 0.4);
    border-radius: 3px;
}

.dark .create-team-modal-container .modal-content-dark {
    background: linear-gradient(145deg, rgba(10, 25, 40, 0.9), rgba(0, 10, 20, 0.7));
}

.light .create-team-modal-container .modal-content {
    background: #ffffffcc;
    /* 白色背景带一点透明度 */
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
    color: #fff;
    /* 始终保持白色文字 */
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
    color: #fff;
    /* 始终保持白色文字 */
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
    margin-bottom: 1.5rem;
    /* 增加搜索框与上方标题的距离 */
}

.members-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group input[type="number"],
.form-group input[type="email"],
.form-group textarea,
.form-group input[type="file"] {
    width: 90%;
    padding: 0.8rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(0, 242, 254, 0.5);
    background: rgba(0, 242, 254, 0.1);
    /* 统一背景颜色 */
    color: #fff;
    font-size: 1rem;
    transition: all 0.3s ease;
    resize: vertical;
    /* 限制只能垂直拉伸 */
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
    display: flex;
    justify-content: center;
    /* 水平居中 */
    margin: 1rem auto;
    /* 上下边距1rem，左右自动居中 */
    width: 80%;
    /* 控制搜索框宽度 */
}

.search-input {
    width: 100%;
    /* 占满父容器宽度 */
    max-width: 500px;
    /* 最大宽度限制 */
    padding: 0.8rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(0, 242, 254, 0.5);
    background: rgba(0, 242, 254, 0.1);
    color: #fff;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: #00f2fe;
    box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}

.member-list.scrollable {
    max-height: 200px;
    /* 设置最大高度 */
    overflow-y: auto;
    /* 添加垂直滚动条 */
    padding-right: 8px;
    /* 为滚动条留出空间 */
}

/* 自定义滚动条样式 */
.member-list.scrollable::-webkit-scrollbar {
    width: 6px;
}

.member-list.scrollable::-webkit-scrollbar-track {
    background: rgba(0, 242, 254, 0.1);
    border-radius: 3px;
}

.member-list.scrollable::-webkit-scrollbar-thumb {
    background: rgba(0, 242, 254, 0.4);
    border-radius: 3px;
}

.member-list.scrollable::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 242, 254, 0.6);
}

input[type="text"],
input[type="date"],
input[type="file"],
select,
textarea {
    width: 100%;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid rgba(0, 242, 254, 0.3);
    background: rgba(0, 242, 254, 0.1);
    color: var(--text-color);
    transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="date"]:focus,
textarea:focus,
select:focus {
    outline: none;
    border-color: #00f2fe;
    box-shadow: 0 0 10px rgba(0, 242, 254, 0.3);
}

/* 下拉选择框样式 */
select {
    width: 97%;
    padding: 0.8rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(0, 242, 254, 0.5);
    background: #072a35;
    color: #fff;
    font-size: 1rem;
    transition: all 0.3s ease;
    appearance: none;
    background-size: 1rem;
}

select:focus {
    outline: none;
    border-color: #00f2fe;
    box-shadow: 0 0 10px rgba(0, 242, 254, 0.3);
}

/* 文本域样式 */
textarea {
    min-height: 100px;
    resize: vertical;
}

/* 文件上传样式 */
input[type="file"] {
    padding: 0.5rem;
}

/* 按钮样式 */
.add-member-btn {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    background: rgba(0, 242, 254, 0.2);
    border: 1px solid rgba(0, 242, 254, 0.5);
    color: #00f2fe;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-member-btn:hover {
    background: rgba(0, 242, 254, 0.3);
}

.inventor-modal-container .modal-overlay {
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

.inventor-modal-container .modal-content-dark {
    max-width: 400px;
    width: 90%;
    padding: 1.5rem;
    color: #fff;
    background: linear-gradient(145deg, rgba(10, 25, 40, 0.9), rgba(0, 10, 20, 0.7));
    border-radius: 20px;
    box-shadow: 0 0 30px rgba(0, 242, 254, 0.3);
    animation: fadeInUp 0.3s ease-in-out;
    position: relative;
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
</style>