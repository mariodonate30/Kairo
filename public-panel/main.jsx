import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import StudentResponses from '../src/components/admin/StudentResponses'
import LoadingSpinner from '../src/components/ui/LoadingSpinner'
import { PUBLIC_EXCLUDED_KEYS } from '../src/utils/studentResponses'
import './index.css'

function formatDateTime(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
}

function PublicPanel() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('./respuestas.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then(setData)
      .catch(() => setError('No se han podido cargar las respuestas.'))
  }, [])

  const updated = formatDateTime(data?.generated_at)

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Kairo · Respuestas por alumno</h1>
        <p className="mt-1 max-w-3xl text-slate-500">
          Respuestas individuales del test inicial y de la encuesta final del estudio sobre hábitos
          en la adolescencia. Los alumnos son anónimos: solo se identifican con un número.
        </p>
        {updated && <p className="mt-1 text-xs text-slate-400">Datos actualizados el {updated}.</p>}
      </header>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      ) : !data ? (
        <LoadingSpinner label="Cargando respuestas…" />
      ) : (
        <StudentResponses students={data.students || []} hiddenKeys={PUBLIC_EXCLUDED_KEYS} />
      )}
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PublicPanel />
  </StrictMode>,
)
