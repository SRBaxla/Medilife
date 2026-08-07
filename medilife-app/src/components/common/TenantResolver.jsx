import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { StorefrontProvider } from '../../context/StorefrontContext'
import LabNotFound from '../../pages/client/LabNotFound'
import { Loader2 } from 'lucide-react'

export default function TenantResolver({ children }) {
  const { tenantSlug } = useParams()
  const location = useLocation()

  const [state, setState] = useState({
    loading: true,
    tenant: null,
    catalog: [],
    notFound: false
  })

  useEffect(() => {
    let isMounted = true

    const resolveTenantAndCatalog = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, notFound: false }))

        // 1. Subdomain Extraction Logic (with Localhost & Route Param Fallback Support)
        const hostname = window.location.hostname.toLowerCase()
        let slug = ''

        if (hostname.includes('.medilife.in') && !hostname.startsWith('www.')) {
          // Live Wildcard DNS routing (e.g., apex-labs.medilife.in -> apex-labs)
          slug = hostname.replace('.medilife.in', '')
        } else {
          // Localhost / Development fallback reading URL param or path
          slug = tenantSlug || 'jhansi-medilife-tenant-01'

          // Check if path contains explicit tenant prefix
          const pathSegments = location.pathname.split('/').filter(Boolean)
          if (pathSegments.length > 0 && pathSegments[0] !== 'onboarding' && pathSegments[0] !== 'booking' && pathSegments[0] !== 'privacy-policy' && pathSegments[0] !== 'terms') {
            if (pathSegments[0].includes('-tenant-') || pathSegments[0].includes('-lab')) {
              slug = pathSegments[0]
            }
          }
        }

        // 2. Query public.tenants in Supabase
        const { data: tenant, error: tenantErr } = await supabase
          .from('tenants')
          .select('*')
          .eq('subdomain', slug)
          .maybeSingle()

        if (tenantErr) console.warn("Tenant lookup warning:", tenantErr)

        if (!tenant) {
          // If no tenant record found in database
          if (slug === 'jhansi-medilife-tenant-01' || slug === 'default') {
            // Default demo tenant fallback
            const defaultTenant = {
              id: '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e',
              business_name: 'Jhansi Medilife Pathology Lab',
              subdomain: 'jhansi-medilife-tenant-01',
              brand_color: '#0d9488',
              logo_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=200&q=80',
              primary_address: 'Khati Baba, Jhansi, UP',
              contact_phone: '+91 82994 87062',
              subscription_status: 'active'
            }

            if (isMounted) {
              applyDynamicBrandColor(defaultTenant.brand_color)
              setState({
                loading: false,
                tenant: defaultTenant,
                catalog: getSampleCatalog(),
                notFound: false
              })
            }
          } else {
            if (isMounted) {
              setState({ loading: false, tenant: null, catalog: [], notFound: true })
            }
          }
          return
        }

        // 3. Fetch Lab Specific Test Catalog
        let catalogData = []
        try {
          const { data: tests } = await supabase
            .from('bookings')
            .select('package_name')
            .eq('tenant_id', tenant.id)

          if (tests && tests.length > 0) {
            const uniqueNames = Array.from(new Set(tests.map(t => t.package_name).filter(Boolean)))
            catalogData = uniqueNames.map((name, i) => ({
              id: `test-${i}`,
              name,
              price: 499 + (i * 250),
              preparation: 'Fasting 10-12 hours required',
              tat: 'Reports within 24 hours'
            }))
          }
        } catch (catErr) {
          console.warn("Catalog fetch error:", catErr)
        }

        if (catalogData.length === 0) {
          catalogData = getSampleCatalog()
        }

        if (isMounted) {
          applyDynamicBrandColor(tenant.brand_color || '#0d9488')
          setState({
            loading: false,
            tenant,
            catalog: catalogData,
            notFound: false
          })
        }

      } catch (err) {
        console.error("TenantResolver error:", err)
        if (isMounted) {
          setState({ loading: false, tenant: null, catalog: [], notFound: true })
        }
      }
    }

    resolveTenantAndCatalog()

    return () => {
      isMounted = false
    }
  }, [tenantSlug, location.pathname])

  // Helper: Inject Dynamic CSS Custom Property for Brand Styling
  const applyDynamicBrandColor = (hexColor) => {
    const color = hexColor || '#0d9488'
    document.documentElement.style.setProperty('--brand-primary', color)
  }

  if (state.loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="w-10 h-10 text-clinical-teal animate-spin" />
        <p className="text-sm font-medium animate-pulse text-slate-400">
          Resolving pathology franchisee storefront & brand assets...
        </p>
      </div>
    )
  }

  if (state.notFound) {
    return <LabNotFound />
  }

  return (
    <StorefrontProvider tenant={state.tenant} catalog={state.catalog} notFound={state.notFound}>
      <div style={{ '--brand-primary': state.tenant?.brand_color || '#0d9488' }}>
        {children}
      </div>
    </StorefrontProvider>
  )
}

function getSampleCatalog() {
  return [
    {
      id: 'c-1',
      name: 'Complete Full Body Checkup (75+ Parameters)',
      price: 1499,
      preparation: 'Fasting 10-12 hrs required',
      tat: 'Reports in 12 hrs',
      popular: true
    },
    {
      id: 'c-2',
      name: 'Diabetes & HbA1c Monitoring Shield',
      price: 499,
      preparation: 'Fasting glucose + Post-prandial',
      tat: 'Reports in 6 hrs',
      popular: false
    },
    {
      id: 'c-3',
      name: 'Thyroid Profile Total (T3, T4, TSH)',
      price: 399,
      preparation: 'No fasting required',
      tat: 'Reports in 8 hrs',
      popular: false
    },
    {
      id: 'c-4',
      name: 'Monsoon Dengue & Typhoid Shield',
      price: 899,
      preparation: 'Fasting not required',
      tat: 'Same day reports',
      popular: true
    }
  ]
}
