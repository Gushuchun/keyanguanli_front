// src/stores/theme.js
import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // 1. 状态：默认为 'light' (白天模式)，或从 localStorage 加载用户偏好
  const currentTheme = ref(localStorage.getItem('theme') || 'light');

  // 2. 应用主题到 HTML 文档根元素
  const applyTheme = (theme) => {
    console.log('applyTheme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
    // 将用户选择的主题存储到 localStorage
    localStorage.setItem('theme', theme);
    currentTheme.value = theme; // 更新 store 中的状态
  };

  // 3. Action (动作): 切换主题
  const toggleTheme = () => {
    applyTheme(currentTheme.value === 'light' ? 'dark' : 'light');
  };

  // 4. Action (动作): 设置特定主题 (可选)
  const setTheme = (themeName) => {
    applyTheme(themeName);
  };

  // 5. 初始化主题：当 store 创建或应用挂载时执行
  // 这个 onMounted 会在组件中首次调用 useThemeStore 时，或者在 main.js 中更早地初始化时执行
  const initializeTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      applyTheme(storedTheme);
    } else {
      // 可选：检查操作系统偏好设置
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  };

  // 确保主题在应用加载时尽快初始化
  // 如果你在 main.js 中没有提前初始化，这里调用一次
  onMounted(() => {
    initializeTheme();
  });

  return {
    currentTheme,
    toggleTheme,
    setTheme,
    applyTheme, // 暴露此方法，以便在外部（如 main.js）进行初始化
    initializeTheme, // 暴露初始化方法
  };
});