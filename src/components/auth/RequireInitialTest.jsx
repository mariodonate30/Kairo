import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../ui/LoadingSpinner'

// Obliga a completar el test inicial antes de acceder al resto de la app.
// Se usa por dentro de ProtectedRoute (el usuario ya está autenticado aquí).
export default function RequireInitialTest() {
  const { initialTestCompleted } = useAuth()

  if (initialTestCompleted === null) {
    return <LoadingSpinner label="Cargando…" />
  }

  if (!initialTestCompleted) {
    return <Navigate to="/test-inicial" replace />
  }

  return <Outlet />
}
