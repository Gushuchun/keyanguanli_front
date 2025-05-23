<template>
  <div class="particles">
    <div v-for="i in 80" :key="i" class="particle" :style="particleStyle(i)"></div>
    <!-- 横向光流 -->
    <div class="light-streams">
      <div class="stream" v-for="n in 5" :key="'stream' + n" :style="{ left: streams[n] + '%' }"></div>
    </div>
    <!-- 扫描线 -->
    <div class="scanline"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 粒子样式生成
const particleStyle = (i) => {
  return {
    '--x': Math.random() * 100 + '%',
    '--y': Math.random() * 100 + '%',
    '--delay': Math.random() * 2 + 's',
    '--duration': Math.random() * 3 + 2 + 's',
    '--color': `hsl(${Math.random() * 360}, 80%, 60%)`,
    '--size': Math.random() * 3 + 1 + 'px'
  };
};

// 动态光流控制
const streams = ref([]);

onMounted(() => {
  // 增加更新间隔时间到 5 秒
  setInterval(() => {
    streams.value = Array.from({ length: 5 }, () => Math.random() * 100);
  }, 5000);
});
</script>

<style scoped>
.particles {
  /* 修改为 fixed 定位 */
  position: fixed;
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
  will-change: transform;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(10px, 10px);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 10px var(--color);
  }
  50% {
    box-shadow: 0 0 20px var(--color);
  }
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
      rgba(0, 242, 254, 0) 0%,
      rgba(0, 242, 254, 0.5) 50%,
      rgba(0, 242, 254, 0) 100%);
  width: 2px;
  height: 100%;
  animation: streamFlow 4s linear infinite;
  will-change: transform;
}

@keyframes streamFlow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

.scanline {
  position: absolute;
  width: 100%;
  height: 2px;
  background: rgba(0, 242, 254, 0.3);
  animation: scan 15s linear infinite;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
  will-change: top;
}

@keyframes scan {
  0% {
    top: -2px;
  }
  100% {
    top: 100%;
  }
}
</style>