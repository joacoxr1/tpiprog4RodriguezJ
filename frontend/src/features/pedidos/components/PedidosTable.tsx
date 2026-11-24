import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import type { EstadoPedido, Pedido } from '../types/pedido.types'

interface PedidosTableProps {
  pedidos: Pedido[]
  modo: 'cliente' | 'admin'
  procesando?: boolean
  onVerDetalle: (pedido: Pedido) => void
  onCancelar?: (pedido: Pedido) => void
  onCambiarEstado?: (pedido: Pedido, nuevoEstado: EstadoPedido) => void
}

const columnHelper = createColumnHelper<Pedido>()

const TRANSICIONES_ADMIN: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

export function PedidosTable({
  pedidos,
  modo,
  procesando = false,
  onVerDetalle,
  onCancelar,
  onCambiarEstado,
}: PedidosTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Pedido',
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-slate-700">
            #{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('created_at', {
        header: 'Fecha',
        cell: (info) => (
          <span className="text-xs text-slate-600">
            {new Date(info.getValue()).toLocaleString('es-AR')}
          </span>
        ),
      }),
      columnHelper.accessor('direccion_entrega', {
        header: 'Entrega / Pago',
        cell: ({ row }) => (
          <div>
            <p className="max-w-xs truncate font-medium text-slate-900">
              {row.original.direccion_entrega}
            </p>
            <p className="text-xs text-slate-500">{row.original.forma_pago}</p>
          </div>
        ),
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="font-semibold text-slate-900">
            ${info.getValue().toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        ),
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => <BadgeEstado estado={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const pedido = row.original
          const siguientes = TRANSICIONES_ADMIN[pedido.estado] ?? []

          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => onVerDetalle(pedido)}>
                Ver detalle
              </Button>

              {modo === 'cliente' &&
                pedido.estado === 'PENDIENTE' &&
                onCancelar && (
                  <Button
                    variant="danger"
                    disabled={procesando}
                    onClick={() => onCancelar(pedido)}
                  >
                    Cancelar
                  </Button>
                )}

              {modo === 'admin' &&
                siguientes.length > 0 &&
                onCambiarEstado && (
                  <select
                    aria-label={`Cambiar estado del pedido #${pedido.id}`}
                    defaultValue=""
                    disabled={procesando}
                    onChange={(e) => {
                      const nuevo = e.target.value as EstadoPedido | ''
                      if (!nuevo) return
                      onCambiarEstado(pedido, nuevo)
                      e.target.value = ''
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-orange-500"
                  >
                    <option value="">Cambiar estado.</option>
                    {siguientes.map((est) => (
                      <option key={est} value={est}>
                        {est.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                )}
            </div>
          )
        },
      }),
    ],
    [modo, onCambiarEstado, onCancelar, onVerDetalle, procesando]
  )

  const table = useReactTable({
    data: pedidos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 font-semibold">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}