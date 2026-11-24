import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from '../hooks/useUsuarios'
import { useAuthStore } from '../../../store/authStore'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { handleApiError } from '../../../shared/api/handleApiError'
import type { UsuarioAdmin } from '../types/usuario.types'

const columnHelper = createColumnHelper<UsuarioAdmin>()

export function AdminUsuariosPage() {
  const usuarioActual = useAuthStore((s) => s.usuario)
  const { data: usuarios = [], isLoading, isError, error, refetch } =
    useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const [actionError, setActionError] = useState<string | null>(null)

  const procesando = activar.isPending || desactivar.isPending

  const handleToggleEstado = async (user: UsuarioAdmin) => {
    const accion = user.disabled ? 'activar' : 'desactivar'
    const confirmado = window.confirm(
      `¿Seguro que querés ${accion} al usuario "${user.username}"?`
    )
    if (!confirmado) return

    setActionError(null)
    try {
      if (user.disabled) {
        await activar.mutateAsync(user.id)
      } else {
        await desactivar.mutateAsync(user.id)
      }
    } catch (err) {
      setActionError(handleApiError(err))
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <span className="font-mono text-xs text-slate-500">
            #{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('username', {
        header: 'Usuario',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-900">
              {row.original.username}
            </p>
            <p className="text-xs text-slate-500">{row.original.full_name}</p>
          </div>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => (
          <span className="text-slate-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('role', {
        header: 'Rol',
        cell: (info) => {
          const esAdmin = info.getValue() === 'admin'
          return (
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                esAdmin
                  ? 'border-orange-200 bg-orange-50 text-orange-700'
                  : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
            >
              {info.getValue()}
            </span>
          )
        },
      }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
              Desactivado
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Activo
            </span>
          ),
      }),
      columnHelper.accessor('created_at', {
        header: 'Alta',
        cell: (info) => (
          <span className="text-xs text-slate-500">
            {new Date(info.getValue()).toLocaleDateString('es-AR')}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const user = row.original
          const esMismoUsuario = usuarioActual?.id === user.id

          if (esMismoUsuario) {
            return (
              <span className="text-xs italic text-slate-400">Tu cuenta</span>
            )
          }

          return user.disabled ? (
            <Button
              variant="secondary"
              disabled={procesando}
              onClick={() => void handleToggleEstado(user)}
            >
              Activar
            </Button>
          ) : (
            <Button
              variant="danger"
              disabled={procesando}
              onClick={() => void handleToggleEstado(user)}
            >
              Desactivar
            </Button>
          )
        },
      }),
    ],
    [procesando, usuarioActual?.id]
  )

  const table = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
        <p className="text-sm text-slate-500">
          Consulte los usuarios y gestione el acceso.
        </p>
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
      ) : usuarios.length === 0 ? (
        <EstadoVacio
          titulo="No hay usuarios registrados"
          descripcion="No se encuentran cuentas en el sistema."
        />
      ) : (
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}