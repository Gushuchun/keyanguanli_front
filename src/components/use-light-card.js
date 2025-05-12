import { ref, onMounted, onUnmounted } from 'vue'

export const useLightCard = (options = {}) => {
  const cardRef = ref(null)
  const lightRef = ref(document.createElement('div'))
  let originalOverflow = ''
  let originalTransform = ''

  // 默认光效配置
  const defaultLightOptions = {
    width: 60,
    height: 60,
    color: '#ff4132',
    blur: 40,
    zIndex: 1
  }

  // 合并配置
  const lightOptions = {
    ...defaultLightOptions,
    ...(options.light || {})
  }

  const initLightStyle = () => {
    lightRef.value.style.cssText = `
      position: absolute;
      width: ${lightOptions.width}px;
      height: ${lightOptions.height}px;
      background: ${lightOptions.color};
      filter: blur(${lightOptions.blur}px);
      border-radius: 50%;
      pointer-events: none;
      z-index: ${lightOptions.zIndex};
      opacity: 0.7;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
    `
  }

  const handleMouseEnter = () => {
    if (!cardRef.value) return
    
    originalOverflow = cardRef.value.style.overflow
    originalTransform = cardRef.value.style.transform
    
    cardRef.value.style.overflow = 'hidden'
    cardRef.value.appendChild(lightRef.value)
    lightRef.value.style.opacity = '0.7'
  }

  const handleMouseMove = (e) => {
    if (!cardRef.value) return

    const rect = cardRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 更新光效位置
    lightRef.value.style.left = `${x}px`
    lightRef.value.style.top = `${y}px`

    // 3D旋转效果
    const rotateX = ((y - rect.height/2) / rect.height) * 10
    const rotateY = -((x - rect.width/2) / rect.width) * 10
    
    cardRef.value.style.transform = `
      ${originalTransform}
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.02)
    `
  }

  const handleMouseLeave = () => {
    if (!cardRef.value) return

    cardRef.value.style.overflow = originalOverflow
    cardRef.value.style.transform = originalTransform
    
    lightRef.value.style.opacity = '0'
    setTimeout(() => {
      if (cardRef.value && lightRef.value.parentNode === cardRef.value) {
        cardRef.value.removeChild(lightRef.value)
      }
    }, 300)
  }

  onMounted(() => {
    initLightStyle()
    if (cardRef.value) {
      cardRef.value.addEventListener('mouseenter', handleMouseEnter)
      cardRef.value.addEventListener('mousemove', handleMouseMove)
      cardRef.value.addEventListener('mouseleave', handleMouseLeave)
    }
  })

  onUnmounted(() => {
    if (cardRef.value) {
      cardRef.value.removeEventListener('mouseenter', handleMouseEnter)
      cardRef.value.removeEventListener('mousemove', handleMouseMove)
      cardRef.value.removeEventListener('mouseleave', handleMouseLeave)
    }
  })

  return { cardRef }
}