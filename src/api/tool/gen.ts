import request from '@/utils/request'

// 查询生成表数据
export function listTable(params?: any) {
  return request({ url: '/tool/gen/list', params })
}
// 查询db数据库列表
export function listDbTable(params?: any) {
  return request({ url: '/tool/gen/db/list', params })
}
// 查询表详细信息
export function getGenTable(tableId: any) {
  return request({ url: '/tool/gen/' + tableId })
}
// 修改代码生成信息
export function updateGenTable(data: any) {
  return request({ url: '/tool/gen', method: 'put', data })
}
// 导入表
export function importTable(params?: any) {
  return request({ url: '/tool/gen/importTable', method: 'post', params })
}
// 预览生成代码
export function previewTable(tableId: any) {
  return request({ url: '/tool/gen/preview/' + tableId })
}
// 删除表数据
export function delTable(tableId: any) {
  return request({ url: '/tool/gen/' + tableId, method: 'delete' })
}
// 生成代码（自定义路径）
export function genCode(tableName: any) {
  return request({ url: '/tool/gen/genCode/' + tableName })
}
// 同步数据库
export function synchDb(tableName: any) {
  return request({ url: '/tool/gen/synchDb/' + tableName })
}
