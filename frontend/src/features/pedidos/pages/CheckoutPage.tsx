import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'
import {
  CheckoutForm,
  type CheckoutFormValues,
} from '../components/CheckoutForm'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { handleApiError } from '../../../shared/api/handleApiError'

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const [apiError, setApiError] = useState<string | null>(null)

  const total = items.reduce(
    (acc, item) => acc + item.precio_unitario * item.cantidad,
    0
  )

  const handleSubmit = async (values: CheckoutFormValues) => {
    setApiError(null)
    try {
      await crearPedido.mutateAsync({
        items: items.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
        })),
        forma_pago: values.forma_pago,
        direccion_entrega: values.direccion_entrega.trim(),
        notas: values.notas.trim() || null,
      })
      vaciar()
      navigate('/mis-pedidos', { replace: true })
    } catch (error) {
      setApiError(handleApiError(error))
    }
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        <EstadoVacio
          titulo="Sin productos en el carrito"
          descripcion="Agrege al menos un producto antes de confirmar un pedido."
        />
        <div className="flex justify-center">
          <Button onClick={() => navigate('/')}>Volver al catálogo</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Finalizar pedido</h1>
        <p className="text-sm text-slate-500">
          Complete los datos de entrega y elija como pagar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CheckoutForm apiError={apiError} onSubmit={handleSubmit} />
        </Card>

        <Card className="flex h-fit flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-900">Tu pedido</h2>

          <ul className="divide-y divide-slate-100 text-sm">
            {items.map((item) => (
              <li
                key={item.producto_id}
                className="flex items-center justify-between gap-2 py-2"
              >
                <span className="text-slate-700">
                  {item.cantidad}x {item.nombre}
                </span>
                <span className="font-medium text-slate-900">
                  $
                  {(item.precio_unitario * item.cantidad).toLocaleString(
                    'es-AR',
                    { minimumFractionDigits: 2 }
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="text-lg font-bold text-orange-600">
              ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}