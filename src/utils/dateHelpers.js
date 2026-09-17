// Utilidades de fechas para Kairo.
// Trabajamos con cadenas 'YYYY-MM-DD' en hora local para evitar desfases
// de zona horaria al guardar y comparar fechas de días.

// Fecha de hoy en formato 'YYYY-MM-DD' (hora local).
export function todayDate() {
  const now = new Date()
  const localMidnight = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return localMidnight.toISOString().slice(0, 10)
}

// Convierte un Date a 'YYYY-MM-DD' en hora local.
export function toDateString(date) {
  const localMidnight = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localMidnight.toISOString().slice(0, 10)
}

// Convierte 'YYYY-MM-DD' a un Date local a medianoche (sin desfase de zona).
export function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Fecha de hace n días en formato 'YYYY-MM-DD'.
export function daysAgo(n) {
  const date = new Date()
  date.setDate(date.getDate() - n)
  return toDateString(date)
}

// Lunes de la semana que contiene la fecha dada (por defecto, hoy), como 'YYYY-MM-DD'.
export function startOfWeek(dateStr = todayDate()) {
  const date = parseDate(dateStr)
  const day = date.getDay() // 0 = domingo, 1 = lunes, ...
  const diff = day === 0 ? 6 : day - 1
  date.setDate(date.getDate() - diff)
  return toDateString(date)
}

const dayLabelFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const shortDayFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

// "miércoles, 6 de agosto"
export function formatDayLabel(dateStr) {
  return dayLabelFormatter.format(parseDate(dateStr))
}

// "mié, 6 ago"
export function formatShortDay(dateStr) {
  return shortDayFormatter.format(parseDate(dateStr)).replace(/\./g, '')
}

// Etiqueta relativa amigable para fechas recientes.
export function relativeDayLabel(dateStr) {
  if (dateStr === todayDate()) return 'Hoy'
  if (dateStr === daysAgo(1)) return 'Ayer'
  return formatShortDay(dateStr)
}

// ============================================================
// Helpers para vistas de calendario (Tareas).
// ============================================================

// Suma (o resta, si n es negativo) n días a 'YYYY-MM-DD'.
export function addDays(dateStr, n) {
  const date = parseDate(dateStr)
  date.setDate(date.getDate() + n)
  return toDateString(date)
}

// Suma (o resta) n meses, ajustando el día si el mes destino es más corto.
export function addMonths(dateStr, n) {
  const date = parseDate(dateStr)
  const targetDay = date.getDate()
  date.setDate(1)
  date.setMonth(date.getMonth() + n)
  // Último día del mes destino, para no desbordar (p. ej. 31 ene + 1 mes).
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  date.setDate(Math.min(targetDay, lastDay))
  return toDateString(date)
}

// Día 1 del mes que contiene la fecha, como 'YYYY-MM-DD'.
export function startOfMonth(dateStr = todayDate()) {
  const date = parseDate(dateStr)
  date.setDate(1)
  return toDateString(date)
}

// True si ambas fechas caen en el mismo mes y año.
export function isSameMonth(a, b) {
  return a.slice(0, 7) === b.slice(0, 7)
}

// Los 7 días (lunes → domingo) de la semana que contiene la fecha dada.
export function weekDates(dateStr = todayDate()) {
  const monday = startOfWeek(dateStr)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

// Matriz de semanas (cada una con 7 días lunes→domingo) que cubre el mes de
// la fecha dada, incluyendo los días de relleno del mes anterior/siguiente.
export function monthMatrix(dateStr = todayDate()) {
  const firstOfMonth = startOfMonth(dateStr)
  const gridStart = startOfWeek(firstOfMonth)
  const weeks = []
  let cursor = gridStart

  // Seis semanas cubren cualquier disposición mensual posible.
  for (let w = 0; w < 6; w += 1) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(cursor, i))
    weeks.push(week)
    cursor = addDays(cursor, 7)
    // Paramos si la siguiente semana ya no pertenece al mes (evita filas vacías).
    if (!isSameMonth(cursor, firstOfMonth) && w >= 3) break
  }

  return weeks
}

const monthLabelFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
})

// "septiembre de 2026"
export function formatMonthLabel(dateStr) {
  return monthLabelFormatter.format(parseDate(dateStr))
}

// Etiqueta de rango de semana: "8 – 14 sep" o "29 sep – 5 oct".
export function formatWeekRange(dateStr) {
  const days = weekDates(dateStr)
  const start = parseDate(days[0])
  const end = parseDate(days[6])
  const sameMonth = start.getMonth() === end.getMonth()
  const monthFmt = new Intl.DateTimeFormat('es-ES', { month: 'short' })
  const startLabel = sameMonth
    ? `${start.getDate()}`
    : `${start.getDate()} ${monthFmt.format(start).replace('.', '')}`
  const endLabel = `${end.getDate()} ${monthFmt.format(end).replace('.', '')}`
  return `${startLabel} – ${endLabel}`
}
