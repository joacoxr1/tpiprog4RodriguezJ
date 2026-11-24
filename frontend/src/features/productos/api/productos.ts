import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
  Producto,
  ProductoCreate,
  ProductosFiltros,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto.types'

export async function listarProductos(
  filtros: ProductosFiltros = {}
): Promise<ProductosPaginados> {
  const params: Record<string, string | number | boolean> = {}

  if (filtros.skip !== undefined) params.skip = filtros.skip
  if (filtros.limit !== undefined) params.limit = filtros.limit
  if (filtros.search && filtros.search.trim() !== '') {
    params.search = filtros.search.trim()
  }
  if (filtros.categoria_id !== undefined) {
    params.categoria_id = filtros.categoria_id
  }
  if (filtros.disponible !== undefined) {
    params.disponible = filtros.disponible
  }

  const { data } = await axiosInstance.get<ProductosPaginados>('/productos', {
    params,
  })
  return data
}

export async function crearProducto(
  payload: ProductoCreate
): Promise<Producto> {
  const { data } = await axiosInstance.post<Producto>('/productos', payload)
  return data
}

export async function actualizarProducto(
  id: number,
  payload: ProductoUpdate
): Promise<Producto> {
  const { data } = await axiosInstance.put<Producto>(
    `/productos/${id}`,
    payload
  )
  return data
}

export async function actualizarStockProducto(
  id: number,
  payload: ProductoStockUpdate
): Promise<Producto> {
  const { data } = await axiosInstance.patch<Producto>(
    `/productos/${id}/stock`,
    payload
  )
  return data
}

export async function anularProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`)
}