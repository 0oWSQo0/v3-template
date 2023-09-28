import request from '@/utils/request'

// 查询调度日志列表
export function listJobLog(params?: any) {
  return request({ url: '/monitor/jobLog/list', params })
}
// 删除调度日志
export function delJobLog(jobLogId: any) {
  return request({ url: '/monitor/jobLog/' + jobLogId, method: 'delete' })
}
// 清空调度日志
export function cleanJobLog() {
  return request({ url: '/monitor/jobLog/clean', method: 'delete' })
}
