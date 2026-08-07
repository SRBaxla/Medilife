import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const TenantContext = createContext(null)

export function TenantProvider({ children }) {
  const { tenantSlug } = useParams()
  const activeSlug = tenantSlug || 'jhansi-medilife-tenant-01'

  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTenantData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('tenants')
        .select('*')
        .eq('subdomain', activeSlug)
        .maybeSingle()

      if (err) throw err

      if (data) {
        setTenant(data)
      } else {
        // Fallback context for default preview/demo branch
        setTenant({
          id: import.meta.env.VITE_PUBLIC_CURRENT_TENANT_ID || '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e',
          business_name: 'Jhansi Medilife Pathology Lab',
          subdomain: activeSlug,
          subscription_status: 'active',
          subscription_tier: 'Scale',
          billing_cycle: 'annual',
          credit_balance: 10000,
          setup_fee_paid: true,
        })
      }
    } catch (e) {
      console.warn("TenantContext lookup failed, using fallback Jhansi context:", e)
      setTenant({
        id: import.meta.env.VITE_PUBLIC_CURRENT_TENANT_ID || '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e',
        business_name: 'Jhansi Medilife Pathology Lab',
        subdomain: activeSlug,
        subscription_status: 'active',
        subscription_tier: 'Scale',
        billing_cycle: 'annual',
        credit_balance: 10000,
        setup_fee_paid: true,
      })
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [activeSlug])

  useEffect(() => {
    fetchTenantData()
  }, [fetchTenantData])

  // Grace Period Calculator: True if status is past_due AND grace_period_until is in the future
  const isGracePeriodActive = useCallback(() => {
    if (!tenant) return false
    if (tenant.subscription_status === 'past_due' && tenant.grace_period_until) {
      const graceEnd = new Date(tenant.grace_period_until).getTime()
      return graceEnd > Date.now()
    }
    return tenant.subscription_status === 'past_due'
  }, [tenant])

  const isSuspended = useCallback(() => {
    if (!tenant) return false
    if (tenant.subscription_status === 'inactive' || tenant.subscription_status === 'canceled') {
      return true
    }
    // If past_due and grace period expired
    if (tenant.subscription_status === 'past_due' && tenant.grace_period_until) {
      const graceEnd = new Date(tenant.grace_period_until).getTime()
      return Date.now() > graceEnd
    }
    return false
  }, [tenant])

  const value = {
    tenant,
    loading,
    error,
    refreshTenant: fetchTenantData,
    isGracePeriodActive: isGracePeriodActive(),
    isSuspended: isSuspended(),
    subscriptionStatus: tenant?.subscription_status || 'inactive',
    creditBalance: tenant?.credit_balance || 0,
    tier: tenant?.subscription_tier || 'Base',
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return context
}
