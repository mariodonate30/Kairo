import { useState } from 'react'
import { CalendarDays, Check, Pencil, Plus, Target, Trash2, X } from 'lucide-react'
import { useGoals, MAX_GOALS_PER_DAY } from '../hooks/useGoals'
import { useAchievements } from '../hooks/useAchievements'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { relativeDayLabel } from '../utils/dateHelpers'

function ProgressBar({ percent }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-violet-500 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

function StatCard({ label, value, caption }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {caption && <p className="mt-0.5 text-xs text-slate-400">{caption}</p>}
    </div>
  )
}

function GoalRow({ goal, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(goal.goal_text)

  async function handleSave() {
    await onEdit(goal, text)
    setEditing(false)
  }

  function handleCancel() {
    setText(goal.goal_text)
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="flex items-center gap-2 rounded-2xl border border-violet-200 bg-white px-3 py-2.5">
        <input
          autoFocus
          type="text"
          value={text}
          maxLength={120}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50"
          aria-label="Guardar cambios"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
          aria-label="Cancelar"
        >
          <X className="h-4 w-4" />
        </button>
      </li>
    )
  }

  return (
    <li className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2.5">
      <button
        type="button"
        onClick={() => onToggle(goal)}
        className={[
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition',
          goal.completed
            ? 'border-violet-600 bg-violet-600 text-white'
            : 'border-slate-300 text-transparent hover:border-violet-400',
        ].join(' ')}
        aria-label={goal.completed ? 'Marcar como pendiente' : 'Marcar como cumplido'}
      >
        <Check className="h-4 w-4" />
      </button>

      <span
        className={[
          'min-w-0 flex-1 break-words text-sm',
          goal.completed ? 'text-slate-400 line-through' : 'text-slate-800',
        ].join(' ')}
      >
        {goal.goal_text}
      </span>

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-500 lg:opacity-0 lg:group-hover:opacity-100"
        aria-label="Editar objetivo"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(goal)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 lg:opacity-0 lg:group-hover:opacity-100"
        aria-label="Eliminar objetivo"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}

export default function Goals() {
  const {
    todayGoals,
    history,
    stats,
    loading,
    error,
    canAddMore,
    addGoal,
    toggleGoal,
    updateGoalText,
    deleteGoal,
  } = useGoals()
  const { checkAchievements } = useAchievements()

  const [newGoal, setNewGoal] = useState('')
  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState('')

  const completedToday = todayGoals.filter((goal) => goal.completed).length
  const percentToday = todayGoals.length
    ? Math.round((completedToday / todayGoals.length) * 100)
    : 0

  // Al marcar/desmarcar un objetivo, comprobamos logros (día redondo, total de
  // objetivos cumplidos). checkAchievements es idempotente, así que también
  // recalcula sin problema al desmarcar.
  async function handleToggle(goal) {
    const { error: toggleError } = await toggleGoal(goal)
    if (!toggleError) checkAchievements()
    return { error: toggleError }
  }

  async function handleAdd(e) {
    e.preventDefault()
    const text = newGoal.trim()
    if (!text) return

    setFormError('')
    setAdding(true)
    const { error: addError } = await addGoal(text)
    setAdding(false)

    if (addError) {
      setFormError('No se ha podido añadir el objetivo. Inténtalo de nuevo.')
    } else {
      setNewGoal('')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis objetivos</h1>
        <p className="mt-1 text-slate-500">
          Escribe hasta {MAX_GOALS_PER_DAY} prioridades para hoy y márcalas a medida que las cumplas.
        </p>
      </div>

      {loading && <LoadingSpinner label="Cargando tus objetivos…" />}

      {!loading && (
        <>
          {/* Objetivos de hoy */}
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Objetivos de hoy</h2>
                  <p className="text-xs text-slate-400">
                    {todayGoals.length
                      ? `${completedToday} de ${todayGoals.length} cumplidos`
                      : 'Aún no has añadido objetivos'}
                  </p>
                </div>
              </div>
              {todayGoals.length > 0 && (
                <span className="text-lg font-bold text-violet-600">{percentToday}%</span>
              )}
            </div>

            {todayGoals.length > 0 && (
              <div className="mb-5">
                <ProgressBar percent={percentToday} />
              </div>
            )}

            {error && (
              <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
            )}

            <ul className="flex flex-col gap-2">
              {todayGoals.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  onToggle={handleToggle}
                  onEdit={updateGoalText}
                  onDelete={deleteGoal}
                />
              ))}
            </ul>

            {canAddMore ? (
              <form onSubmit={handleAdd} className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={newGoal}
                  maxLength={120}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder={
                    todayGoals.length === 0
                      ? '¿Cuál es tu prioridad de hoy?'
                      : 'Añadir otro objetivo…'
                  }
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
                <button
                  type="submit"
                  disabled={adding || !newGoal.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Añadir objetivo"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </form>
            ) : (
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-center text-xs text-slate-400">
                Has alcanzado el máximo de {MAX_GOALS_PER_DAY} objetivos para hoy.
              </p>
            )}

            {formError && <p className="mt-2 text-sm text-rose-600">{formError}</p>}
          </section>

          {/* Estadísticas */}
          <section className="grid grid-cols-2 gap-3">
            <StatCard
              label="Esta semana"
              value={`${stats.week.percent}%`}
              caption={`${stats.week.completed}/${stats.week.total} objetivos`}
            />
            <StatCard
              label="Últimos 30 días"
              value={`${stats.month.percent}%`}
              caption={`${stats.month.completed}/${stats.month.total} objetivos`}
            />
          </section>

          {/* Historial */}
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">Historial de días anteriores</h2>
            </div>

            {history.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                Aquí verás tu cumplimiento de días anteriores a medida que uses la app.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {history.map((day) => (
                  <li key={day.date} className="flex items-center gap-4">
                    <span className="w-24 shrink-0 text-sm font-medium capitalize text-slate-600">
                      {relativeDayLabel(day.date)}
                    </span>
                    <div className="flex-1">
                      <ProgressBar percent={day.percent} />
                    </div>
                    <span className="w-28 shrink-0 text-right text-xs text-slate-400">
                      {day.completed}/{day.total} · {day.percent}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
