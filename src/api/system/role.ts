import request from '@/utils/request'

// 查询列表
export function listRole(params: any) {
  return request({ url: '/system/role/list', params })
}
// 查询详细
export function getRole(roleId: any) {
  return request({ url: '/system/role/' + roleId })
}
// 新增
export function addRole(data: any) {
  return request({ url: '/system/role', method: 'post', data })
}
// 修改
export function updateRole(data: any) {
  return request({ url: '/system/role', method: 'put', data })
}
// 角色数据权限
export function dataScope(data: any) {
  return request({ url: '/system/role/dataScope', method: 'put', data })
}
// 角色状态修改
export function changeRoleStatus(roleId: any, status: any) {
  const data = { roleId, status }
  return request({ url: '/system/role/changeStatus', method: 'put', data })
}
// 删除
export function delRole(roleId: any) {
  return request({ url: '/system/role/' + roleId, method: 'delete' })
}
// 查询角色已授权用户列表
export function allocatedUserList(params: any) {
  return request({ url: '/system/role/authUser/allocatedList', params })
}
// 查询角色未授权用户列表
export function unallocatedUserList(params: any) {
  return request({ url: '/system/role/authUser/unallocatedList', params })
}
// 取消用户授权角色
export function authUserCancel(data: any) {
  return request({ url: '/system/role/authUser/cancel', method: 'put', data })
}
// 批量取消用户授权角色
export function authUserCancelAll(params: any) {
  return request({ url: '/system/role/authUser/cancelAll', method: 'put', params })
}
// 授权用户选择
export function authUserSelectAll(params: any) {
  return request({ url: '/system/role/authUser/selectAll', method: 'put', params })
}
// 根据角色ID查询部门树结构
export function deptTreeSelect(roleId: any) {
  return request({ url: '/system/role/deptTree/' + roleId })
}
