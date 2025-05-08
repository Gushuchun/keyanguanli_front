<script setup name="login">
import login_img from "@/assets/image/login.png"
import { ref } from "vue";
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';

// 引入登录页面样式
import '@/assets/css/login.css'

const form = ref({
  username: '',
  password: ''
})
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const onSubmit = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.error('请输入用户名和密码')
    return
  }

  try {
    loading.value = true
    const response = await authStore.login(form.value)

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
}

</script>

<template>
    <div class="dowebok">
        <div class="container-login100">
            <div class="wrap-login100">
                <div class="login100-pic js-tilt" data-tilt>
                    <img :src="login_img" alt="IMG" />
                </div>

                <div class="login100-form validate-form">
                    <span class="login100-form-title"> 用户登陆 </span>

                    <div class="wrap-input100 validate-input">
                        <input class="input100" type="text" name="username" placeholder="账号" v-model="form.username" @keyup.enter="onSubmit" />
                        <span class="focus-input100"></span>
                        <span class="symbol-input100">
                            <i class="iconfont icon-fa-envelope" aria-hidden="true"></i>
                        </span>
                    </div>

                    <div class="wrap-input100 validate-input">
                        <input class="input100" type="password" name="password" placeholder="密码"
                            v-model="form.password" @keyup.enter="onSubmit" />
                        <span class="focus-input100"></span>
                        <span class="symbol-input100">
                            <i class="iconfont icon-fa-lock" aria-hidden="true"></i>
                        </span>
                    </div>

                    <div class="container-login100-form-btn">
                        <button class="login100-form-btn" @click="onSubmit" :disabled="loading">
                            {{ loading ? '登录中...' : '登陆' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped src="@/assets/css/login.css"></style>
<style scoped src="@/assets/iconfonts/iconfont.css"></style>
