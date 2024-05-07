import request from '@/utils/request'

// 查询操作日志列表
export function listOperlog(params: any) {
  return request({ url: '/monitor/operlog/list', params })
}
// 删除操作日志
export function delOperlog(operId: any) {
  return request({ url: '/monitor/operlog/' + operId, method: 'delete' })
}
// 清空操作日志
export function cleanOperlog() {
  return request({ url: '/monitor/operlog/clean', method: 'delete' })
}
