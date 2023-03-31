import request from '@/utils/request'

// 查询SysProject详细
export function getUseProject(query) {
  return request({
    url: '/api/v1/use-range',
    method: 'get',
    params: query
  })
}
