import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Modal } from '../../../shared/ui/Modal'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import { handleApiError } from '../../../shared/api/handleApiError'
import {
  useActualizarCategoria,
  useCrearCategoria,
} from '../hooks/useCategorias'
import type { Categoria } from '../types/categoria.types'

interface CategoriaFormModalProps {
  open: boolean
  categoria: Categoria | null
  onClose: () => void
}

export function CategoriaFormModal({
  open,
  categoria,
  onClose,
}: CategoriaFormModalProps) {
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const [apiError, setApiError] = useState<string | null>(null)

  const esEdicion = Boolean(categoria)

  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    },
    onSubmit: async ({ value }) => {
      setApiError(null)
      const payload = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
      }

      try {
        if (categoria) {
          await actualizar.mutateAsync({ id: categoria.id, payload })
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
      title={esEdicion ? 'Editar categoría' : 'Nueva categoria'}
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
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const limpio = value.trim()
              if (limpio.length < 2) {
                return 'El nombre debe tener al menos 2 caracteres'
              }
              if (limpio.length > 100) {
                return 'El nombre no puede superar los 100 caracteres'
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

        <form.Field name="descripcion">
          {(field) => (
            <div className="flex flex-col gap-1">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-slate-700"
              >
                Descripción (opcional)
              </label>
              <textarea
                id={field.name}
                rows={3}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
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
                    : 'Crear categoría'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  )
}