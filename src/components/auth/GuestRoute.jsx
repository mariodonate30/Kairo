import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../ui/LoadingSpinner'

// Evita que un usuario ya logueado vuelva a ver Login/Register
export default function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner label="Cargando…" />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
