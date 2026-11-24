import { Link } from 'react-router-dom'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'

export function UnauthorizedPage() {
  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">Acceso denegado</h1>
        <p className="mt-2 text-sm text-slate-600">
          No tenes permisos para esta seccion.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>Volver al catálogo</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}