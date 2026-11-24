export interface UsuarioAdmin {
  id: number
  username: string
  full_name: string
  email: string
  role: 'admin' | 'cliente' | string
  disabled: boolean
  created_at: string
}