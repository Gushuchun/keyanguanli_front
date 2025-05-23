<template>
  <div class="settings-container" :class="{ 'dark': themeStore.isDark }">
    <!-- 主内容区域 -->
    <div class="settings-wrapper">
      <div class="settings-header">
        <h1>系统设置</h1>
      </div>

      <div class="settings-list">
        <!-- 账户安全板块 -->
        <div :class="themeStore.currentTheme === 'dark' ? 'settings-card-dark' : 'settings-card'">
          <h2 class="card-title">
            <i class="icon-shield"></i>
            账户安全
          </h2>
          <div class="setting-item">
            <button class="primary-btn" @click="showResetPasswordModal = true">
              重置密码
            </button>
          </div>
        </div>

        <!-- 通知设置板块 -->
        <div :class="themeStore.currentTheme === 'dark' ? 'settings-card-dark' : 'settings-card'">
          <h2 class="card-title">
            <i class="icon-bell"></i>
            通知设置
          </h2>
          <div class="setting-item">
            <span>开启邮件通知</span>
            <el-switch v-model="sendEmail" @change="updateEmailNotification" />
          </div>
        </div>

        <!-- 界面设置板块 -->
        <div :class="themeStore.currentTheme === 'dark' ? 'settings-card-dark' : 'settings-card'">
          <h2 class="card-title">
            <i class="icon-bell"></i>
            界面设置
          </h2>
          <div class="setting-item">
            <span>开启光标特效</span>
            <el-switch v-model="cursor" @change="updateCursorNotification" />
          </div>
        </div>
      </div>
    </div>

    <!-- 重置密码模态框 -->
    <Teleport to="body">
      <transition name="cyber-modal">
        <div v-if="showResetPasswordModal" class="modal-overlay" @click.self="showResetPasswordModal = false">
          <div :class="themeStore.currentTheme === 'dark' ? 'modal-content-dark' : 'modal-content'" class="cyber-modal">
            <div class="modal-header">
              <h2 class="cyber-title">密码重置</h2>
            </div>
            <form @submit.prevent="resetPassword">
              <div class="form-group">
                <div class="cyber-input">
                  <input type="password" placeholder=" " v-model="oldPassword" required>
                  <label>旧密码</label>
                </div>
              </div>
              <div class="form-group">
                <div class="cyber-input">
                  <input type="password" placeholder=" " v-model="newPassword" required>
                  <label>新密码</label>
                </div>
              </div>
              <div class="modal-actions">
                <button type="submit" class="cyber-button confirm-btn">
                  <span class="btn-text">确认</span>
                  <div class="glow"></div>
                </button>
                <button type="button" class="cyber-button cancel-btn" @click="showResetPasswordModal = false">
                  <span class="btn-text">取消</span>
                  <div class="glow"></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { settingsAPI } from '@/api/settings'
import { infoAPI } from '@/api/info'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const oldPassword = ref('')
const newPassword = ref('')
const showResetPasswordModal = ref(false)
const systemNotifications = ref(true)
const sendEmail = ref(false);
const userid = ref('')
const cursor = ref(false)

// 重置密码方法
const resetPassword = async () => {
  try {
    const data = {
      old_password: oldPassword.value,
      new_password: newPassword.value
    }
    const response = await infoAPI.resetpassword(data)
    if (response.data === 200) {
      ElMessage.success('密码重置成功，请使用新密码登录')
      showResetPasswordModal.value = false
    }
    else {
      ElMessage.error(`密码重置失败，请检查旧密码是否正确`)
    }
  } catch (error) {
    ElMessage.error(`密码重置失败`)
  }
}

// 获取学生信息
const fetchSettings = async () => {
  try {
    const response = await settingsAPI.getsettings();
    if (response.data.code==200) {
      sendEmail.value = response.data.data[0].send_email;
      userid.value = response.data.data[0].id;
      cursor.value  = response.data.data[0].cursor;
    }
  } catch (error) {
    console.error('获取学生信息失败:', error);
    ElMessage.error('获取学生信息失败');
  }
};

// 更新邮件通知设置
const updateEmailNotification = async () => {
  try {
    console.log(userid.value);
    const data = { send_email: sendEmail.value };
    await settingsAPI.updatesettings(userid.value, data);
    ElMessage.success('邮件通知设置更新成功');
  } catch (error) {
    console.error('更新邮件通知设置失败:', error);
    ElMessage.error('更新邮件通知设置失败');
    // 回滚开关状态
    sendEmail.value = !sendEmail.value;
  }
};

// 更新邮件通知设置
const updateCursorNotification = async () => {
  try {
    console.log(userid.value);
    const data = { cursor: cursor.value };
    await settingsAPI.updatesettings(userid.value, data);
    ElMessage.success('光标设置更新成功');
  } catch (error) {
    console.error('光标设置失败:', error);
    ElMessage.error('光标设置失败');
    // 回滚开关状态
    cursor.value = !cursor.value;
  }
};

onMounted(() => {
  fetchSettings();
});

</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  padding: 2rem;
  transition: background-color 0.3s ease;
}


.settings-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  text-align: center;
  margin-bottom: 2rem;
}

.settings-header h1 {
  font-size: 2rem;
  transition: color 0.3s ease;
}

.dark .settings-header h1 {
  color: #fff;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-card {
  background: rgba(0, 0, 0, 0.07);
  border-radius: 15px;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.settings-card-dark {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.settings-card :hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.card-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
}

.dark .card-title {
  color: #fff;
}

.dark .input-group input {
  background-color: #404040;
  color: #fff;
  border-color: #666;
}

.primary-btn {
  background: #409eff;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease;
}

.primary-btn:hover {
  background: #66b1ff;
}

.dark .primary-btn:hover {
  background: #66b1ff;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-handle {
  width: 40px;
  height: 24px;
  background: #ddd;
  border-radius: 12px;
  position: relative;
  transition: 0.3s;
}

.toggle-handle.active {
  background: #409eff;
}

.toggle-handle::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: 0.3s;
}

.toggle-handle.active::after {
  left: 18px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content-dark,
.modal-content {
  background: white;
  padding: 3rem;
  border-radius: 8px;
  width: 25%;
  max-width: 90%;
  transition: background-color 0.3s ease;
}

.dark .modal-content {
  background: #2d2d2d;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  transition: color 0.3s ease;
}

.dark .close-btn {
  color: #fff;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.secondary-btn {
  background: #f0f2f5;
  color: #333;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.secondary-btn:hover {
  background: #d9d9d9;
}

.dark .secondary-btn {
  background: #404040;
  color: #fff;
}

.dark .secondary-btn:hover {
  background: #595959;
}

.cyber-modal {
  position: relative;
  padding: 2rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 245, 245, 0.95) 100%);
  border: 1px solid rgba(0, 242, 254, 0.3);
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.2),
    inset 0 0 15px rgba(255, 255, 255, 0.5);
}

.modal-content-dark {
  background: linear-gradient(145deg, rgba(10, 10, 20, 0.9) 0%, rgba(30, 30, 40, 0.95) 100%);
  border: 1px solid rgba(0, 242, 254, 0.2);
  box-shadow: 0 0 40px rgba(0, 242, 254, 0.3),
    inset 0 0 20px rgba(0, 242, 254, 0.1);
}

.cyber-title {
  font-family: monospace;
  text-transform: uppercase;
  letter-spacing: 2px;
  background: linear-gradient(45deg, #00f2fe, #0066ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
}

.dark .cyber-title {
  background: linear-gradient(45deg, #00f2fe, #ff003c);
}

.cyber-input {
  position: relative;
  margin: 1.5rem 0;
  width: 350px;
  z-index: 200;
}

.cyber-input input {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: #00f2fe;
  font-family: monospace;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.cyber-input label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
  transition: all 0.3s ease;
}

.cyber-input input:focus~label,
.cyber-input input:valid~label {
  top: -10px;
  left: 0.5rem;
  font-size: 0.8em;
  color: #00f2fe;
}

.cyber-border {
  /* 调整宽度以匹配输入框 */
  width: 380px;
  position: absolute;
  inset: 0;
  border-radius: 6px;
  padding: 2px;
  background: linear-gradient(45deg, #00f2fe, transparent, #00f2fe);
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  opacity: 0.5;
}

.cyber-button {
  position: relative;
  padding: 1rem 2rem;
  border: none;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.confirm-btn {
  background: linear-gradient(45deg, #00f2fe, #0066ff);
  color: white;
}

.cancel-btn {
  background: linear-gradient(45deg, #ff003c, #9900ff);
  color: white;
}

.cyber-button .glow {
  position: absolute;
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.3), transparent 70%);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cyber-button:hover .glow {
  opacity: 1;
}

.cyber-cross {
  position: relative;
  width: 24px;
  height: 24px;
}

.cyber-cross::before,
.cyber-cross::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background: #00f2fe;
  top: 50%;
  left: 0;
}

.cyber-cross::before {
  transform: rotate(45deg);
}

.cyber-cross::after {
  transform: rotate(-45deg);
}

/* 过渡动画 */
.cyber-modal-enter-active,
.cyber-modal-leave-active {
  transition: all 0.3s ease;
}

.cyber-modal-enter-from,
.cyber-modal-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(-20px);
}

.notification-settings {
  padding: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  margin-left:7px;
}
</style>