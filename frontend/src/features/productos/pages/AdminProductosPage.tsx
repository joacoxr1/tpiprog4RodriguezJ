import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import {
  useAnularProducto,
  useProductos,
} from '../hooks/useProductos'
import { ProductoFormModal } from '../components/ProductoFormModal'
import { ProductoStockModal } from '../components/ProductoStockModal'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { handleApiError } from '../../../shared/api/handleApiError'
import type { Producto } from '../types/producto.types'

const PAGE_SIZE = 10
const columnHelper = createColumnHelper<Producto>()

export function AdminProductosPage() {
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null)
  const [productoStock, setProductoStock] = useState<Producto | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: categorias = [] } = useCategorias()
  const { data, isLoading, isError, error, refetch } = useProductos({
    skip: 0,
    limit: 100,
    search: search || undefined,
    categoria_id: categoriaId ? Number(categoriaId) : undefined,
  })
  const anular = useAnularProducto()

  const items = data?.items ?? []

  const abrirCrear = () => {
    setProductoEditar(null)
    setFormOpen(true)
  }

  const abrirEditar = (producto: Producto) => {
    setProductoEditar(producto)
    setFormOpen(true)
  }

  const handleAnular = async (producto: Producto) => {
    const confirmado = window.confirm(
      `¿Seguro que querés desactivar el producto "${producto.nombre}"?`
    )
    if (!confirmado) return

    setActionError(null)
    try {
      await anular.mutateAsync(producto.id)
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
        header: 'Producto',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-900">{row.original.nombre}</p>
            <p className="text-xs text-slate-500">
              {row.original.categoria?.nombre ??
                `Cat. #${row.original.categoria_id}`}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('precio_base', {
        header: 'Precio',
        cell: (info) => (
          <span className="font-medium text-slate-900">
            ${info.getValue().toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        ),
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => (
          <span className="font-semibold text-slate-800">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('disponible', {
        header: 'Disponible',
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Sí
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              No
            </span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const prod = row.original
          return (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => abrirEditar(prod)}>
                Editar
              </Button>
              <Button variant="ghost" onClick={() => setProductoStock(prod)}>
                Stock
              </Button>
              {prod.activo && (
                <Button
                  variant="danger"
                  disabled={anular.isPending}
                  onClick={() => void handleAnular(prod)}
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
    data: items,
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
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-500">
            Gestione el catálogo, precios y stock disponible.
          </p>
        </div>
        <Button onClick={abrirCrear}>+ Nuevo producto</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <Input
          id="admin-prod-search"
          label="Buscar por nombre"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            table.setPageIndex(0)
          }}
        />
        <div className="flex flex-col gap-1">
          <label
            htmlFor="admin-prod-cat"
            className="text-sm font-medium text-slate-700"
          >
            Filtrar por categoria
          </label>
          <select
            id="admin-prod-cat"
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value)
              table.setPageIndex(0)
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
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
          titulo="No hay productos para mostrar"
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
            total={items.length}
            limit={PAGE_SIZE}
            onPageChange={(nextPage) => table.setPageIndex(nextPage)}
          />
        </>
      )}

      {formOpen && (
        <ProductoFormModal
          key={productoEditar?.id ?? 'nuevo'}
          open={formOpen}
          producto={productoEditar}
          onClose={() => {
            setFormOpen(false)
            setProductoEditar(null)
          }}
        />
      )}

      {productoStock && (
        <ProductoStockModal
          key={productoStock.id}
          open={Boolean(productoStock)}
          producto={productoStock}
          onClose={() => setProductoStock(null)}
        />
      )}
    </div>
  )
}