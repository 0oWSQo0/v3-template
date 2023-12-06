import request from '@/utils/request'

// 查询字典数据列表
export function listData(params: any) {
  return request({ url: '/system/dict/data/list', params })
}
// 查询字典数据详细
export function getData(dictCode: any) {
  return request({ url: '/system/dict/data/' + dictCode })
}
// 根据字典类型查询字典数据信息
export function getDicts(dictType: any) {
  return request({ url: '/system/dict/data/type/' + dictType })
}
// 新增字典数据
export function addData(data: any) {
  return request({ url: '/system/dict/data', method: 'post', data })
}
// 修改字典数据
export function updateData(data: any) {
  return request({ url: '/system/dict/data', method: 'put', data })
}
// 删除字典数据
export function delData(dictCode: any) {
  return request({ url: '/system/dict/data/' + dictCode, method: 'delete' })
}
