// Cálculos agregados y ANONIMIZADOS para el panel de administración.
// Todas las funciones son puras: reciben los datos crudos del instituto y
// devuelven agregados (medias, conteos, porcentajes). Nunca manejan nombres ni
// emails; trabajan solo con user_id para contar usuarios distintos.

import { parseDate, todayDate, startOfWeek } from './dateHelpers'
import { SURVEY_CATEGORIES } from '../hooks/useSurveys'
import { INITIAL_TEST_QUESTIONS } from './initialTest'

// ---- Autoestima: escala de Rosenberg del test inicial ----
// Los 10 ítems del bloque de autoestima. Cada uno trae su escala (scaleMax = 4)
// y si es inverso (reverse). La puntuación total va del mínimo (10) al máximo (40).
const ROSENBERG_ITEMS = INITIAL_TEST_QUESTIONS.filter((q) => q.block === 'autoestima')
export const ROSENBERG_MIN = ROSENBERG_ITEMS.length
export const ROSENBERG_MAX = ROSENBERG_ITEMS.reduce((sum, q) => sum + (q.scaleMax || 5), 0)

// Puntuación de autoestima de un alumno a partir de sus respuestas del test
// inicial. Invierte los ítems marcados como `reverse` (max+1 − valor) y suma
// todos. Devuelve null si falta alguna respuesta (test incompleto).
export function rosenbergScore(responses) {
  if (!responses) return null
  let total = 0
  for (const item of ROSENBERG_ITEMS) {
    const raw = Number(responses[item.key])
    if (!raw || Number.isNaN(raw)) return null
    const max = item.scaleMax || 5
    total += item.reverse ? max + 1 - raw : raw
  }
  return total
}

// Nivel orientativo de autoestima según la puntuación total (10-40).
// Umbrales aproximados: los usamos solo como referencia visual, no como
// diagnóstico. <26 baja · 26-29 media · ≥30 alta.
export function rosenbergLevel(score) {
  if (score == null) return null
  if (score < 26) return 'baja'
  if (score < 30) return 'media'
  return 'alta'
}

// Resumen de una lista de puntuaciones: nº, media (/40) y media normalizada 0-100.
function summarizeScores(scores) {
  const count = scores.length
  if (!count) return { count: 0, mean: null, meanPct: null }
  const mean = scores.reduce((a, b) => a + b, 0) / count
  const span = ROSENBERG_MAX - ROSENBERG_MIN
  const meanPct = span > 0 ? Math.round(((mean - ROSENBERG_MIN) / span) * 100) : null
  return { count, mean: Number(mean.toFixed(1)), meanPct }
}

// Agregado de autoestima del instituto a partir de los tests iniciales.
// Devuelve medias en conjunto y separadas por sexo, más la distribución por
// nivel (baja/media/alta) del total de alumnos.
export function buildSelfEsteemStats(initialTests, genderById) {
  const groups = { all: [], chico: [], chica: [] }
  const levels = { baja: 0, media: 0, alta: 0 }

  for (const test of initialTests) {
    const score = rosenbergScore(test.responses)
    if (score == null) continue
    groups.all.push(score)
    levels[rosenbergLevel(score)] += 1
    const gender = genderById.get(test.user_id)
    if (gender === 'chico') groups.chico.push(score)
    else if (gender === 'chica') groups.chica.push(score)
  }

  return {
    min: ROSENBERG_MIN,
    max: ROSENBERG_MAX,
    all: summarizeScores(groups.all),
    chico: summarizeScores(groups.chico),
    chica: summarizeScores(groups.chica),
    levels,
  }
}

// Etiqueta compacta "día/mes" para los ejes X de los gráficos temporales.
export function shortLabel(dateStr) {
  const date = parseDate(dateStr)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

// Cuenta los estudiantes (no admins) por género declarado en su perfil.
export function countByGender(profiles, genderById) {
  const counts = { chico: 0, chica: 0, none: 0 }
  for (const profile of profiles) {
    if (profile.role === 'admin') continue
    const gender = genderById.get(profile.id)
    if (gender === 'chico') counts.chico += 1
    else if (gender === 'chica') counts.chica += 1
    else counts.none += 1
  }
  counts.total = counts.chico + counts.chica + counts.none
  return counts
}

// Devuelve una copia de los datos del panel filtrada a un solo sexo. Con
// gender = 'all' devuelve los datos sin tocar (vista conjunta). Filtra tanto los
// perfiles (para que los porcentajes de retención usen el total de ese sexo)
// como todas las tablas de actividad por su user_id.
export function filterDataByGender(data, genderById, gender) {
  if (gender !== 'chico' && gender !== 'chica') return data

  const keep = (userId) => genderById.get(userId) === gender

  return {
    ...data,
    profiles: data.profiles.filter((p) => genderById.get(p.id) === gender),
    checkins: data.checkins.filter((r) => keep(r.user_id)),
    surveys: data.surveys.filter((r) => keep(r.user_id)),
    goals: data.goals.filter((r) => keep(r.user_id)),
    focusSessions: data.focusSessions.filter((r) => keep(r.user_id)),
    meditationSessions: data.meditationSessions.filter((r) => keep(r.user_id)),
  }
}

// Genera un evento { userId, date } por cada actividad del usuario en la app.
// Sirve para medir usuarios activos, retención y uso de secciones. Las encuestas
// cuentan por su fecha de completado (o el inicio de semana si no la hay).
function activityEvents(data) {
  const events = []
  const push = (userId, date) => {
    if (userId && date) events.push({ userId, date })
  }

  for (const row of data.checkins) push(row.user_id, row.date)
  for (const row of data.goals) push(row.user_id, row.date)
  for (const row of data.focusSessions) push(row.user_id, row.date)
  for (const row of data.meditationSessions) push(row.user_id, row.date)
  for (const row of data.surveys) {
    const date = row.completed_at ? row.completed_at.slice(0, 10) : row.week_start
    if (row.completed_at) push(row.user_id, date)
  }

  return events
}

// Estadísticas generales del dashboard (tarjetas superiores).
export function computeDashboardStats(data) {
  const today = todayDate()
  const weekStart = startOfWeek()

  const totalStudents = data.profiles.filter((p) => p.role !== 'admin').length

  const events = activityEvents(data)
  const activeToday = new Set()
  const activeThisWeek = new Set()
  for (const { userId, date } of events) {
    if (date === today) activeToday.add(userId)
    if (date >= weekStart) activeThisWeek.add(userId)
  }

  const checkinsToday = data.checkins.filter((c) => c.date === today).length

  const surveysThisWeek = data.surveys.filter(
    (s) => s.week_start === weekStart && s.completed_at,
  ).length

  return {
    totalStudents,
    activeToday: activeToday.size,
    activeThisWeek: activeThisWeek.size,
    checkinsToday,
    surveysThisWeek,
  }
}

// Media por día del instituto de una métrica de check-in (ánimo, sueño, estrés).
// Devuelve filas { date, label, mood, sleep_hours, stress, count } ordenadas.
export function buildDailyAverages(checkins, fromDate) {
  const byDate = new Map()

  for (const checkin of checkins) {
    if (fromDate && checkin.date < fromDate) continue
    if (!byDate.has(checkin.date)) {
      byDate.set(checkin.date, {
        moodSum: 0,
        sleepSum: 0,
        stressSum: 0,
        count: 0,
      })
    }
    const bucket = byDate.get(checkin.date)
    bucket.moodSum += checkin.mood ?? 0
    bucket.sleepSum += checkin.sleep_hours != null ? Number(checkin.sleep_hours) : 0
    bucket.stressSum += checkin.stress ?? 0
    bucket.count += 1
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, b]) => ({
      date,
      label: shortLabel(date),
      count: b.count,
      mood: b.count ? Number((b.moodSum / b.count).toFixed(2)) : null,
      sleep_hours: b.count ? Number((b.sleepSum / b.count).toFixed(1)) : null,
      stress: b.count ? Number((b.stressSum / b.count).toFixed(2)) : null,
    }))
}

// Media por categoría de encuesta (normalizada a 0-100 %) de todas las respuestas
// completadas dentro del rango. Devuelve una fila por categoría con datos.
export function buildCategoryDistribution(surveys, questions, fromDate) {
  const meta = new Map(
    questions.map((q) => [
      q.id,
      { category: q.category, min: q.scale_min ?? 1, max: q.scale_max ?? 5 },
    ]),
  )

  const byCategory = new Map()

  for (const survey of surveys) {
    if (!survey.completed_at) continue
    if (fromDate && survey.week_start < fromDate) continue

    for (const [questionId, rawValue] of Object.entries(survey.responses || {})) {
      const m = meta.get(questionId)
      const value = Number(rawValue)
      if (!m || Number.isNaN(value)) continue

      const span = m.max - m.min
      const percent = span > 0 ? ((value - m.min) / span) * 100 : 0
      const clamped = Math.min(100, Math.max(0, percent))

      if (!byCategory.has(m.category)) byCategory.set(m.category, { sum: 0, count: 0 })
      const bucket = byCategory.get(m.category)
      bucket.sum += clamped
      bucket.count += 1
    }
  }

  return SURVEY_CATEGORIES.filter((cat) => byCategory.get(cat.key)?.count).map((cat) => {
    const bucket = byCategory.get(cat.key)
    return {
      category: cat.label,
      value: Math.round(bucket.sum / bucket.count),
    }
  })
}

// Uso de cada sección de la app: número de registros dentro del rango.
// Es un proxy de qué funciones usan más los estudiantes.
export function buildSectionUsage(data, fromDate) {
  const inRange = (date) => !fromDate || (date && date >= fromDate)

  const surveysCount = data.surveys.filter(
    (s) => s.completed_at && inRange(s.week_start),
  ).length

  const sections = [
    { section: 'Check-in', count: data.checkins.filter((r) => inRange(r.date)).length },
    { section: 'Objetivos', count: data.goals.filter((r) => inRange(r.date)).length },
    { section: 'Enfoque', count: data.focusSessions.filter((r) => inRange(r.date)).length },
    {
      section: 'Meditación',
      count: data.meditationSessions.filter((r) => inRange(r.date)).length,
    },
    { section: 'Encuestas', count: surveysCount },
  ]

  return sections.sort((a, b) => b.count - a.count)
}

// Tasa de retención diaria: porcentaje de estudiantes registrados que están
// activos cada día del rango. Devuelve filas { date, label, percent, active }.
export function buildRetention(data, fromDate) {
  const totalStudents = data.profiles.filter((p) => p.role !== 'admin').length
  const events = activityEvents(data)

  const byDate = new Map() // date -> Set(userId)
  for (const { userId, date } of events) {
    if (fromDate && date < fromDate) continue
    if (!byDate.has(date)) byDate.set(date, new Set())
    byDate.get(date).add(userId)
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, users]) => ({
      date,
      label: shortLabel(date),
      active: users.size,
      percent: totalStudents ? Math.round((users.size / totalStudents) * 100) : 0,
    }))
}
