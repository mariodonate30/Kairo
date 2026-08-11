import { useState } from 'react'
import { Check, Eye, EyeOff, Pencil, Plus, X } from 'lucide-react'
import { SURVEY_CATEGORIES } from '../../hooks/useSurveys'

const CATEGORY_LABELS = Object.fromEntries(
  SURVEY_CATEGORIES.map((cat) => [cat.key, `${cat.emoji} ${cat.label}`]),
)

const EMPTY_DRAFT = { questionText: '', category: 'stress', sortOrder: '' }

// Selector de categoría reutilizable.
function CategorySelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
    >
      {SURVEY_CATEGORIES.map((cat) => (
        <option key={cat.key} value={cat.key}>
          {cat.emoji} {cat.label}
        </option>
      ))}
    </select>
  )
}

// Fila de una pregunta existente: vista normal o modo edición.
function QuestionRow({ question, onUpdate, onToggle }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    questionText: question.question_text,
    category: question.category,
    sortOrder: String(question.sort_order),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!draft.questionText.trim()) {
      setError('El texto no puede estar vacío.')
      return
    }
    setSaving(true)
    setError('')
    const { error: err } = await onUpdate(question.id, {
      questionText: draft.questionText.trim(),
      category: draft.category,
      sortOrder: Number(draft.sortOrder) || 0,
    })
    setSaving(false)
    if (err) {
      setError('No se ha podido guardar.')
    } else {
      setEditing(false)
    }
  }

  function handleCancel() {
    setDraft({
      questionText: question.question_text,
      category: question.category,
      sortOrder: String(question.sort_order),
    })
    setError('')
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4">
        <div className="flex flex-col gap-3">
          <textarea
            value={draft.questionText}
            onChange={(e) => setDraft((d) => ({ ...d, questionText: e.target.value }))}
            rows={2}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
          <div className="flex flex-wrap items-center gap-2">
            <CategorySelect
              value={draft.category}
              onChange={(value) => setDraft((d) => ({ ...d, category: value }))}
            />
            <label className="flex items-center gap-2 text-sm text-slate-500">
              Orden
              <input
                type="number"
                value={draft.sortOrder}
                onChange={(e) => setDraft((d) => ({ ...d, sortOrder: e.target.value }))}
                className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </label>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                Guardar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
      </li>
    )
  }

  return (
    <li
      className={`rounded-2xl border p-4 ${
        question.active ? 'border-slate-100 bg-white' : 'border-slate-100 bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
          #{question.sort_order}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm ${question.active ? 'text-slate-800' : 'text-slate-400'}`}>
            {question.question_text}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">
              {CATEGORY_LABELS[question.category] || question.category}
            </span>
            {!question.active && (
              <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">
                Desactivada
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Editar pregunta"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggle(question.id, !question.active)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label={question.active ? 'Desactivar pregunta' : 'Activar pregunta'}
            title={question.active ? 'Desactivar' : 'Activar'}
          >
            {question.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </li>
  )
}

// Formulario para añadir una pregunta nueva.
function NewQuestionForm({ onCreate, nextOrder }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!draft.questionText.trim()) {
      setError('Escribe el texto de la pregunta.')
      return
    }
    setSaving(true)
    setError('')
    const { error: err } = await onCreate({
      questionText: draft.questionText.trim(),
      category: draft.category,
      sortOrder: draft.sortOrder ? Number(draft.sortOrder) : nextOrder,
    })
    setSaving(false)
    if (err) {
      setError('No se ha podido crear la pregunta.')
    } else {
      setDraft(EMPTY_DRAFT)
      setOpen(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50/50 px-4 py-2.5 text-sm font-medium text-violet-600 transition hover:bg-violet-50"
      >
        <Plus className="h-4 w-4" />
        Añadir pregunta
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50/40 p-4"
    >
      <textarea
        value={draft.questionText}
        onChange={(e) => setDraft((d) => ({ ...d, questionText: e.target.value }))}
        rows={2}
        placeholder="Texto de la pregunta…"
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
      />
      <div className="flex flex-wrap items-center gap-2">
        <CategorySelect
          value={draft.category}
          onChange={(value) => setDraft((d) => ({ ...d, category: value }))}
        />
        <label className="flex items-center gap-2 text-sm text-slate-500">
          Orden
          <input
            type="number"
            value={draft.sortOrder}
            onChange={(e) => setDraft((d) => ({ ...d, sortOrder: e.target.value }))}
            placeholder={String(nextOrder)}
            className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </label>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Crear
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(EMPTY_DRAFT)
              setError('')
              setOpen(false)
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </form>
  )
}

// Gestión completa de las preguntas de la encuesta semanal.
export default function SurveyManager({ questions, onCreate, onUpdate, onToggle }) {
  const nextOrder =
    questions.reduce((max, q) => Math.max(max, q.sort_order || 0), 0) + 10

  const activeCount = questions.filter((q) => q.active).length

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Gestión de encuestas</h2>
          <p className="text-sm text-slate-400">
            {activeCount} preguntas activas de {questions.length} en total.
          </p>
        </div>
        <NewQuestionForm onCreate={onCreate} nextOrder={nextOrder} />
      </div>

      {questions.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
          Aún no hay preguntas. Añade la primera para empezar.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {questions.map((question) => (
            <QuestionRow
              key={question.id}
              question={question}
              onUpdate={onUpdate}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
