import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Trash2,
  User,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// Tarjeta contenedora reutilizable para cada bloque de configuración.
function SettingsCard({ icon: Icon, title, description, tone = 'violet', children }) {
  const tones = {
    violet: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
  }
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2.5">
        <div
          className={[
            'flex h-10 w-10 items-center justify-center rounded-2xl',
            tones[tone],
          ].join(' ')}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

const inputClasses =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100'

// Mensaje de estado (éxito / error) reutilizable dentro de un formulario.
function StatusMessage({ status }) {
  if (!status) return null
  const isError = status.type === 'error'
  return (
    <p
      className={[
        'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm',
        isError ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600',
      ].join(' ')}
    >
      {!isError && <Check className="h-4 w-4 shrink-0" />}
      {status.text}
    </p>
  )
}

function ChangeNameForm() {
  const { profile, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  const unchanged = fullName.trim() === (profile?.full_name || '').trim()

  async function handleSubmit(e) {
    e.preventDefault()
    const name = fullName.trim()
    setStatus(null)

    if (!name) {
      setStatus({ type: 'error', text: 'El nombre no puede estar vacío.' })
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', profile.id)
    setSaving(false)

    if (error) {
      setStatus({ type: 'error', text: 'No se ha podido guardar el nombre. Inténtalo de nuevo.' })
      return
    }

    await refreshProfile()
    setStatus({ type: 'success', text: 'Nombre actualizado correctamente.' })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700">
          Nombre completo
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          maxLength={80}
          autoComplete="name"
          onChange={(e) => setFullName(e.target.value)}
          className={inputClasses}
        />
      </div>

      <StatusMessage status={status} />

      <button
        type="submit"
        disabled={saving || unchanged}
        className="flex items-center justify-center gap-2 self-start rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? 'Guardando…' : 'Guardar nombre'}
      </button>
    </form>
  )
}

function ChangePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus(null)

    if (password.length < 6) {
      setStatus({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }

    if (password !== confirmPassword) {
      setStatus({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (error) {
      setStatus({ type: 'error', text: 'No se ha podido cambiar la contraseña. Inténtalo de nuevo.' })
      return
    }

    setPassword('')
    setConfirmPassword('')
    setStatus({ type: 'success', text: 'Contraseña cambiada correctamente.' })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
          Nueva contraseña
        </label>
        <div className="relative">
          <input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className={inputClasses + ' pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          autoComplete="new-password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repite la nueva contraseña"
          className={inputClasses}
        />
      </div>

      <StatusMessage status={status} />

      <button
        type="submit"
        disabled={saving || !password || !confirmPassword}
        className="flex items-center justify-center gap-2 self-start rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? 'Cambiando…' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}

function DeleteAccountSection() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const CONFIRM_WORD = 'ELIMINAR'

  async function handleDelete() {
    setError('')
    setDeleting(true)

    const { error: rpcError } = await supabase.rpc('delete_own_account')

    if (rpcError) {
      setDeleting(false)
      setError('No se ha podido eliminar la cuenta. Inténtalo de nuevo más tarde.')
      return
    }

    // La cuenta ya no existe: cerramos sesión y volvemos al login.
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Al eliminar tu cuenta se borrarán de forma permanente tu perfil y todos tus datos
        (check-ins, objetivos, encuestas, sesiones y logros). Esta acción no se puede deshacer.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="flex items-center gap-2 self-start rounded-xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar mi cuenta
        </button>
      ) : (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
          <p className="mb-3 text-sm text-slate-700">
            Escribe <strong className="font-semibold text-rose-700">{CONFIRM_WORD}</strong> para
            confirmar que quieres eliminar tu cuenta.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_WORD}
            className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />

          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || confirmText.trim() !== CONFIRM_WORD}
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {deleting ? 'Eliminando…' : 'Eliminar definitivamente'}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false)
                setConfirmText('')
                setError('')
              }}
              disabled={deleting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Settings() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>

      <SettingsCard icon={User} title="Cambiar nombre" description="Cómo aparece tu nombre en la app.">
        <ChangeNameForm />
      </SettingsCard>

      <SettingsCard
        icon={KeyRound}
        title="Cambiar contraseña"
        description="Actualiza la contraseña de tu cuenta."
      >
        <ChangePasswordForm />
      </SettingsCard>

      <SettingsCard
        icon={AlertTriangle}
        title="Eliminar cuenta"
        description="Borra tu cuenta y todos tus datos."
        tone="rose"
      >
        <DeleteAccountSection />
      </SettingsCard>
    </div>
  )
}
