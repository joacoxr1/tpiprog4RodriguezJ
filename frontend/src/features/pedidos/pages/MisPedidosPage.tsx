import { useState } from 'react'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import { PedidosTable } from '../components/PedidosTable'
import { DetallePedidoModal } from '../components/DetallePedidoModal'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { handleApiError } from '../../../shared/api/handleApiError'
import type { EstadoPedido, Pedido } from '../types/pedido.types'

const LIMIT = 10

export function MisPedidosPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | ''>('')
  const [pagina, setPagina] = useState(0)
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null
  )
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    estado: estadoFiltro || undefined,
  })
  const cancelar = useCancelarPedido()

  const items = data?.items ?? []
  const total = data?.total ?? 0

  const handleCancelar = async (pedido: Pedido) => {
    const confirmado = window.confirm(
      `¿Seguro que querés cancelar el pedido #${pedido.id}?`
    )
    if (!confirmado) return

    setActionError(null)
    try {
      await cancelar.mutateAsync(pedido.id)
    } catch (err) {
      setActionError(handleApiError(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis pedidos</h1>
          <p className="text-sm text-slate-500">
            Segui el estado de tus compras y consultar el detalle.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="mis-pedidos-estado"
            className="text-xs font-medium text-slate-600"
          >
            Filtrar por estado
          </label>
          <select
            id="mis-pedidos-estado"
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value as EstadoPedido | '')
              setPagina(0)
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PREPARACION">En preparacion</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <Skeleton cantidad={3} className="h-20" />
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onRetry={() => void refetch()}
        />
      ) : items.length === 0 ? (
        <EstadoVacio
          titulo="No tenes pedidos registrados"
        />
      ) : (
        <>
          <PedidosTable
            pedidos={items}
            modo="cliente"
            procesando={cancelar.isPending}
            onVerDetalle={setPedidoSeleccionado}
            onCancelar={(p) => void handleCancelar(p)}
          />

          <Paginacion
            pagina={pagina}
            total={total}
            limit={LIMIT}
            onPageChange={setPagina}
          />
        </>
      )}

      <DetallePedidoModal
        pedido={pedidoSeleccionado}
        onClose={() => setPedidoSeleccionado(null)}
      />
    </div>
  )
}