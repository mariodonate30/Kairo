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
