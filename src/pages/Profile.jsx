import { Flame, Lock, Trophy } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAchievements } from '../hooks/useAchievements'
import { useProfileStats } from '../hooks/useProfileStats'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function StatBox({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}

// Tarjeta grande de estadística general de uso (check-ins, rachas, días…).
function UsageStat({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-1 text-lg" aria-hidden="true">
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-400">{label}</p>
    </div>
  )
}

// Tarjeta de un logro: a color si está desbloqueado, en gris y con candado si
// todavía está pendiente.
function AchievementCard({ achievement }) {
  const { unlocked, icon, title, description, unlocked_at } = achievement

  const unlockedDate = unlocked_at
    ? new Date(unlocked_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <div
      className={[
        'flex items-start gap-3 rounded-2xl border p-4 transition',
        unlocked
          ? 'border-amber-200/70 bg-gradient-to-br from-amber-50 to-white shadow-sm'
          : 'border-slate-100 bg-slate-50',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl',
          unlocked ? 'bg-white shadow-inner' : 'bg-slate-100',
        ].join(' ')}
      >
        {unlocked ? (
          <span aria-hidden="true">{icon}</span>
        ) : (
          <Lock className="h-4 w-4 text-slate-300" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={[
            'text-sm font-semibold',
            unlocked ? 'text-slate-900' : 'text-slate-400',
          ].join(' ')}
        >
          {title}
        </p>
        <p
          className={[
            'mt-0.5 text-xs leading-snug',
            unlocked ? 'text-slate-500' : 'text-slate-400',
          ].join(' ')}
        >
          {description}
        </p>
        {unlocked && unlockedDate && (
          <p className="mt-1.5 text-[11px] font-medium text-amber-600">
            Desbloqueado el {unlockedDate}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Profile() {
  const { profile } = useAuth()
  const { achievements, unlockedCount, total, loading } = useAchievements()
  const { checkinCount, daysUsingApp } = useProfileStats()

  const initials =
    profile?.full_name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  // Los desbloqueados primero, manteniendo el orden del catálogo dentro de cada
  // grupo (para que lo conseguido quede arriba y motive a por lo pendiente).
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1
    return (a.sort_order || 0) - (b.sort_order || 0)
  })

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Perfil</h1>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-700">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {profile?.full_name || 'Estudiante'}
            </p>
            <p className="text-sm text-slate-500">{profile?.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
          <StatBox label="Rol" value={profile?.role === 'admin' ? 'Administrador' : 'Estudiante'} />
          <StatBox label="Miembro desde" value={memberSince} />
        </div>
      </div>

      {/* Estadísticas generales */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <UsageStat label="Check-ins completados" value={checkinCount} icon="✅" />
        <UsageStat label="Días usando la app" value={daysUsingApp} icon="📅" />
        <UsageStat label="Racha actual" value={`${profile?.current_streak ?? 0} d`} icon="🔥" />
        <UsageStat label="Racha más larga" value={`${profile?.longest_streak ?? 0} d`} icon="🏆" />
      </section>

      {/* Logros */}
      <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Logros</h2>
              <p className="text-xs text-slate-400">
                {unlockedCount} de {total} desbloqueados
              </p>
            </div>
          </div>
          {total > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${total ? (unlockedCount / total) * 100 : 0}%` }}
                />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                <Flame className="h-3.5 w-3.5" />
                {total ? Math.round((unlockedCount / total) * 100) : 0}%
              </span>
            </div>
          )}
        </div>

        {loading && <LoadingSpinner label="Cargando tus logros…" />}

        {!loading && total === 0 && (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Aún no hay logros disponibles.
          </p>
        )}

        {!loading && total > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sortedAchievements.map((achievement) => (
              <AchievementCard key={achievement.key} achievement={achievement} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
