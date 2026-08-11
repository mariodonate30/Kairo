import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'
import { todayDate, daysAgo, startOfWeek } from '../utils/dateHelpers'

export const MAX_GOALS_PER_DAY = 3

// Días de historial que cargamos para el listado y las estadísticas.
const HISTORY_DAYS = 60

// Agrupa una lista plana de objetivos por fecha, calculando el porcentaje
// de cumplimiento de cada día. Devuelve los días ordenados de más reciente a
// más antiguo.
function groupByDay(goals) {
  const byDate = new Map()

  for (const goal of goals) {
    if (!byDate.has(goal.date)) {
      byDate.set(goal.date, { date: goal.date, total: 0, completed: 0 })
    }
    const day = byDate.get(goal.date)
    day.total += 1
    if (goal.completed) day.completed += 1
  }

  return Array.from(byDate.values())
    .map((day) => ({
      ...day,
      percent: day.total ? Math.round((day.completed / day.total) * 100) : 0,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

// Tasa de cumplimiento (objetivos cumplidos / objetivos totales) de los
// objetivos con fecha igual o posterior a `fromDate`.
function completionRate(goals, fromDate) {
  let total = 0
  let completed = 0

  for (const goal of goals) {
    if (goal.date < fromDate) continue
    total += 1
    if (goal.completed) completed += 1
  }

  return {
    total,
    completed,
    percent: total ? Math.round((completed / total) * 100) : 0,
  }
}

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', daysAgo(HISTORY_DAYS))
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      setError('No se han podido cargar tus objetivos.')
    } else {
      setGoals(data || [])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const today = todayDate()

  const todayGoals = useMemo(
    () => goals.filter((goal) => goal.date === today),
    [goals, today],
  )

  const history = useMemo(
    () => groupByDay(goals.filter((goal) => goal.date !== today)),
    [goals, today],
  )

  const stats = useMemo(
    () => ({
      week: completionRate(goals, startOfWeek()),
      month: completionRate(goals, daysAgo(30)),
    }),
    [goals],
  )

  async function addGoal(text) {
    const goalText = text.trim()
    if (!user || !goalText) return { error: null }
    if (todayGoals.length >= MAX_GOALS_PER_DAY) {
      return { error: new Error('Máximo de objetivos alcanzado.') }
    }

    const nextSortOrder = todayGoals.length + 1

    const { data, error } = await supabase
      .from('daily_goals')
      .insert({
        user_id: user.id,
        date: today,
        goal_text: goalText,
        sort_order: nextSortOrder,
      })
      .select()
      .single()

    if (!error && data) {
      setGoals((prev) => [...prev, data])
    }

    return { error }
  }

  async function toggleGoal(goal) {
    const nextCompleted = !goal.completed

    // Optimista: actualizamos la UI antes de confirmar en el servidor.
    setGoals((prev) =>
      prev.map((g) => (g.id === goal.id ? { ...g, completed: nextCompleted } : g)),
    )

    const { error } = await supabase
      .from('daily_goals')
      .update({ completed: nextCompleted })
      .eq('id', goal.id)

    if (error) {
      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, completed: goal.completed } : g)),
      )
    }

    return { error }
  }

  async function updateGoalText(goal, text) {
    const goalText = text.trim()
    if (!goalText || goalText === goal.goal_text) return { error: null }

    const { error } = await supabase
      .from('daily_goals')
      .update({ goal_text: goalText })
      .eq('id', goal.id)

    if (!error) {
      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, goal_text: goalText } : g)),
      )
    }

    return { error }
  }

  async function deleteGoal(goal) {
    const previous = goals
    setGoals((prev) => prev.filter((g) => g.id !== goal.id))

    const { error } = await supabase.from('daily_goals').delete().eq('id', goal.id)

    if (error) {
      setGoals(previous)
    }

    return { error }
  }

  return {
    todayGoals,
    history,
    stats,
    loading,
    error,
    canAddMore: todayGoals.length < MAX_GOALS_PER_DAY,
    addGoal,
    toggleGoal,
    updateGoalText,
    deleteGoal,
    refresh: load,
  }
}
