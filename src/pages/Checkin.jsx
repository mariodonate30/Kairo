import { useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  Dumbbell,
  Droplets,
  Minus,
  Moon,
  Plus,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCheckin } from '../hooks/useCheckin'
import { useAchievements } from '../hooks/useAchievements'
import ScaleInput from '../components/ui/ScaleInput'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const MOOD_EMOJIS = ['😞', '🙁', '😐', '🙂', '😄']
const SLEEP_QUALITY_EMOJIS = ['😩', '😕', '😐', '😌', '😴']
const NUTRITION_EMOJIS = ['🍔', '🍕', '🥪', '🥗', '🥦']
const STRESS_EMOJIS = ['😌', '🙂', '😬', '😖', '🤯']

function YesNoToggle({ value, onChange, yesLabel = 'Sí', noLabel = 'No' }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={[
          'flex-1 rounded-xl border py-2.5 text-sm font-semibold transition',
          value === true
            ? 'border-violet-600 bg-violet-600 text-white'
            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
        ].join(' ')}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={[
          'flex-1 rounded-xl border py-2.5 text-sm font-semibold transition',
          value === false
            ? 'border-slate-600 bg-slate-600 text-white'
            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
        ].join(' ')}
      >
        {noLabel}
      </button>
    </div>
  )
}

function Stepper({ value, onChange, min = 0, max = 24, step = 1, unit }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, Math.round((value - step) * 10) / 10))}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition hover:bg-slate-100"
        aria-label="Restar"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[4rem] text-center text-lg font-semibold text-slate-900">
        {value} {unit}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, Math.round((value + step) * 10) / 10))}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition hover:bg-slate-100"
        aria-label="Sumar"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

function CheckinSummary({ checkin, firstName }) {
  const stats = [
    { icon: Moon, label: 'Son', value: `${checkin.sleep_hours} h` },
    { icon: Droplets, label: 'Aigua', value: `${checkin.water_glasses} gots` },
    { icon: BookOpen, label: 'Estudi', value: checkin.studied ? `${checkin.study_minutes} min` : 'No' },
    { icon: Dumbbell, label: 'Exercici', value: checkin.exercised ? checkin.exercise_type || 'Sí' : 'No' },
  ]

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
          ✓ Completat
        </span>
        <h2 className="text-lg font-semibold text-slate-900">
          {firstName ? `Bona feina, ${firstName}!` : 'Bona feina!'}
        </h2>
        <p className="text-sm text-slate-500">Ja has registrat el check-in d'avui. Torna demà.</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <Icon className="h-5 w-5 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const INITIAL_FORM = {
  mood: null,
  sleepHours: 8,
  sleepQuality: null,
  nutrition: null,
  waterGlasses: 0,
  stress: null,
  studied: null,
  studyMinutes: '',
  exercised: null,
  exerciseType: '',
}

export default function Checkin() {
  const { profile } = useAuth()
  const { checkin, loading, error: loadError, isCompleted, submitCheckin } = useCheckin()
  const { checkAchievements } = useAchievements()
  const firstName = profile?.full_name?.split(' ')[0]

  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function set(field) {
    return (value) => setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    if (!form.mood || !form.sleepQuality || !form.nutrition || !form.stress) {
      return 'Completa les valoracions d\'ànim, son, alimentació i estrès.'
    }
    if (form.studied === null || form.exercised === null) {
      return 'Indica si has estudiat i si has fet exercici avui.'
    }
    if (form.studied && (!form.studyMinutes || Number(form.studyMinutes) <= 0)) {
      return 'Indica quants minuts has estudiat.'
    }
    if (form.exercised && !form.exerciseType.trim()) {
      return 'Indica quin tipus d\'exercici has fet.'
    }
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setSubmitting(true)

    const { error: submitError } = await submitCheckin({
      mood: form.mood,
      sleep_hours: form.sleepHours,
      sleep_quality: form.sleepQuality,
      nutrition: form.nutrition,
      water_glasses: form.waterGlasses,
      stress: form.stress,
      studied: form.studied,
      study_minutes: form.studied ? Number(form.studyMinutes) : null,
      exercised: form.exercised,
      exercise_type: form.exercised ? form.exerciseType.trim() : null,
    })

    setSubmitting(false)

    if (submitError) {
      setError(
        submitError.code === '23505'
          ? 'Ja has completat el check-in d\'avui.'
          : 'No s\'ha pogut desar el check-in. Torna-ho a provar.',
      )
    } else {
      // Actualiza racha y desbloquea logros (primer check-in, rachas, agua…).
      checkAchievements()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {firstName ? `Hola, ${firstName}` : 'Hola'}
        </h1>
        <p className="mt-1 text-slate-500">
          {isCompleted
            ? 'Aquest és el resum del teu dia.'
            : 'Pren-te 2 minuts per registrar com estàs avui.'}
        </p>
      </div>

      {loading && <LoadingSpinner label="Carregant el check-in d'avui…" />}

      {!loading && loadError && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {loadError} Comprova la connexió i torna a carregar la pàgina.
        </p>
      )}

      {!loading && !loadError && isCompleted && (
        <CheckinSummary checkin={checkin} firstName={firstName} />
      )}

      {!loading && !loadError && !isCompleted && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8"
        >
          <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
            Pendent avui
          </span>

          <ScaleInput
            label="Com et sents avui?"
            value={form.mood}
            onChange={set('mood')}
            emojis={MOOD_EMOJIS}
            lowLabel="Malament"
            highLabel="Genial"
          />

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Quantes hores has dormit?</p>
            <Stepper value={form.sleepHours} onChange={set('sleepHours')} min={0} max={14} step={0.5} unit="h" />
          </div>

          <ScaleInput
            label="Com ha estat la qualitat del son?"
            value={form.sleepQuality}
            onChange={set('sleepQuality')}
            emojis={SLEEP_QUALITY_EMOJIS}
            lowLabel="Dolenta"
            highLabel="Excel·lent"
          />

          <ScaleInput
            label="Com de saludable has menjat avui?"
            value={form.nutrition}
            onChange={set('nutrition')}
            emojis={NUTRITION_EMOJIS}
            lowLabel="Poc saludable"
            highLabel="Molt saludable"
          />

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Gots d'aigua</p>
            <Stepper value={form.waterGlasses} onChange={set('waterGlasses')} min={0} max={20} step={1} unit="gots" />
          </div>

          <ScaleInput
            label="Com ha estat el teu nivell d'estrès?"
            value={form.stress}
            onChange={set('stress')}
            emojis={STRESS_EMOJIS}
            lowLabel="Tranquil"
            highLabel="Molt estressat"
          />

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Has estudiat avui?</p>
            <YesNoToggle value={form.studied} onChange={set('studied')} />
            {form.studied && (
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={form.studyMinutes}
                onChange={(e) => set('studyMinutes')(e.target.value)}
                placeholder="Minuts aproximats"
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Has fet exercici avui?</p>
            <YesNoToggle value={form.exercised} onChange={set('exercised')} />
            {form.exercised && (
              <input
                type="text"
                value={form.exerciseType}
                onChange={(e) => set('exerciseType')(e.target.value)}
                placeholder="Quin tipus d'exercici?"
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            )}
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Desant…' : 'Desar el check-in'}
          </button>
        </form>
      )}
    </div>
  )
}
