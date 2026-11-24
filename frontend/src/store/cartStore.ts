import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}

interface CartState {
  items: CartItem[]
  agregar: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void
  quitar: (producto_id: number) => void
  cambiarCantidad: (producto_id: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (nuevoItem, cantidad = 1) => {
        set((state) => {
          const existente = state.items.find(
            (i) => i.producto_id === nuevoItem.producto_id
          )
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === nuevoItem.producto_id
                  ? { ...i, cantidad: i.cantidad + cantidad }
                  : i
              ),
            }
          }
          return {
            items: [...state.items, { ...nuevoItem, cantidad }],
          }
        })
      },

      quitar: (producto_id) => {
        set((state) => ({
          items: state.items.filter((i) => i.producto_id !== producto_id),
        }))
      },

      cambiarCantidad: (producto_id, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(producto_id)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === producto_id ? { ...i, cantidad } : i
          ),
        }))
      },

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (acc, item) => acc + item.precio_unitario * item.cantidad,
          0
        ),
    }),
    {
      name: 'food-store-cart',
    }
  )
)