import request from '@/utils/request'

// 查询列表
export function listMenu(params?: any) {
  return request({ url: '/system/menu/list', params })
}
// 查询详细
export function getMenu(menuId: any) {
  return request({ url: '/system/menu/' + menuId })
}
// 查询菜单下拉树结构
export function treeselect() {
  return request({ url: '/system/menu/treeselect' })
}
// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId: any) {
  return request({ url: '/system/menu/roleMenuTreeselect/' + roleId })
}
// 新增
export function addMenu(data: any) {
  return request({ url: '/system/menu', method: 'post', data })
}
// 修改
export function updateMenu(data: any) {
  return request({ url: '/system/menu', method: 'put', data })
}
// 删除
export function delMenu(menuId: any) {
  return request({ url: '/system/menu/' + menuId, method: 'delete' })
}
