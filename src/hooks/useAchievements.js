import { useContext } from 'react'
import { AchievementsContext } from '../contexts/AchievementsContext'

export function useAchievements() {
  const context = useContext(AchievementsContext)
  if (context === undefined) {
    throw new Error('useAchievements s\'ha de fer servir dins d\'un AchievementsProvider')
  }
  return context
}
