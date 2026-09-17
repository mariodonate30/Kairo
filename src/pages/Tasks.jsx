import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useTasks, PRIORITIES } from '../hooks/useTasks'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  addMonths,
  addDays,
  formatDayLabel,
  formatMonthLabel,
  formatWeekRange,
  isSameMonth,
  monthMatrix,
  todayDate,
  weekDates,
  parseDate,
} from '../utils/dateHelpers'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// Configuración visual por prioridad. `dot` para los chips del calendario,
// `chip`/`badge` para etiquetas y `button` para el selector del formulario.
const PRIORITY_CONFIG = {
  alta: {
    label: 'Alta',
    dot: 'bg-rose-500',
    chip: 'bg-rose-50 text-rose-700 border-rose-100',
    activeButton: 'border-rose-400 bg-rose-50 text-rose-700',
  },
  media: {
    label: 'Media',
    dot: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700 border-amber-100',
    activeButton: 'border-amber-400 bg-amber-50 text-amber-700',
  },
  baja: {
    label: 'Baja',
    dot: 'bg-sky-500',
    chip: 'bg-sky-50 text-sky-700 border-sky-100',
    activeButton: 'border-sky-400 bg-sky-50 text-sky-700',
  },
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ============================================================
// Modal para crear / editar una tarea.
// ============================================================
function TaskModal({ initialDate, task, onClose, onSubmit, onDelete }) {
  const isEditing = Boolean(task)
  const [title, setTitle] = useState(task?.title || '')
  const [subject, setSubject] = useState(task?.subject || '')
  const [description, setDescription] = useState(task?.description || '')
  const [dueDate, setDueDate] = useState(task?.due_date || initialDate)
  const [priority, setPriority] = useState(task?.priority || 'media')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setFormError('Ponle un título a la tarea.')
      return
    }
    setSaving(true)
    setFormError('')
    const { error } = await onSubmit({ title, subject, description, dueDate, priority })
    setSaving(false)
    if (error) {
      setFormError('No se ha podido guardar. Inténtalo de nuevo.')
    } else {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Título</label>
            <input
              autoFocus
              type="text"
              value={title}
              maxLength={140}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Entregar trabajo de Historia"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Fecha de entrega
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Asignatura <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={subject}
                maxLength={40}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej. Matemáticas"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Prioridad</label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => {
                const config = PRIORITY_CONFIG[p]
                const active = priority === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={[
                      'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                      active
                        ? config.activeButton
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <span className={['h-2.5 w-2.5 rounded-full', config.dot].join(' ')} />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Notas <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              value={description}
              maxLength={500}
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles, enlaces, lo que necesites recordar…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {formError && <p className="text-sm text-rose-600">{formError}</p>}

          <div className="mt-1 flex items-center gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={() => onDelete(task)}
                className="flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            )}
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="ml-auto flex h-11 items-center justify-center rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================
// Chip compacto de una tarea dentro de una celda del calendario.
// ============================================================
function TaskChip({ task }) {
  const config = PRIORITY_CONFIG[task.priority]
  return (
    <div
      className={[
        'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-left text-[11px] leading-tight',
        task.completed ? 'bg-slate-50 text-slate-400 line-through' : 'bg-slate-100 text-slate-700',
      ].join(' ')}
    >
      <span
        className={[
          'h-1.5 w-1.5 shrink-0 rounded-full',
          task.completed ? 'bg-slate-300' : config.dot,
        ].join(' ')}
      />
      <span className="truncate">{task.title}</span>
    </div>
  )
}

// ============================================================
// Celda de un día en la cuadrícula del calendario.
// ============================================================
function DayCell({ date, tasks, inMonth, isToday, isSelected, onSelect, tall }) {
  const dayNumber = parseDate(date).getDate()
  const visible = tall ? tasks.slice(0, 4) : tasks.slice(0, 2)
  const hidden = tasks.length - visible.length

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      className={[
        'flex flex-col gap-1 rounded-xl border p-1.5 text-left transition',
        tall ? 'min-h-[7rem]' : 'min-h-[4.5rem] sm:min-h-[6rem]',
        isSelected
          ? 'border-violet-400 bg-violet-50/50 ring-1 ring-violet-200'
          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50',
        inMonth ? 'bg-white' : 'bg-slate-50/40',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
          isToday
            ? 'bg-violet-600 text-white'
            : inMonth
              ? 'text-slate-700'
              : 'text-slate-300',
        ].join(' ')}
      >
        {dayNumber}
      </span>

      <div className="flex flex-col gap-0.5">
        {visible.map((task) => (
          <TaskChip key={task.id} task={task} />
        ))}
        {hidden > 0 && (
          <span className="px-1 text-[10px] font-medium text-slate-400">+{hidden} más</span>
        )}
      </div>
    </button>
  )
}

// ============================================================
// Fila de una tarea en el panel del día seleccionado.
// ============================================================
function TaskRow({ task, onToggle, onEdit }) {
  const config = PRIORITY_CONFIG[task.priority]
  return (
    <li className="group flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2.5">
      <button
        type="button"
        onClick={() => onToggle(task)}
        className={[
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition',
          task.completed
            ? 'border-violet-600 bg-violet-600 text-white'
            : 'border-slate-300 text-transparent hover:border-violet-400',
        ].join(' ')}
        aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
      >
        <Check className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={[
            'break-words text-sm font-medium',
            task.completed ? 'text-slate-400 line-through' : 'text-slate-800',
          ].join(' ')}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 break-words text-xs text-slate-500">{task.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className={['rounded-md border px-1.5 py-0.5 text-[11px] font-medium', config.chip].join(
              ' ',
            )}
          >
            {config.label}
          </span>
          {task.subject && (
            <span className="rounded-md border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
              {task.subject}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEdit(task)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-500 lg:opacity-0 lg:group-hover:opacity-100"
        aria-label="Editar tarea"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </li>
  )
}

// ============================================================
// Página principal: Calendario de tareas.
// ============================================================
export default function Tasks() {
  const { tasksByDate, loading, error, addTask, updateTask, toggleTask, deleteTask } = useTasks()

  const [view, setView] = useState('month') // 'month' | 'week'
  const [anchor, setAnchor] = useState(todayDate())
  const [selectedDate, setSelectedDate] = useState(todayDate())
  const [modal, setModal] = useState(null) // { date, task } | null

  const today = todayDate()

  const weeks = useMemo(() => (view === 'month' ? monthMatrix(anchor) : null), [view, anchor])
  const week = useMemo(() => (view === 'week' ? weekDates(anchor) : null), [view, anchor])

  const rangeLabel =
    view === 'month' ? capitalize(formatMonthLabel(anchor)) : formatWeekRange(anchor)

  const selectedTasks = tasksByDate.get(selectedDate) || []

  function goPrev() {
    setAnchor((a) => (view === 'month' ? addMonths(a, -1) : addDays(a, -7)))
  }

  function goNext() {
    setAnchor((a) => (view === 'month' ? addMonths(a, 1) : addDays(a, 7)))
  }

  function goToday() {
    setAnchor(today)
    setSelectedDate(today)
  }

  function handleSelectDay(date) {
    setSelectedDate(date)
    if (view === 'month' && !isSameMonth(date, anchor)) setAnchor(date)
  }

  async function handleModalSubmit(fields) {
    if (modal?.task) return updateTask(modal.task, fields)
    return addTask(fields)
  }

  async function handleDelete(task) {
    await deleteTask(task)
    setModal(null)
  }

  const gridDays = view === 'month' ? weeks.flat() : week

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendario de tareas</h1>
          <p className="mt-1 text-slate-500">
            Organiza tus entregas y tareas con fecha límite, como un planificador.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ date: selectedDate, task: null })}
          className="flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
        >
          <Plus className="h-5 w-5" />
          Nueva tarea
        </button>
      </div>

      {loading && <LoadingSpinner label="Cargando tu calendario…" />}

      {!loading && (
        <>
          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
          )}

          <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/50 sm:p-6">
            {/* Cabecera: navegación + toggle de vista */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="min-w-[9rem] text-center text-sm font-semibold text-slate-900 sm:min-w-[11rem]">
                  {rangeLabel}
                </h2>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goToday}
                  className="ml-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Hoy
                </button>
              </div>

              <div className="flex rounded-xl bg-slate-100 p-1">
                {[
                  { key: 'month', label: 'Mes' },
                  { key: 'week', label: 'Semana' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setView(key)}
                    className={[
                      'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                      view === key ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cabecera de días de la semana */}
            <div className="mb-1.5 grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Cuadrícula de días */}
            <div className="grid grid-cols-7 gap-1.5">
              {gridDays.map((date) => (
                <DayCell
                  key={date}
                  date={date}
                  tasks={tasksByDate.get(date) || []}
                  inMonth={view === 'week' || isSameMonth(date, anchor)}
                  isToday={date === today}
                  isSelected={date === selectedDate}
                  onSelect={handleSelectDay}
                  tall={view === 'week'}
                />
              ))}
            </div>
          </section>

          {/* Panel del día seleccionado */}
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold capitalize text-slate-900">
                    {formatDayLabel(selectedDate)}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedTasks.length
                      ? `${selectedTasks.filter((t) => t.completed).length}/${selectedTasks.length} completadas`
                      : 'Sin tareas para este día'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModal({ date: selectedDate, task: null })}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                aria-label="Añadir tarea a este día"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {selectedTasks.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                No hay tareas para este día. Pulsa + para añadir una.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {selectedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onEdit={(t) => setModal({ date: t.due_date, task: t })}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {modal && (
        <TaskModal
          initialDate={modal.date}
          task={modal.task}
          onClose={() => setModal(null)}
          onSubmit={handleModalSubmit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
