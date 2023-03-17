import request from '@/utils/request'

// 查询SysImage列表
export function listSysImage(query) {
  return request({
    url: '/api/v1/sys-image',
    method: 'get',
    params: query
  })
}

// 查询SysImage详细
export function getSysImage(imageId) {
  return request({
    url: '/api/v1/sys-image/' + imageId,
    method: 'get'
  })
}

// 新增SysImage
export function addSysImage(data) {
  return request({
    url: '/api/v1/sys-image',
    method: 'post',
    data: data
  })
}

// 修改SysImage
export function updateSysImage(data) {
  return request({
    url: '/api/v1/sys-image/' + data.imageId,
    method: 'put',
    data: data
  })
}

// 删除SysImage
export function delSysImage(data) {
  return request({
    url: '/api/v1/sys-image',
    method: 'delete',
    data: data
  })
}
