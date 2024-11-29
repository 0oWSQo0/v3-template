import request from '@/utils/request'

// 登录方法
export function login(data: any) {
  return request({
    url: '/login',
    headers: {
      isToken: false
    },
    method: 'post',
    data
  })
}

// 注册方法
export function register(data: any) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({ url: '/getInfo' })
}

// 退出方法
export function logout() {
  return request({ url: '/logout', method: 'post' })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    headers: {
      isToken: false
    },
    timeout: 20000
  })
}
// 获取随机数
export function randomString16(params: any) {
  return request({ url: '/security/randomString16', params })
}

export function isNeedKey() {
  return request({
    url: '/security/isNeedKey',
    headers: {
      isToken: false
    }
  })
}
// cloud模式接口
// import request from '@/utils/request'

// // 登录方法
// export function login(data: any) {
//   return request({
//     url: '/auth/login',
//     headers: {
//       isToken: false
//     },
//     method: 'post',
//     data
//   })
// }

// // 注册方法
// export function register(data: any) {
//   return request({
//     url: '/auth/register',
//     headers: {
//       isToken: false
//     },
//     method: 'post',
//     data
//   })
// }

// // 刷新方法
// export function refreshToken() {
//   return request({ url: '/auth/refresh', method: 'post' })
// }
// // 获取用户详细信息
// export function getInfo() {
//   return request({ url: '/system/user/getInfo' })
// }
// // 退出方法
// export function logout() {
//   return request({ url: '/auth/logout', method: 'delete' })
// }
// // 获取验证码
// export function getCodeImg() {
//   return request({
//     url: '/code',
//     headers: {
//       isToken: false
//     },
//     method: 'get',
//     timeout: 20000
//   })
// }
// // 获取登录方式
// export function getLoginType() {
//   return request({ url: '/auth/getLoginType' })
// }
// // 获取随机数
// export function randomString16(params: any) {
//   return request({ url: '/auth/randomString16', params })
// }
