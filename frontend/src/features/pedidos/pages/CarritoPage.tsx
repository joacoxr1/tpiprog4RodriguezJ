import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { useAuthStore } from '../../../store/authStore'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'

export function CarritoPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const quitar = useCartStore((s) => s.quitar)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const vaciar = useCartStore((s) => s.vaciar)
  const usuario = useAuthStore((s) => s.usuario)

  const total = items.reduce(
    (acc, item) => acc + item.precio_unitario * item.cantidad,
    0
  )

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Tu carrito</h1>
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Agregá productos desde el catálogo para armar tu pedido."
        />
        <div className="flex justify-center">
          <Button onClick={() => navigate('/')}>Ir al catálogo</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tu carrito</h1>
          <p className="text-sm text-slate-500">
            Recuerde revisar las cantidades antes del checkout.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            if (window.confirm('¿Seguro quieres vaciar todo el carrito?')) {
              vaciar()
            }
          }}
        >
          Vaciar carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="divide-y divide-slate-200 p-0 lg:col-span-2">
          {items.map((item) => {
            const subtotal = item.precio_unitario * item.cantidad
            return (
              <div
                key={item.producto_id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{item.nombre}</p>
                  <p className="text-sm text-slate-500">
                    $
                    {item.precio_unitario.toLocaleString('es-AR', {
                      minimumFractionDigits: 2,
                    })}{' '}
                    c/u
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad - 1)
                    }
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold text-slate-900">
                    {item.cantidad}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad + 1)
                    }
                  >
                    +
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-24 text-right font-semibold text-slate-900">
                    $
                    {subtotal.toLocaleString('es-AR', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <Button
                    variant="danger"
                    onClick={() => quitar(item.producto_id)}
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            )
          })}
        </Card>

        <Card className="flex h-fit flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-900">Resumen</h2>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-sm font-medium text-slate-600">Total</span>
            <span className="text-xl font-bold text-orange-600">
              ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <Button className="w-full" onClick={() => navigate('/checkout')}>
            {usuario ? 'Continuar al checkout' : 'Iniciar sesión y pagar'}
          </Button>

          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate('/')}
          >
            Seguir comprando
          </Button>
        </Card>
      </div>
    </div>
  )
}