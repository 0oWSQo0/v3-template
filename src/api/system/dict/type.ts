import request from '@/utils/request'

// 查询列表
export function listType(params: any) {
  return request({ url: '/system/dict/type/list', params })
}
// 查询详细
export function getType(dictId: any) {
  return request({ url: '/system/dict/type/' + dictId })
}
// 新增
export function addType(data: any) {
  return request({ url: '/system/dict/type', method: 'post', data })
}
// 修改
export function updateType(data: any) {
  return request({ url: '/system/dict/type', method: 'put', data })
}
// 删除
export function delType(dictId: any) {
  return request({ url: '/system/dict/type/' + dictId, method: 'delete' })
}
// 刷新字典缓存
export function refreshCache() {
  return request({ url: '/system/dict/type/refreshCache', method: 'delete' })
}
// 获取字典选择框列表
export function optionselect() {
  return request({ url: '/system/dict/type/optionselect' })
}
