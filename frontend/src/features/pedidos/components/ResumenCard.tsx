import { Card } from '../../../shared/ui/Card'

interface ResumenCardProps {
  titulo: string
  valor: string | number
  descripcion?: string
  accentClass?: string
}

export function ResumenCard({
  titulo,
  valor,
  descripcion,
  accentClass = 'text-slate-900',
}: ResumenCardProps) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {titulo}
      </span>
      <span className={`text-2xl font-bold ${accentClass}`}>{valor}</span>
      {descripcion && (
        <span className="text-xs text-slate-500">{descripcion}</span>
      )}
    </Card>
  )
}