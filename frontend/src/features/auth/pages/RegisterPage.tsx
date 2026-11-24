import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useAuthStore } from '../../../store/authStore'
import { registerUsuario } from '../api/auth'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'

export function RegisterPage() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setApiError(null)
      try {
        await registerUsuario({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        navigate('/login', { replace: true, state: { registered: true } })
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
        <h1 className="text-xl font-bold text-slate-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">
          Complete sus datos para registrarse como cliente.
        </p>

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
                value.trim().length < 3
                  ? 'El usuario debe tener al menos 3 caracteres'
                  : undefined,
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
                />
              )
            }}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? 'El nombre es obligatorio' : undefined,
            }}
          >
            {(field) => {
              const firstError = field.state.meta.errors.find((e) => Boolean(e))
              return (
                <Input
                  id={field.name}
                  label="Nombre completo"
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
            name="email"
            validators={{
              onChange: ({ value }) =>
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                  ? 'Ingrese un email valido'
                  : undefined,
            }}
          >
            {(field) => {
              const firstError = field.state.meta.errors.find((e) => Boolean(e))
              return (
                <Input
                  id={field.name}
                  type="email"
                  label="Email"
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
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 6
                  ? 'La contraseña debe tener al menos 6 caracteres'
                  : undefined,
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
                {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          ¿Ya tenes cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-orange-600 hover:underline"
          >
            Iniciar sesion
          </Link>
        </p>
      </Card>
    </div>
  )
}