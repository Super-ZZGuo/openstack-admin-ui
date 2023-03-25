import request from '@/utils/request'

// 查询SysProject列表
export function listSysProject(query) {
  return request({
    url: '/api/v1/sys-project',
    method: 'get',
    params: query
  })
}

// 查询SysProject详细
export function getSysProject(Id) {
  return request({
    url: '/api/v1/sys-project/' + Id,
    method: 'get'
  })
}

// 新增SysProject
export function addSysProject(data) {
  return request({
    url: '/api/v1/sys-project',
    method: 'post',
    data: data
  })
}

// 修改SysProject
export function updateSysProject(id, data) {
  return request({
    url: '/api/v1/sys-project/' + id,
    method: 'put',
    data: data
  })
}

// 删除SysProject
export function delSysProject(data) {
  return request({
    url: '/api/v1/sys-project',
    method: 'delete',
    data: data
  })
}

//* ************************************raneg */

// 查询SysRange列表
export function listSysRange(query) {
  return request({
    url: '/api/v1/sys-range',
    method: 'get',
    params: query
  })
}

// 查询SysRange详细
export function getSysRange(Id) {
  return request({
    url: '/api/v1/sys-range/' + Id,
    method: 'get'
  })
}

// 新增SysRange
export function addSysRange(data) {
  return request({
    url: '/api/v1/sys-range',
    method: 'post',
    data: data
  })
}

// 修改SysRange
export function updateSysRange(id, data) {
  return request({
    url: '/api/v1/sys-range/' + id,
    method: 'put',
    data: data
  })
}

// 删除SysRange
export function delSysRange(data) {
  return request({
    url: '/api/v1/sys-range',
    method: 'delete',
    data: data
  })
}
