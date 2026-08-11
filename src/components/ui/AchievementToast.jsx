import { useEffect, useState } from 'react'
import { Trophy, X } from 'lucide-react'

const VISIBLE_MS = 6000
const EXIT_MS = 300

// Un único toast de logro. Se anima al entrar, se auto-cierra tras VISIBLE_MS
// (o al pulsar la X) y avisa al padre cuando termina la animación de salida.
function AchievementToast({ achievement, onDismiss }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const hideTimer = setTimeout(() => setLeaving(true), VISIBLE_MS)
    return () => clearTimeout(hideTimer)
  }, [])

  useEffect(() => {
    if (!leaving) return
    const removeTimer = setTimeout(() => onDismiss(achievement.uid), EXIT_MS)
    return () => clearTimeout(removeTimer)
  }, [leaving, achievement.uid, onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3',
        'rounded-2xl border border-amber-200/70 bg-white p-4 shadow-xl shadow-amber-200/40',
        'ring-1 ring-amber-100',
        leaving ? 'animate-[achievement-out_300ms_ease-in_forwards]' : 'animate-[achievement-in_400ms_cubic-bezier(0.22,1,0.36,1)]',
      ].join(' ')}
    >
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl shadow-inner">
        <span aria-hidden="true">{achievement.icon}</span>
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-amber-500 shadow">
          <Trophy className="h-3 w-3" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
          ¡Logro desbloqueado!
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
          {achievement.title}
        </p>
        <p className="mt-0.5 text-xs leading-snug text-slate-500">
          {achievement.description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setLeaving(true)}
        aria-label="Cerrar"
        className="shrink-0 rounded-lg p-1 text-slate-300 transition hover:bg-slate-50 hover:text-slate-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Pila de toasts, fija arriba a la derecha por encima de todo. Recibe la lista
// de logros pendientes de mostrar y una función para retirarlos de la cola.
export default function AchievementToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((achievement) => (
        <AchievementToast
          key={achievement.uid}
          achievement={achievement}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}
