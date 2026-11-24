import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  actualizarProducto,
  actualizarStockProducto,
  anularProducto,
  crearProducto,
  listarProductos,
} from '../api/productos'
import type {
  ProductoCreate,
  ProductosFiltros,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto.types'

export const PRODUCTOS_QUERY_KEY = ['productos'] as const

export function useProductos(filtros: ProductosFiltros = {}) {
  return useQuery({
    queryKey: [...PRODUCTOS_QUERY_KEY, filtros],
    queryFn: () => listarProductos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useCrearProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProductoCreate) => crearProducto(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEY })
    },
  })
}

export function useActualizarProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoUpdate }) =>
      actualizarProducto(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEY })
    },
  })
}

export function useActualizarStockProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ProductoStockUpdate
    }) => actualizarStockProducto(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEY })
    },
  })
}

export function useAnularProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => anularProducto(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEY })
    },
  })
}