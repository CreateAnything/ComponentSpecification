import { setupRouter } from '@/router/index'
import { setupPinia } from '@/store/index'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
const app = createApp(App)
setupRouter(app) //使用路由
setupPinia(app) //使用pinia
app.mount('#app')
