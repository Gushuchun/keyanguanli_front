<template>
  <div class="login-container" :class="{ 'dark': themeStore.isDark }">
    <h1 class="system-title">广东海洋大学科研管理平台</h1>
    <div class="login-wrapper">
      <transition :name="transitionName === 'flip-back' ? 'register-fade-out' : transitionName" mode="out-in"
        @before-enter="beforeEnter" @after-leave="afterLeave">
        <div v-if="!showRegister" :key="loginSubViewKey" class="form-container">
          <!-- 登录表单 -->
          <div v-if="!showEmailLogin && !showForgotPassword" :key="`login-${showEmailLogin}`"
            class="form-container">
            <!-- 登录表单 -->
            <div v-if="!showRegister && !showEmailLogin && !showForgotPassword" class="login-form">
              <div class="toggle-buttons-container">
                <el-button-group class="toggle-buttons">
                  <el-button :type="!showRegister ? 'primary' : 'default'" :class="{ 'active': !showRegister }"
                    @click="toggleForm(false)">
                    登录
                  </el-button>
                  <el-button :type="showRegister ? 'primary' : 'default'" :class="{ 'active': showRegister }"
                    @click="toggleForm(true)">
                    注册
                  </el-button>
                </el-button-group>
              </div>

              <!-- 删除原有的标题 -->
              <!-- <h2 class="glow-text">用户登录</h2> -->

              <div class="input-group">
                <input type="text" v-model="form.username" placeholder="账号" @keyup.enter="onSubmit" />
              </div>

              <div class="input-group">
                <input type="password" v-model="form.password" placeholder="密码" @keyup.enter="onSubmit" />
              </div>

              <button class="login-btn cyber-button primary" @click="onSubmit" :disabled="loading">
                {{ loading ? '登录中...' : '登录' }}
              </button>

              <p class="toggle-link-group">
                <span class="toggle-link" @click="toggleEmailLogin">
                  使用邮件验证码登录
                </span>
                <span class="toggle-link-separator"> | </span>
                <span class="toggle-link" @click="toggleForgotPassword">
                  忘记密码
                </span>
              </p>
            </div>
          </div>

          <!-- 邮件验证码登录表单 -->
          <div v-else-if="showEmailLogin" :key="`email-login-${showEmailLogin}`" class="login-form">
            <h2 class="glow-text">邮件验证码登录</h2>

            <div class="input-group">
              <input type="email" v-model="emailLoginForm.email" placeholder="邮箱" @keyup.enter="sendVerificationCode" />
            </div>

            <!-- 验证码输入和发送按钮容器 -->
            <div class="input-group verification-group">
              <input type="text" v-model="emailLoginForm.code" placeholder="验证码" @keyup.enter="onEmailLogin" />
              <button class="send-button" @click="sendVerificationCode" :disabled="isSendingCode || countdown > 0">
                {{ countdown > 0 ? `${countdown}s后重试` : (isSendingCode ? '发送中...' : '发送验证码') }}
              </button>
            </div>
            <div class="email-login-btn-container">
              <button class="login-btn cyber-button primary" @click="onEmailLogin" :disabled="emailLoginLoading">
                {{ emailLoginLoading ? '登录中...' : '登录' }}
              </button>
              <p class="toggle-link" @click="toggleEmailLogin">
                返回账号密码登录
              </p>
            </div>
          </div>

          <!-- 忘记密码表单 -->
          <div v-else-if="showForgotPassword" class="login-form">
            <h2 class="glow-text">忘记密码</h2>

            <div class="input-group">
              <input type="email" v-model="forgotPasswordForm.email" placeholder="邮箱"
                @keyup.enter="sendForgotPasswordCode" />
            </div>

            <div class="input-group verification-group">
              <input type="text" v-model="forgotPasswordForm.code" placeholder="验证码" @keyup.enter="submitForgotPassword" />
              <button class="send-button" @click="sendForgotPasswordCode"
                :disabled="isSendingForgotPasswordCode || forgotPasswordCountdown > 0">
                {{ forgotPasswordCountdown > 0 ? `${forgotPasswordCountdown}s后重试` : (isSendingForgotPasswordCode ? '发送中...' : '发送验证码') }}
              </button>
            </div>

            <div class="input-group">
              <input type="email" v-model="forgotPasswordForm.new_password" placeholder="新密码"
                @keyup.enter="submitForgotPassword" />
            </div>

            <button class="login-btn cyber-button primary" @click="submitForgotPassword" :disabled="resetPasswordLoading">
              {{ resetPasswordLoading ? '重置中...' : '重置密码' }}
            </button>

            <p class="toggle-link" @click="toggleForgotPassword">
              返回登录
            </p>
          </div>
        </div>

        <!-- 注册表单 -->
        <div v-else :key="`register-${showRegister}`" class="register-form">
          <div class="toggle-buttons-container"><el-button-group class="toggle-buttons">
              <el-button :type="!showRegister ? 'primary' : 'default'" :class="{ 'active': !showRegister }"
                @click="toggleForm(false)">
                登录
              </el-button>
              <el-button :type="showRegister ? 'primary' : 'default'" :class="{ 'active': showRegister }"
                @click="toggleForm(true)">
                注册
              </el-button>
            </el-button-group>
          </div>
          <!-- 删除原有的标题 -->
          <!-- <h2 class="register-title">用户注册</h2> -->
          <!-- 第一行：角色、学院 -->
          <div class="input-row">
            <div class="input-group half-width">
              <select v-model="registerForm.role">
                <option value="student">学生</option>
                <option value="teacher">教师</option>
              </select>
            </div>
            <div class="input-group half-width">
              <select v-model="registerForm.college_id" required>
                <option v-for="college in colleges" :key="college.id" :value="college.id">
                  {{ college.name }}
                </option>
                <option value="" disabled selected style="color: #ccc">请选择学院</option>
              </select>
            </div>
          </div>
          <!-- 第二行：账号、密码 -->
          <div class="input-row">
            <div class="input-group half-width">
              <input type="text" v-model="registerForm.username" placeholder="用户名" maxlength="20" />
            </div>
            <div class="input-group half-width">
              <input type="password" v-model="registerForm.password" placeholder="密码" maxlength="20" />
            </div>
          </div>
          <!-- 第三行：性别、身份证 -->
          <div class="input-row">
            <div class="input-group half-width">
              <select v-model="registerForm.gender">
                <option :value="true">男</option>
                <option :value="false">女</option>
              </select>
            </div>
            <div class="input-group half-width">
              <input type="text" v-model="registerForm.cn" placeholder="身份证号码" required maxlength="18"
                @input="validateIdCard" />
            </div>
          </div>
          <!-- 第四行：电话、邮箱 -->
          <div class="input-row">
            <div class="input-group half-width">
              <input type="text" v-model="registerForm.phone" placeholder="联系方式" required maxlength="11" />
            </div>
            <div class="input-group half-width">
              <input type="email" v-model="registerForm.email" placeholder="邮箱" required />
            </div>
          </div>
          <button class="register-btn cyber-button-register success" @click="onRegister" :disabled="registerLoading">
            {{ registerLoading ? '注册中...' : '注册' }}
          </button>
          <!-- <button class="toggle-btn cyber-button secondary" @click="toggleForm">
            返回登录
          </button> -->
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup name="login">
import { ref, onMounted, computed } from "vue";
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import { infoAPI } from '@/api/index';
import { useThemeStore } from '@/stores/theme';
import { authAPI } from "@/api/auth";
import { RSAEncrypt } from '@/utils/rsa'; // 引入 RSA 加密工具

const themeStore = useThemeStore();
const form = ref({
  username: '',
  password: ''
});
const loading = ref(false);
const router = useRouter();
const authStore = useAuthStore();
const colleges = ref([]);

// 邮件验证码登录相关状态
const showEmailLogin = ref(false);
const emailLoginForm = ref({
  email: '',
  code: ''
});
const emailLoginLoading = ref(false);
const isSendingCode = ref(false);

const countdown = ref(0);
let timer = null;

// 忘记密码相关状态
const showForgotPassword = ref(false);
const forgotPasswordForm = ref({
  email: '',
  code: '',
  new_password: ''
});
const forgotPasswordLoading = ref(false);
const isSendingForgotPasswordCode = ref(false);
const forgotPasswordCountdown = ref(0);

const loginSubViewKey = computed(() => {
  if (showForgotPassword.value) return 'forgot-password-view';
  if (showEmailLogin.value) return 'email-login-view';
  return 'standard-login-view';
});

const publicKey = ref(null); 
const sendVerificationCode = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailLoginForm.value.email)) {
    ElMessage.error('请输入有效的邮箱地址');
    return;
  }

  try {
    isSendingCode.value = true;
    const response = await authAPI.send_code({ email: emailLoginForm.value.email });

    if (response.status === 200) {
      ElMessage.success('验证码已发送，请查收邮箱');
      countdown.value = 60;
      timer = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else {
          clearInterval(timer);
        }
      }, 1000);
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    if (error.response && error.response.data) {
      const messages = Object.values(error.response.data)
        .flat()
        .join('; ');
      ElMessage.error(messages);
    } else {
      ElMessage.error('发送验证码失败，请稍后再试');
    }
  } finally {
    isSendingCode.value = false;
  }
};

// 发送忘记密码验证码
const sendForgotPasswordCode = async () => {
  if (!forgotPasswordForm.value.email) {
    ElMessage.error('请输入邮箱地址');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(forgotPasswordForm.value.email)) {
    ElMessage.error('请输入有效的邮箱地址');
    return;
  }

  try {
    isSendingForgotPasswordCode.value = true;
    const response = await authAPI.send_code({ email: forgotPasswordForm.value.email });

    if (response.status === 200) {
      ElMessage.success('验证码已发送，请查收邮箱');
      forgotPasswordCountdown.value = 60;
      let forgotPasswordTimer = setInterval(() => {
        if (forgotPasswordCountdown.value > 0) {
          forgotPasswordCountdown.value--;
        } else {
          clearInterval(forgotPasswordTimer);
        }
      }, 1000);
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    if (error.response && error.response.data) {
      const messages = Object.values(error.response.data)
        .flat()
        .join('; ');
      ElMessage.error(messages);
    } else {
      ElMessage.error('发送验证码失败，请稍后再试');
    }
  } finally {
    isSendingForgotPasswordCode.value = false;
  }
};

// 提交忘记密码表单
const submitForgotPassword = async () => {
  if (!forgotPasswordForm.value.email || !forgotPasswordForm.value.code || !forgotPasswordForm.value.new_password) {
    ElMessage.error('请输入邮箱、验证码和新密码');
    return;
  }

  try {
    forgotPasswordLoading.value = true;
    const response = await authAPI.forgot_password({
      email: forgotPasswordForm.value.email,
      code: forgotPasswordForm.value.code,
      new_password: forgotPasswordForm.value.new_password
    });

    if (response.status === 200) {
      ElMessage.success('密码重置成功，请使用新密码登录');
      toggleForgotPassword(); // 返回登录界面
    }
  } catch (error) {
    console.error('密码重置失败:', error);
    if (error.response && error.response.data) {
      const messages = Object.values(error.response.data)
        .flat()
        .join('; ');
      ElMessage.error(messages);
    } else {
      ElMessage.error('密码重置失败，请稍后再试');
    }
  } finally {
    forgotPasswordLoading.value = false;
  }
};

// 邮件验证码登录逻辑
const onEmailLogin = async () => {
  if (!emailLoginForm.value.email || !emailLoginForm.value.code) {
    ElMessage.error('请输入邮箱和验证码');
    return;
  }

  try {
    emailLoginLoading.value = true;
    const response = await authStore.login_code(emailLoginForm.value);

    if (response.code === 200) {
      ElMessage.success({
        message: `欢迎您，${response.username}！`,
        duration: 2000
      });
      router.push('/index'); // 跳转到主页 
    }
  } catch (error) {
    console.error('邮件验证码登录失败:', error);
    if (error.message) {
      // const messages = Object.values(error.response.data)
      //   .flat()
      //   .join('; ');
      ElMessage.error(error.message);
    } else {
      ElMessage.error('登录失败，请稍后再试');
    }
  } finally {
    emailLoginLoading.value = false;
  }
};


// 粒子样式生成
const particleStyle = (i) => {
  return {
    '--x': Math.random() * 100 + '%',
    '--y': Math.random() * 100 + '%',
    '--delay': Math.random() * 2 + 's',
    '--duration': Math.random() * 3 + 2 + 's',
    '--color': `hsl(${Math.random() * 360}, 80%, 60%)`,
    '--size': Math.random() * 3 + 1 + 'px'
  }
}

// 动态光流控制
const streams = ref([]);

const idCardError = ref(false);

const validateIdCard = () => {
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])\d{3}[\dXx]$/;
  idCardError.value = !idCardRegex.test(registerForm.value.cn);
};

const phoneError = ref(false);
const emailError = ref(false);

// 手机号验证
const validatePhone = () => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  phoneError.value = !phoneRegex.test(registerForm.value.phone);
};

// 邮箱验证
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailError.value = !emailRegex.test(registerForm.value.email);
};

onMounted(async () => {
  try {
    // 获取学院数据
    const collegeRes = await infoAPI.getcollegepublic()
    if (collegeRes.data.code === 200) {
      colleges.value = collegeRes.data.data;
    }
    const response = await authAPI.get_public_key();
    if (response.data) {
      publicKey.value = response.data.public_key;
    }
  } catch (error) {
    console.error('获取学院列表失败:', error);
    ElMessage.error('学院信息加载失败');
  }

  setInterval(() => {
    streams.value = Array.from({ length: 10 }, () => Math.random() * 100)
  }, 3000)
})

// 注册表单数据
const showRegister = ref(false);
const registerForm = ref({
  role: 'student',
  username: '',
  password: '',
  gender: true, // 默认值改为字符串类型
  college_id: '',
  phone: '',
  email: '', // 新增邮箱字段
  cn: '',
});

const registerLoading = ref(false);

// 切换登录/注册表单
const transitionName = ref('flip-back')

// 修改切换逻辑
// --- 修改后的切换逻辑 ---
const toggleForm = (isRegister) => {
  if (showRegister.value === isRegister) return; // 如果状态未改变，则不执行

  if (isRegister) { // 从登录切换到注册
    transitionName.value = 'flip-forward';
  } else { // 从注册切换到登录
    transitionName.value = 'flip-back'; // 或 'register-fade-out' 如果希望注册表单有特定离开动画
  }
  showRegister.value = isRegister;
  // 切换到主登录/注册界面时，重置子登录状态
  if (!isRegister) {
    showEmailLogin.value = false;
    showForgotPassword.value = false;
  }
};
const toggleEmailLogin = () => {
  if (showEmailLogin.value) { // 从邮件登录返回标准登录
    transitionName.value = 'flip-back';
  } else { // 从标准登录切换到邮件登录
    transitionName.value = 'flip-forward';
  }
  showEmailLogin.value = !showEmailLogin.value;
  if (showEmailLogin.value) {
    showForgotPassword.value = false; // 隐藏忘记密码表单
    showRegister.value = false; // 确保不在注册状态
  }
};

const toggleForgotPassword = () => {
  if (showForgotPassword.value) { // 从忘记密码返回标准登录
    transitionName.value = 'flip-back';
  } else { // 从标准登录切换到忘记密码
    transitionName.value = 'flip-forward';
  }
  showForgotPassword.value = !showForgotPassword.value;
  if (showForgotPassword.value) {
    showEmailLogin.value = false; // 隐藏邮件登录表单
    showRegister.value = false; // 确保不在注册状态
  }
};

const beforeEnter = (el) => {
  // 确保离开元素保持较高层级以显示动画
  el.style.zIndex = 2;
};

const afterLeave = (el) => {
  el.style.zIndex = 0;
}
// 登录逻辑
const onSubmit = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.error('请输入用户名和密码');
    return;
  }

  try {
    loading.value = true;
    const encryptedPassword = RSAEncrypt(form.value.password, publicKey.value); // 使用 RSA 加密密码
    console.log(encryptedPassword.length)
    const response = await authStore.login({
      username: form.value.username,
      password: encryptedPassword, // 发送加密后的密码
    });

    if (response.code === 200) {
      ElMessage.success({
        message: `欢迎您，${response.username}！`,
        duration: 2000
      });
      router.push('/index'); // 跳转到主页 
    } else {
      ElMessage.error(response.message);
    }
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
};

// 注册逻辑
const onRegister = async () => {
  // 先进行身份证验证
  validateIdCard();
  if (idCardError.value) {
    ElMessage.error('请输入有效的身份证号码');
    return;
  }

  // 手机号验证
  validatePhone();
  if (phoneError.value) {
    ElMessage.error('请输入有效的手机号');
    return;
  }

  // 邮箱验证
  validateEmail();
  if (emailError.value) {
    ElMessage.error('请输入有效的邮箱地址');
    return;
  }

  // 学院验证
  if (!registerForm.value.college_id) {
    ElMessage.error('请选择一个学院');
    return;
  }

  // 账号密码长度验证
  if (registerForm.value.username.length > 20 || registerForm.value.password.length > 20) {
    ElMessage.error('账号或密码不能超过20个字符');
    return;
  }

  // 新增：用户名长度不能小于2，密码长度不能小于6
  if (registerForm.value.username.length < 2) {
    ElMessage.error('用户名至少需要2个字符');
    return;
  }

  if (registerForm.value.password.length < 6) {
    ElMessage.error('密码至少需要6个字符');
    return;
  }

  const data = {
    email: registerForm.value.email,
    role: registerForm.value.role,
    username: registerForm.value.username,
    password: registerForm.value.password,
    gender: registerForm.value.gender,
    college_id: registerForm.value.college_id,
    phone: registerForm.value.phone
  };

  // 仅当角色为学生时添加cn字段
  if (registerForm.value.role === 'student') {
    data.cn = registerForm.value.cn;
  }

  try {
    registerLoading.value = true;
    const response = await authAPI.register(data);

    if (response.status === 200 || response.status === 201) {
      ElMessage.success('注册成功，请登录');
      toggleForm(); // 切换回登录界面
    }
  } catch (error) {
    console.error('注册失败:', error);
    if (error.response && error.response.data) {
      const messages = Object.values(error.response.data)
        .flat()
        .join('; ');
      ElMessage.error(messages);
    } else {
      ElMessage.error('注册失败，请稍后再试');
    }
  } finally {
    registerLoading.value = false;
  }
};


</script>

<style scoped>
.error-tip {
  color: #aaa;
  /* 调亮错误提示文字颜色 */
  font-size: 0.8rem;
  margin-top: 0.5rem;
  animation: shake 0.3s;
}

/* 新增长椭圆形容器样式 */
.oval-container {
  display: flex;
  border-radius: 50px;
  /* 使容器呈长椭圆形 */
  border: 1px solid #444;
  background: rgba(51, 51, 51, 0.3);
  margin-bottom: 1.5rem;
  overflow: hidden;
  position: relative;
}

.oval-container::before {
  content: '';
  position: absolute;
  top: 10%;
  bottom: 10%;
  left: 50%;
  width: 1px;
  background-color: #444;
}

.left-btn {
  border-radius: 50px 0 0 50px;
  /* 左按钮圆角 */
}

.right-btn {
  border-radius: 0 50px 50px 0;
  /* 右按钮圆角 */
}

.toggle-btn {
  flex: 1;
  margin: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 0.8rem;
}

.toggle-btn.active {
  background: rgba(40, 40, 60, 0.3);
  color: #eee;
}

/* 身份证输入框特殊样式 */
.input-group input[type="text"][v-model="id_card"] {

}

.input-group input::placeholder,
.input-group select:invalid {
  color: #dddada !important;
  /* 调亮占位符颜色 */
  opacity: 1;
}

/* 统一输入框和选择框样式 */
.input-group input,
.input-group select {
  width: 100%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid #fffefe;
  /* 调亮边框颜色 */
  background: rgba(30, 30, 30, 0.4);
  /* 进一步降低背景透明度 */
  color: #eee;
  /* 调亮文字颜色 */
  font-size: 1rem;
  transition: all 0.3s ease;

}

.input-group select option {
  background-color: rgba(34, 34, 34, 0.4);
  /* 降低选项背景透明度 */
  color: #eee;
  /* 调亮选项文字颜色 */
}

.glow-text {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, #8e8d8d, #dddcdc, #eceaea);
  /* 调亮光效背景色 */
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: glowMove 3s linear infinite;
}

@keyframes glowMove {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@keyframes glow {

  0%,
  100% {
    box-shadow: 0 0 15px #444;
  }

  50% {
    box-shadow: 0 0 25px #444;
  }
}

.toggle-link {
  text-align: center;
  margin-top: 1.5rem;
  margin-left: 0rem;
  color: #ffff;
  /* 调亮链接文字颜色 */
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.toggle-link:hover {
  color: #ffff;
  /* 调亮链接悬停颜色 */
  transform: scale(1.05);
}

.login-container {
  min-height: 100vh;
  padding: 2rem;
  transition: background-color 0.3s ease;
  background-image: url('@/assets/image/gdou_bg_1.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  background-color: rgba(20, 20, 20, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form::before,
.register-form::before {
  background: transparent;

}

@keyframes colorFlash {
  0% {
    background-position: 0% 50%;
    opacity: 0.4;
  }

  50% {
    background-position: 100% 50%;
    opacity: 0.6;
  }

  100% {
    background-position: 0% 50%;
    opacity: 0.4;
  }
}

@keyframes neonGlow {
  0% {
    filter: hue-rotate(0deg) blur(25px);
  }

  100% {
    filter: hue-rotate(360deg) blur(25px);
  }
}

/* 3D悬浮效果 */
.login-form:hover,
.register-form:hover {
  transform: perspective(1000px) rotateX(5deg) rotateY(5deg);
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  /* box-shadow: 0 0 60px rgba(40, 40, 60, 0.6), 0 0 120px rgba(40, 40, 60, 0.4);  */
}

.dark .login-container {
  background: linear-gradient(45deg, #111, #223, #111);
  /* 调亮深色模式背景色 */
}

@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.login-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  margin-right: 3rem;
}

.login-form{
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  background: transparent;
  border-radius: 20px;
  color: #eee;
  /* 调亮文字颜色 */
  /* transition: all 0.3s ease; */
  margin-bottom: 13rem;
}
.register-form {
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  background: transparent;
  border-radius: 20px;
  color: #eee;
  /* 调亮文字颜色 */
  /* transition: all 0.3s ease; */
  margin-bottom: 13rem;
  margin-top: 50px; 
  margin-left: 65px;
}

.input-row {
  display: flex;
  gap: 0.7rem;
}

.input-group.half-width {
  flex: 1;
  margin-right: 0;
  margin-bottom: 14px;
}

.input-group.half-width input,
.input-group.half-width select {
  width: 100%;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}


.input-group {
  margin-bottom: 1.5rem;
  margin-right: 1.5rem;
}

.input-group input {
  width: 100%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid #f4efef;
  /* 调亮边框颜色 */
  background: rgba(174, 173, 173, 0.3);
  /* 进一步降低背景透明度 */
  color: #eee;
  /* 调亮文字颜色 */
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group select {
  width: 108%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid #fcfafa;
  /* 调亮边框颜色 */
  background: rgba(174, 173, 173, 0.3);
  color: #eee;
  /* 调亮文字颜色 */
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #555;
  /* 调亮聚焦边框颜色 */
  background: rgba(40, 40, 40, 0.4);
  /* 进一步降低聚焦背景透明度 */
  box-shadow: 0 0 15px rgba(40, 40, 60, 0.6);
  /* 调亮光效阴影 */
}

.cyber-button {
  position: relative;
  max-width: 200px;
  width: 100%;
  padding: 0.8rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  z-index: 1;
  margin-top: 1rem;
  background: rgba(51, 51, 51, 0.3);
  border: 1px solid #444;
  color: #eee;
}

.cyber-button-register {
  margin-left: 6.5rem;
  position: relative;
  max-width: 200px;
  width: 100%;
  padding: 0.8rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  z-index: 1;
  margin-top: 1rem;
  background: rgba(51, 51, 51, 0.3);
  border: 1px solid #444;
  color: #eee;
}

.send-button {
  position: relative;
  width: 10px;
  padding: 0.8rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  z-index: 1;
  margin-top: 1rem;
  background: rgba(174, 173, 173, 0.3);
  border: 1px solid #fbfbfb;
  color: #eee;
}


.cyber-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(90deg, #333, #444, #333);
  /* 调亮光效背景色 */
  background-size: 400% auto;
  animation: flowGradient 6s ease infinite;
  opacity: 0.2;
  /* 进一步降低光效透明度 */
  z-index: -1;
}

@keyframes flowGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.login-btn {
  background: rgba(174, 173, 173, 0.3);
  border: 1px solid #fdfafa;
  box-shadow: 0 0 15px rgba(40, 40, 60, 0.4), inset 0 0 15px rgba(40, 40, 60, 0.3);
  /* color: #eee; */
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(40, 40, 60, 0.6), inset 0 0 20px rgba(40, 40, 60, 0.4);
  /* 调亮光效阴影 */
}

.register-btn {
  background: rgba(174, 173, 173, 0.3);
  /* 进一步降低按钮背景透明度 */
  border: 1px solid #fffdfd;
  /* 调亮按钮边框颜色 */
  box-shadow: 0 0 15px rgba(40, 40, 60, 0.4), inset 0 0 15px rgba(40, 40, 60, 0.3);
  /* 调亮光效阴影 */
  color: #eee;
  /* 调亮按钮文字颜色 */
}

.register-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(40, 40, 60, 0.6), inset 0 0 20px rgba(40, 40, 60, 0.4);
  /* 调亮光效阴影 */
}

.toggle-btn {
  margin-top: 1.5rem;
  background: rgba(40, 40, 60, 0.03);
  /* 进一步降低按钮背景透明度 */
  border: 1px solid #444;
  /* 调亮按钮边框颜色 */
  color: #888;
  /* 调亮按钮文字颜色 */
  box-shadow: 0 0 15px rgba(40, 40, 60, 0.4), inset 0 0 15px rgba(40, 40, 60, 0.3);
  /* 调亮光效阴影 */
}

.toggle-btn:hover {
  background: rgba(50, 50, 70, 0.08);
  /* 进一步降低按钮悬停背景透明度 */
  box-shadow: 0 0 20px rgba(40, 40, 60, 0.5), inset 0 0 20px rgba(40, 40, 60, 0.4);
  /* 调亮光效阴影 */
}

.form-container {
  position: relative;
  perspective: 1200px;
  transform-style: preserve-3d;
}

.register-fade-out-enter-active,
.register-fade-out-leave-active {
  transition: all 0.5s ease;
}

.register-fade-out-enter-from,
.register-fade-out-leave-to {
  opacity: 0;
  transform: rotateY(-90deg);
}

.flip-forward-enter-active,
.flip-forward-leave-active {
  transition: all 0.5s ease;
}

.flip-forward-enter-from,
.flip-forward-leave-to {
  opacity: 0;
  transform: rotateY(90deg);
}

.flip-back-enter-active,
.flip-back-leave-active {
  transition: all 0.5s ease;
}

.flip-back-enter-from,
.flip-back-leave-to {
  opacity: 0;
  transform: rotateY(-90deg);
}

.toggle-link-group {
  text-align: center;
  margin-top: 1.5rem;
  margin-left: 0.5rem;
}

.toggle-link-group .toggle-link {
  display: inline-block;
  margin: 0 0.5rem;
}

.verification-group {
  display: flex;
  gap: 10px;
  width: 81%;
  margin-left: 1.33rem;
}

.verification-group input {
  flex: 1;
  width: 130px;
}

.verification-group button {
  flex-shrink: 0;
  margin-top: 0;
  font-size: small;
  width: auto;
  width: 93px;
}

/* 注册页面消失动画 */
.register-fade-out-leave-active {
  animation: registerFadeOut 0.5s ease-in;
}

@keyframes registerFadeOut {
  0% {
    transform: perspective(1000px) rotateY(0deg) scale(1);
    opacity: 1;
  }

  100% {
    transform: perspective(1000px) rotateY(30deg) scale(0.9);
    opacity: 0;
  }
}

.register-title {
  text-align: center;
  /* 文字水平居中 */
  display: block;
  /* 确保元素为块级元素 */
  width: 100%;
  /* 宽度占满父容器 */
  font-size: 2rem;
}

.toggle-buttons-container {
  display: flex;
  justify-content: center;
  /* 水平居中 */
  margin-bottom: 2rem;
  /* 与下方表单保持间距 */
}

.toggle-buttons {
  display: flex;
  border: 1px solid #e6e8ec;
  border-radius: 8px;
  overflow: hidden;
  width: 80%;
  /* 增大按钮组宽度 */
  max-width: 400px;
  /* 限制最大宽度 */
}

.toggle-buttons button {
  flex: 1;
  padding: 1.2rem;
  /* 增大内边距，放大按钮 */
  border: #fffefe;
  background-color: rgba(128, 128, 128, 0.2);
  color: var(--star-color);
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1.1rem;
  /* 增大字体大小 */
}

.toggle-buttons button.active {
  background-color: rgba(15, 15, 15, 0.2);
}

.toggle-buttons button:hover {
  background-color: rgba(107, 140, 255, 0.2);
}

/* 新增样式，缩小邮件验证码输入框和按钮 */
.login-form .input-group input[type="email"],
.login-form .input-group input[type="text"].verification-code,
.login-form .cyber-button {
  width: 80%;
  /* 可根据需要调整宽度 */
  margin-left: auto;
  margin-right: auto;
  display: block;
}

.login-form .input-group.verification-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.login-form .input-group.verification-group input[type="text"] {
  flex: 2;
}

.login-form .input-group.verification-group .cyber-button {
  flex: 1;
  min-width: fit-content;
}

.email-login-btn-container {
  margin-right: 35px;
  place-items: center;
}

.input-group-forgot-password{
  width: 100%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid #333;
  /* 调亮边框颜色 */
  background: rgba(30, 30, 30, 0.4);
  /* 进一步降低背景透明度 */
  color: #eee;
  /* 调亮文字颜色 */
  font-size: 1rem;
  transition: all 0.3s ease;
}

.system-title {
  width: 1000px;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 32px;
  font-weight: bold;
  z-index: 3;
  margin-left: 20rem;
  margin-top: 5rem;
  text-shadow: 0 0 10px rgba(206, 220, 239, 0.8);
}
</style>