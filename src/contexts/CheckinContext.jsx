import { createContext, useCallback, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { todayDate } from '../utils/dateHelpers'

export const CheckinContext = createContext(undefined)

// Estado compartido del check-in de hoy. Al vivir en un contexto, tanto la
// página principal como la navegación (sidebar y barra móvil) leen el mismo
// estado: así el indicador de pendiente/completado es coherente en toda la app
// y se actualiza al instante en cuanto el usuario guarda su check-in.
export function CheckinProvider({ children }) {
  const { user } = useAuth()
  const [checkin, setCheckin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTodayCheckin = useCallback(async () => {
    if (!user) {
      setCheckin(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const { data, error: loadError } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayDate())
      .maybeSingle()

    if (loadError) {
      setError('No se ha podido cargar el check-in de hoy.')
    } else {
      setCheckin(data)
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    loadTodayCheckin()
  }, [loadTodayCheckin])

  const submitCheckin = useCallback(
    async (values) => {
      if (!user) {
        return { data: null, error: new Error('No hay sesión activa.') }
      }

      const { data, error: submitError } = await supabase
        .from('daily_checkins')
        .insert({ user_id: user.id, date: todayDate(), ...values })
        .select()
        .single()

      if (!submitError) {
        setCheckin(data)
      }

      return { data, error: submitError }
    },
    [user],
  )

  const value = {
    checkin,
    loading,
    error,
    isCompleted: Boolean(checkin),
    submitCheckin,
    refresh: loadTodayCheckin,
  }

  return <CheckinContext.Provider value={value}>{children}</CheckinContext.Provider>
}
