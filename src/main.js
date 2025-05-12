import { createApp } from 'vue'
import { createPinia } from 'pinia'
// import 'inspira-ui/dist/style.css'; 
import App from './App.vue'
import router from './router'
// 引入 Element Plus 及其样式
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/css/main.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)
// 添加 Element Plus 插件
app.use(ElementPlus);

app.mount('#app')
