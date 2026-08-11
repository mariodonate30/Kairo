import { useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
} from 'lucide-react'
import { useSurveys } from '../hooks/useSurveys'
import { useAchievements } from '../hooks/useAchievements'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ScaleInput from '../components/ui/ScaleInput'
import { parseDate } from '../utils/dateHelpers'

const weekFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
})

// "Semana del 4 de agosto"
function formatWeekLabel(weekStart) {
  return `Semana del ${weekFormatter.format(parseDate(weekStart))}`
}

// Construye la escala 1-5 (o el rango configurado en la pregunta) como
// dígitos, para reutilizar ScaleInput con anclas de acuerdo/desacuerdo.
function scaleDigits(question) {
  const min = question.scale_min ?? 1
  const max = question.scale_max ?? 5
  const digits = []
  for (let n = min; n <= max; n += 1) digits.push(String(n))
  return digits
}

function SectionCard({ children, className = '' }) {
  return (
    <section
      className={`rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 ${className}`}
    >
      {children}
    </section>
  )
}

// Bloque de una categoría dentro del formulario.
function CategoryBlock({ category, answers, onAnswer }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          {category.emoji}
        </span>
        <h3 className="text-sm font-semibold text-slate-900">{category.label}</h3>
      </div>

      <div className="flex flex-col gap-6">
        {category.questions.map((question) => (
          <div key={question.id}>
            <ScaleInput
              label={question.question_text}
              value={answers[question.id] ?? null}
              onChange={(value) => onAnswer(question.id, value)}
              emojis={scaleDigits(question)}
              lowLabel="Nada de acuerdo"
              highLabel="Totalmente de acuerdo"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Formulario de la encuesta de la semana actual.
function SurveyForm({ categories, weekStart, onSubmit }) {
  const { checkAchievements } = useAchievements()
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const totalQuestions = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.questions.length, 0),
    [categories],
  )
  const answeredCount = Object.keys(answers).length
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions

  function handleAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!allAnswered) {
      setFormError('Responde todas las preguntas antes de enviar.')
      return
    }

    setFormError('')
    setSubmitting(true)
    const { error } = await onSubmit(answers)
    setSubmitting(false)

    if (error) {
      setFormError('No se ha podido guardar la encuesta. Inténtalo de nuevo.')
    } else {
      checkAchievements()
    }
  }

  return (
    <SectionCard>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {formatWeekLabel(weekStart)}
            </h2>
            <p className="text-xs text-slate-400">
              {answeredCount} de {totalQuestions} respondidas
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
          Pendiente
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {categories.map((category) => (
          <CategoryBlock
            key={category.key}
            category={category}
            answers={answers}
            onAnswer={handleAnswer}
          />
        ))}

        {formError && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{formError}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !allAnswered}
          className="flex h-12 items-center justify-center rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Guardando…' : 'Enviar encuesta'}
        </button>
      </form>
    </SectionCard>
  )
}

// Muestra las respuestas de una encuesta agrupadas por categoría.
function SurveyResponses({ categories, responses }) {
  return (
    <div className="flex flex-col gap-5">
      {categories.map((category) => (
        <div key={category.key}>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base" aria-hidden="true">
              {category.emoji}
            </span>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {category.label}
            </h4>
          </div>
          <ul className="flex flex-col gap-2">
            {category.questions.map((question) => {
              const value = responses?.[question.id]
              const max = question.scale_max ?? 5
              return (
                <li
                  key={question.id}
                  className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1 text-sm text-slate-700">
                    {question.question_text}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-violet-600">
                    {value != null ? `${value}/${max}` : '—'}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

// Resumen "✓ Completada" de la encuesta de la semana actual.
function CompletedSummary({ categories, survey }) {
  const completedDate = survey.completed_at
    ? new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(survey.completed_at))
    : null

  return (
    <SectionCard>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {formatWeekLabel(survey.week_start)}
            </h2>
            {completedDate && (
              <p className="text-xs text-slate-400">Completada el {completedDate}</p>
            )}
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Completada
        </span>
      </div>

      <SurveyResponses categories={categories} responses={survey.responses} />
    </SectionCard>
  )
}

// Fila desplegable del historial de encuestas pasadas.
function HistoryRow({ categories, survey }) {
  const [open, setOpen] = useState(false)
  const answered = survey.responses ? Object.keys(survey.responses).length : 0

  return (
    <li className="overflow-hidden rounded-2xl border border-slate-100">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 bg-white px-4 py-3 text-left transition hover:bg-slate-50"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium capitalize text-slate-800">
            {formatWeekLabel(survey.week_start)}
          </p>
          <p className="text-xs text-slate-400">
            {survey.completed_at ? `${answered} respuestas` : 'No respondida'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {survey.completed_at ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
              Completada
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
              No respondida
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4">
          {survey.completed_at ? (
            <SurveyResponses categories={categories} responses={survey.responses} />
          ) : (
            <p className="text-sm text-slate-400">Esta encuesta no llegó a responderse.</p>
          )}
        </div>
      )}
    </li>
  )
}

export default function Surveys() {
  const {
    categories,
    currentSurvey,
    history,
    weekStart,
    loading,
    error,
    isCompleted,
    submitSurvey,
  } = useSurveys()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Encuestas semanales</h1>
        <p className="mt-1 text-slate-500">
          Cada lunes se desbloquea una nueva encuesta. Responde con sinceridad: nos ayuda a
          entender cómo evoluciona vuestro bienestar.
        </p>
      </div>

      {loading && <LoadingSpinner label="Cargando encuestas…" />}

      {!loading && error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
      )}

      {!loading && !error && (
        <>
          {categories.length === 0 ? (
            <SectionCard className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-500">
                Todavía no hay preguntas configuradas para la encuesta. Vuelve más tarde.
              </p>
            </SectionCard>
          ) : isCompleted ? (
            <CompletedSummary categories={categories} survey={currentSurvey} />
          ) : (
            <SurveyForm
              categories={categories}
              weekStart={weekStart}
              onSubmit={submitSurvey}
            />
          )}

          {/* Historial de encuestas pasadas */}
          <SectionCard>
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">Historial de encuestas</h2>
            </div>

            {history.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                Aquí verás tus encuestas de semanas anteriores a medida que las completes.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {history.map((survey) => (
                  <HistoryRow key={survey.id} categories={categories} survey={survey} />
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      )}
    </div>
  )
}
