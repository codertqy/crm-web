// utils/upload.ts
import axios from 'axios'

export const uploadFile = async (formData: FormData) => {
  const res = await axios.post('/api/upload', formData)
  return res // 返回 { data: ... }
}

export const uploadVideo = async (formData: FormData) => {
  const res = await axios.post('/api/upload', formData)
  return res // 返回 { data: ... }
}
