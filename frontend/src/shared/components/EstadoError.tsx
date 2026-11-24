import { Button } from '../ui/Button'

interface EstadoErrorProps {
  mensaje?: string
  onRetry?: () => void
}

export function EstadoError({
  mensaje = 'Ocurrio un error al cargar los datos.',
  onRetry,
}: EstadoErrorProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-medium text-red-700">{mensaje}</p>
      {onRetry && (
        <Button variant="danger" className="mt-3" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}