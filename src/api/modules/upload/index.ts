import { COMMON_ADMIN_API } from '@/api/axios/servicePort'
import http from '@/api'

export const uploadFile = async (formData: FormData) => {
  return http.post(COMMON_ADMIN_API + '/common/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const uploadVideo = async (formData: FormData) => {
  return formData
}
