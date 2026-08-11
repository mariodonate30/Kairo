import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function AdminRoute() {
  const { loading, isAdmin } = useAuth()

  if (loading) {
    return <LoadingSpinner label="Comprobando permisos…" />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
