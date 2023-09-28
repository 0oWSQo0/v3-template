import request from '@/utils/request'

// 获取路由
export const getRouters = () => {
  return request({
    url: '/getRouters',
    method: 'get'
  })
}

// cloud模式
// export const getRouters = () => {
//   return request({ url: '/system/menu/getRouters' })
// }