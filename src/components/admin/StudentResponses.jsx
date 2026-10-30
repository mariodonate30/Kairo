import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, UserRound } from 'lucide-react'
import { GENDER_OPTIONS, INITIAL_TEST_BLOCKS } from '../../utils/initialTest'
import { FINAL_TEST_BLOCKS } from '../../utils/finalTest'
import { rosenbergScore } from '../../utils/adminStats'

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'both', label: 'Inicial + final' },
  { key: 'initial_only', label: 'Solo inicial' },
]

const INITIAL_KEYS = new Set(INITIAL_TEST_BLOCKS.flatMap((b) => b.questions.map((q) => q.key)))
const FINAL_KEYS = new Set(FINAL_TEST_BLOCKS.flatMap((b) => b.questions.map((q) => q.key)))

// Secciones a mostrar: los bloques del test inicial (con la columna final si la
// pregunta se repite) y luego las preguntas que solo existen en la encuesta final.
const SECTIONS = [
  ...INITIAL_TEST_BLOCKS.map((block) => ({
    key: `i_${block.key}`,
    title: block.title,
    questions: block.questions,
  })),
  ...FINAL_TEST_BLOCKS.map((block) => ({
    key: `f_${block.key}`,
    title: `${block.title} (solo encuesta final)`,
    questions: block.questions.filter((q) => !INITIAL_KEYS.has(q.key)),
  })).filter((section) => section.questions.length > 0),
]

// Convierte una respuesta guardada en texto legible según el tipo de pregunta.
function formatAnswer(question, value) {
  if (value == null || value === '') return null
  if (question.type === 'gender') {
    return GENDER_OPTIONS.find((o) => o.value === value)?.label || value
  }
  if (question.type === 'scale') return `${value} / ${question.scaleMax || 5}`
  return String(value)
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function AnswerCell({ question, value, asked }) {
  if (!asked) return <span className="text-xs text-slate-300">No se pregunta</span>
  const text = formatAnswer(question, value)
  if (text == null) return <span className="text-slate-300">—</span>
  if (question.type === 'text') {
    return <p className="whitespace-pre-wrap text-sm text-slate-700">{text}</p>
  }
  return <span className="font-semibold text-slate-800">{text}</span>
}

export default function StudentResponses({ initialTests, finalTests, anonIds, genderById }) {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  // Un registro por alumno que haya hecho al menos uno de los dos tests.
  const students = useMemo(() => {
    const initialByUser = new Map(initialTests.map((t) => [t.user_id, t]))
    const finalByUser = new Map(finalTests.map((t) => [t.user_id, t]))
    const userIds = new Set([...initialByUser.keys(), ...finalByUser.keys()])

    return Array.from(userIds)
      .map((userId) => {
        const initial = initialByUser.get(userId) || null
        const final = finalByUser.get(userId) || null
        return {
          userId,
          anonId: anonIds.get(userId) ?? '?',
          gender: genderById.get(userId) || '',
          initial,
          final,
          initialScore: initial ? rosenbergScore(initial.responses) : null,
          finalScore: final ? rosenbergScore(final.responses) : null,
        }
      })
      .sort((a, b) => {
        if (typeof a.anonId === 'number' && typeof b.anonId === 'number') return a.anonId - b.anonId
        return String(a.anonId).localeCompare(String(b.anonId))
      })
  }, [initialTests, finalTests, anonIds, genderById])

  const visible = students.filter((s) => {
    if (filter === 'both' && !(s.initial && s.final)) return false
    if (filter === 'initial_only' && !(s.initial && !s.final)) return false
    if (query.trim() && !String(s.anonId).includes(query.trim())) return false
    return true
  })

  const selected =
    visible.find((s) => s.userId === selectedId) || visible[0] || null
  const index = selected ? visible.indexOf(selected) : -1

  if (students.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Todavía ningún alumno ha respondido el test inicial ni la encuesta final.
      </section>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
      {/* Lista de alumnos */}
      <section className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm lg:max-h-[75vh]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            inputMode="numeric"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nº de alumno"
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-400"
          />
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1">
          {FILTERS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              className={[
                'flex-1 rounded-lg px-2 py-1 text-xs font-medium transition',
                filter === option.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400">{visible.length} alumno(s)</p>

        <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto lg:max-h-none lg:flex-1">
          {visible.map((s) => (
            <li key={s.userId}>
              <button
                type="button"
                onClick={() => setSelectedId(s.userId)}
                className={[
                  'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition',
                  selected?.userId === s.userId
                    ? 'bg-violet-50 font-semibold text-violet-700'
                    : 'text-slate-700 hover:bg-slate-50',
                ].join(' ')}
              >
                <span>Alumno {s.anonId}</span>
                <span className="flex gap-1">
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                      s.initial ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    I
                  </span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                      s.final ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    F
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Detalle del alumno seleccionado */}
      {!selected ? (
        <section className="rounded-3xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Ningún alumno coincide con el filtro.
        </section>
      ) : (
        <section className="flex flex-col gap-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Alumno {selected.anonId}</h2>
                <p className="text-xs text-slate-400">
                  {selected.gender === 'chico' ? 'Chico' : selected.gender === 'chica' ? 'Chica' : 'Género no indicado'}
                  {' · '}Inicial: {formatDate(selected.initial?.completed_at)}
                  {' · '}Final: {formatDate(selected.final?.completed_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={index <= 0}
                onClick={() => setSelectedId(visible[index - 1].userId)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                aria-label="Alumno anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={index >= visible.length - 1}
                onClick={() => setSelectedId(visible[index + 1].userId)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                aria-label="Alumno siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-sky-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-sky-600">Autoestima inicial</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{selected.initialScore ?? '—'}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Autoestima final</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{selected.finalScore ?? '—'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Variación</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {selected.initialScore != null && selected.finalScore != null
                  ? `${selected.finalScore - selected.initialScore > 0 ? '+' : ''}${selected.finalScore - selected.initialScore}`
                  : '—'}
              </p>
            </div>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.key}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {section.title}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                      <th className="px-3 py-2 font-medium">Pregunta</th>
                      <th className="w-32 px-3 py-2 font-medium text-sky-600">Test inicial</th>
                      <th className="w-32 px-3 py-2 font-medium text-emerald-600">Encuesta final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.questions.map((question) => {
                      const inInitial = INITIAL_KEYS.has(question.key)
                      const inFinal = FINAL_KEYS.has(question.key)
                      return (
                        <tr key={question.key} className="border-b border-slate-50 align-top last:border-0">
                          <td className="px-3 py-2 text-slate-600">
                            {question.text}
                            {question.reverse && (
                              <span className="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                                inversa
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {selected.initial || !inInitial ? (
                              <AnswerCell
                                question={question}
                                value={selected.initial?.responses?.[question.key]}
                                asked={inInitial}
                              />
                            ) : (
                              <span className="text-xs text-slate-300">No lo hizo</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {selected.final || !inFinal ? (
                              <AnswerCell
                                question={question}
                                value={selected.final?.responses?.[question.key]}
                                asked={inFinal}
                              />
                            ) : (
                              <span className="text-xs text-slate-300">No lo hizo</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
