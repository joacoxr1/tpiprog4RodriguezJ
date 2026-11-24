import { useForm } from '@tanstack/react-form'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import type { FormaPago } from '../types/pedido.types'

export interface CheckoutFormValues {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  apiError: string | null
  onSubmit: (values: CheckoutFormValues) => Promise<void>
}

export function CheckoutForm({ apiError, onSubmit }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      {apiError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const limpio = value.trim()
            if (limpio.length < 5) {
              return 'La direccion debe tener al menos 5 caracteres'
            }
            if (limpio.length > 200) {
              return 'La direccion no puede superar los 200 caracteres'
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
              label="Dirección de entrega"
              placeholder="Ej: Av. Colon 1434, Piso"
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

      <form.Field name="forma_pago">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-slate-700"
            >
              Forma de pago
            </label>
            <select
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value as FormaPago)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>
        )}
      </form.Field>

      <form.Field name="notas">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-slate-700"
            >
              Notas adicionales (opcional)
            </label>
            <textarea
              id={field.name}
              rows={3}
              placeholder="Ej: Sin cebolla."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(s) => [s.canSubmit, s.isSubmitting] as const}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="mt-2 w-full"
          >
            {isSubmitting ? 'Confirmando pedido...' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}