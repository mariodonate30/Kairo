import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CalendarDays,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Waves,
  Wind,
  X,
} from 'lucide-react'
import { useMeditation } from '../hooks/useMeditation'
import { useAchievements } from '../hooks/useAchievements'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { relativeDayLabel } from '../utils/dateHelpers'

const PRESETS = [5, 10, 15]
const MIN_CUSTOM = 1
const MAX_CUSTOM = 120

// 'idle' | 'running' | 'paused' | 'finished'
const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  FINISHED: 'finished',
}

// Sonidos ambientales. Se generan en tiempo real con la Web Audio API a partir
// de ruido filtrado, así que no dependemos de ningún archivo de audio externo.
const AMBIENTS = [
  { id: 'none', label: 'Silencio', icon: VolumeX },
  { id: 'rain', label: 'Lluvia', icon: Volume2 },
  { id: 'waves', label: 'Olas', icon: Waves },
  { id: 'wind', label: 'Viento', icon: Wind },
]

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

// Reproduce un cuenco tibetano suave al terminar la meditación (sin archivos).
function playBowl() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const notes = [432, 648] // tono base y una quinta, cálidos y relajantes
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = ctx.currentTime + i * 0.06
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 3)
    })
    setTimeout(() => ctx.close(), 3500)
  } catch {
    // Si el navegador bloquea el audio, el aviso visual es suficiente.
  }
}

// Controlador de sonido ambiental. Encapsula el AudioContext y el grafo de
// nodos (ruido → filtro → ganancia). Permite arrancar un ambiente, cambiarlo,
// silenciar/reanudar y detenerlo por completo.
function createAmbientController() {
  let ctx = null
  let noise = null // AudioBufferSourceNode con ruido en bucle
  let filter = null
  let masterGain = null
  let lfo = null // modula la ganancia para dar sensación de vaivén (olas)
  let lfoGain = null

  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return null
      ctx = new AudioCtx()
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }

  // Buffer de ruido blanco de unos segundos, reproducido en bucle.
  function makeNoiseBuffer(audioCtx) {
    const seconds = 3
    const buffer = audioCtx.createBuffer(
      1,
      audioCtx.sampleRate * seconds,
      audioCtx.sampleRate,
    )
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  function stop() {
    try {
      if (noise) noise.stop()
    } catch {
      // ya estaba parado
    }
    if (lfo) {
      try {
        lfo.stop()
      } catch {
        // ya estaba parado
      }
    }
    noise = null
    filter = null
    masterGain = null
    lfo = null
    lfoGain = null
  }

  // Arranca (o reemplaza) el ambiente indicado. 'none' equivale a silencio.
  function start(kind) {
    stop()
    if (kind === 'none') return

    const audioCtx = ensureContext()
    if (!audioCtx) return

    noise = audioCtx.createBufferSource()
    noise.buffer = makeNoiseBuffer(audioCtx)
    noise.loop = true

    filter = audioCtx.createBiquadFilter()
    masterGain = audioCtx.createGain()

    if (kind === 'rain') {
      // Lluvia: paso alto suave para un siseo fino y constante.
      filter.type = 'highpass'
      filter.frequency.value = 1000
      masterGain.gain.value = 0.12
    } else if (kind === 'waves') {
      // Olas: ruido grave con un vaivén lento de volumen.
      filter.type = 'lowpass'
      filter.frequency.value = 500
      masterGain.gain.value = 0.18

      lfo = audioCtx.createOscillator()
      lfoGain = audioCtx.createGain()
      lfo.frequency.value = 0.12 // ~un ciclo cada 8 s
      lfoGain.gain.value = 0.1
      lfo.connect(lfoGain)
      lfoGain.connect(masterGain.gain)
      lfo.start()
    } else if (kind === 'wind') {
      // Viento: banda media grave, envolvente y difusa.
      filter.type = 'lowpass'
      filter.frequency.value = 900
      masterGain.gain.value = 0.14
    }

    noise.connect(filter)
    filter.connect(masterGain)
    masterGain.connect(audioCtx.destination)
    noise.start()
  }

  // Baja o sube el volumen sin destruir el grafo (para pausar/reanudar).
  function setMuted(muted) {
    if (!ctx) return
    if (muted) {
      ctx.suspend()
    } else if (ctx.state === 'suspended') {
      ctx.resume()
    }
  }

  function dispose() {
    stop()
    if (ctx) {
      try {
        ctx.close()
      } catch {
        // ignorar
      }
      ctx = null
    }
  }

  return { start, stop, setMuted, dispose }
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

export default function Meditation() {
  const { sessions, stats, loading, error, saveSession } = useMeditation()
  const { checkAchievements } = useAchievements()

  const [plannedMinutes, setPlannedMinutes] = useState(5)
  const [customValue, setCustomValue] = useState('')
  const [status, setStatus] = useState(STATUS.IDLE)
  const [remaining, setRemaining] = useState(5 * 60)
  const [ambient, setAmbient] = useState('none')
  const [saveError, setSaveError] = useState('')

  // Momento (timestamp) en que debería terminar la sesión en curso. Al basar
  // el contador en la hora real evitamos la deriva de un setInterval de 1s.
  const deadlineRef = useRef(null)
  const ambientRef = useRef(null)

  // Creamos el controlador de audio una sola vez y lo liberamos al desmontar.
  if (ambientRef.current === null) {
    ambientRef.current = createAmbientController()
  }
  useEffect(() => {
    const controller = ambientRef.current
    return () => controller?.dispose()
  }, [])

  const isActive = status === STATUS.RUNNING || status === STATUS.PAUSED
  const totalSeconds = plannedMinutes * 60
  const progress = totalSeconds ? 1 - remaining / totalSeconds : 0

  // Registra la sesión completada. Solo se llama al llegar el reloj a cero.
  const finalize = useCallback(async () => {
    deadlineRef.current = null
    setSaveError('')
    const { error: sessionError } = await saveSession({
      durationMinutes: plannedMinutes,
    })
    if (sessionError) {
      setSaveError('No se ha podido guardar la sesión. Revisa tu conexión.')
    } else {
      checkAchievements()
    }
  }, [plannedMinutes, saveSession, checkAchievements])

  // Bucle del reloj: mientras corre, recalculamos el tiempo restante a partir
  // del deadline. Al llegar a 0, la meditación se considera completada.
  useEffect(() => {
    if (status !== STATUS.RUNNING) return

    const tick = () => {
      const secondsLeft = Math.round((deadlineRef.current - Date.now()) / 1000)
      if (secondsLeft <= 0) {
        setRemaining(0)
        setStatus(STATUS.FINISHED)
        ambientRef.current?.stop()
        playBowl()
        finalize()
      } else {
        setRemaining(secondsLeft)
      }
    }

    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [status, finalize])

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

  // Cambiar el ambiente: si hay una sesión en marcha, lo aplicamos al vuelo.
  function selectAmbient(id) {
    setAmbient(id)
    if (status === STATUS.RUNNING) {
      ambientRef.current?.start(id)
    }
  }

  function handleStart() {
    deadlineRef.current = Date.now() + remaining * 1000
    setStatus(STATUS.RUNNING)
    ambientRef.current?.start(ambient)
  }

  function handlePause() {
    deadlineRef.current = null
    setStatus(STATUS.PAUSED)
    ambientRef.current?.setMuted(true)
  }

  function handleResume() {
    deadlineRef.current = Date.now() + remaining * 1000
    setStatus(STATUS.RUNNING)
    ambientRef.current?.setMuted(false)
  }

  function handleCancel() {
    setStatus(STATUS.IDLE)
    setRemaining(totalSeconds)
    ambientRef.current?.stop()
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
        <h1 className="text-2xl font-bold text-slate-900">Meditación</h1>
        <p className="mt-1 text-slate-500">
          Tómate unos minutos para respirar y calmar la mente. Elige una duración y, si quieres,
          un sonido ambiental.
        </p>
      </div>

      {/* Temporizador */}
      <section className="rounded-3xl border border-teal-100 bg-gradient-to-b from-teal-50/60 to-white p-6 shadow-xl shadow-teal-100/40 sm:p-8">
        {/* Selector de duración */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => selectDuration(minutes)}
              disabled={isActive}
              className={[
                'rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40',
                plannedMinutes === minutes && presetActive
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                  : 'bg-white/70 text-slate-600 hover:bg-white',
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
              className="w-20 rounded-xl border border-teal-200 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-40"
            />
            <span className="text-sm text-slate-400">min</span>
          </div>
        </div>

        {/* Selector de sonido ambiental */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {AMBIENTS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectAmbient(id)}
              className={[
                'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition',
                ambient === id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white/70 text-slate-500 hover:bg-white hover:text-slate-700',
              ].join(' ')}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
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
                className="text-teal-100"
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
                  status === STATUS.FINISHED ? 'text-emerald-500' : 'text-teal-500',
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
                {status === STATUS.RUNNING && 'Respira…'}
                {status === STATUS.PAUSED && 'En pausa'}
                {status === STATUS.FINISHED && '¡Sesión completada! 🧘'}
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
                className="flex items-center gap-2 rounded-2xl bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-700"
              >
                <Play className="h-5 w-5" />
                Empezar
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
                  className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-600"
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
                  className="flex items-center gap-2 rounded-2xl bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-700"
                >
                  <Play className="h-5 w-5" />
                  Reanudar
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-600"
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
                className="flex items-center gap-2 rounded-2xl bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-700"
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
          icon={Sparkles}
          label="Esta semana"
          value={`${stats.weekSessions} ${stats.weekSessions === 1 ? 'sesión' : 'sesiones'}`}
          caption={formatMinutes(stats.weekMinutes)}
        />
        <StatCard
          icon={Flame}
          label="Racha"
          value={`${stats.streak} ${stats.streak === 1 ? 'día' : 'días'}`}
          caption="Días seguidos meditando"
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
            Aún no tienes sesiones registradas. Completa tu primera meditación para verla aquí.
          </p>
        )}

        {!loading && !error && sessions.length > 0 && (
          <ul className="flex flex-col gap-2">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Wind className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {formatMinutes(session.duration_minutes)} de meditación
                  </p>
                  <p className="text-xs capitalize text-slate-400">
                    {relativeDayLabel(session.date)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-600">
                  Completada
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
