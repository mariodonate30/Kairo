import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../ui/LoadingSpinner'

// Obliga a completar el test inicial antes de acceder al resto de la app.
// Se usa por dentro de ProtectedRoute (el usuario ya está autenticado aquí).
// Si el estudio ya ha terminado (encuesta final activada), quien no hizo el
// test inicial ya no puede entrar: se le muestra la pantalla de estudio cerrado.
export default function RequireInitialTest() {
  const { initialTestCompleted, finalTestActive, isAdmin } = useAuth()

  if (initialTestCompleted === null) {
    return <LoadingSpinner label="Carregant…" />
  }

  if (initialTestCompleted) {
    return <Outlet />
  }

  if (finalTestActive === null) {
    return <LoadingSpinner label="Carregant…" />
  }

  // Los admins siguen pudiendo entrar al panel aunque no hicieran el test.
  if (finalTestActive) {
    return isAdmin ? <Outlet /> : <Navigate to="/estudio-cerrado" replace />
  }

  return <Navigate to="/test-inicial" replace />
}
