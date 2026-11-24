import { Modal } from '../../../shared/ui/Modal'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import type { Pedido } from '../types/pedido.types'

interface DetallePedidoModalProps {
  pedido: Pedido | null
  onClose: () => void
}

export function DetallePedidoModal({
  pedido,
  onClose,
}: DetallePedidoModalProps) {
  if (!pedido) return null

  return (
    <Modal open={Boolean(pedido)} title={`Pedido #${pedido.id}`} onClose={onClose}>
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <BadgeEstado estado={pedido.estado} />
          <span className="text-xs text-slate-500">
            {new Date(pedido.created_at).toLocaleString('es-AR')}
          </span>
        </div>

        <div className="space-y-1 text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Direccion:</span>{' '}
            {pedido.direccion_entrega}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Forma de pago:</span>{' '}
            {pedido.forma_pago}
          </p>
          {pedido.notas && (
            <p>
              <span className="font-semibold text-slate-900">Notas:</span>{' '}
              {pedido.notas}
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Producto</th>
                <th className="px-3 py-2 text-right font-semibold">Cant</th>
                <th className="px-3 py-2 text-right font-semibold">Precio</th>
                <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pedido.items.map((item) => (
                <tr key={item.producto_id}>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {item.nombre_producto}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-600">
                    {item.cantidad}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-600">
                    ${item.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-slate-900">
                    ${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-base font-bold text-slate-900">Total</span>
          <span className="text-lg font-bold text-orange-600">
            ${pedido.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}