<template>
  <div class="page-container">
    <div class="main-content">
      <h1>欢迎来到主页</h1>
      <p v-if="authStore.user">
        当前用户: {{ authStore.user.username }} (角色: {{ authStore.user.role }})
      </p>
      <p>这是主仪表盘区域的内容。</p>
      <section class="sample-card">
        <h2>示例卡片</h2>
        <p>这张卡片也应该响应主题变化。</p>
        <button class="primary">主要按钮</button>
        <button>次要按钮</button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  

  padding-top: var(--navbar-total-height, 26px); /* 避免内容被固定导航栏遮挡 */
  box-sizing: border-box;
}

.main-content {
  font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif; /* 与导航栏一致或使用全局字体 */
  padding: 20px;
  flex: 1;
  background-color: var(--body-bg); 
  color: var(--text-color);
}

.main-content h1 {
  color: var(--text-color);
  margin-bottom: 20px;
}

.main-content p {
  color: var(--text-muted-color);
  line-height: 1.7;
}

.sample-card {
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--card-border-color);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: var(--card-box-shadow);
}

.sample-card h2 {
  margin-top: 0;
  color: var(--text-color);
}

.sample-card button {
  margin-right: 10px;
  margin-top: 10px;
}

</style>
