import { useNavigate } from 'react-router-dom'
import { useResumenPedidos } from '../hooks/usePedidos'
import { ResumenCard } from '../components/ResumenCard'
import { Button } from '../../../shared/ui/Button'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'

export function AdminResumenPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch, isFetching } =
    useResumenPedidos()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Resumen de pedidos
          </h1>
          <p className="text-sm text-slate-500">
            Metrica general de actividad e ingresos.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {isFetching ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button onClick={() => navigate('/admin/pedidos')}>
            Ver pedidos
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton cantidad={6} className="h-28" />
      ) : isError || !data ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard
            titulo="Ingresos entregados"
            valor={`$${data.ingresos_entregados.toLocaleString('es-AR', {
              minimumFractionDigits: 2,
            })}`}
            descripcion="Total acumulado en pedidos entregados"
            accentClass="text-emerald-700"
          />
          <ResumenCard
            titulo="Pedidos de hoy"
            valor={data.pedidos_hoy}
            descripcion="Pedidos ingresados actual"
            accentClass="text-orange-600"
          />
          <ResumenCard
            titulo="Pendientes"
            valor={data.pendientes}
            descripcion="Esperando preparacion"
            accentClass="text-amber-600"
          />
          <ResumenCard
            titulo="En preparación"
            valor={data.en_preparacion}
            descripcion="Actualmente en cocina"
            accentClass="text-blue-700"
          />
          <ResumenCard
            titulo="Entregados"
            valor={data.entregados}
            descripcion="Pedidos finalizados con exito"
            accentClass="text-emerald-700"
          />
          <ResumenCard
            titulo="Cancelados"
            valor={data.cancelados}
            descripcion="Pedidos anulados"
            accentClass="text-red-600"
          />
        </div>
      )}
    </div>
  )
}