import request from '@/utils/request'

// 查询SysNetwork列表
export function listSysNetwork(query) {
  return request({
    url: '/api/v1/sys-network',
    method: 'get',
    params: query
  })
}

// 查询SysNetwork详细
export function getSysNetwork(networkId) {
  return request({
    url: '/api/v1/sys-network/' + networkId,
    method: 'get'
  })
}

// 新增SysNetwork
export function addSysNetwork(data) {
  return request({
    url: '/api/v1/sys-network',
    method: 'post',
    data: data
  })
}

// 修改SysNetwork
export function updateSysNetwork(id, data) {
  return request({
    url: '/api/v1/sys-network/' + id,
    method: 'put',
    data: data
  })
}

// 删除SysNetwork
export function delSysNetwork(data) {
  return request({
    url: '/api/v1/sys-network',
    method: 'delete',
    data: data
  })
}

