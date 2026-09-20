import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../ui/LoadingSpinner'

// Cuando la encuesta final está activada, obliga a completarla antes de usar la
// app (igual que el test inicial). Los admins quedan exentos, para que siempre
// puedan entrar al panel a ver resultados o desactivarla.
export default function RequireFinalTest() {
  const { finalTestActive, finalTestCompleted, isAdmin } = useAuth()

  if (isAdmin) {
    return <Outlet />
  }

  // Mientras carga el estado global, esperamos (evita redirecciones en falso).
  if (finalTestActive === null) {
    return <LoadingSpinner label="Cargando…" />
  }

  if (!finalTestActive) {
    return <Outlet />
  }

  if (finalTestCompleted === null) {
    return <LoadingSpinner label="Cargando…" />
  }

  if (!finalTestCompleted) {
    return <Navigate to="/test-final" replace />
  }

  return <Outlet />
}
