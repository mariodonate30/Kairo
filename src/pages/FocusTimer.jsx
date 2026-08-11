import { useCallback, useEffect, useRef, useState } from 'react'
import { CalendarDays, Flame, Pause, Play, RotateCcw, Timer, X } from 'lucide-react'
import { useFocusTimer } from '../hooks/useFocusTimer'
import { useAchievements } from '../hooks/useAchievements'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { relativeDayLabel } from '../utils/dateHelpers'

const PRESETS = [25, 45, 60]
const MIN_CUSTOM = 1
const MAX_CUSTOM = 240

// 'idle' | 'running' | 'paused' | 'finished'
const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  FINISHED: 'finished',
}

// Formatea segundos como "MM:SS".
function formatClock(totalSeconds) {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// Suma de minutos con etiqueta legible: "1 h 30 min", "45 min".
function formatMinutes(totalMinutes) {
  if (totalMinutes < 60) return `${totalMinutes} min`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`
}

// Reproduce una breve alerta sonora usando la Web Audio API (sin archivos).
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const notes = [880, 1108.73, 1318.51] // La5, Do#6, Mi6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = ctx.currentTime + i * 0.18
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.5)
    })
    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Si el navegador bloquea el audio, el aviso visual es suficiente.
  }
}

function StatCard({ icon: Icon, label, value, caption }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
      {caption && <p className="mt-0.5 text-xs text-slate-400">{caption}</p>}
    </div>
  )
}

export default function FocusTimer() {
  const { sessions, stats, loading, error, saveSession } = useFocusTimer()
  const { checkAchievements } = useAchievements()

  const [plannedMinutes, setPlannedMinutes] = useState(25)
  const [customValue, setCustomValue] = useState('')
  const [status, setStatus] = useState(STATUS.IDLE)
  const [remaining, setRemaining] = useState(25 * 60)
  const [saveError, setSaveError] = useState('')

  // Momento (timestamp) en que debería terminar la sesión en curso. Al basar
  // el contador en la hora real evitamos la deriva de un setInterval de 1s.
  const deadlineRef = useRef(null)

  const isActive = status === STATUS.RUNNING || status === STATUS.PAUSED
  const totalSeconds = plannedMinutes * 60
  const progress = totalSeconds ? 1 - remaining / totalSeconds : 0

  // Registra la sesión terminada y vuelve al estado inicial.
  const finalize = useCallback(
    async (completed, elapsedSeconds) => {
      deadlineRef.current = null
      const actualMinutes = completed
        ? plannedMinutes
        : Math.round(elapsedSeconds / 60)

      // Solo guardamos si hubo al menos un minuto real de enfoque.
      if (actualMinutes >= 1) {
        setSaveError('')
        const { error: sessionError } = await saveSession({
          plannedMinutes,
          actualMinutes,
          completed,
        })
        if (sessionError) {
          setSaveError('No se ha podido guardar la sesión. Revisa tu conexión.')
        } else {
          checkAchievements()
        }
      }
    },
    [plannedMinutes, saveSession, checkAchievements],
  )

  // Bucle del reloj: mientras corre, recalculamos el tiempo restante a partir
  // del deadline. Al llegar a 0, marcamos la sesión como completada.
  useEffect(() => {
    if (status !== STATUS.RUNNING) return

    const tick = () => {
      const secondsLeft = Math.round((deadlineRef.current - Date.now()) / 1000)
      if (secondsLeft <= 0) {
        setRemaining(0)
        setStatus(STATUS.FINISHED)
        playChime()
        finalize(true, totalSeconds)
      } else {
        setRemaining(secondsLeft)
      }
    }

    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [status, totalSeconds, finalize])

  function selectDuration(minutes) {
    if (isActive) return
    setPlannedMinutes(minutes)
    setRemaining(minutes * 60)
    setCustomValue('')
    setStatus(STATUS.IDLE)
  }

  function applyCustom() {
    const parsed = Math.round(Number(customValue))
    if (!Number.isFinite(parsed) || parsed < MIN_CUSTOM) return
    const minutes = Math.min(parsed, MAX_CUSTOM)
    setPlannedMinutes(minutes)
    setRemaining(minutes * 60)
    setStatus(STATUS.IDLE)
  }

  function handleStart() {
    deadlineRef.current = Date.now() + remaining * 1000
    setStatus(STATUS.RUNNING)
  }

  function handlePause() {
    deadlineRef.current = null
    setStatus(STATUS.PAUSED)
  }

  function handleResume() {
    deadlineRef.current = Date.now() + remaining * 1000
    setStatus(STATUS.RUNNING)
  }

  async function handleCancel() {
    const elapsedSeconds = totalSeconds - remaining
    setStatus(STATUS.IDLE)
    setRemaining(totalSeconds)
    await finalize(false, elapsedSeconds)
  }

  function handleReset() {
    setStatus(STATUS.IDLE)
    setRemaining(totalSeconds)
  }

  const presetActive = PRESETS.includes(plannedMinutes)

  // Anillo de progreso SVG.
  const R = 130
  const circumference = 2 * Math.PI * R

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Temporizador de enfoque</h1>
        <p className="mt-1 text-slate-500">
          Sesiones de estudio concentrado tipo Pomodoro. Elige una duración y mantén el foco.
        </p>
      </div>

      {/* Temporizador */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        {/* Selector de duración */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => selectDuration(minutes)}
              disabled={isActive}
              className={[
                'rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40',
                plannedMinutes === minutes && presetActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              ].join(' ')}
            >
              {minutes} min
            </button>
          ))}

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={MIN_CUSTOM}
              max={MAX_CUSTOM}
              value={customValue}
              disabled={isActive}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyCustom()
              }}
              onBlur={applyCustom}
              placeholder="Otro"
              className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
            />
            <span className="text-sm text-slate-400">min</span>
          </div>
        </div>

        {/* Contador visual grande con anillo de progreso */}
        <div className="flex flex-col items-center">
          <div className="relative flex h-72 w-72 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 300 300">
              <circle
                cx="150"
                cy="150"
                r={R}
                fill="none"
                stroke="currentColor"
                strokeWidth="14"
                className="text-slate-100"
              />
              <circle
                cx="150"
                cy="150"
                r={R}
                fill="none"
                stroke="currentColor"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                className={[
                  'transition-all duration-300 ease-linear',
                  status === STATUS.FINISHED ? 'text-emerald-500' : 'text-violet-500',
                ].join(' ')}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={[
                  'font-mono text-6xl font-bold tabular-nums',
                  status === STATUS.FINISHED ? 'text-emerald-600' : 'text-slate-900',
                ].join(' ')}
              >
                {formatClock(remaining)}
              </span>
              <span className="mt-1 text-sm font-medium text-slate-400">
                {status === STATUS.RUNNING && 'En marcha'}
                {status === STATUS.PAUSED && 'En pausa'}
                {status === STATUS.FINISHED && '¡Sesión completada! 🎉'}
                {status === STATUS.IDLE && `Sesión de ${plannedMinutes} min`}
              </span>
            </div>
          </div>

          {/* Controles */}
          <div className="mt-8 flex items-center gap-3">
            {status === STATUS.IDLE && (
              <button
                type="button"
                onClick={handleStart}
                className="flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                <Play className="h-5 w-5" />
                Iniciar
              </button>
            )}

            {status === STATUS.RUNNING && (
              <>
                <button
                  type="button"
                  onClick={handlePause}
                  className="flex items-center gap-2 rounded-2xl bg-slate-800 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-900"
                >
                  <Pause className="h-5 w-5" />
                  Pausar
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 rounded-2xl bg-slate-100 px-6 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <X className="h-5 w-5" />
                  Cancelar
                </button>
              </>
            )}

            {status === STATUS.PAUSED && (
              <>
                <button
                  type="button"
                  onClick={handleResume}
                  className="flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                >
                  <Play className="h-5 w-5" />
                  Reanudar
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 rounded-2xl bg-slate-100 px-6 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <X className="h-5 w-5" />
                  Cancelar
                </button>
              </>
            )}

            {status === STATUS.FINISHED && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                <RotateCcw className="h-5 w-5" />
                Nueva sesión
              </button>
            )}
          </div>

          {saveError && <p className="mt-4 text-sm text-rose-600">{saveError}</p>}
        </div>
      </section>

      {/* Estadísticas */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          icon={Timer}
          label="Esta semana"
          value={formatMinutes(stats.weekMinutes)}
          caption={`${stats.weekSessions} ${stats.weekSessions === 1 ? 'sesión' : 'sesiones'}`}
        />
        <StatCard
          icon={Flame}
          label="Racha"
          value={`${stats.streak} ${stats.streak === 1 ? 'día' : 'días'}`}
          caption="Días seguidos con enfoque"
        />
        <StatCard
          icon={CalendarDays}
          label="Total"
          value={formatMinutes(stats.totalMinutes)}
          caption={`${stats.totalSessions} ${stats.totalSessions === 1 ? 'sesión' : 'sesiones'}`}
        />
      </section>

      {/* Historial */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">Historial de sesiones</h2>
        </div>

        {loading && <LoadingSpinner label="Cargando tus sesiones…" />}

        {!loading && error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
        )}

        {!loading && !error && sessions.length === 0 && (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Aún no tienes sesiones registradas. Completa tu primera sesión de enfoque para verla aquí.
          </p>
        )}

        {!loading && !error && sessions.length > 0 && (
          <ul className="flex flex-col gap-2">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <div
                  className={[
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    session.completed
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600',
                  ].join(' ')}
                >
                  <Timer className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {formatMinutes(session.actual_minutes)} de enfoque
                  </p>
                  <p className="text-xs capitalize text-slate-400">
                    {relativeDayLabel(session.date)}
                    {!session.completed &&
                      ` · cancelada (${session.planned_minutes} min planificados)`}
                  </p>
                </div>
                <span
                  className={[
                    'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                    session.completed
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600',
                  ].join(' ')}
                >
                  {session.completed ? 'Completada' : 'Parcial'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
