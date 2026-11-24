import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarCategoria,
  anularCategoria,
  crearCategoria,
  listarCategorias,
} from '../api/categorias'
import type {
  CategoriaCreate,
  CategoriaUpdate,
} from '../types/categoria.types'

export const CATEGORIAS_QUERY_KEY = ['categorias'] as const

export function useCategorias() {
  return useQuery({
    queryKey: CATEGORIAS_QUERY_KEY,
    queryFn: listarCategorias,
  })
}

export function useCrearCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CategoriaCreate) => crearCategoria(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIAS_QUERY_KEY })
    },
  })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoriaUpdate }) =>
      actualizarCategoria(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIAS_QUERY_KEY })
    },
  })
}

export function useAnularCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => anularCategoria(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIAS_QUERY_KEY })
    },
  })
}