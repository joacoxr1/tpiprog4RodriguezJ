import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { UsuarioAdmin } from '../types/usuario.types'

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const { data } = await axiosInstance.get<UsuarioAdmin[]>('/admin/usuarios')
  return data
}

export async function activarUsuario(id: number): Promise<UsuarioAdmin> {
  const { data } = await axiosInstance.post<UsuarioAdmin>(
    `/admin/usuarios/${id}/activar`
  )
  return data
}

export async function desactivarUsuario(id: number): Promise<UsuarioAdmin> {
  const { data } = await axiosInstance.post<UsuarioAdmin>(
    `/admin/usuarios/${id}/desactivar`
  )
  return data
}