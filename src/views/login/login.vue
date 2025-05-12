<template>
  <div class="login-container" :class="{ 'dark': themeStore.isDark }">
    <div class="particles">
      <div 
        v-for="i in 200" 
        :key="i" 
        class="particle"
        :style="particleStyle(i)"
      ></div>
      
      <!-- 横向光流 -->
      <div class="light-streams">
        <div 
          class="stream" 
          v-for="n in 10" 
          :key="'stream'+n"
          :style="{ left: streams[n] + '%' }"
        ></div>
      </div>
      
      <!-- 扫描线 -->
      <div class="scanline"></div>
    </div>
    <div class="login-wrapper">
      <transition 
      :name="transitionName"
      mode="out-in"
      @before-enter="beforeEnter"
      @after-leave="afterLeave"
    >
      <div 
        v-if="!showRegister" 
        key="login"
        class="form-container"
      >
      <!-- 登录表单 -->
      <div v-if="!showRegister" class="login-form">
        <h2 class="glow-text">用户登录</h2>
        
        <div class="input-group">
          <input 
            type="text" 
            v-model="form.username"
            placeholder="账号"
            @keyup.enter="onSubmit"
          />
        </div>
        
        <div class="input-group">
          <input 
            type="password" 
            v-model="form.password"
            placeholder="密码"
            @keyup.enter="onSubmit"
          />
        </div>

        <button 
          class="login-btn cyber-button primary"
          @click="onSubmit"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <p class="toggle-link" @click="toggleForm">
          尚未注册？
        </p>
      </div>
    </div>

      <!-- 注册表单 -->
      <div v-else class="register-form">
        <h2>用户注册</h2>

        <div class="input-group">
          <select v-model="registerForm.role">
            <option value="student">学生</option>
            <option value="teacher">教师</option>
          </select>
        </div>

        <div class="input-group">
          <input 
            type="text" 
            v-model="registerForm.username"
            placeholder="用户名"
          />
        </div>

        <div class="input-group">
          <input 
            type="password" 
            v-model="registerForm.password"
            placeholder="密码"
          />
        </div>

        <div class="input-group">
          <select v-model="registerForm.gender">
            <option :value="true">男</option>
            <option :value="false">女</option>
          </select>
        </div>

        <!-- 学院下拉选择 -->
        <div class="input-group">
          <select 
            v-model="registerForm.college_id"
            required
          >
            <option 
              v-for="college in colleges" 
              :key="college.id" 
              :value="college.id"
            >
              {{ college.name }}
            </option>
            <option value="" disabled selected style="color: #ccc">请选择学院</option>
          </select>
        </div>

        <div class="input-group">
          <input 
            type="text" 
            v-model="registerForm.cn"
            placeholder="身份证号码"
            required
            maxlength="18"
            @input="validateIdCard"
          />
          <p v-if="idCardError" class="error-tip">请输入有效的身份证号码</p>
        </div>

        <div class="input-group">
          <input 
            type="text" 
            v-model="registerForm.phone"
            placeholder="联系方式"
          />
        </div>

        <div class="input-group">
          <input 
            type="email" 
            v-model="registerForm.email"
            placeholder="邮箱"
            required
          />
        </div>


        <button 
          class="register-btn cyber-button success"
          @click="onRegister"
          :disabled="registerLoading"
        >
          {{ registerLoading ? '注册中...' : '注册' }}
        </button>

        <button 
          class="toggle-btn cyber-button secondary"
          @click="toggleForm"
        >
          返回登录
        </button>
      </div>
    </transition>
    </div>
  </div>
</template>

<script setup name="login">
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
const form = ref({
  username: '',
  password: ''
});
const loading = ref(false);
const router = useRouter();
const authStore = useAuthStore();
const colleges = ref([]);

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


onMounted(async () => {
  try {
    // 获取学院数据
    const collegeRes = await axios.get('http://127.0.0.1:8105/api/college/public/');
    if (collegeRes.data.code === 200) {
      colleges.value = collegeRes.data.data;
    }
  } catch (error) {
    console.error('获取学院列表失败:', error);
    ElMessage.error('学院信息加载失败');
  }

  setInterval(() => {
    streams.value = Array.from({length: 10}, () => Math.random() * 100)
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
  cn:  '',
});

const registerLoading = ref(false);

// 切换登录/注册表单
const transitionName = ref('flip-back')

const toggleForm = () => {
  transitionName.value = showRegister.value ? 'flip-back' : 'flip-forward'
  showRegister.value = !showRegister.value
}

// 动画生命周期处理
const beforeEnter = (el) => {
  el.style.zIndex = showRegister.value ? 1 : 2
}

const afterLeave = (el) => {
  el.style.zIndex = 0
}
// 登录逻辑
const onSubmit = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.error('请输入用户名和密码');
    return;
  }

  try {
    loading.value = true;
    const response = await authStore.login(form.value);

    if (response && response.token) {
      ElMessage.success(`欢迎您，${response.username}！`);
      router.push('/index'); // 跳转到主页
    } else {
      ElMessage.error(response.message || '登录失败，请稍后再试');
    }
  } catch (error) {
    ElMessage.error('登录失败，请稍后再试');
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

   // 邮箱格式验证
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(registerForm.value.email)) {
    ElMessage.error('请输入有效的邮箱地址');
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
    const response = await axios.post(
      'http://127.0.0.1:8105/api/user/register/',
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

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
  color: #ff4d4f;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  animation: shake 0.3s;
}

/* 身份证输入框特殊样式 */
.input-group input[type="text"][v-model="id_card"] {
  letter-spacing: 0.1em;
  font-family: monospace;
}

.input-group input::placeholder,
.input-group select:invalid {
  color: #ccc !important;
  opacity: 1;
}
/* .input-group select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300f2fe'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1.2em;
} */

/* 统一输入框和选择框样式 */
.input-group input, 
.input-group select {
  width: 100%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 242, 254, 0.3);
  background: rgba(128, 128, 128, 0.2);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

/* 禁用选项样式 */
select option[disabled] {
  color: #666;
}

.glow-text {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, #00f2fe, #66f9ff, #aaf8ff, #7dfaff, #00f2fe);
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
  0%, 100% { box-shadow: 0 0 10px var(--color); }
  50% { box-shadow: 0 0 20px var(--color); }
}

.light-streams {
  position: absolute;
  width: 100%;
  height: 100%;
  filter: blur(15px);
  opacity: 0.3;
}

.stream {
  position: absolute;
  background: linear-gradient(90deg, 
    rgba(0,242,254,0) 0%,
    rgba(0,242,254,0.5) 50%,
    rgba(0,242,254,0) 100%);
  width: 2px;
  height: 100%;
  animation: streamFlow 4s linear infinite;
}

@keyframes streamFlow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

/* 扫描线特效 */
.scanline {
  position: absolute;
  width: 100%;
  height: 2px;
  background: rgba(0, 242, 254, 0.3);
  animation: scan 5s linear infinite;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}

@keyframes scan {
  0% { top: -2px; }
  100% { top: 100%; }
}

.toggle-link {
  text-align: center;
  margin-top: 1.5rem;
  margin-left: 1rem;
  color: #00f2fe;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.toggle-link:hover {
  color: #00d6e6;
  transform: scale(1.05);
}

.login-container {
  min-height: 100vh;
  background: 
    linear-gradient(45deg, 
      rgba(0, 15, 32, 0.9) 0%,
      rgba(0, 55, 112, 0.7) 50%,
      rgba(0, 15, 32, 0.9) 100%),
    url('@/assets/images/cyber-bg.jpg');
  background-size: 400% 400%;
  animation: gradientFlow 15s ease infinite;
  position: relative;
  overflow: hidden;
}

.login-form::before,
.register-form::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    #00f2fe 0%,    /* 科技蓝 */
    #00ff88 25%,   /* 荧光绿 */
    #00f2fe 50%,   /* 科技蓝 */
    #00ff88 75%    /* 荧光绿 */
  );
  z-index: -1;
  animation: colorFlash 1.5s linear infinite;
  filter: blur(20px);
  opacity: 0.4;
  background-size: 200% 200%;
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
  0% { filter: hue-rotate(0deg) blur(20px); }
  100% { filter: hue-rotate(360deg) blur(20px); }
}

/* 3D悬浮效果 */
.login-form:hover,
.register-form:hover {
  transform: perspective(1000px) rotateX(5deg) rotateY(5deg);
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 
    0 0 50px rgba(0, 242, 254, 0.5),
    0 0 100px rgba(0, 242, 254, 0.3);
}

.dark .login-container {
  background: 
    linear-gradient(45deg, 
      rgba(0, 0, 0, 0.9) 0%,
      rgba(50, 50, 150, 0.7) 50%,
      rgba(0, 0, 0, 0.9) 100%),
    url('@/assets/images/cyber-bg-dark.jpg');
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}


.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: 
    float var(--duration) var(--delay) infinite,
    glow 2s ease-in-out infinite;
  filter: blur(1px);
  left: var(--x);
  top: var(--y);
  width: var(--size);
  height: var(--size);
  background: var(--color);
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(10px, -20px) scale(0.9); }
  50% { transform: translate(-10px, 20px) scale(1.1); }
  75% { transform: translate(15px, 10px) scale(0.95); }
}

.login-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.login-form, .register-form {
  max-width: 300px; /* 减小最大宽度 */
  width: 100%;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.3);
  color: #fff;
  transition: all 0.3s ease;
  margin-bottom: 6rem;
}

.input-group {
  margin-bottom: 1.5rem;
  margin-right: 1.5rem;
}

.input-group input, .input-group select {
  width: 100%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 242, 254, 0.3);
  background: rgba(128, 128, 128, 0.2);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group input:focus, .input-group select:focus {
  outline: none;
  border-color: #00f2fe;
  background: rgba(128, 128, 128, 0.3);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
}

.cyber-button {
  position: relative;
  width: 100%;
  padding: 0.8rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  z-index: 1;
  margin-top: 1rem;
}

.cyber-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(90deg,#00f2fe, #0056b3, #00f2fe,#0f2eca,#53aec1);
  background-size: 400% auto;
  animation: flowGradient 6s ease infinite;
  opacity: 0.2;
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
  background: linear-gradient(45deg, rgba(0, 242, 254, 0.2), rgba(0, 86, 179, 0.2));
  border: 1px solid rgba(0, 242, 254, 0.5);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3), inset 0 0 10px rgba(0, 242, 254, 0.2);
  color: #fff;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.5), inset 0 0 15px rgba(0, 242, 254, 0.3);
}

.register-btn {
  background: linear-gradient(45deg, rgba(0, 242, 254, 0.2), rgba(0, 86, 179, 0.2));
  border: 1px solid rgba(0, 242, 254, 0.5);
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3), inset 0 0 10px rgba(0, 242, 254, 0.2);
  color: #fff;
}

.register-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.5), inset 0 0 15px rgba(0, 242, 254, 0.3);
}

.toggle-btn {
  margin-top: 1.5rem;
  background: transparent;
  border: 1px solid rgba(0, 242, 254, 0.5);
  color: #00f2fe;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3), inset 0 0 10px rgba(0, 242, 254, 0.2);
}

.toggle-btn:hover {
  background: rgba(0, 242, 254, 0.1);
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.4), inset 0 0 15px rgba(0, 242, 254, 0.3);
}

.form-container {
  position: relative;
  perspective: 1200px;
  transform-style: preserve-3d;
}

.flip-forward-enter-active,
.flip-forward-leave-active,
.flip-back-enter-active,
.flip-back-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.flip-forward-enter-from {
  transform: rotateY(-180deg);
  opacity: 0;
}
.flip-forward-leave-to {
  transform: rotateY(180deg);
  opacity: 0;
}

.flip-back-enter-from {
  transform: rotateY(180deg);
  opacity: 0;
}
.flip-back-leave-to {
  transform: rotateY(-180deg);
  opacity: 0;
}

</style>