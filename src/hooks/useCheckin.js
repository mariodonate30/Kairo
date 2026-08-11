import { useContext } from 'react'
import { CheckinContext } from '../contexts/CheckinContext'

// Acceso al estado compartido del check-in de hoy (ver CheckinProvider).
export function useCheckin() {
  const context = useContext(CheckinContext)
  if (context === undefined) {
    throw new Error('useCheckin debe usarse dentro de un CheckinProvider')
  }
  return context
}
