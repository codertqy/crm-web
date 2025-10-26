import http from '@/api'
import { COMMON_ADMIN_API } from '@/api/axios/servicePort'

/**
 * @name 商品管理
 */
export const ProductApi = {
  page: (params: any) => http.post(COMMON_ADMIN_API + '/product/page', params)
}
