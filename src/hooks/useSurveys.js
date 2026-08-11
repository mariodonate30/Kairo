import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'
import { startOfWeek } from '../utils/dateHelpers'

// Metadatos de las categorías de encuesta: etiqueta visible y orden de aparición.
// El `key` coincide con la columna `category` de survey_questions.
export const SURVEY_CATEGORIES = [
  { key: 'stress', label: 'Estrés académico', emoji: '📚' },
  { key: 'social', label: 'Relaciones sociales', emoji: '🤝' },
  { key: 'motivation', label: 'Motivación', emoji: '🎯' },
  { key: 'study_habits', label: 'Hábitos de estudio', emoji: '⏱️' },
  { key: 'wellbeing', label: 'Bienestar general', emoji: '🌱' },
]

// Agrupa las preguntas activas por categoría, respetando el orden definido en
// SURVEY_CATEGORIES. Solo devuelve las categorías que tienen alguna pregunta.
function groupByCategory(questions) {
  const byCategory = new Map()

  for (const question of questions) {
    if (!byCategory.has(question.category)) {
      byCategory.set(question.category, [])
    }
    byCategory.get(question.category).push(question)
  }

  return SURVEY_CATEGORIES.filter((cat) => byCategory.has(cat.key)).map((cat) => ({
    ...cat,
    questions: byCategory.get(cat.key),
  }))
}

export function useSurveys() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const weekStart = startOfWeek()

  const load = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError('')

    const [questionsResult, surveysResult] = await Promise.all([
      supabase
        .from('survey_questions')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('weekly_surveys')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false }),
    ])

    if (questionsResult.error || surveysResult.error) {
      setError('No se han podido cargar las encuestas.')
    } else {
      setQuestions(questionsResult.data || [])
      setSurveys(surveysResult.data || [])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const categories = useMemo(() => groupByCategory(questions), [questions])

  // Encuesta de la semana actual (si ya existe) e histórico (semanas anteriores),
  // ordenado de más reciente a más antiguo.
  const currentSurvey = useMemo(
    () => surveys.find((survey) => survey.week_start === weekStart) || null,
    [surveys, weekStart],
  )

  const history = useMemo(
    () => surveys.filter((survey) => survey.week_start !== weekStart),
    [surveys, weekStart],
  )

  // Guarda (o actualiza) la encuesta de la semana actual. `responses` es un
  // objeto { question_id: valor }.
  async function submitSurvey(responses) {
    if (!user) {
      return { data: null, error: new Error('No hay sesión activa.') }
    }

    const { data, error } = await supabase
      .from('weekly_surveys')
      .upsert(
        {
          user_id: user.id,
          week_start: weekStart,
          responses,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,week_start' },
      )
      .select()
      .single()

    if (!error && data) {
      setSurveys((prev) => {
        const rest = prev.filter((survey) => survey.week_start !== weekStart)
        return [data, ...rest].sort((a, b) => (a.week_start < b.week_start ? 1 : -1))
      })
    }

    return { data, error }
  }

  return {
    questions,
    categories,
    currentSurvey,
    history,
    weekStart,
    loading,
    error,
    isCompleted: Boolean(currentSurvey?.completed_at),
    submitSurvey,
    refresh: load,
  }
}
