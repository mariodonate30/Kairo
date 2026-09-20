import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useInitialTest } from '../hooks/useInitialTest'
import ScaleInput from '../components/ui/ScaleInput'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  GENDER_OPTIONS,
  GRADE_OPTIONS,
  INITIAL_TEST_BLOCKS,
  REQUIRED_KEYS,
  SCALE_HIGH_LABEL,
  SCALE_LOW_LABEL,
  SOCIAL_HOURS_OPTIONS,
} from '../utils/initialTest'

// Construye los dígitos de la escala (['1','2','3','4'] o hasta 5) según la
// pregunta. Rosenberg usa 1-4; el resto del test, 1-5.
function scaleDigits(max = 5) {
  return Array.from({ length: max }, (_, index) => String(index + 1))
}

// Selector de opciones en "píldoras" (género, nota media, horas en redes).
function OptionPills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const optValue = typeof option === 'string' ? option : option.value
        const optLabel = typeof option === 'string' ? option : option.label
        const isSelected = value === optValue

        return (
          <button
            key={optValue}
            type="button"
            onClick={() => onChange(optValue)}
            className={[
              'rounded-xl border px-4 py-2.5 text-sm font-semibold transition',
              isSelected
                ? 'border-violet-600 bg-violet-600 text-white'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
            ].join(' ')}
          >
            {optLabel}
          </button>
        )
      })}
    </div>
  )
}

// Renderiza una pregunta según su tipo.
function Question({ question, value, onChange }) {
  if (question.type === 'scale') {
    return (
      <ScaleInput
        label={question.text}
        value={value ?? null}
        onChange={onChange}
        emojis={scaleDigits(question.scaleMax)}
        lowLabel={SCALE_LOW_LABEL}
        highLabel={SCALE_HIGH_LABEL}
      />
    )
  }

  const options =
    question.type === 'gender'
      ? GENDER_OPTIONS
      : question.type === 'grade'
        ? GRADE_OPTIONS
        : SOCIAL_HOURS_OPTIONS

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{question.text}</p>
      <OptionPills options={options} value={value ?? null} onChange={onChange} />
    </div>
  )
}

export default function InitialTest() {
  const { initialTestCompleted, profile } = useAuth()
  const { submit } = useInitialTest()
  const firstName = profile?.full_name?.split(' ')[0]

  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const answeredRequired = useMemo(
    () => REQUIRED_KEYS.filter((key) => answers[key] != null && answers[key] !== '').length,
    [answers],
  )
  const allAnswered = answeredRequired === REQUIRED_KEYS.length

  // Estados de carga / ya completado (evita rellenarlo dos veces).
  if (initialTestCompleted === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-emerald-50">
        <LoadingSpinner label="Cargando…" />
      </div>
    )
  }

  if (initialTestCompleted) {
    return <Navigate to="/" replace />
  }

  function setAnswer(key) {
    return (value) => setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!allAnswered) {
      setError('Responde todas las preguntas antes de continuar. El género es opcional.')
      return
    }

    setError('')
    setSubmitting(true)
    const { error: submitError } = await submit(answers)
    setSubmitting(false)

    if (submitError) {
      setError(
        submitError.code === '23505'
          ? 'Este test ya estaba completado.'
          : 'No se ha podido guardar el test. Inténtalo de nuevo.',
      )
    }
    // Si va bien, refreshInitialTest() (dentro de submit) actualiza el estado y
    // el <Navigate> de arriba redirige automáticamente a la app.
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-emerald-50 px-4 py-12">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {firstName ? `¡Bienvenido/a, ${firstName}!` : '¡Bienvenido/a!'}
          </h1>
          <p className="max-w-md text-sm text-slate-500">
            Antes de empezar, responde este cuestionario inicial (unos 5 minutos). Nos da un
            punto de partida para entender cómo evolucionas. No hay respuestas correctas ni
            incorrectas: contesta con sinceridad.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {INITIAL_TEST_BLOCKS.map((block) => (
            <section
              key={block.key}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8"
            >
              <div className="mb-5">
                <h2 className="text-base font-semibold text-slate-900">{block.title}</h2>
                {block.description && (
                  <p className="mt-1 text-sm text-slate-500">{block.description}</p>
                )}
              </div>

              <div className="flex flex-col gap-6">
                {block.questions.map((question) => (
                  <Question
                    key={question.key}
                    question={question}
                    value={answers[question.key]}
                    onChange={setAnswer(question.key)}
                  />
                ))}
              </div>
            </section>
          ))}

          {error && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
          )}

          <div className="sticky bottom-4 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-lg shadow-slate-200/50 backdrop-blur">
            <p className="mb-2 text-center text-xs text-slate-400">
              {answeredRequired} de {REQUIRED_KEYS.length} respondidas
            </p>
            <button
              type="submit"
              disabled={submitting || !allAnswered}
              className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Guardando…' : 'Empezar a usar Kairo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
