import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useAuthStore } from '../../../store/authStore'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'

interface LocationState {
  registered?: boolean
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const [apiError, setApiError] = useState<string | null>(null)

  const state = location.state as LocationState | null

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setApiError(null)
      try {
        await login(value.username.trim(), value.password)
        navigate('/', { replace: true })
      } catch (error) {
        setApiError(handleApiError(error))
      }
    },
  })

  if (usuario) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <h1 className="text-xl font-bold text-slate-900">Iniciar sesion</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ingresa usuario y contraseña para continuar.
        </p>

        {state?.registered && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            Cuenta creada. Ya podes iniciar sesion.
          </div>
        )}

        {apiError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <form
          className="mt-5 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? 'El usuario es obligatorio' : undefined,
            }}
          >
            {(field) => {
              const firstError = field.state.meta.errors.find((e) => Boolean(e))
              return (
                <Input
                  id={field.name}
                  label="Usuario"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={
                    field.state.meta.isTouched && firstError
                      ? String(firstError)
                      : undefined
                  }
                  autoComplete="username"
                />
              )
            }}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                !value ? 'La contraseña es obligatoria' : undefined,
            }}
          >
            {(field) => {
              const firstError = field.state.meta.errors.find((e) => Boolean(e))
              return (
                <Input
                  id={field.name}
                  type="password"
                  label="Contraseña"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={
                    field.state.meta.isTouched && firstError
                      ? String(firstError)
                      : undefined
                  }
                  autoComplete="current-password"
                />
              )
            }}
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
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          ¿No tenes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-orange-600 hover:underline"
          >
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}