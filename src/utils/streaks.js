// Lógica de cálculo de rachas (días consecutivos).
// Trabajamos con cadenas 'YYYY-MM-DD' en hora local, igual que dateHelpers.

import { todayDate, daysAgo } from './dateHelpers'

// Racha actual: número de días consecutivos con actividad que termina hoy o
// ayer. Si el último día activo es más antiguo que ayer, la racha está rota (0).
// `dates` es un Set (o array) de cadenas 'YYYY-MM-DD'.
export function currentStreak(dates) {
  const set = dates instanceof Set ? dates : new Set(dates)
  if (set.size === 0) return 0

  // La racha sigue viva si hubo actividad hoy o ayer; contamos desde ahí.
  let cursor
  if (set.has(todayDate())) {
    cursor = todayDate()
  } else if (set.has(daysAgo(1))) {
    cursor = daysAgo(1)
  } else {
    return 0
  }

  let streak = 0
  const day = new Date(cursor)
  while (set.has(day.toISOString().slice(0, 10))) {
    streak += 1
    day.setDate(day.getDate() - 1)
  }

  return streak
}

// Racha más larga jamás alcanzada: el tramo más largo de días consecutivos
// dentro del conjunto, esté o no activo ahora mismo.
export function longestStreak(dates) {
  const set = dates instanceof Set ? dates : new Set(dates)
  if (set.size === 0) return 0

  const sorted = Array.from(set).sort()
  let longest = 1
  let run = 1

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(sorted[i - 1])
    prev.setDate(prev.getDate() + 1)
    if (prev.toISOString().slice(0, 10) === sorted[i]) {
      run += 1
    } else {
      run = 1
    }
    if (run > longest) longest = run
  }

  return longest
}
