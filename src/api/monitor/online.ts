import request from '@/utils/request'

// 查询在线用户列表
export function list(params: any) {
  return request({ url: '/monitor/online/list', params })
}
// 强退用户
export function forceLogout(tokenId: any) {
  return request({ url: '/monitor/online/' + tokenId, method: 'delete' })
}
