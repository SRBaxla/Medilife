import React, { useState, useEffect } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { tenantSlug } = useParams()
  const activeSlug = tenantSlug || 'jhansi-medilife-tenant-01'

  const [authState, setAuthState] = useState({
    loading: true,
    authenticated: false,
    authorized: false,
    error: null,
    resolvedTenantId: null
  })
  
  const location = useLocation()

  useEffect(() => {
    let mounted = true

    const checkAuthentication = async () => {
      try {
        // 1. Resolve tenantSlug to UUID first
        let resolvedId = import.meta.env.VITE_PUBLIC_CURRENT_TENANT_ID || '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e' // Default fallback Jhansi UUID
        
        try {
          const { data: tenant, error: tenantErr } = await supabase
            .from('tenants')
            .select('id')
            .eq('subdomain', activeSlug)
            .maybeSingle()

          if (!tenantErr && tenant) {
            resolvedId = tenant.id
          }
        } catch (tErr) {
          console.warn("Tenant UUID resolution failed inside ProtectedRoute, using Jhansi default context:", tErr)
        }

        // 2. Fetch current authenticated session & validate user
        let user = null
        try {
          const { data, error: userError } = await supabase.auth.getUser()
          if (!userError && data?.user) {
            user = data.user
          }
        } catch (uErr) {
          console.warn("ProtectedRoute getUser network exception:", uErr)
        }

        // Check for active offline session in sessionStorage
        const offlineSessionRaw = sessionStorage.getItem('medilife_offline_session')
        let offlineSession = null
        if (offlineSessionRaw) {
          try {
            offlineSession = JSON.parse(offlineSessionRaw)
          } catch (e) {}
        }

        if (!user && offlineSession) {
          const roleMatched = allowedRoles ? allowedRoles.includes(offlineSession.role) : true
          if (mounted) {
            setAuthState({
              loading: false,
              authenticated: true,
              authorized: roleMatched,
              error: null,
              resolvedTenantId: resolvedId
            })
          }
          return
        }
        
        if (!user) {
          if (mounted) {
            setAuthState({
              loading: false,
              authenticated: false,
              authorized: false,
              error: 'No active session',
              resolvedTenantId: resolvedId
            })
          }
          return;
        }

        // 3. Fetch user profile role and tenant verification
        let userRole = null
        let userTenantId = resolvedId

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, tenant_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profile && profile.role) {
          userRole = profile.role
          if (profile.tenant_id) userTenantId = profile.tenant_id
        } else if (user?.email) {
          const { data: emailProfile } = await supabase
            .from('user_profiles')
            .select('role, tenant_id')
            .eq('email', user.email)
            .maybeSingle()
          if (emailProfile && emailProfile.role) {
            userRole = emailProfile.role
            if (emailProfile.tenant_id) userTenantId = emailProfile.tenant_id
          }
        }

        if (!userRole && user) {
          if (user.user_metadata?.role) {
            userRole = user.user_metadata.role
          } else {
            const registeredStaffList = JSON.parse(localStorage.getItem('medilife_registered_staff') || '[]')
            const matchedStaff = registeredStaffList.find(s => s.email.toLowerCase() === (user.email || '').toLowerCase())
            if (matchedStaff && matchedStaff.role) {
              userRole = matchedStaff.role
              if (matchedStaff.tenant_id) userTenantId = matchedStaff.tenant_id
            }
          }
        }

        if (!userRole) {
          const userEmail = user?.email || ''
          const isRoutingAdmin = location.pathname.includes('/admin/')
          userRole = (userEmail.includes('admin') || userEmail.includes('staff') || isRoutingAdmin) ? 'admin' : 'patient'
        }

        verifyAccess({ role: userRole, tenant_id: userTenantId }, resolvedId)

      } catch (err) {
        console.error("Auth protection verification failed:", err)
        if (mounted) {
          setAuthState({
            loading: false,
            authenticated: false,
            authorized: false,
            error: err.message,
            resolvedTenantId: null
          })
        }
      }
    }

    const verifyAccess = (profile, resolvedId) => {
      if (!mounted) return

      // Verify role designation
      const roleMatched = allowedRoles ? allowedRoles.includes(profile.role) : true
      
      // Cross-reference profile tenant_id with active context resolvedId
      const tenantMatched = profile.tenant_id === resolvedId

      setAuthState({
        loading: false,
        authenticated: true,
        authorized: roleMatched && tenantMatched,
        error: null,
        resolvedTenantId: resolvedId
      })
    }

    checkAuthentication()

    return () => {
      mounted = false
    }
  }, [allowedRoles, activeSlug])

  // Renders the clean clinical loading spinner matching the dark mode layout
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-[#051424] flex flex-col items-center justify-center gap-md">
        <Loader2 className="w-10 h-10 text-clinical-teal animate-spin" />
        <p className="text-body-md text-admin-on-surface-variant animate-pulse font-medium">
          Verifying security credentials...
        </p>
      </div>
    )
  }

  // Redirect to appropriate login page based on URL prefix if unauthenticated
  if (!authState.authenticated) {
    const isRoutingAdmin = location.pathname.includes('/admin/')
    const redirectUrl = isRoutingAdmin 
      ? `/${activeSlug}/admin/login` 
      : `/${activeSlug}/patient/login`
    
    return <Navigate to={redirectUrl} state={{ from: location }} replace />
  }

  // Redirect to 403 unauthorized page if permissions or tenant context is invalid
  if (!authState.authorized) {
    return <Navigate to="/403" replace />
  }

  return children
}
