<template>
  <div 
    ref="cursorRef" 
    class="global-cursor"
    :style="cursorStyle"
  ></div>
  <div ref="trailsContainer" class="trails-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const cursorRef = ref(null)
const trailsContainer = ref(null)
const pos = ref({ x: 0, y: 0 })
const clicked = ref(false) // 点击状态
// 记录上次创建尾迹的时间
const lastTrailTime = ref(0) 
// 尾迹生成最小间隔，单位毫秒
const trailInterval = 1 

// 修改配置项，增加尾迹消失时间
const options = ref({
  size: 15, 
  normalColor: 'rgba(0, 255, 255, 0.8)', // 青色
  clickColor: 'rgba(255, 0, 255, 0.9)',  // 粉色
  blur: 20,
  scale: 1.1,
  clickScale: 0.8,
  glow: 10, 
  trailCount: 8, 
  // 增加尾迹存在时间，例如设置为 3000 毫秒（3 秒）
  trailDuration: 3000 
})

const cursorStyle = computed(() => ({
  // 宽度和高度可设置不同值形成矩形
  width: `${options.value.size}px`,
  height: `${options.value.size * 2}px`, 
  background: clicked.value ? options.value.clickColor : options.value.normalColor,
  filter: `blur(${options.value.blur}px) drop-shadow(0 0 ${options.value.glow}px ${clicked.value ? options.value.clickColor : options.value.normalColor})`,
  transform: `translate(-50%, -50%) scale(${
    clicked.value ? options.value.clickScale : options.value.scale
  })`
}))

const updatePosition = (e) => {
  pos.value = { x: e.clientX, y: e.clientY }
  if (cursorRef.value) {
    cursorRef.value.style.left = `${pos.value.x}px`
    cursorRef.value.style.top = `${pos.value.y}px`
  }
  const now = Date.now()
  // 判断是否达到尾迹生成最小间隔
  if (now - lastTrailTime.value >= trailInterval) { 
    createTrail()
    lastTrailTime.value = now
  }
}

// 生成彩虹颜色的函数，增加颜色丰富度
const getRainbowColor = (offset = 0) => {
  const frequency = 0.001; // 降低频率，使颜色变化更平缓
  const red = Math.sin(frequency * (Date.now() + offset) + 0) * 127 + 128;
  const green = Math.sin(frequency * (Date.now() + offset) + 2) * 127 + 128;
  const blue = Math.sin(frequency * (Date.now() + offset) + 4) * 127 + 128;
  return `rgba(${red}, ${green}, ${blue}, 0.8)`;
}

// 创建尾迹元素
const createTrail = () => {
  const trail = document.createElement('div')
  trail.classList.add('trail')
  trail.style.left = `${pos.value.x}px`
  trail.style.top = `${pos.value.y}px`
  // 为每个尾迹元素设置不同的偏移量以获取不同颜色
  const offset = Math.random() * 1000; 
  const trailColor = getRainbowColor(offset);
  trail.style.background = trailColor
  trail.style.filter = `blur(${options.value.blur}px) drop-shadow(0 0 ${options.value.glow}px ${trailColor})`
  trailsContainer.value.appendChild(trail)

  setTimeout(() => {
    if (trail.parentElement) {
      trail.parentElement.removeChild(trail)
    }
  }, options.value.trailDuration)
}

// 点击处理函数
const handleMouseDown = () => {
  clicked.value = true
}

const handleMouseUp = () => {
  clicked.value = false
}

onMounted(() => {
  // 添加类名以隐藏原生光标
  document.body.classList.add('cursor-effect-active')
  document.addEventListener('mousemove', updatePosition)
  // 点击事件监听
  document.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  // 移除类名以恢复原生光标
  document.body.classList.remove('cursor-effect-active')
  document.removeEventListener('mousedown', handleMouseDown)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('mousemove', updatePosition)
})
</script>

<style>
.global-cursor {
  position: fixed;
  /* 移除圆角样式，使其变为矩形 */
  border-radius: 0; 
  pointer-events: none;
  z-index: 9999;
  transition: 
    transform 0.15s cubic-bezier(0.68, -0.55, 0.27, 1.55),
    opacity 0.15s ease,
    background 0.2s ease,
    filter 0.2s ease;
  will-change: transform, filter;
}

.trails-container {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9998;
}

.trail {
  position: absolute;
  /* 缩小尾迹尺寸并改为矩形 */
  width: 10px;
  height: 20px; 
  /* 移除圆角样式 */
  border-radius: 0; 
  opacity: 0.8;
  /* 调整动画时长与尾迹持续时间匹配 */
  animation: trail-fade 3s ease forwards;
}

@keyframes trail-fade {
  from {
    opacity: 0.8;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(1.5);
  }
}

/* 显示隐藏原生光标的样式 */
body.cursor-effect-active *{
  cursor: none;
}

/* 增强点击动画 */
.global-cursor:active {
  animation: click-pulse 0.3s ease infinite;
}

@keyframes click-pulse {
  0% { 
    transform: translate(-50%, -50%) scale(1);
    filter: blur(20px) drop-shadow(0 0 10px rgba(255, 0, 255, 0.9));
  }
  50% { 
    transform: translate(-50%, -50%) scale(0.8);
    filter: blur(10px) drop-shadow(0 0 20px rgba(255, 0, 255, 1));
  }
  100% { 
    transform: translate(-50%, -50%) scale(1);
    filter: blur(20px) drop-shadow(0 0 10px rgba(255, 0, 255, 0.9));
  }
}
</style>