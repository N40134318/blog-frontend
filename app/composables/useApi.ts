import type { ApiResponse } from '~/types/api'

export const useApi = () => {
  return async <T>(url: string, options: any = {}) => {
    const token = import.meta.client ? localStorage.getItem('token') : null

    const headers: Record<string, string> = {
      ...(options.headers || {})
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await $fetch<ApiResponse<T>>(`https://dev.rainstorm.space${url}`, {
      ...options,
      headers
    })

    if (res.code !== 200) {
      throw new Error(res.message || '请求失败')
    }

    return res.data
  }
}