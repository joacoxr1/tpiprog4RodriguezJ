import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from '../types/categoria.types'

export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>('/categorias')
  return data
}

export async function crearCategoria(
  payload: CategoriaCreate
): Promise<Categoria> {
  const { data } = await axiosInstance.post<Categoria>('/categorias', payload)
  return data
}

export async function actualizarCategoria(
  id: number,
  payload: CategoriaUpdate
): Promise<Categoria> {
  const { data } = await axiosInstance.put<Categoria>(
    `/categorias/${id}`,
    payload
  )
  return data
}

export async function anularCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`)
}