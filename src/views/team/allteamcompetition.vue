<template>
  <div class="all-team-competition" :class="{ 'dark-mode': isDarkMode }">
    <h1 class="neon-title">所有团队获奖次数</h1>
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { infoAPI } from '@/api/index';
import * as echarts from 'echarts';

const teams = ref([]);
const isLoading = ref(true);
const error = ref(null);
const chartContainer = ref(null);
let chartInstance = null;
// 从 localStorage 读取主题模式
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');

// 获取所有团队的获奖数据
const fetchAllTeamData = async () => {
  try {
    const response = await infoAPI.getallteamcompetition();
    if (response.status === 200) {
      // 按获奖次数从大到小排序
      teams.value = response.data.data.sort((a, b) => b.prize_count - a.prize_count);
      console.log('获取的团队数据:', teams.value);
      // 使用 nextTick 确保 chartContainer 已挂载
      nextTick(() => {
        initChart();
      });
    } else {
      throw new Error('API 返回错误码: ' + response.code);
    }
  } catch (err) {
    error.value = err;
    console.error('获取团队数据失败:', err);
  } finally {
    isLoading.value = false; // 加载完成
  }
};

// 更新图表主题
const updateChartTheme = () => {
  if (chartInstance) {
    const option = getChartOption();
    console.log('Updating chart theme with option:', option); 
    chartInstance.setOption(option, true); 
  } else {
    console.warn('Chart instance is not initialized.');
  }
};

// 获取图表配置
const getChartOption = () => {
  const darkTheme = {
    backgroundColor: 'rgba(10, 20, 40, 0.8)',
    tooltipBg: 'rgba(0, 0, 0, 0.8)',
    textColor: '#00f2fe',
    axisLineColor: '#00f2fe',
    splitLineColor: 'rgba(0, 242, 254, 0.2)',
    barGradientStart: '#00f2fe',
    barGradientEnd: '#007bff',
    emphasisStart: '#00ffea',
    emphasisEnd: '#00a2ff'
  };

  const lightTheme = {
    backgroundColor: '#ffffff',
    tooltipBg: 'rgba(255, 255, 255, 0.9)',
    textColor: '#333333',
    axisLineColor: '#333333',
    splitLineColor: 'rgba(0, 0, 0, 0.1)',
    barGradientStart: '#4e79a7',
    barGradientEnd: '#f28e2b',
    emphasisStart: '#76b7b2',
    emphasisEnd: '#edc948'
  };

  const theme = isDarkMode.value ? darkTheme : lightTheme;

  return {
    backgroundColor: theme.backgroundColor,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      backgroundColor: theme.tooltipBg,
      textStyle: {
        color: theme.textColor
      }
    },
    xAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: theme.axisLineColor,
          width: 2,
          shadowColor: isDarkMode.value ? 'rgba(0, 242, 254, 0.8)' : 'rgba(0, 0, 0, 0.1)',
          shadowBlur: isDarkMode.value ? 10 : 0
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: theme.splitLineColor,
          type: 'dashed'
        }
      },
      axisLabel: {
        color: theme.textColor
      }
    },
    yAxis: {
      type: 'category',
      data: teams.value.map(team => team.team_name),
      axisLine: {
        lineStyle: {
          color: theme.axisLineColor,
          width: 2,
          shadowColor: isDarkMode.value ? 'rgba(0, 242, 254, 0.8)' : 'rgba(0, 0, 0, 0.1)',
          shadowBlur: isDarkMode.value ? 10 : 0
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: theme.textColor,
        fontSize: 12
      },
      inverse: true 
    },
    series: [
      {
        name: '获奖次数',
        type: 'bar',
        data: teams.value.map(team => team.prize_count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(
            0, 0, 1, 0,
            [
              { offset: 0, color: theme.barGradientStart },
              { offset: 1, color: theme.barGradientEnd }
            ]
          ),
          shadowColor: isDarkMode.value ? 'rgba(0, 242, 254, 0.8)' : 'rgba(0, 0, 0, 0.1)',
          shadowBlur: isDarkMode.value ? 10 : 0
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(
              0, 0, 1, 0,
              [
                { offset: 0, color: theme.emphasisStart },
                { offset: 1, color: theme.emphasisEnd }
              ]
            )
          }
        },
        barWidth: '60%'
      }
    ]
  };
};

// 初始化图表
const initChart = () => {
  if (chartContainer.value) {
    chartInstance = echarts.init(chartContainer.value);
    const option = getChartOption();
    chartInstance.setOption(option);

    // 监听窗口大小变化，更新图表
    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    // 移除监听事件时使用同一个函数引用
    onBeforeUnmount(() => {
      if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
      }
      window.removeEventListener('resize', handleResize);
    });
  } else {
    console.warn('chartContainer 未正确挂载');
  }
};

// 处理 localStorage 变化的函数
const handleStorageChange = (event) => {
  if (event.key === 'theme') {
    isDarkMode.value = event.newValue === 'dark';
    console.log('Theme changed to:', isDarkMode.value ? 'dark' : 'light');
    updateChartTheme();
  }
};

onMounted(() => {
  fetchAllTeamData();
  // 监听 storage 事件
  window.addEventListener('storage', handleStorageChange);
});

onBeforeUnmount(() => {
  // 移除 storage 事件监听
  window.removeEventListener('storage', handleStorageChange);
});
</script>

<style scoped>
.all-team-competition {
  padding: 20px;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  transition: background-color 0.3s;
}

.dark-mode {
  background: rgba(10, 20, 40, 0.8);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.5);
}

.dark-mode::after {
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
  z-index: 1;
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

.neon-title {
  text-shadow: 0 0 10px;
  text-align: center;
  margin-bottom: 20px;
  transition: color 0.3s;
}

.dark-mode .neon-title {
  color: #00f2fe;
  text-shadow: 0 0 10px #00f2fe, 0 0 20px #00f2fe, 0 0 30px #00f2fe;
}

:not(.dark-mode) .neon-title {
  color: #333333;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.chart-container {
  width: 100%;
  height: 600px;
}
</style>
