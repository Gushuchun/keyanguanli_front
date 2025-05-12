<template>
  <div class="app-container">
    <CursorEffect v-if="!isLoginPage" />
    <navbar v-if="!isLoginPage" />
    <div class="content-wrapper">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, computed } from 'vue';
import navbar from '@/components/navbar.vue';
import CursorEffect from '@/components/cursoreffect.vue'

const route = useRoute();
const isLoginPage = computed(() => {
  return route.path === '/login';
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