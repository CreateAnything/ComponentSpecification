import { createPinia } from 'pinia'
import { App } from 'vue'
import user from './modules/user/index'

//pinia注册方法
const setupPinia = (app: App) => {
  const pinia = createPinia()
  app.use(pinia)
}

//暴露全部store实列
const Store = {
  user
}

export { Store, setupPinia }
