import { createContext, useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { earnedKeys } from '../utils/achievements'
import { currentStreak, longestStreak } from '../utils/streaks'
import AchievementToastStack from '../components/ui/AchievementToast'

export const AchievementsContext = createContext(undefined)

// Identificador único incremental para cada toast (permite mostrar el mismo
// logro más de una vez en sesiones distintas sin colisiones de key).
let toastCounter = 0

export function AchievementsProvider({ children }) {
  const { user, profile, refreshProfile } = useAuth()

  const [catalog, setCatalog] = useState([]) // filas de la tabla achievements
  const [unlocked, setUnlocked] = useState({}) // key -> unlocked_at (ISO)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])

  // Refs con el estado más reciente, para que checkAchievements no dependa de
  // closures obsoletas ni se re-cree en cada render.
  const catalogRef = useRef(catalog)
  const profileRef = useRef(profile)
  const checkingRef = useRef(false)
  catalogRef.current = catalog
  profileRef.current = profile

  // Carga inicial del catálogo de logros y de los que el usuario ya tiene.
  const load = useCallback(async () => {
    if (!user) {
      setCatalog([])
      setUnlocked({})
      setLoading(false)
      return
    }

    setLoading(true)

    const [catRes, uaRes] = await Promise.all([
      supabase.from('achievements').select('*').order('sort_order', { ascending: true }),
      supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user.id),
    ])

    const cat = catRes.data || []
    setCatalog(cat)

    const idToKey = new Map(cat.map((a) => [a.id, a.key]))
    const map = {}
    for (const row of uaRes.data || []) {
      const key = idToKey.get(row.achievement_id)
      if (key) map[key] = row.unlocked_at
    }
    setUnlocked(map)
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const enqueueToasts = useCallback((items) => {
    setToasts((prev) => [...prev, ...items])
  }, [])

  const dismissToast = useCallback((uid) => {
    setToasts((prev) => prev.filter((t) => t.uid !== uid))
  }, [])

  // Recalcula todas las estadísticas del usuario desde la base de datos,
  // desbloquea los logros recién conseguidos y actualiza la racha del perfil.
  // Es idempotente: se puede llamar tras cualquier acción sin duplicar nada.
  const checkAchievements = useCallback(async () => {
    if (!user) return
    if (checkingRef.current) return
    checkingRef.current = true

    try {
      // Aseguramos tener el catálogo cargado (puede llamarse antes de load()).
      let cat = catalogRef.current
      if (!cat.length) {
        const { data } = await supabase.from('achievements').select('*')
        cat = data || []
        setCatalog(cat)
      }
      const keyToAchievement = new Map(cat.map((a) => [a.key, a]))

      const [checkinsRes, surveysRes, focusRes, medRes, goalsRes, uaRes] =
        await Promise.all([
          supabase.from('daily_checkins').select('date, water_glasses').eq('user_id', user.id),
          supabase
            .from('weekly_surveys')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .not('completed_at', 'is', null),
          supabase.from('focus_sessions').select('actual_minutes').eq('user_id', user.id),
          supabase
            .from('meditation_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase.from('daily_goals').select('date, completed').eq('user_id', user.id),
          supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id),
        ])

      const checkins = checkinsRes.data || []
      const focus = focusRes.data || []
      const goals = goalsRes.data || []

      // Rachas de check-in (a partir de los días con check-in).
      const checkinDates = new Set(checkins.map((c) => c.date))
      const streakNow = currentStreak(checkinDates)
      const streakBest = longestStreak(checkinDates)

      // Objetivos: total cumplidos y si algún día se cumplieron todos.
      const goalsByDay = new Map()
      let goalsCompletedTotal = 0
      for (const goal of goals) {
        if (goal.completed) goalsCompletedTotal += 1
        if (!goalsByDay.has(goal.date)) goalsByDay.set(goal.date, { total: 0, done: 0 })
        const day = goalsByDay.get(goal.date)
        day.total += 1
        if (goal.completed) day.done += 1
      }
      let perfectGoalDay = false
      for (const day of goalsByDay.values()) {
        if (day.total >= 1 && day.done === day.total) {
          perfectGoalDay = true
          break
        }
      }

      const stats = {
        checkinCount: checkins.length,
        checkinStreak: streakNow,
        waterTotal: checkins.reduce((sum, c) => sum + (c.water_glasses || 0), 0),
        surveyCount: surveysRes.count || 0,
        focusCount: focus.length,
        focusMinutes: focus.reduce((sum, f) => sum + (f.actual_minutes || 0), 0),
        meditationCount: medRes.count || 0,
        goalsCompletedTotal,
        perfectGoalDay,
      }

      // Determina qué logros hay que insertar (conseguidos y aún sin registrar).
      const alreadyUnlockedIds = new Set(
        (uaRes.data || []).map((row) => row.achievement_id),
      )
      const earned = earnedKeys(stats)
      const newRows = []
      const newToasts = []

      for (const key of earned) {
        const achievement = keyToAchievement.get(key)
        if (!achievement) continue
        if (alreadyUnlockedIds.has(achievement.id)) continue
        newRows.push({ user_id: user.id, achievement_id: achievement.id })
        newToasts.push({
          uid: (toastCounter += 1),
          key: achievement.key,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
        })
      }

      if (newRows.length) {
        const { error } = await supabase
          .from('user_achievements')
          .upsert(newRows, {
            onConflict: 'user_id,achievement_id',
            ignoreDuplicates: true,
          })

        if (!error) {
          const now = new Date().toISOString()
          setUnlocked((prev) => {
            const next = { ...prev }
            for (const toast of newToasts) next[toast.key] = now
            return next
          })
          enqueueToasts(newToasts)
        }
      }

      // Actualiza la racha del perfil si ha cambiado (item de la fase: cálculo
      // de rachas en los check-ins diarios).
      const currentProfile = profileRef.current
      if (currentProfile) {
        const newLongest = Math.max(currentProfile.longest_streak || 0, streakBest)
        if (
          currentProfile.current_streak !== streakNow ||
          currentProfile.longest_streak !== newLongest
        ) {
          const { error } = await supabase
            .from('profiles')
            .update({ current_streak: streakNow, longest_streak: newLongest })
            .eq('id', user.id)
          if (!error) await refreshProfile()
        }
      }
    } finally {
      checkingRef.current = false
    }
  }, [user, enqueueToasts, refreshProfile])

  // Al iniciar sesión, comprobamos los logros una vez para desbloquear de forma
  // retroactiva cualquiera ya conseguido (y recalcular la racha del perfil).
  useEffect(() => {
    if (user) checkAchievements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Lista para la UI: catálogo con estado desbloqueado/pendiente.
  const achievements = catalog.map((a) => ({
    ...a,
    unlocked: Boolean(unlocked[a.key]),
    unlocked_at: unlocked[a.key] || null,
  }))

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  const value = {
    achievements,
    unlockedCount,
    total: catalog.length,
    loading,
    checkAchievements,
  }

  return (
    <AchievementsContext.Provider value={value}>
      {children}
      <AchievementToastStack toasts={toasts} onDismiss={dismissToast} />
    </AchievementsContext.Provider>
  )
}
