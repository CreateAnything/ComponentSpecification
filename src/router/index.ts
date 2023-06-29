import { App } from 'vue'
import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import { createRouterGuards } from './premission'

const routes: RouteRecordRaw[] = []

const router = createRouter({
  history: createWebHistory(),
  routes
})

export function setupRouter(app: App) {
  createRouterGuards(router)
  app.use(router)
}
