import { createContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  // null = todavía sin comprobar; true/false una vez cargado.
  const [initialTestCompleted, setInitialTestCompleted] = useState(null)
  const [finalTestCompleted, setFinalTestCompleted] = useState(null)
  // Si la encuesta final está activada globalmente (app_settings). null = cargando.
  const [finalTestActive, setFinalTestActive] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error cargando el perfil:', error.message)
      setProfile(null)
      return
    }

    setProfile(data)
  }

  // Comprueba si el usuario ya ha completado el test inicial (baseline).
  async function loadInitialTest(userId) {
    const { data, error } = await supabase
      .from('initial_test')
      .select('completed_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error cargando el test inicial:', error.message)
      setInitialTestCompleted(false)
      return
    }

    setInitialTestCompleted(Boolean(data?.completed_at))
  }

  // Comprueba si el usuario ya ha completado la encuesta final.
  async function loadFinalTest(userId) {
    const { data, error } = await supabase
      .from('final_test')
      .select('completed_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error cargando la encuesta final:', error.message)
      setFinalTestCompleted(false)
      return
    }

    setFinalTestCompleted(Boolean(data?.completed_at))
  }

  // Lee del ajuste global si la encuesta final está activada.
  async function loadFinalTestActive() {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'final_test_active')
      .maybeSingle()

    if (error) {
      console.error('Error cargando la configuración:', error.message)
      setFinalTestActive(false)
      return
    }

    setFinalTestActive(data?.value === true)
  }

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        Promise.all([
          loadProfile(session.user.id),
          loadInitialTest(session.user.id),
          loadFinalTest(session.user.id),
          loadFinalTestActive(),
        ]).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
        loadInitialTest(session.user.id)
        loadFinalTest(session.user.id)
        loadFinalTestActive()
      } else {
        setProfile(null)
        setInitialTestCompleted(null)
        setFinalTestCompleted(null)
        setFinalTestActive(null)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id)
    }
  }

  async function refreshInitialTest() {
    if (user) {
      await loadInitialTest(user.id)
    }
  }

  async function refreshFinalTest() {
    if (user) {
      await loadFinalTest(user.id)
    }
    await loadFinalTestActive()
  }

  async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    initialTestCompleted,
    finalTestCompleted,
    finalTestActive,
    isAdmin: profile?.role === 'admin',
    refreshProfile,
    refreshInitialTest,
    refreshFinalTest,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
