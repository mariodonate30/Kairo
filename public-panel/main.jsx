import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import AdminPanel from '../src/components/admin/AdminPanel'
import LoadingSpinner from '../src/components/ui/LoadingSpinner'
import { toDateString } from '../src/utils/dateHelpers'
import { snapshotToAdminData } from '../src/utils/publicSnapshot'
import './index.css'

function formatDateTime(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
}

function PublicPanel() {
  const [snapshot, setSnapshot] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('./datos.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then(setSnapshot)
      .catch(() => setError('No se han podido cargar los datos.'))
  }, [])

  const admin = useMemo(() => (snapshot ? snapshotToAdminData(snapshot) : null), [snapshot])
  const updated = formatDateTime(snapshot?.generated_at)
  const referenceDate = snapshot?.generated_at
    ? toDateString(new Date(snapshot.generated_at))
    : undefined

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      ) : !admin ? (
        <LoadingSpinner label="Cargando resultados…" />
      ) : (
        <>
          <AdminPanel admin={admin} publicView referenceDate={referenceDate} />
          <p className="text-center text-xs text-slate-400">
            Estudio sobre hábitos en la adolescencia · Datos anónimos: cada alumno se identifica
            solo con un número.{updated && ` Copia de los datos del ${updated}.`}
          </p>
        </>
      )}
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PublicPanel />
  </StrictMode>,
)
