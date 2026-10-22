import { StrictMode, useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LogOut } from 'lucide-react'
import { supabase } from '../src/lib/supabase'
import { buildHypothesisResults } from './hypotheses'
import HypothesesPanel from './HypothesesPanel'
import './index.css'

// Pantalla de acceso: solo los admins pueden leer los tests de todos los
// alumnos (RLS con public.is_admin()), así que hay que iniciar sesión.
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) setError("No s'ha pogut iniciar sessió. Revisa el correu i la contrasenya.")
    setBusy(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-24 flex w-full max-w-sm flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
    >
      <h1 className="text-lg font-semibold text-slate-900">Hipòtesis i conclusions</h1>
      <p className="text-sm text-slate-500">Inicia sessió amb un compte d'administrador de Kairo.</p>
      <input
        type="email"
        required
        placeholder="Correu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        type="password"
        required
        placeholder="Contrasenya"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
      >
        {busy ? 'Entrant…' : 'Entrar'}
      </button>
    </form>
  )
}

function Panel() {
  const [tests, setTests] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', auth.user.id)
      .maybeSingle()
    if (profile?.role !== 'admin') {
      setError("Aquest compte no és d'administrador.")
      return
    }

    const [initialRes, finalRes] = await Promise.all([
      supabase.from('initial_test').select('user_id, responses'),
      supabase.from('final_test').select('user_id, responses'),
    ])
    if (initialRes.error || finalRes.error) {
      setError("No s'han pogut carregar les dades.")
      return
    }
    setTests({ initial: initialRes.data || [], final: finalRes.data || [] })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const results = useMemo(
    () => (tests ? buildHypothesisResults(tests.initial, tests.final) : null),
    [tests],
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kairo · Hipòtesis i conclusions</h1>
          <p className="mt-1 text-slate-500">Panell local del treball de recerca.</p>
        </div>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sortir
        </button>
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
      {!error && !results && <p className="text-sm text-slate-500">Carregant dades…</p>}
      {results && <HypothesesPanel data={results} />}
    </div>
  )
}

function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  return session ? <Panel /> : <Login />
}

document.body.className = 'bg-slate-50'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
