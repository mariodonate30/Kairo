import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// Estado y envío del test inicial (baseline). El estado de "completado" vive en
// AuthContext para que las rutas puedan protegerse; aquí solo se añade el insert.
export function useInitialTest() {
  const { user, initialTestCompleted, refreshInitialTest, refreshProfile } = useAuth()

  async function submit(responses) {
    const { error } = await supabase.from('initial_test').insert({
      user_id: user.id,
      responses,
      completed_at: new Date().toISOString(),
    })

    if (error) {
      return { error }
    }

    // El género (opcional) se copia al perfil para poder analizar los datos
    // agregados por sexo. Si el alumno no lo indicó, se deja el perfil intacto.
    const gender = responses.gender
    if (gender === 'chico' || gender === 'chica') {
      await supabase.from('profiles').update({ gender }).eq('id', user.id)
      await refreshProfile()
    }

    await refreshInitialTest()
    return { error: null }
  }

  return { completed: initialTestCompleted, submit }
}
