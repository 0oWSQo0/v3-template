import request from '@/utils/request'

// 查询列表
export function listDept(params?: any) {
  return request({ url: '/system/dept/list', params })
}
// 查询部门列表（排除节点）
export function listDeptExcludeChild(deptId: any) {
  return request({ url: '/system/dept/list/exclude/' + deptId })
}
// 查询详细
export function getDept(deptId: any) {
  return request({ url: '/system/dept/' + deptId })
}
// 新增
export function addDept(data: any) {
  return request({ url: '/system/dept', method: 'post', data })
}
// 修改
export function updateDept(data: any) {
  return request({ url: '/system/dept', method: 'put', data })
}
// 删除
export function delDept(deptId: any) {
  return request({ url: '/system/dept/' + deptId, method: 'delete' })
}
