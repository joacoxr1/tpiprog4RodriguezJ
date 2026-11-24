type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'

interface BadgeEstadoProps {
  estado: EstadoPedido | string
}

const estilos: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 border-amber-200',
  EN_PREPARACION: 'bg-blue-100 text-blue-800 border-blue-200',
  ENTREGADO: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELADO: 'bg-red-100 text-red-800 border-red-200',
}

const etiquetas: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const color = estilos[estado] ?? 'bg-slate-100 text-slate-700 border-slate-200'
  const label = etiquetas[estado] ?? estado

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  )
}