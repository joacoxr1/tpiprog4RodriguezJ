import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { RegisterPayload, Usuario } from '../types/auth.types'

export async function registerUsuario(
  payload: RegisterPayload
): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>('/auth/register', payload)
  return data
}