export type UserRole = 'user' | 'admin'

export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: UserRole
  disabled: boolean
  created_at: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  full_name: string
  email: string
  password: string
}