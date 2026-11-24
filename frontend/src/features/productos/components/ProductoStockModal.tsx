import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Modal } from '../../../shared/ui/Modal'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import { handleApiError } from '../../../shared/api/handleApiError'
import { useActualizarStockProducto } from '../hooks/useProductos'
import type { Producto } from '../types/producto.types'

interface ProductoStockModalProps {
  open: boolean
  producto: Producto
  onClose: () => void
}

export function ProductoStockModal({
  open,
  producto,
  onClose,
}: ProductoStockModalProps) {
  const actualizarStock = useActualizarStockProducto()
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      stock: String(producto.stock),
      disponible: producto.disponible,
    },
    onSubmit: async ({ value }) => {
      setApiError(null)
      try {
        await actualizarStock.mutateAsync({
          id: producto.id,
          payload: {
            stock: Number(value.stock),
            disponible: value.disponible,
          },
        })
        onClose()
      } catch (error) {
        setApiError(handleApiError(error))
      }
    },
  })

  return (
    <Modal
      open={open}
      title={`Actualizar stock: ${producto.nombre}`}
      onClose={onClose}
    >
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => {
              const n = Number(value)
              if (value === '' || !Number.isInteger(n) || n < 0) {
                return 'Ingrese un numero entero mayor o igual a 0'
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
                label="Stock disponible"
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
                {isSubmitting ? 'Actualizando...' : 'Guardar stock'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  )
}