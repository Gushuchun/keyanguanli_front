<template>
  <div class="page-container">
    <!-- <div class="stars"></div>
    <div class="meteor"></div>
    <div class="meteor"></div>
    <div class="meteor"></div> -->
    <div class="scroll-container">
      <div ref="page1" class="page active">
        <div class="main-content">
          <div class="header-section">
            <h1 class="neon-title">学院竞赛荣誉榜</h1>
            <p class="neon-description">探索各院系的卓越成就与创新风采</p>
            <div class="decorative-line"></div>
          </div>

          <!-- 修改为左右分栏布局 -->
          <div class="dashboard-layout">
            <!-- 左侧最新奖项 -->
            <div class="competition-section">
              <h2 class="neon-subtitle-1">最新获奖信息</h2>
              <div :class="themeStore.currentTheme === 'dark' ? 'competition-list flow-border' : 'competition-list-1 flow-border'">
                <div v-for="(item, index) in latestCompetitions" :key="index" class="competition-item">
                  <span class="glow-text">🎉 恭喜</span>
                  <span class="highlight-text">{{ item.team_name }}</span>
                  <span class="glow-text">团队在</span>
                  <span class="highlight-text">{{ item.title }}</span>
                  <span class="glow-text">比赛中赢得了</span>
                  <span class="highlight-text">{{ item.score }}！</span>
                  <span class="time-text">{{ new Date(item.date).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>

            <!-- 右侧领奖台 -->
            <div class="podium-section">
              <h2 class="neon-subtitle">团队荣誉榜</h2>
              <div :class="themeStore.currentTheme === 'dark' ? 'podium-container flow-border' : 'podium-container-1 flow-border'">
                <div 
                  v-for="(team, index) in podiumTeams" 
                  :key="team.team_id" 
                  :class="['podium-item', `podium-${index + 1}`]"
                  @click="goToAllTeamCompetition"
                >
                  <div class="podium-rank">{{ ['🥇', '🥈', '🥉'][index] }}</div>
                  <div class="team-info">
                    <span class="highlight-text">{{ team.team_name }}</span>
                    <span class="glow-text">累计获奖</span>
                    <span class="highlight-text">{{ team.prize_count }}次</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div ref="page2" class="page">
        <div class="main-content">
        <h2 class="neon-subtitle-3">学院获奖信息</h2>
        <div
          :class="themeStore.currentTheme === 'dark' ? 'cyber-chart-wrapper flow-border' : 'cyber-chart-wrapper-1 flow-border'">
          <div ref="chartRef" class="chart-container"></div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/auth';
import * as echarts from 'echarts';
import axios from 'axios';
import { infoAPI } from '@/api/index';
import { useThemeStore } from '@/stores/theme'; 
import { useRouter } from 'vue-router'; // 引入路由
import '@/assets/styles/global.css'

const router = useRouter(); // 使用路由
const themeStore = useThemeStore()
const chartRef = ref(null);
const chart = ref(null);
const collegeData = ref([]);
const latestCompetitions = ref([]); // 新增：存储最新比赛数据
const theme = ref(localStorage.getItem('theme') || 'dark');

// 新增分页相关逻辑
const page1 = ref(null)
const page2 = ref(null)
const currentPage = ref(1)
const pageOpacity = ref(0)
const isAnimating = ref(false)


// 获取学院获奖数据
const fetchCollegeData = async () => {
  try {
    const response = await infoAPI.getcollegeprize()
    collegeData.value = response.data.data;
    initChart();
  } catch (error) {
    console.error('获取学院数据失败:', error);
  }
};

// 新增：获取最新比赛数据
const fetchLatestCompetitions = async () => {
  try {
    const response = await infoAPI.getallcompetition();
    // 过滤出status为confirmed的数据，并按日期排序，取最新3条
    console.log(response.data)
    latestCompetitions.value = response.data
      .filter(item => item.status === 'confirmed')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  } catch (error) {
    console.error('获取比赛数据失败:', error);
  }
};

const initChart = () => {
  if (!chartRef.value) return;
  chart.value = echarts.init(chartRef.value);

  // 简化数据验证
  const validData = collegeData.value.map(item => ({
    name: item.name || '未知学院',
    prize_num: Math.max(0, Number(item.prize_num || 0))
  }));

  const option = {
    title: {
      text: '🏆 学院荣誉数据全景 🏆',
      left: 'center',
      textStyle: {
        color: 'var(--neon-primary)',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Microsoft YaHei',
        textShadow: '0 0 15px var(--neon-primary)'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = params[0];
        return `<div class="cyber-tooltip">
                  <span class="glow">🏛️ ${data.name}</span><br/>
                  <span class="highlight">✨ ${data.value} 项荣誉</span>
                </div>`;
      },
      backgroundColor: 'rgba(0, 15, 30, 0.9)',
      borderColor: '#00F7FF',
      borderWidth: 2,
      textStyle: {
        color: '#fff',
        fontSize: 16
      },
      extraCssText: 'box-shadow: 0 0 20px rgba(0, 247, 255, 0.5);'
    },
    xAxis: {
      type: 'category',
       data: validData.map(item => ({
        value: item.name || '未知学院',
          formatter: function(value) {
        const maxCharsPerLine = 5;
        const regex = new RegExp(`.{1,${maxCharsPerLine}}`, 'g');
        return value.match(regex).join('\n');
      }
      })),
      axisLabel: {
        color: 'var(--neon-primary)',
        fontSize: 16, 
        rotate: 0,
        margin: 15,
        interval: 0,
        rich: {
          // a: {
          //   lineHeight: 18,
          //   color: 'var(--neon-primary)'
          // }
        },
        formatter: function(params) {
          const maxCharsPerLine = 5;
          const regex = new RegExp(`.{1,${maxCharsPerLine}}`, 'g');
          const lines = params.match(regex);
          return lines.map(line => `{a|${line}}`).join('\n');
        }
      },
      axisLine: {
        lineStyle: {
          color: 'var(--neon-secondary)',
          width: 2
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(138, 233, 255, 0.1)'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '获奖数量',
      nameTextStyle: {
        color: 'var(--neon-secondary)',
        fontSize: 16,
        padding: [0, 0, 0, 40]
      },
      axisLabel: {
        color: 'var(--neon-secondary)',
        fontSize: 14
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(138, 233, 255, 0.8)',
          width: 2
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(138, 233, 255, 0.1)'
        }
      }
    },
    series: [{
      name: '荣誉数量',
      type: 'bar',
      data: validData.map(item => item.prize_num),
      label: {
        show: true,
        position: 'top',
        color: '#000000',
        fontSize: 14,
        formatter: '{c}',
        textShadow: '0 0 10px rgba(0, 247, 255, 0.8)'
      },
      itemStyle: {
        barBorderRadius: [15, 15, 0, 0],
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: 'rgba(0, 247, 255, 0.6)',
        shadowBlur: 20
      },
      emphasis: {
        itemStyle: {
          shadowColor: 'rgba(0, 247, 255, 0.9)',
          shadowBlur: 30,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00F7FF' },
            { offset: 1, color: '#7B61FF' }
          ])
        }
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: (idx) => idx * 50
    }],
    grid: {
      left: '2%',
      right: '2%',
      bottom: '2%',
      containLabel: true
    },
    backgroundColor: 'transparent',
    // 移除 visualMap 配置
  };

  try {
    chart.value.setOption(option);
  } catch (error) {
    console.error('图表渲染失败:', error);
    chart.value.setOption({
      title: {
        text: '数据加载失败',
        subtext: '请检查数据源',
        left: 'center',
        top: 'center'
      }
    });
  }
};

watch(
  () => document.documentElement.getAttribute('data-theme'),
  () => chart.value && initChart(),
  { immediate: true }
);

onMounted(() => {
  // 初始淡入
  pageOpacity.value = 1

  // 监听滚轮事件
  window.addEventListener('wheel', handleWheel, { passive: false })
  fetchCollegeData();
  fetchLatestCompetitions(); // 新增：在组件挂载时获取比赛数据
  console.log('theme:', theme.value); // 打印当前主题
  fetchTeamData(); // 新增获取团队数据
});
const podiumTeams = ref([]); 
const fetchTeamData = async () => {
  try {
    const response = await infoAPI.getallteamcompetition();
    let validData = response.data.data
      .sort((a, b) => b.prize_count - a.prize_count)
      .slice(0, 3);

    // 如果数据不足3个，用默认数据填充
    while (validData.length < 3) {
      validData.push({
        team_id: `placeholder_${validData.length + 1}`,
        team_name: '暂无数据',
        prize_count: 0
      });
    }

    podiumTeams.value = validData;
  } catch (error) {
    console.error('获取团队数据失败:', error);
  }
};

onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleWheel)
})

const handleWheel = (e) => {
  if (isAnimating.value) return

  // 节流处理
  isAnimating.value = true
  const direction = e.deltaY > 0 ? 'down' : 'up'

  if (direction === 'down' && currentPage.value === 1) {
    switchPage(2)
  } else if (direction === 'up' && currentPage.value === 2) {
    switchPage(1)
  } else {
    isAnimating.value = false
  }
}

// 跳转到 allteamcompetition 页面
const goToAllTeamCompetition = () => {
  router.push({ name: 'allteamcompetition' });
};


const switchPage = (targetPage) => {
  const current = currentPage.value
  if (current === targetPage) return

  const fromPage = current === 1 ? page1.value : page2.value
  const toPage = current === 1 ? page2.value : page1.value

  // 动画参数
  fromPage.style.transform = `translateY(${current === 1 ? '-100%' : '0%'})`
  fromPage.style.opacity = '0'
  toPage.style.transform = 'translateY(0)'
  toPage.style.opacity = '1'

  // 更新当前页
  currentPage.value = targetPage

  // 重置状态
  setTimeout(() => {
    isAnimating.value = false
  }, 1000)
}
</script>

<style scoped>
/* 调整团队荣誉榜标题位置，向下移动 */
.neon-subtitle {
  color: #00f7ff;
  font-size: 1.8rem;
  text-shadow: 0 0 10px rgba(0, 247, 255, 0.8);
  margin-top: 7.5rem; /* 适当增大 margin-top 值，让标题向下移动 */
  text-align: center;
  height: 0px;
  margin-right: 11rem;
}

/* 调整领奖台容器位置和高度 */
.podium-container, .podium-container-1 {
  display: flex;
  align-items: flex-end;
  margin-top: 4.5rem; /* 减小顶部外边距，向上移动 */
  height: auto; /* 自动高度，避免过高 */
  margin-right: 11rem;
  padding: 1rem;
}

/* 调整领奖台单个元素高度 */
.podium-1 {
  height: 100px; /* 适当降低第一名高度 */
}

.podium-2 {
  height: 100px; /* 适当降低第二名高度 */
}

.podium-3 {
  height: 100px; /* 适当降低第三名高度 */
}

.podium-section {
  order: 1;
  flex: 1;
  margin-top: -2rem; /* 从-8rem调整到-2rem */
}

/* 调整最新获奖信息容器位置 */
.competition-section {
  order: 2;
  flex: 1;
  min-width: 0;
  margin-top: -2rem; /* 保持与领奖台一致 */
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 30%;
  text-align: center;
}

.podium-1 {
  height: 300px; /* 增加第一名高度 */
  background: linear-gradient(145deg, #ffd70033, #ffd70066);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}


.podium-2 {
  height: 250px; /* 增加第二名高度 */
  background: linear-gradient(145deg, #c0c0c033, #c0c0c066);
  box-shadow: 0 0 20px rgba(192, 192, 192, 0.5);
}

.podium-3 {
  height: 200px; /* 增加第三名高度 */
  background: linear-gradient(145deg, #cd7f3233, #cd7f3266);
  box-shadow: 0 0 20px rgba(205, 127, 50, 0.5);
}

.podium-rank {
  font-size: 2rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 添加领奖台底座效果 */
.podium-item::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  height: 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0 0 5px 5px;
}

/* 添加领奖台边缘光效 */
.podium-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
}

.competition-section {
  margin-bottom: 3rem;
}


.neon-subtitle-3 {
  color: #00f7ff;
  font-size: 1.8rem;
  text-shadow: 0 0 10px rgba(0, 247, 255, 0.8);
  margin-top: 8rem; /* 从5rem减少到3rem */
  margin-bottom: 1rem; /* 从1.5rem减少到1rem */
  text-align: center;
}

.neon-subtitle-1 {
  color: #00f7ff;
  font-size: 1.8rem;
  text-shadow: 0 0 10px rgba(0, 247, 255, 0.8);
  /* margin-top: 3rem;  */
  margin-bottom: 2.5rem; 
  text-align: center;
  margin-left: 2rem;
}

.competition-list {
  border-radius: 15px;
  padding: 1.5rem;
  background: var(--card-bg);
  box-shadow: 0 0 30px color-mix(in srgb, var(--neon-primary) 20%, transparent);
  width: 580px;
}

.competition-item {
  font-size: 1.1rem;
  padding: 0.8rem 1rem;
  height: 80px;
  /* margin-bottom: 5px; */
  border-radius: 8px;
  color: var(--neon-secondary);
  background: color-mix(in srgb, var(--neon-primary) 10%, transparent);
}

.glow-text {
  color: var(--neon-secondary);
  text-shadow: 0 0 5px color-mix(in srgb, var(--neon-secondary) 50%, transparent);
}

.highlight-text {
  font-weight: bold;
  color: var(--neon-primary);
  text-shadow: 0 0 10px color-mix(in srgb, var(--neon-primary) 50%, transparent);
}

.page-container {
  background: radial-gradient(ellipse at bottom, #0d1d31 0%, #0c0d13 100%);
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transform: scale(0.9); /* 缩小整个页面尺寸 */
  transform-origin: top center;
}

/* 修改星星效果 */
.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: radial-gradient(circle, transparent 10%, #0d1d31 70%);
  filter: blur(1px);
}

.stars::before,
.stars::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  background-image: radial-gradient(4px 4px at 20% 30%, rgba(255, 255, 255, 0.8) 50%, transparent 100%),
    radial-gradient(4px 4px at 50% 70%, rgba(255, 255, 255, 0.8) 50%, transparent 100%),
    radial-gradient(4px 4px at 80% 40%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
  background-size: 300px 300px;
  animation: twinkle 3s infinite ease-in-out;
  opacity: 0.8;
  filter: blur(1px);
}

.stars::after {
  background-image: radial-gradient(4px 4px at 20% 30%, var(--star-color) 50%, transparent 100%),
    radial-gradient(4px 4px at 50% 70%, var(--star-color) 50%, transparent 100%),
    radial-gradient(4px 4px at 80% 40%, var(--star-color) 50%, transparent 100%);
}


@keyframes twinkle {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }
}

/* 添加流星效果 */
.meteor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.meteor::before, .meteor::after {
  content: '';
  position: absolute;
  top: -50px;
  width: 2px;
  height: 50px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  animation: meteor 10s linear infinite;
  background: var(--meteor-color);
}

.meteor::before {
  left: 20%;
  animation-delay: 3s;
}

.meteor::after {
  left: 80%;
  animation-delay: 7s;
}

/* 新增不同位置的流星 */
.meteor:nth-child(2)::before {
  left: 40%;
  animation-delay: 5s;
}

.meteor:nth-child(2)::after {
  left: 60%;
  animation-delay: 9s;
}

.meteor:nth-child(3)::before {
  left: 10%;
  animation-delay: 1s;
}

.meteor:nth-child(3)::after {
  left: 90%;
  animation-delay: 11s;
}

@keyframes meteor {
  0% {
    transform: translateY(-50px) rotate(30deg);
    opacity: 1;
  }

  100% {
    transform: translateY(100vh) rotate(30deg);
    opacity: 0;
  }
}

.main-content {
  position: relative;
  z-index: 1;
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem 2rem; /* 减少内边距 */
  transform: translateY(0);
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}


.header-section {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.neon-title {
  color: var(--neon-primary);
  font-size: 2.5rem;
  text-shadow: 0 0 15px color-mix(in srgb, var(--neon-primary) 50%, transparent);
  margin-bottom: 1rem;
  margin-top: -7rem;
  animation: neonPulse 2s infinite alternate;
}

.neon-description {
  color: var(--neon-secondary);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.decorative-line {
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--neon-primary), transparent);
  margin: 1rem auto;
}

/* .cyber-chart-wrapper {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  background: transparent;
  box-shadow: 0 0 30px color-mix(in srgb, var(--neon-primary) 20%, transparent);
} */

.chart-container {
  margin-top: 1rem;
  width: 800px;
  height: 400px;
  /* 从650px增加到800px */
  position: relative;
  z-index: 1;
  --axis-color: color-mix(in srgb, var(--neon-primary) 80%, transparent);
  --split-line-color: color-mix(in srgb, var(--neon-primary) 10%, transparent);
  margin-left: auto;
  margin-right: auto; /* 使图表水平居中 */
}

.cyber-chart-wrapper {
  position: relative;
  background: var(--card-bg);
  border-radius: 15px;
  padding: 1rem;
  /* 从2rem增加到3rem */
  box-shadow: 0 0 30px rgba(0, 247, 255, 0.2);
  overflow: hidden;
}

.cyber-chart-wrapper-1 {
  position: relative;
  background: #ebeaea;
  border-radius: 15px;
  padding: 1rem;
  /* 从2rem增加到3rem */
  box-shadow: 0 0 30px rgba(0, 247, 255, 0.2);
  overflow: hidden;
}

@media (max-width: 768px) {
  .chart-container {
    height: 400px;
    /* 从400px增加到500px */
  }
}

.cyber-border {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(45deg,
      transparent 0px,
      transparent 5px,
      rgba(0, 247, 255, 0.2) 5px,
      rgba(0, 247, 255, 0.2) 10px);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  padding: 2px;
  border-radius: 15px;
  pointer-events: none;
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .neon-title {
    font-size: 1.8rem;
  }

  .chart-container {
    height: 400px;
  }
}

.time-text {
  color: var(--neon-primary);
  margin-right: 5rem;
  font-size: 0.9rem;
  text-shadow: 0 0 5px rgba(0, 247, 255, 0.8);
}


@keyframes neonPulse {
  from {
    text-shadow: 0 0 10px color-mix(in srgb, var(--neon-primary) 60%, transparent);
  }

  to {
    text-shadow: 0 0 20px color-mix(in srgb, var(--neon-primary) 90%, transparent),
      0 0 30px color-mix(in srgb, var(--neon-primary) 60%, transparent);
  }
}

:root {
  --bg-gradient-start: #0d1d31;
  --bg-gradient-end: #0c0d13;
  --neon-primary: #00f7ff;
  --neon-secondary: #8ae9ff;
  --text-primary: #ffffff;
  --text-secondary: #c0c0c0;
  --chart-bg: rgba(0, 20, 40, 0.8);
  --card-bg: rgba(13, 29, 49, 0.8);
  --border-color: rgba(0, 247, 255, 0.2);
  --star-color: rgba(255, 255, 255, 0.8);
  --meteor-color: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  --chart-label-color: #00f7ff;
  --axis-label-color: #8ae9ff;
}

[data-theme="light"] {
  --bg-gradient-start: #f0f2f5;
  --bg-gradient-end: #d0d7e0;
  --neon-primary: #0077ff;
  --neon-secondary: #3a5dff;
  --text-primary: #2c3e50;
  --text-secondary: #4a5568;
  --chart-bg: rgba(240, 242, 245, 0.9);
  /* 修改为浅灰色 */
  --card-bg: rgba(240, 242, 245, 0.9);
  /* 修改为浅灰色 */
  --border-color: rgba(0, 119, 255, 0.2);
  --star-color: rgba(0, 0, 0, 0.6);
  --meteor-color: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
  --chart-label-color: #0077ff;
  --axis-label-color: #3a5dff;
}

.echarts .series-label {
  color: var(--chart-label-color) !important;
  fill: var(--chart-label-color) !important;
}

.echarts .xAxis .axis-label,
.echarts .yAxis .axis-label {
  color: var(--axis-label-color) !important;
  fill: var(--axis-label-color) !important;
}

.page-container {
  background: radial-gradient(ellipse at bottom,
      var(--bg-gradient-start) 0%,
      var(--bg-gradient-end) 100%);
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  animation: bgMove 15s linear infinite;
}

@keyframes bgMove {
  0% {
    background-position: 0 0;
  }

  50% {
    background-position: 50% 50%;
  }

  100% {
    background-position: 100% 100%;
  }
}

/* 修改容器框动效 */
.cyber-chart-wrapper::before,
.competition-list::before {
  content: '';
  position: absolute;
  top: 0;
  /* left: -100%; */
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent);
  animation: slide 6s linear infinite alternate;
  /* 增加 alternate 和延长动画时间 */
}

@keyframes slide {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

/* 增强边框光效 */
.cyber-border {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(45deg,
      transparent 0px,
      transparent 5px,
      rgba(0, 247, 255, 0.5) 5px,
      rgba(0, 247, 255, 0.5) 10px);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  padding: 2px;
  border-radius: 15px;
  pointer-events: none;
  animation: borderGlow 1.5s ease-in-out infinite alternate;
}

@keyframes borderGlow {
  0% {
    opacity: 0.5;
    filter: brightness(1);
  }

  100% {
    opacity: 1;
    filter: brightness(1.5);
  }
}

.competition-list-1 {
  border-radius: 15px;
  padding: 1.5rem;
  background-color: #ebeaea;
  box-shadow: 0 0 30px color-mix(in srgb, var(--neon-primary) 20%, transparent);
  width: 580px;
}

.flow-border {
  position: relative;
  /* background: transparent; */
  border-radius: 15px;
  padding: 1.5rem;
  overflow: hidden;
}

.flow-border::after {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(90deg,
      rgba(0, 242, 254, 0) 25%,
      #00f2fe 50%,
      rgba(0, 242, 254, 0) 75%);
  background-size: 200% 100%;
  animation: borderLineMove 4s linear infinite;
  pointer-events: none;
  z-index: -1;
  border-radius: 15px;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  padding: 1px;
}

@keyframes borderLineMove {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

/* 新增分页样式 */
.page-container {
  opacity: 0;
  animation: pageFadeIn 2s ease-out forwards;
}

@keyframes pageFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.page {
  position: absolute;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(100%);
  opacity: 0;
}

.page.active {
  transform: translateY(0);
  opacity: 1;
}

/* 增强过渡效果 */
.competition-item,
.cyber-chart-wrapper {
  transition: all 0.4s ease-out;
}

/* 优化滚轮检测 */
@media (hover: none) {
  .scroll-container {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.dashboard-layout {
  display: flex;
  gap: 2rem;
  margin-top: -5rem; /* 将上边距从2rem减少到1rem */
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.podium-section {
  order: 1;
  flex: 1;
  margin-top: -8rem; /* 向上移动 */
}

.podium-item:nth-child(1) {
  width: 120px;
  order: 2; /* 第一名在中间 */
}

.podium-item:nth-child(2) {
  width: 120px;
  order: 3; /* 第二名在右边 */
}

.podium-item:nth-child(3) {
  width: 120px;
  order: 1; /* 第三名在左边 */
}


/* 调整最新获奖信息容器 */
.competition-section {
  order: 2;
  flex: 1;
  min-width: 0;
  margin-top: -2rem; /* 向上移动 */
}

.competition-list, .competition-list-1 {
  height: 300px; /* 从400px减少到300px */
  padding: 1rem; /* 减少内边距 */
}
</style>