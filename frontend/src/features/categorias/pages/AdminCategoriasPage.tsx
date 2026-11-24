import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  useAnularCategoria,
  useCategorias,
} from '../hooks/useCategorias'
import { CategoriaFormModal } from '../components/CategoriaFormModal'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { handleApiError } from '../../../shared/api/handleApiError'
import type { Categoria } from '../types/categoria.types'

const PAGE_SIZE = 10
const columnHelper = createColumnHelper<Categoria>()

export function AdminCategoriasPage() {
  const { data: categorias = [], isLoading, isError, error, refetch } =
    useCategorias()
  const anular = useAnularCategoria()

  const [modalOpen, setModalOpen] = useState(false)
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const abrirCrear = () => {
    setCategoriaSeleccionada(null)
    setModalOpen(true)
  }

  const abrirEditar = (categoria: Categoria) => {
    setCategoriaSeleccionada(categoria)
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
    setCategoriaSeleccionada(null)
  }

  const handleAnular = async (categoria: Categoria) => {
    const confirmado = window.confirm(
      `¿Seguro que deseas desactivar la categoria "${categoria.nombre}"?`
    )
    if (!confirmado) return

    setActionError(null)
    try {
      await anular.mutateAsync(categoria.id)
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
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => (
          <span className="font-medium text-slate-900">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: (info) => (
          <span className="text-slate-600">{info.getValue() ?? '—'}</span>
        ),
      }),
      columnHelper.accessor('activo', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Activa
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              Inactiva
            </span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const cat = row.original
          return (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => abrirEditar(cat)}>
                Editar
              </Button>
              {cat.activo && (
                <Button
                  variant="danger"
                  disabled={anular.isPending}
                  onClick={() => void handleAnular(cat)}
                >
                  Desactivar
                </Button>
              )}
            </div>
          )
        },
      }),
    ],
    [anular.isPending]
  )

  const table = useReactTable({
    data: categorias,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: PAGE_SIZE },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorias</h1>
          <p className="text-sm text-slate-500">
            Administre las categorias del catalogo.
          </p>
        </div>
        <Button onClick={abrirCrear}>+ Nueva categoria</Button>
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
      ) : categorias.length === 0 ? (
        <EstadoVacio
          titulo="No hay categorias cargadas"
        />
      ) : (
        <>
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

          <Paginacion
            pagina={table.getState().pagination.pageIndex}
            total={categorias.length}
            limit={PAGE_SIZE}
            onPageChange={(nextPage) => table.setPageIndex(nextPage)}
          />
        </>
      )}

      {modalOpen && (
        <CategoriaFormModal
          key={categoriaSeleccionada?.id ?? 'nueva'}
          open={modalOpen}
          categoria={categoriaSeleccionada}
          onClose={cerrarModal}
        />
      )}
    </div>
  )
}