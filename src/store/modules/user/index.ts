import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UserInfo } from './type'

const userStore = defineStore('user', () => {
  const token = ref<string>('1213')
  const userInfo = ref<UserInfo>()
  return {
    token,
    userInfo
  }
})
export default userStore
export type UserStore = ReturnType<typeof userStore>
