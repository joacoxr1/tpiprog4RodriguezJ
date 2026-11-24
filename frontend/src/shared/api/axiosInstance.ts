import axios, { AxiosError } from 'axios'

let onUnauthorizedCallback: (() => void) | null = null

export function setOnUnauthorized(callback: () => void): void {
  onUnauthorizedCallback = callback
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

interface ApiErrorBody {
  detail?: string
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const detail = error.response?.data?.detail

    const isAuthEndpoint =
      url.includes('/auth/token') || url.includes('/auth/me')

    const isUnauthorized = status === 401 && !isAuthEndpoint
    const isAccountDisabled =
      status === 400 && detail === 'Cuenta de usuario desactivada'

    if (isUnauthorized || isAccountDisabled) {
      onUnauthorizedCallback?.()
    }

    return Promise.reject(error)
  }
)
