import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { axiosInstance, setOnUnauthorized } from '../shared/api/axiosInstance'
import type { Usuario } from '../features/auth/types/auth.types'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username: string, password: string) => {
        const formData = new URLSearchParams()
        formData.append('username', username)
        formData.append('password', password)

        await axiosInstance.post('/auth/token', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })

        const { data } = await axiosInstance.get<Usuario>('/auth/me')
        set({ usuario: data, cargando: false })
      },

      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout')
        } finally {
          set({ usuario: null, cargando: false })
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          const { data } = await axiosInstance.get<Usuario>('/auth/me')
          set({ usuario: data, cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },

      clearSession: () => {
        set({ usuario: null, cargando: false })
      },
    }),
    {
      name: 'food-store-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
)

setOnUnauthorized(() => {
  useAuthStore.getState().clearSession()
})