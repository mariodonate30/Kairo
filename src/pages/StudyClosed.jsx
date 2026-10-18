import { Navigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Pantalla para quien entra cuando el estudio ya ha terminado (encuesta final
// activada) sin haber hecho el test inicial: no puede participar, porque sin
// test inicial no hay evolución que medir.
export default function StudyClosed() {
  const { initialTestCompleted, finalTestActive, isAdmin, signOut } = useAuth()

  if (initialTestCompleted === null || finalTestActive === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-emerald-50">
        <LoadingSpinner label="Cargando…" />
      </div>
    )
  }

  // Si en realidad puede entrar (hizo el test inicial, es admin o el estudio
  // sigue abierto), lo mandamos a la app.
  if (initialTestCompleted || isAdmin || !finalTestActive) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">El estudio ha terminado</h1>
        <p className="mt-3 text-sm text-slate-500">
          Kairo ya ha cerrado la fase de participación. Solo pueden acceder los alumnos que
          completaron el test inicial al principio del estudio. ¡Gracias por tu interés!
        </p>
        <button
          type="button"
          onClick={signOut}
          className="mt-6 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
