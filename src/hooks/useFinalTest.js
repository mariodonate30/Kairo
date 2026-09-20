import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// Estado y envío de la encuesta final. El estado (activa / completada) vive en
// AuthContext para que las rutas puedan protegerse; aquí solo se añade el insert.
export function useFinalTest() {
  const { user, finalTestActive, finalTestCompleted, refreshFinalTest } = useAuth()

  async function submit(responses) {
    const { error } = await supabase.from('final_test').insert({
      user_id: user.id,
      responses,
      completed_at: new Date().toISOString(),
    })

    if (!error) {
      await refreshFinalTest()
    }

    return { error }
  }

  return { active: finalTestActive, completed: finalTestCompleted, submit }
}
