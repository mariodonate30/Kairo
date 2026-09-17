import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { downloadCsv } from '../../utils/exportCsv'

const yesNo = (value) => (value ? 'sí' : 'no')

// Género declarado del usuario (vacío si no lo indicó). Se añade a cada fila
// exportada para poder analizar los resultados separados por sexo.
const genderOf = (genderById, userId) => genderById.get(userId) || ''

// Definición de cada conjunto exportable. Cada uno declara sus columnas y una
// función que produce las filas ANONIMIZADAS a partir de los datos crudos, el
// mapa de anonimización (user_id → nº) y el rango de fechas [from, to].
// La columna de identidad es siempre `id` (número), nunca el nombre ni el email.
const DATASETS = [
  {
    key: 'checkins',
    label: 'Check-ins diarios',
    filename: 'kairo_checkins',
    columns: [
      { key: 'id', label: 'id' },
      { key: 'genero', label: 'genero' },
      { key: 'date', label: 'fecha' },
      { key: 'mood', label: 'animo' },
      { key: 'sleep_hours', label: 'horas_sueno' },
      { key: 'sleep_quality', label: 'calidad_sueno' },
      { key: 'nutrition', label: 'alimentacion' },
      { key: 'water_glasses', label: 'vasos_agua' },
      { key: 'stress', label: 'estres' },
      { key: 'studied', label: 'estudiado' },
      { key: 'study_minutes', label: 'minutos_estudio' },
      { key: 'exercised', label: 'ejercicio' },
    ],
    build: (data, anonIds, inRange, questions, genderById) =>
      data.checkins
        .filter((r) => inRange(r.date))
        .map((r) => ({
          id: anonIds.get(r.user_id) ?? '?',
          genero: genderOf(genderById, r.user_id),
          date: r.date,
          mood: r.mood,
          sleep_hours: r.sleep_hours,
          sleep_quality: r.sleep_quality,
          nutrition: r.nutrition,
          water_glasses: r.water_glasses,
          stress: r.stress,
          studied: yesNo(r.studied),
          study_minutes: r.study_minutes ?? '',
          exercised: yesNo(r.exercised),
        }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
  },
  {
    key: 'surveys',
    label: 'Encuestas semanales',
    filename: 'kairo_encuestas',
    // Formato largo: una fila por (encuesta, respuesta). Fácil de analizar.
    columns: [
      { key: 'id', label: 'id' },
      { key: 'genero', label: 'genero' },
      { key: 'week_start', label: 'inicio_semana' },
      { key: 'category', label: 'categoria' },
      { key: 'question_id', label: 'pregunta_id' },
      { key: 'value', label: 'valor' },
    ],
    build: (data, anonIds, inRange, questions, genderById) => {
      const categoryById = new Map(questions.map((q) => [q.id, q.category]))
      const rows = []
      for (const survey of data.surveys) {
        if (!survey.completed_at) continue
        if (!inRange(survey.week_start)) continue
        for (const [questionId, value] of Object.entries(survey.responses || {})) {
          rows.push({
            id: anonIds.get(survey.user_id) ?? '?',
            genero: genderOf(genderById, survey.user_id),
            week_start: survey.week_start,
            category: categoryById.get(questionId) || '',
            question_id: questionId,
            value,
          })
        }
      }
      return rows.sort((a, b) => (a.week_start < b.week_start ? -1 : 1))
    },
  },
  {
    key: 'goals',
    label: 'Objetivos diarios',
    filename: 'kairo_objetivos',
    columns: [
      { key: 'id', label: 'id' },
      { key: 'genero', label: 'genero' },
      { key: 'date', label: 'fecha' },
      { key: 'completed', label: 'completado' },
    ],
    build: (data, anonIds, inRange, questions, genderById) =>
      data.goals
        .filter((r) => inRange(r.date))
        .map((r) => ({
          id: anonIds.get(r.user_id) ?? '?',
          genero: genderOf(genderById, r.user_id),
          date: r.date,
          completed: yesNo(r.completed),
        }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
  },
  {
    key: 'focus',
    label: 'Sesiones de enfoque',
    filename: 'kairo_enfoque',
    columns: [
      { key: 'id', label: 'id' },
      { key: 'genero', label: 'genero' },
      { key: 'date', label: 'fecha' },
      { key: 'actual_minutes', label: 'minutos_reales' },
      { key: 'completed', label: 'completada' },
    ],
    build: (data, anonIds, inRange, questions, genderById) =>
      data.focusSessions
        .filter((r) => inRange(r.date))
        .map((r) => ({
          id: anonIds.get(r.user_id) ?? '?',
          genero: genderOf(genderById, r.user_id),
          date: r.date,
          actual_minutes: r.actual_minutes,
          completed: yesNo(r.completed),
        }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
  },
  {
    key: 'meditation',
    label: 'Sesiones de meditación',
    filename: 'kairo_meditacion',
    columns: [
      { key: 'id', label: 'id' },
      { key: 'genero', label: 'genero' },
      { key: 'date', label: 'fecha' },
      { key: 'duration_minutes', label: 'minutos' },
    ],
    build: (data, anonIds, inRange, questions, genderById) =>
      data.meditationSessions
        .filter((r) => inRange(r.date))
        .map((r) => ({
          id: anonIds.get(r.user_id) ?? '?',
          genero: genderOf(genderById, r.user_id),
          date: r.date,
          duration_minutes: r.duration_minutes,
        }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
  },
]

export default function DataExport({ data, anonIds, questions, genderById }) {
  const [datasetKey, setDatasetKey] = useState('checkins')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const dataset = DATASETS.find((d) => d.key === datasetKey) || DATASETS[0]

  // Filtro por rango: incluye una fecha si está dentro de [from, to] (ambos
  // opcionales). Se compara como cadena 'YYYY-MM-DD', que ordena lexicográficamente.
  const inRange = useMemo(() => {
    return (date) => {
      if (!date) return false
      if (from && date < from) return false
      if (to && date > to) return false
      return true
    }
  }, [from, to])

  const rows = useMemo(
    () => dataset.build(data, anonIds, inRange, questions, genderById),
    [dataset, data, anonIds, inRange, questions, genderById],
  )

  function handleDownload() {
    const suffix = [from || 'inicio', to || 'hoy'].join('_')
    downloadCsv(`${dataset.filename}_${suffix}.csv`, dataset.columns, rows)
  }

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Exportación de datos</h2>
        <p className="text-sm text-slate-400">
          Datos anonimizados (solo IDs numéricos, sin nombres) en formato CSV.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Selector de conjunto de datos */}
        <div className="flex flex-wrap gap-2">
          {DATASETS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setDatasetKey(option.key)}
              className={[
                'rounded-xl px-3.5 py-2 text-sm font-medium transition',
                datasetKey === option.key
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Filtro por fechas */}
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-500">
            Desde
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-500">
            Hasta
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </label>
          {(from || to) && (
            <button
              type="button"
              onClick={() => {
                setFrom('')
                setTo('')
              }}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            {rows.length} {rows.length === 1 ? 'fila' : 'filas'} listas para exportar.
          </p>
          <button
            type="button"
            onClick={handleDownload}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Descargar CSV
          </button>
        </div>
      </div>
    </section>
  )
}
