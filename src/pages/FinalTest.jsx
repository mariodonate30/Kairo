import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useFinalTest } from '../hooks/useFinalTest'
import ScaleInput from '../components/ui/ScaleInput'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  FINAL_REQUIRED_KEYS,
  FINAL_TEST_BLOCKS,
  SCALE_HIGH_LABEL,
  SCALE_LOW_LABEL,
} from '../utils/finalTest'

function scaleDigits(max = 5) {
  return Array.from({ length: max }, (_, index) => String(index + 1))
}

// Selector de opciones en "píldoras" (nota, herramienta, mejora percibida).
function OptionPills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={[
              'rounded-xl border px-4 py-2.5 text-sm font-semibold transition',
              isSelected
                ? 'border-violet-600 bg-violet-600 text-white'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
            ].join(' ')}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

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

  if (question.type === 'text') {
    return (
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">{question.text}</p>
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="Escribe aquí tu respuesta…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
        />
      </div>
    )
  }

  // type === 'choice'
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{question.text}</p>
      <OptionPills options={question.options} value={value ?? null} onChange={onChange} />
    </div>
  )
}

export default function FinalTest() {
  const { finalTestActive, finalTestCompleted, profile } = useAuth()
  const { submit } = useFinalTest()
  const firstName = profile?.full_name?.split(' ')[0]

  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const answeredRequired = useMemo(
    () =>
      FINAL_REQUIRED_KEYS.filter((key) => answers[key] != null && answers[key] !== '').length,
    [answers],
  )
  const allAnswered = answeredRequired === FINAL_REQUIRED_KEYS.length

  // Cargando estado
  if (finalTestActive === null || finalTestCompleted === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-emerald-50">
        <LoadingSpinner label="Cargando…" />
      </div>
    )
  }

  // No visible si está desactivada, o si ya se completó → volver a la app.
  if (!finalTestActive || finalTestCompleted) {
    return <Navigate to="/" replace />
  }

  function setAnswer(key) {
    return (value) => setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!allAnswered) {
      setError('Responde todas las preguntas antes de enviar. El comentario es opcional.')
      return
    }

    setError('')
    setSubmitting(true)
    const { error: submitError } = await submit(answers)
    setSubmitting(false)

    if (submitError) {
      setError(
        submitError.code === '23505'
          ? 'Esta encuesta ya estaba completada.'
          : 'No se ha podido guardar la encuesta. Inténtalo de nuevo.',
      )
    }
    // Si va bien, refreshFinalTest() actualiza el estado y el <Navigate> redirige.
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-emerald-50 px-4 py-12">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
            <Trophy className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {firstName ? `¡Ya casi está, ${firstName}!` : '¡Ya casi está!'}
          </h1>
          <p className="max-w-md text-sm text-slate-500">
            Esta es la encuesta final del estudio. Compara cómo te sientes ahora, después de
            usar la app, con cómo estabas al principio. Contesta con sinceridad: es el último
            paso y el más importante para nuestras conclusiones.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {FINAL_TEST_BLOCKS.map((block) => (
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
              {answeredRequired} de {FINAL_REQUIRED_KEYS.length} respondidas
            </p>
            <button
              type="submit"
              disabled={submitting || !allAnswered}
              className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Enviando…' : 'Enviar encuesta final'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
