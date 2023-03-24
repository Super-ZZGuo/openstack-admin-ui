import request from '@/utils/request'

// 查询SysNetwork列表
export function listSysFlavor(query) {
  return request({
    url: '/api/v1/sys-flavor',
    method: 'get',
    params: query
  })
}

// 查询SysNetwork详细
export function getSysFlavor(networkId) {
  return request({
    url: '/api/v1/sys-flavor/' + networkId,
    method: 'get'
  })
}

// 新增SysNetwork
export function addSysFlavor(data) {
  return request({
    url: '/api/v1/sys-flavor',
    method: 'post',
    data: data
  })
}

// 删除SysNetwork
export function delSysFlavor(data) {
  return request({
    url: '/api/v1/sys-flavor',
    method: 'delete',
    data: data
  })
}

