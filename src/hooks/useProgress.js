import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

// Carga todo el historial del usuario necesario para el dashboard de progresión.
// Traemos las filas sin límite de fecha (los volúmenes por usuario son pequeños)
// y dejamos que la página filtre por rango temporal en cliente. Así cambiar el
// filtro no dispara nuevas consultas.
export function useProgress() {
  const { user } = useAuth()
  const [checkins, setCheckins] = useState([])
  const [goals, setGoals] = useState([])
  const [surveys, setSurveys] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError('')

    const [checkinsRes, goalsRes, surveysRes, questionsRes] = await Promise.all([
      supabase
        .from('daily_checkins')
        .select('date, mood, sleep_hours, sleep_quality, nutrition, water_glasses, stress, study_minutes')
        .eq('user_id', user.id)
        .order('date', { ascending: true }),
      supabase
        .from('daily_goals')
        .select('date, completed')
        .eq('user_id', user.id)
        .order('date', { ascending: true }),
      supabase
        .from('weekly_surveys')
        .select('week_start, responses, completed_at')
        .eq('user_id', user.id)
        .order('week_start', { ascending: true }),
      // Todas las preguntas (incluidas las desactivadas) para poder mapear la
      // categoría de respuestas de encuestas antiguas.
      supabase.from('survey_questions').select('id, category, scale_min, scale_max'),
    ])

    if (checkinsRes.error || goalsRes.error || surveysRes.error || questionsRes.error) {
      setError('No se han podido cargar tus datos de progresión.')
    } else {
      setCheckins(checkinsRes.data || [])
      setGoals(goalsRes.data || [])
      setSurveys(surveysRes.data || [])
      setQuestions(questionsRes.data || [])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  return { checkins, goals, surveys, questions, loading, error, refresh: load }
}
