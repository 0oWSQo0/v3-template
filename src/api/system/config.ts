import request from '@/utils/request'

// 查询列表
export function listConfig(params: any) {
  return request({ url: '/system/config/list', params })
}
// 查询详细
export function getConfig(configId: any) {
  return request({ url: '/system/config/' + configId })
}
// 根据参数键名查询参数值
export function getConfigKey(configKey: any) {
  return request({ url: '/system/config/configKey/' + configKey })
}
// 新增
export function addConfig(data: any) {
  return request({ url: '/system/config', method: 'post', data })
}
// 修改
export function updateConfig(data: any) {
  return request({ url: '/system/config', method: 'put', data })
}
// 删除
export function delConfig(configId: any) {
  return request({ url: '/system/config/' + configId, method: 'delete' })
}
// 刷新参数缓存
export function refreshCache() {
  return request({ url: '/system/config/refreshCache', method: 'delete' })
}
