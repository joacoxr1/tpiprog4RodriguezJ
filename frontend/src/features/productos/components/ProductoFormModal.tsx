import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Modal } from '../../../shared/ui/Modal'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import { handleApiError } from '../../../shared/api/handleApiError'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import {
  useActualizarProducto,
  useCrearProducto,
} from '../hooks/useProductos'
import type { Producto } from '../types/producto.types'

interface ProductoFormModalProps {
  open: boolean
  producto: Producto | null
  onClose: () => void
}

export function ProductoFormModal({
  open,
  producto,
  onClose,
}: ProductoFormModalProps) {
  const { data: categorias = [] } = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const [apiError, setApiError] = useState<string | null>(null)

  const esEdicion = Boolean(producto)
  const categoriasActivas = categorias.filter(
    (c) => c.activo || c.id === producto?.categoria_id
  )

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto ? String(producto.precio_base) : '',
      imagen_url: producto?.imagen_url ?? '',
      stock: producto ? String(producto.stock) : '0',
      disponible: producto?.disponible ?? true,
      categoria_id: producto ? String(producto.categoria_id) : '',
    },
    onSubmit: async ({ value }) => {
      setApiError(null)
      const payload = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      }

      try {
        if (producto) {
          await actualizar.mutateAsync({ id: producto.id, payload })
        } else {
          await crear.mutateAsync(payload)
        }
        onClose()
      } catch (error) {
        setApiError(handleApiError(error))
      }
    },
  })

  return (
    <Modal
      open={open}
      title={esEdicion ? 'Editar producto' : 'Nuevo producto'}
      onClose={onClose}
    >
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) =>
              value.trim().length < 2
                ? 'El nombre debe tener al menos 2 caracteres'
                : undefined,
          }}
        >
          {(field) => {
            const firstError = field.state.meta.errors.find((e) => Boolean(e))
            return (
              <Input
                id={field.name}
                label="Nombre"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={
                  field.state.meta.isTouched && firstError
                    ? String(firstError)
                    : undefined
                }
              />
            )
          }}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Seleccione una categoria' : undefined,
          }}
        >
          {(field) => {
            const firstError = field.state.meta.errors.find((e) => Boolean(e))
            return (
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-slate-700"
                >
                  Categoria
                </label>
                <select
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">Seleccionar categoria...</option>
                  {categoriasActivas.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {field.state.meta.isTouched && firstError && (
                  <span className="text-xs text-red-600">
                    {String(firstError)}
                  </span>
                )}
              </div>
            )
          }}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) => {
                const n = Number(value)
                if (value === '' || Number.isNaN(n) || n < 0) {
                  return 'Ingresá un precio válido (>= 0)'
                }
                return undefined
              },
            }}
          >
            {(field) => {
              const firstError = field.state.meta.errors.find((e) => Boolean(e))
              return (
                <Input
                  id={field.name}
                  type="number"
                  step="0.01"
                  min="0"
                  label="Precio base"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={
                    field.state.meta.isTouched && firstError
                      ? String(firstError)
                      : undefined
                  }
                />
              )
            }}
          </form.Field>

          <form.Field
            name="stock"
            validators={{
              onChange: ({ value }) => {
                const n = Number(value)
                if (
                  value === '' ||
                  !Number.isInteger(n) ||
                  n < 0
                ) {
                  return 'Ingrese un stock (>= 0)'
                }
                return undefined
              },
            }}
          >
            {(field) => {
              const firstError = field.state.meta.errors.find((e) => Boolean(e))
              return (
                <Input
                  id={field.name}
                  type="number"
                  step="1"
                  min="0"
                  label="Stock"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={
                    field.state.meta.isTouched && firstError
                      ? String(firstError)
                      : undefined
                  }
                />
              )
            }}
          </form.Field>
        </div>

        <form.Field name="imagen_url">
          {(field) => (
            <Input
              id={field.name}
              type="url"
              label="URL de imagen (opcional)"
              placeholder="https://..."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <div className="flex flex-col gap-1">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-slate-700"
              >
                Descripcion (opcional)
              </label>
              <textarea
                id={field.name}
                rows={2}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <form.Subscribe
            selector={(s) => [s.canSubmit, s.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting
                  ? 'Guardando...'
                  : esEdicion
                    ? 'Guardar cambios'
                    : 'Crear producto'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  )
}