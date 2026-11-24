import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

export function Navbar() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const items = useCartStore((s) => s.items)

  const cantidadCarrito = items.reduce((acc, item) => acc + item.cantidad, 0)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-bold text-orange-600">
            Food Store
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700">
            <Link to="/" className="hover:text-orange-600">
              Catalogo
            </Link>
            <Link to="/carrito" className="hover:text-orange-600">
              Carrito ({cantidadCarrito})
            </Link>
            {usuario && (
              <Link to="/mis-pedidos" className="hover:text-orange-600">
                Mis pedidos
              </Link>
            )}
            {usuario?.role === 'admin' && (
              <div className="flex flex-wrap items-center gap-3 border-l border-slate-200 pl-4">
                <Link to="/admin/resumen" className="hover:text-orange-600">
                  Resumen
                </Link>
                <Link to="/admin/categorias" className="hover:text-orange-600">
                  Categorias
                </Link>
                <Link to="/admin/productos" className="hover:text-orange-600">
                  Productos
                </Link>
                <Link to="/admin/pedidos" className="hover:text-orange-600">
                  Pedidos
                </Link>
                <Link to="/admin/usuarios" className="hover:text-orange-600">
                  Usuarios
                </Link>
              </div>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-slate-600">
                <strong className="text-slate-900">{usuario.full_name}</strong>{' '}
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs uppercase text-slate-600">
                  {usuario.role}
                </span>
              </span>
              <Button variant="secondary" onClick={handleLogout}>
                Cerrar sesion
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Ingresar</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}