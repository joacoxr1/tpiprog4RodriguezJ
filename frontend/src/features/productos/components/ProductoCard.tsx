import { useCartStore } from '../../../store/cartStore'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import type { Producto } from '../types/producto.types'

interface ProductoCardProps {
  producto: Producto
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar)
  const itemEnCarrito = useCartStore((s) =>
    s.items.find((i) => i.producto_id === producto.id)
  )

  const cantidadEnCarrito = itemEnCarrito?.cantidad ?? 0
  const sinStock = !producto.disponible || producto.stock <= 0
  const limiteAlcanzado = cantidadEnCarrito >= producto.stock

  const handleAgregar = () => {
    if (sinStock || limiteAlcanzado) return
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
    })
  }

  return (
    <Card className="flex h-full flex-col justify-between gap-4 p-4">
      <div className="space-y-3">
        <div className="h-44 w-full overflow-hidden rounded-lg bg-slate-100">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              Sin imagen
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">
            {producto.nombre}
          </h3>
          {producto.categoria && (
            <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
              {producto.categoria.nombre}
            </span>
          )}
        </div>

        {producto.descripcion && (
          <p className="line-clamp-2 text-sm text-slate-600">
            {producto.descripcion}
          </p>
        )}
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">
            ${producto.precio_base.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
          <span
            className={`text-xs font-medium ${
              sinStock ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {sinStock ? 'No disponible' : `Stock: ${producto.stock}`}
          </span>
        </div>

        <Button
          className="w-full"
          disabled={sinStock || limiteAlcanzado}
          onClick={handleAgregar}
        >
          {sinStock
            ? 'Sin stock'
            : limiteAlcanzado
              ? `Maximo en carrito (${cantidadEnCarrito})`
              : cantidadEnCarrito > 0
                ? `Agregar otro (${cantidadEnCarrito} en carrito)`
                : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  )
}