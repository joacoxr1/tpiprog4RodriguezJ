interface EstadoVacioProps {
  titulo?: string
  descripcion?: string
}

export function EstadoVacio({
  titulo = 'No hay resultados',
  descripcion = 'No hay elementos para mostrar.',
}: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <p className="text-base font-semibold text-slate-700">{titulo}</p>
      <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
    </div>
  )
}