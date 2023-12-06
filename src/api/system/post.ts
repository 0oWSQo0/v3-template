import request from '@/utils/request'

// 查询列表
export function listPost(params: any) {
  return request({ url: '/system/post/list', params })
}
// 查询详细
export function getPost(postId: any) {
  return request({ url: '/system/post/' + postId })
}
// 新增岗位
export function addPost(data: any) {
  return request({ url: '/system/post', method: 'post', data })
}
// 修改岗位
export function updatePost(data: any) {
  return request({ url: '/system/post', method: 'put', data })
}
// 删除
export function delPost(postId: any) {
  return request({ url: '/system/post/' + postId, method: 'delete' })
}
