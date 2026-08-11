import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'
import { todayDate, daysAgo, startOfWeek } from '../utils/dateHelpers'

// Días de historial que cargamos para el listado y las estadísticas.
const HISTORY_DAYS = 60

// Cuenta cuántos días consecutivos (terminando hoy o ayer) tienen al menos una
// sesión de enfoque registrada. Si la última sesión es más antigua que ayer, la
// racha se considera rota (0).
function currentStreak(dates) {
  if (dates.size === 0) return 0

  // La racha sigue viva si hubo enfoque hoy o ayer; empezamos a contar desde ahí.
  let cursor
  if (dates.has(todayDate())) {
    cursor = todayDate()
  } else if (dates.has(daysAgo(1))) {
    cursor = daysAgo(1)
  } else {
    return 0
  }

  let streak = 0
  const day = new Date(cursor)
  while (dates.has(day.toISOString().slice(0, 10))) {
    streak += 1
    day.setDate(day.getDate() - 1)
  }

  return streak
}

export function useFocusTimer() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', daysAgo(HISTORY_DAYS))
      .order('created_at', { ascending: false })

    if (error) {
      setError('No se han podido cargar tus sesiones de enfoque.')
    } else {
      setSessions(data || [])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const stats = useMemo(() => {
    const weekStart = startOfWeek()
    let weekMinutes = 0
    let weekSessions = 0
    let totalMinutes = 0

    // Conjunto de días con al menos una sesión, para calcular la racha.
    const activeDays = new Set()

    for (const session of sessions) {
      totalMinutes += session.actual_minutes
      activeDays.add(session.date)
      if (session.date >= weekStart) {
        weekMinutes += session.actual_minutes
        weekSessions += 1
      }
    }

    return {
      weekMinutes,
      weekSessions,
      totalMinutes,
      totalSessions: sessions.length,
      streak: currentStreak(activeDays),
    }
  }, [sessions])

  // Registra una sesión finalizada (completada o cancelada). Solo tiene sentido
  // guardar sesiones con algún minuto real de enfoque.
  async function saveSession({ plannedMinutes, actualMinutes, completed }) {
    if (!user) {
      return { data: null, error: new Error('No hay sesión activa.') }
    }

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: user.id,
        date: todayDate(),
        planned_minutes: plannedMinutes,
        actual_minutes: actualMinutes,
        completed,
      })
      .select()
      .single()

    if (!error && data) {
      setSessions((prev) => [data, ...prev])
    }

    return { data, error }
  }

  return {
    sessions,
    stats,
    loading,
    error,
    saveSession,
    refresh: load,
  }
}
