import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true)
        const { data: { user }, error } = await supabase.auth.getUser()
        
        // If the user was deleted on the backend, Supabase returns an error (e.g., status 403 or AuthApiError)
        if (error && (error.status === 403 || error.status === 401 || error.message?.includes('User not found'))) {
          console.warn("Session invalid or user deleted. Signing out locally.")
          await supabase.auth.signOut() // Clears the stale token from Local Storage
          setUser(null)
          return
        }

        setUser(user)
      } catch (err) {
        console.error("Auth session check error:", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  return { user, loading }
}
