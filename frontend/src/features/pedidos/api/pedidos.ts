import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
  CambioEstado,
  Pedido,
  PedidoCreate,
  PedidosFiltros,
  PedidosPaginados,
  ResumenPedidos,
} from '../types/pedido.types'

export async function listarPedidos(
  filtros: PedidosFiltros = {}
): Promise<PedidosPaginados> {
  const params: Record<string, string | number> = {}
  if (filtros.skip !== undefined) params.skip = filtros.skip
  if (filtros.limit !== undefined) params.limit = filtros.limit
  if (filtros.estado) params.estado = filtros.estado

  const { data } = await axiosInstance.get<PedidosPaginados>('/pedidos', {
    params,
  })
  return data
}

export async function obtenerPedido(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.get<Pedido>(`/pedidos/${id}`)
  return data
}

export async function crearPedido(payload: PedidoCreate): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>('/pedidos', payload)
  return data
}

export async function cambiarEstadoPedido(
  id: number,
  payload: CambioEstado
): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(
    `/pedidos/${id}/estado`,
    payload
  )
  return data
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`)
  return data
}

export async function obtenerResumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen')
  return data
}