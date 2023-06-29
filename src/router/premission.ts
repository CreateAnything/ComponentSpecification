import { Router } from 'vue-router'

export function createRouterGuards(router: Router) {
  router.beforeEach((to, form, next) => {
    next()
  })
}
