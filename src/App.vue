<template>
  <div class="app-container">
    <BackgroundDecor v-if="!isLoginPage" />
    <CursorEffect v-if="!isLoginPage && cursor" />
    <navbar v-if="!isLoginPage" />
    <div class="content-wrapper">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import navbar from '@/components/navbar.vue';
import CursorEffect from '@/components/cursoreffect.vue'
import BackgroundDecor from '@/components/BackgroundDecor.vue';
import { settingsAPI } from '@/api/settings'

const route = useRoute();
const isLoginPage = computed(() => {
  return route.path === '/login';
});
const cursor = ref(true);

// 获取学生信息
const fetchSettings = async () => {
  try {
    const response = await settingsAPI.getsettings();
    if (response.data.code==200) {
      cursor.value  = response.data.data[0].cursor;
    }
  } catch (error) {
    console.error('获取学生信息失败:', error);
  }
};

onMounted(() => {
  fetchSettings();
});

</script>

<style scoped>
*{
  margin: 0;
  padding: 0;
}
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.content-wrapper {
  flex: 1;
  width: 100%;
}
</style>