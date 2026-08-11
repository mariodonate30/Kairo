// Catálogo de logros y reglas de desbloqueo.
//
// Cada logro se identifica por una `key` estable que DEBE coincidir con la
// tabla `achievements` de Supabase (ver supabase/migrations/0007_achievements.sql).
// La metadata visible (title/description/icon) se lee siempre de la base de
// datos; aquí guardamos únicamente la lógica de detección (`check`), que recibe
// un objeto `stats` calculado en useAchievements y devuelve true si el logro
// está conseguido.
//
// Forma de `stats`:
//   checkinCount        int   — check-ins diarios registrados
//   checkinStreak       int   — racha actual de check-ins (días consecutivos)
//   waterTotal          int   — suma de vasos de agua de todos los check-ins
//   surveyCount         int   — encuestas semanales completadas
//   focusCount          int   — sesiones de enfoque registradas
//   focusMinutes        int   — minutos reales de enfoque acumulados
//   meditationCount     int   — sesiones de meditación registradas
//   goalsCompletedTotal int   — objetivos diarios completados en total
//   perfectGoalDay      bool  — algún día con >=1 objetivo y todos cumplidos

export const ACHIEVEMENTS = [
  { key: 'first_checkin', check: (s) => s.checkinCount >= 1 },
  { key: 'streak_3', check: (s) => s.checkinStreak >= 3 },
  { key: 'streak_7', check: (s) => s.checkinStreak >= 7 },
  { key: 'streak_30', check: (s) => s.checkinStreak >= 30 },
  { key: 'checkin_10', check: (s) => s.checkinCount >= 10 },
  { key: 'first_survey', check: (s) => s.surveyCount >= 1 },
  { key: 'survey_4', check: (s) => s.surveyCount >= 4 },
  { key: 'first_focus', check: (s) => s.focusCount >= 1 },
  { key: 'focus_10', check: (s) => s.focusCount >= 10 },
  { key: 'focus_600', check: (s) => s.focusMinutes >= 600 },
  { key: 'first_meditation', check: (s) => s.meditationCount >= 1 },
  { key: 'meditation_10', check: (s) => s.meditationCount >= 10 },
  { key: 'water_100', check: (s) => s.waterTotal >= 100 },
  { key: 'goals_perfect_day', check: (s) => s.perfectGoalDay },
  { key: 'goals_10', check: (s) => s.goalsCompletedTotal >= 10 },
]

// Devuelve las `key` de los logros conseguidos según las stats dadas.
export function earnedKeys(stats) {
  return ACHIEVEMENTS.filter((a) => a.check(stats)).map((a) => a.key)
}
