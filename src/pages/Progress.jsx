import { useMemo, useState } from 'react'
import {
  Droplets,
  GraduationCap,
  Moon,
  Radar as RadarIcon,
  Smile,
  Target,
  Zap,
} from 'lucide-react'
import { useProgress } from '../hooks/useProgress'
import { SURVEY_CATEGORIES } from '../hooks/useSurveys'
import { daysAgo, parseDate } from '../utils/dateHelpers'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ChartCard from '../components/charts/ChartCard'
import MoodChart from '../components/charts/MoodChart'
import SleepChart from '../components/charts/SleepChart'
import StressChart from '../components/charts/StressChart'
import WaterChart from '../components/charts/WaterChart'
import StudyChart from '../components/charts/StudyChart'
import GoalCompletionChart from '../components/charts/GoalCompletionChart'
import SurveyRadarChart from '../components/charts/SurveyRadarChart'

// Rangos temporales disponibles. `days` a null significa "todo el historial".
const RANGES = [
  { key: 'week', label: 'Última semana', days: 7 },
  { key: 'month', label: 'Último mes', days: 30 },
  { key: 'all', label: 'Todo', days: null },
]

// Etiqueta compacta "día/mes" para los ejes X.
function shortLabel(dateStr) {
  const date = parseDate(dateStr)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

// Media de una propiedad numérica, ignorando valores nulos.
function average(rows, key) {
  const values = rows
    .map((row) => row[key])
    .filter((value) => value != null && !Number.isNaN(value))
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

// Convierte los check-ins del rango en filas listas para los gráficos diarios.
function buildDailyRows(checkins, fromDate) {
  return checkins
    .filter((checkin) => !fromDate || checkin.date >= fromDate)
    .map((checkin) => ({
      date: checkin.date,
      label: shortLabel(checkin.date),
      mood: checkin.mood ?? null,
      sleep_hours: checkin.sleep_hours != null ? Number(checkin.sleep_hours) : null,
      stress: checkin.stress ?? null,
      water_glasses: checkin.water_glasses ?? 0,
      study_minutes: checkin.study_minutes ?? 0,
    }))
}

// Agrupa los objetivos por día y calcula el porcentaje de cumplimiento diario.
function buildGoalRows(goals, fromDate) {
  const byDate = new Map()

  for (const goal of goals) {
    if (fromDate && goal.date < fromDate) continue
    if (!byDate.has(goal.date)) {
      byDate.set(goal.date, { total: 0, completed: 0 })
    }
    const day = byDate.get(goal.date)
    day.total += 1
    if (goal.completed) day.completed += 1
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, { total, completed }]) => ({
      date,
      label: shortLabel(date),
      percent: total ? Math.round((completed / total) * 100) : 0,
    }))
}

// Media por categoría (normalizada a 0-100 %) de las respuestas de las encuestas
// completadas dentro del rango. Devuelve solo las categorías con datos.
function buildRadarRows(surveys, questions, fromDate) {
  const questionMeta = new Map(
    questions.map((q) => [
      q.id,
      { category: q.category, min: q.scale_min ?? 1, max: q.scale_max ?? 5 },
    ]),
  )

  const byCategory = new Map() // category -> { sum, count } de porcentajes

  for (const survey of surveys) {
    if (!survey.completed_at) continue
    if (fromDate && survey.week_start < fromDate) continue

    const responses = survey.responses || {}
    for (const [questionId, rawValue] of Object.entries(responses)) {
      const meta = questionMeta.get(questionId)
      const value = Number(rawValue)
      if (!meta || Number.isNaN(value)) continue

      const span = meta.max - meta.min
      const percent = span > 0 ? ((value - meta.min) / span) * 100 : 0
      const clamped = Math.min(100, Math.max(0, percent))

      if (!byCategory.has(meta.category)) {
        byCategory.set(meta.category, { sum: 0, count: 0 })
      }
      const bucket = byCategory.get(meta.category)
      bucket.sum += clamped
      bucket.count += 1
    }
  }

  // Respetamos el orden de SURVEY_CATEGORIES y solo mostramos las que tienen datos.
  return SURVEY_CATEGORIES.filter((cat) => byCategory.get(cat.key)?.count).map((cat) => {
    const bucket = byCategory.get(cat.key)
    return {
      category: cat.label,
      value: Math.round(bucket.sum / bucket.count),
    }
  })
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`flex items-center gap-2 ${accent}`}>
        <Icon className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      </div>
      <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

export default function Progress() {
  const { checkins, goals, surveys, questions, loading, error } = useProgress()
  const [rangeKey, setRangeKey] = useState('month')

  const range = RANGES.find((r) => r.key === rangeKey) || RANGES[1]
  const fromDate = range.days ? daysAgo(range.days) : null

  const dailyRows = useMemo(() => buildDailyRows(checkins, fromDate), [checkins, fromDate])
  const goalRows = useMemo(() => buildGoalRows(goals, fromDate), [goals, fromDate])
  const radarRows = useMemo(
    () => buildRadarRows(surveys, questions, fromDate),
    [surveys, questions, fromDate],
  )

  // Resumen numérico del periodo para las tarjetas superiores.
  const summary = useMemo(() => {
    const mood = average(dailyRows, 'mood')
    const sleep = average(dailyRows, 'sleep_hours')
    const stress = average(dailyRows, 'stress')
    const goalPercent = average(goalRows, 'percent')
    return {
      mood: mood != null ? mood.toFixed(1) : '—',
      sleep: sleep != null ? `${sleep.toFixed(1)} h` : '—',
      stress: stress != null ? stress.toFixed(1) : '—',
      goals: goalPercent != null ? `${Math.round(goalPercent)}%` : '—',
    }
  }, [dailyRows, goalRows])

  const hasDaily = dailyRows.length > 0
  const hasGoals = goalRows.length > 0
  const hasRadar = radarRows.length > 0

  if (loading) {
    return <LoadingSpinner label="Cargando tu progresión…" />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mi progresión</h1>
          <p className="mt-1 text-slate-500">
            Observa cómo evolucionan tus hábitos: ánimo, sueño, estrés, hidratación, estudio y
            objetivos.
          </p>
        </div>

        {/* Filtro temporal */}
        <div className="flex shrink-0 rounded-2xl bg-slate-100 p-1">
          {RANGES.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRangeKey(option.key)}
              className={[
                'rounded-xl px-3.5 py-1.5 text-sm font-medium transition',
                rangeKey === option.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}

      {/* Resumen del periodo */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Smile} label="Ánimo medio" value={summary.mood} accent="text-violet-500" />
        <StatCard icon={Moon} label="Sueño medio" value={summary.sleep} accent="text-indigo-500" />
        <StatCard icon={Zap} label="Estrés medio" value={summary.stress} accent="text-rose-500" />
        <StatCard
          icon={Target}
          label="Objetivos"
          value={summary.goals}
          accent="text-emerald-500"
        />
      </section>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          icon={Smile}
          title="Estado de ánimo"
          subtitle="Escala 1-5 por día"
          accent="violet"
          hasData={hasDaily}
        >
          <MoodChart data={dailyRows} />
        </ChartCard>

        <ChartCard
          icon={Moon}
          title="Horas de sueño"
          subtitle="Horas registradas por día"
          accent="indigo"
          hasData={hasDaily}
        >
          <SleepChart data={dailyRows} />
        </ChartCard>

        <ChartCard
          icon={Zap}
          title="Nivel de estrés"
          subtitle="Escala 1-5 por día"
          accent="rose"
          hasData={hasDaily}
        >
          <StressChart data={dailyRows} />
        </ChartCard>

        <ChartCard
          icon={Droplets}
          title="Vasos de agua"
          subtitle="Hidratación por día"
          accent="sky"
          hasData={hasDaily}
        >
          <WaterChart data={dailyRows} />
        </ChartCard>

        <ChartCard
          icon={GraduationCap}
          title="Minutos de estudio"
          subtitle="Tiempo de estudio por día"
          accent="amber"
          hasData={hasDaily}
        >
          <StudyChart data={dailyRows} />
        </ChartCard>

        <ChartCard
          icon={Target}
          title="Cumplimiento de objetivos"
          subtitle="Porcentaje cumplido por día"
          accent="emerald"
          hasData={hasGoals}
          emptyLabel="Aún no has registrado objetivos en este periodo."
        >
          <GoalCompletionChart data={goalRows} />
        </ChartCard>
      </div>

      {/* Encuestas semanales por categoría (radar, a ancho completo) */}
      <ChartCard
        icon={RadarIcon}
        title="Encuestas semanales por categoría"
        subtitle="Media de tus respuestas (0-100 %) en el periodo"
        accent="violet"
        hasData={hasRadar}
        emptyLabel="Completa alguna encuesta semanal para ver este gráfico."
      >
        <SurveyRadarChart data={radarRows} />
      </ChartCard>
    </div>
  )
}
