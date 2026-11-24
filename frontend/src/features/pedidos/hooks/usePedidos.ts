import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  listarPedidos,
  obtenerResumenPedidos,
} from '../api/pedidos'
import { PRODUCTOS_QUERY_KEY } from '../../productos/hooks/useProductos'
import type {
  CambioEstado,
  PedidoCreate,
  PedidosFiltros,
} from '../types/pedido.types'

export const PEDIDOS_QUERY_KEY = ['pedidos'] as const
export const RESUMEN_PEDIDOS_QUERY_KEY = ['pedidos', 'resumen'] as const

export function usePedidos(filtros: PedidosFiltros = {}) {
  return useQuery({
    queryKey: [...PEDIDOS_QUERY_KEY, filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: RESUMEN_PEDIDOS_QUERY_KEY,
    queryFn: obtenerResumenPedidos,
  })
}

export function useCrearPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PedidoCreate) => crearPedido(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEY })
    },
  })
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CambioEstado }) =>
      cambiarEstadoPedido(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEY })
    },
  })
}

export function useCancelarPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEY })
    },
  })
}