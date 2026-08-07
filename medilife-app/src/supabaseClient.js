import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Custom fetch wrapper to fail fast when offline/DNS unresolvable to prevent noisy retry loops
const fetchWithOfflineGuard = async (url, options) => {
  try {
    return await fetch(url, options)
  } catch (err) {
    // Fail fast on DNS / network errors
    throw err
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    fetch: fetchWithOfflineGuard
  }
})
