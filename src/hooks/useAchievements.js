import { useContext } from 'react'
import { AchievementsContext } from '../contexts/AchievementsContext'

export function useAchievements() {
  const context = useContext(AchievementsContext)
  if (context === undefined) {
    throw new Error('useAchievements debe usarse dentro de un AchievementsProvider')
  }
  return context
}
