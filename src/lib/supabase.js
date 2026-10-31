import { createClient } from '@supabase/supabase-js'
import { createGuestClient, isGuestMode } from './guestClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// En modo invitado nada se envía a Supabase: los datos viven en el navegador.
export const supabase = isGuestMode()
  ? createGuestClient()
  : createClient(supabaseUrl, supabaseAnonKey)
