import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { defineStore } from 'pinia'

const useUserStore = defineStore('user', {
  state: (): {
    token?: string
    userInfo: any
    roles: any[]
    permissions: string[]
  } => ({
    token: getToken(),
    userInfo: {},
    roles: [],
    permissions: []
  }),
  actions: {
    // 登录
    login(userInfo: any) {
      userInfo.username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login(userInfo)
          .then((res: any) => {
            setToken(res.token)
            this.token = res.token
            resolve(1)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res: any) => {
            if (res.roles && res.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              this.roles = res.roles
              this.permissions = res.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.userInfo = res.user
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    // 退出系统
    logOut() {
      return new Promise((resolve, reject) => {
        logout()
          .then(() => {
            this.token = ''
            this.roles = []
            this.permissions = []
            removeToken()
            resolve(1)
          })
          .catch(error => {
            reject(error)
          })
      })
    }
  }
})

export default useUserStore
