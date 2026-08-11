import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'
import { parseDate, todayDate } from '../utils/dateHelpers'

// Estadísticas generales para el perfil: cuántos check-ins ha completado el
// usuario y cuántos días lleva usando la app (desde su registro).
export function useProfileStats() {
  const { user, profile } = useAuth()
  const [checkinCount, setCheckinCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    if (!user) return

    setLoading(true)

    const { count, error } = await supabase
      .from('daily_checkins')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (!error && typeof count === 'number') {
      setCheckinCount(count)
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  // Días usando la app: diferencia (inclusiva) entre el registro y hoy.
  let daysUsingApp = 0
  if (profile?.created_at) {
    const start = parseDate(profile.created_at.slice(0, 10))
    const today = parseDate(todayDate())
    const diff = Math.round((today - start) / (1000 * 60 * 60 * 24))
    daysUsingApp = Math.max(1, diff + 1)
  }

  return { checkinCount, daysUsingApp, loading, refresh: loadStats }
}
