import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

// Hook de datos para el panel de administración.
//
// Carga TODOS los datos del instituto (los admins tienen permiso de lectura vía
// RLS: cada policy de SELECT incluye `or public.is_admin()`). Los volúmenes son
// pequeños (~50-150 usuarios), así que traemos el histórico completo y agregamos
// en cliente. Nunca exponemos nombres ni emails de estudiantes en los datos
// agregados: para eso el hook construye un mapa de anonimización user_id → nº.
export function useAdminData() {
  const [profiles, setProfiles] = useState([])
  const [checkins, setCheckins] = useState([])
  const [surveys, setSurveys] = useState([])
  const [goals, setGoals] = useState([])
  const [focusSessions, setFocusSessions] = useState([])
  const [meditationSessions, setMeditationSessions] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    const [
      profilesRes,
      checkinsRes,
      surveysRes,
      goalsRes,
      focusRes,
      meditationRes,
      questionsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id, role, created_at'),
      supabase
        .from('daily_checkins')
        .select(
          'user_id, date, mood, sleep_hours, sleep_quality, nutrition, water_glasses, stress, studied, study_minutes, exercised',
        )
        .order('date', { ascending: true }),
      supabase
        .from('weekly_surveys')
        .select('user_id, week_start, responses, completed_at')
        .order('week_start', { ascending: true }),
      supabase.from('daily_goals').select('user_id, date, completed'),
      supabase.from('focus_sessions').select('user_id, date, actual_minutes, completed'),
      supabase.from('meditation_sessions').select('user_id, date, duration_minutes'),
      supabase
        .from('survey_questions')
        .select('*')
        .order('sort_order', { ascending: true }),
    ])

    const firstError =
      profilesRes.error ||
      checkinsRes.error ||
      surveysRes.error ||
      goalsRes.error ||
      focusRes.error ||
      meditationRes.error ||
      questionsRes.error

    if (firstError) {
      setError('No se han podido cargar los datos de administración.')
    } else {
      setProfiles(profilesRes.data || [])
      setCheckins(checkinsRes.data || [])
      setSurveys(surveysRes.data || [])
      setGoals(goalsRes.data || [])
      setFocusSessions(focusRes.data || [])
      setMeditationSessions(meditationRes.data || [])
      setQuestions(questionsRes.data || [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Mapa de anonimización: cada user_id recibe un número estable (1, 2, 3…),
  // ordenado por fecha de registro. Es la única identidad que sale en las
  // exportaciones y en cualquier vista agregada.
  const anonIds = useMemo(() => {
    const ordered = [...profiles].sort((a, b) => {
      const at = a.created_at || ''
      const bt = b.created_at || ''
      if (at !== bt) return at < bt ? -1 : 1
      return a.id < b.id ? -1 : 1
    })
    const map = new Map()
    ordered.forEach((profile, index) => {
      map.set(profile.id, index + 1)
    })
    return map
  }, [profiles])

  // ---- Gestión de preguntas de encuesta (solo admins pueden mutar por RLS) ----

  async function createQuestion({ questionText, category, sortOrder }) {
    const { data, error: err } = await supabase
      .from('survey_questions')
      .insert({
        question_text: questionText,
        category,
        sort_order: sortOrder,
      })
      .select()
      .single()

    if (!err && data) {
      setQuestions((prev) =>
        [...prev, data].sort((a, b) => a.sort_order - b.sort_order),
      )
    }
    return { data, error: err }
  }

  async function updateQuestion(id, changes) {
    const patch = {}
    if (changes.questionText !== undefined) patch.question_text = changes.questionText
    if (changes.category !== undefined) patch.category = changes.category
    if (changes.sortOrder !== undefined) patch.sort_order = changes.sortOrder
    if (changes.active !== undefined) patch.active = changes.active

    const { data, error: err } = await supabase
      .from('survey_questions')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (!err && data) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? data : q)).sort((a, b) => a.sort_order - b.sort_order),
      )
    }
    return { data, error: err }
  }

  // Activar / desactivar una pregunta sin borrarla (preserva el histórico de
  // respuestas de las encuestas ya contestadas).
  async function toggleQuestion(id, active) {
    return updateQuestion(id, { active })
  }

  return {
    profiles,
    checkins,
    surveys,
    goals,
    focusSessions,
    meditationSessions,
    questions,
    anonIds,
    loading,
    error,
    refresh: load,
    createQuestion,
    updateQuestion,
    toggleQuestion,
  }
}
