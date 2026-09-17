import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// Estado y envío del test inicial (baseline). El estado de "completado" vive en
// AuthContext para que las rutas puedan protegerse; aquí solo se añade el insert.
export function useInitialTest() {
  const { user, initialTestCompleted, refreshInitialTest } = useAuth()

  async function submit(responses) {
    const { error } = await supabase.from('initial_test').insert({
      user_id: user.id,
      responses,
      completed_at: new Date().toISOString(),
    })

    if (!error) {
      await refreshInitialTest()
    }

    return { error }
  }

  return { completed: initialTestCompleted, submit }
}
