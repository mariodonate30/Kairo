import { NavLink, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Check,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  User,
  Wind,
  X,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCheckin } from '../../hooks/useCheckin'

const mainNavItems = [
  { to: '/', label: 'Check-in diario', icon: ClipboardCheck, end: true },
  { to: '/encuestas', label: 'Encuestas semanales', icon: ClipboardList },
  { to: '/objetivos', label: 'Mis objetivos', icon: Target },
  { to: '/enfoque', label: 'Temporizador de enfoque', icon: Timer },
  { to: '/meditacion', label: 'Meditación', icon: Wind },
  { to: '/progreso', label: 'Mi progresión', icon: TrendingUp },
  { to: '/recursos', label: 'Recursos', icon: BookOpen },
]

const secondaryNavItems = [
  { to: '/perfil', label: 'Perfil', icon: User },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
  { to: '/privacidad', label: 'Políticas de privacidad', icon: ShieldCheck },
]

function linkClasses({ isActive }) {
  return [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-violet-50 text-violet-700'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
  ].join(' ')
}

// Indicador del estado del check-in de hoy junto a su entrada de navegación:
// un punto ámbar pulsante si está pendiente, una marca verde si ya se completó.
function CheckinIndicator() {
  const { loading, isCompleted } = useCheckin()

  if (loading) return null

  if (isCompleted) {
    return (
      <span
        className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
        title="Check-in de hoy completado"
      >
        <Check className="h-3 w-3" />
      </span>
    )
  }

  return (
    <span className="ml-auto flex shrink-0 items-center" title="Check-in de hoy pendiente">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
      </span>
    </span>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  const { profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const initials =
    profile?.full_name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-100 bg-white transition-transform duration-200 ease-out',
          'lg:static lg:z-auto lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">Kairo</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <div className="flex flex-col gap-1">
            {mainNavItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} onClick={onClose} className={linkClasses}>
                <Icon className="h-5 w-5 shrink-0" />
                {label}
                {end && <CheckinIndicator />}
              </NavLink>
            ))}
          </div>

          {isAdmin && (
            <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-4">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Administración
              </p>
              <NavLink to="/admin" onClick={onClose} className={linkClasses}>
                <LayoutDashboard className="h-5 w-5 shrink-0" />
                Panel de admin
              </NavLink>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-4">
            {secondaryNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={onClose} className={linkClasses}>
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {profile?.full_name || 'Estudiante'}
              </p>
              <p className="truncate text-xs text-slate-400">{profile?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
