import { useState } from 'react'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { ProductoCard } from '../components/ProductoCard'
import { Input } from '../../../shared/ui/Input'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { handleApiError } from '../../../shared/api/handleApiError'

const LIMIT = 12

export function CatalogoPage() {
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState<string>('')
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const [pagina, setPagina] = useState(0)

  const { data: categorias = [] } = useCategorias()
  const { data, isLoading, isError, error, refetch } = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search: search || undefined,
    categoria_id: categoriaId ? Number(categoriaId) : undefined,
    disponible: soloDisponibles ? true : undefined,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Catálogo</h1>
        <p className="text-sm text-slate-500">
          Explore nuestros productos y agrega el que quieras al carrito.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3 sm:items-end">
        <Input
          id="catalogo-search"
          label="Buscar producto"
          placeholder="Ej: Hamburguesa, Pizza..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPagina(0)
          }}
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="catalogo-categoria"
            className="text-sm font-medium text-slate-700"
          >
            Categoría
          </label>
          <select
            id="catalogo-categoria"
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value)
              setPagina(0)
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            <option value="">Todas las categorias</option>
            {categorias
              .filter((c) => c.activo)
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
          </select>
        </div>

        <label className="flex items-center gap-2 pb-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={soloDisponibles}
            onChange={(e) => {
              setSoloDisponibles(e.target.checked)
              setPagina(0)
            }}
            className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
          />
          Mostrar solo disponibles
        </label>
      </div>

      {isLoading ? (
        <Skeleton cantidad={6} className="h-72" />
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onRetry={() => void refetch()}
        />
      ) : items.length === 0 ? (
        <EstadoVacio
          titulo="No se encontraron productos"
          descripcion="Pruebe con otro filtro o bien busque."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          <Paginacion
            pagina={pagina}
            total={total}
            limit={LIMIT}
            onPageChange={setPagina}
          />
        </>
      )}
    </div>
  )
}