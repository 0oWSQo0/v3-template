import request from '@/utils/request'

// 获取路由
export const getRouters = () => {
  return request({ url: '/getRouters' })
}

// cloud模式
// export const getRouters = () => {
//   return request({ url: '/system/menu/getRouters' })
// }
