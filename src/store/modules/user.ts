import { login, logout, getInfo } from '@/api/login'
import { setToken, removeToken } from '@/utils/auth'
import { defineStore } from 'pinia'

const useUserStore = defineStore('user', {
  state: (): any => ({
    userInfo: {},
    roles: [],
    permissions: []
  }),
  actions: {
    // 登录
    async login(userInfo: any) {
      userInfo.username = userInfo.username.trim()
      try {
        const res: any = await login(userInfo)
        setToken(res.token)
        return Promise.resolve(res)
      } catch(e) {
        return Promise.reject(e)
      }
    },
    // 获取用户信息
    async getInfo() {
      try {
        const res: any = await getInfo()
        if (res.roles && res.roles.length > 0) {
          // 验证返回的roles是否是一个非空数组
          this.roles = res.roles
          this.permissions = res.permissions
        } else {
          this.roles = ['ROLE_DEFAULT']
        }
        this.userInfo = res.user
        return Promise.resolve(res)
      } catch(e) {
        return Promise.reject(e)
      }
    },
    // 退出系统
    async logOut() {
      try {
        await logout()
        this.roles = []
        this.permissions = []
        removeToken()
        return Promise.resolve(1)
      } catch(e) {
        return Promise.reject(e)
      }
    }
  }
})

export default useUserStore
