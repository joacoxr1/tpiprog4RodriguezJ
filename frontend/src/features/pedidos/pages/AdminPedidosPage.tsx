import { useState } from 'react'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { PedidosTable } from '../components/PedidosTable'
import { DetallePedidoModal } from '../components/DetallePedidoModal'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { handleApiError } from '../../../shared/api/handleApiError'
import type { EstadoPedido, Pedido } from '../types/pedido.types'

const LIMIT = 10

export function AdminPedidosPage() {
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
  const cambiarEstado = useCambiarEstadoPedido()

  const items = data?.items ?? []
  const total = data?.total ?? 0

  const handleCambiarEstado = async (
    pedido: Pedido,
    nuevoEstado: EstadoPedido
  ) => {
    const confirmado = window.confirm(
      `¿Cambiar el pedido #${pedido.id} a estado "${nuevoEstado.replace('_', ' ')}"?`
    )
    if (!confirmado) return

    setActionError(null)
    try {
      await cambiarEstado.mutateAsync({
        id: pedido.id,
        payload: { estado: nuevoEstado },
      })
    } catch (err) {
      setActionError(handleApiError(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestion de pedidos
          </h1>
          <p className="text-sm text-slate-500">
            Controle todos los pedidos y actualice su estado.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="admin-pedidos-estado"
            className="text-xs font-medium text-slate-600"
          >
            Filtrar por estado
          </label>
          <select
            id="admin-pedidos-estado"
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
          titulo="No hay pedidos para mostrar"
          descripcion="Pruebe en cambiar el filtro de estado."
        />
      ) : (
        <>
          <PedidosTable
            pedidos={items}
            modo="admin"
            procesando={cambiarEstado.isPending}
            onVerDetalle={setPedidoSeleccionado}
            onCambiarEstado={(p, est) => void handleCambiarEstado(p, est)}
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