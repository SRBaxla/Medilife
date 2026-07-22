import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../supabaseClient'
import PageTransition from '../../components/common/PageTransition'
import TestCatalog from '../../components/common/TestCatalog'
import StaffManagement from '../../components/common/StaffManagement'

const statusConfig = {
  waiting: { label: 'Waiting', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: 'schedule' },
  pending: { label: 'Waiting', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: 'schedule' },
  scheduled: { label: 'Waiting', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: 'schedule' },
  'in-progress': { label: 'In Progress', color: 'text-clinical-teal', bg: 'bg-clinical-teal/10 border-clinical-teal/20', icon: 'hourglass_top' },
  processing: { label: 'In Progress', color: 'text-clinical-teal', bg: 'bg-clinical-teal/10 border-clinical-teal/20', icon: 'hourglass_top' },
  done: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: 'check_circle' },
  completed: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: 'check_circle' },
  complete: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: 'check_circle' },
}

const defaultStatusConfig = { label: 'Waiting', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: 'schedule' }

export default function AdminDashboard() {
  const [patients, setPatients] = useState([])
  const [queueLoading, setQueueLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [currentTenantSlug, setCurrentTenantSlug] = useState('jhansi-medilife-tenant-01')
  const [tenantId, setTenantId] = useState(null)
  const [tenantLoading, setTenantLoading] = useState(true)
  const [tenantError, setTenantError] = useState(null)
  const [dashboardTab, setDashboardTab] = useState('operations') // 'operations' or 'staff'

  // Fetch live queue from Supabase bookings table
  const fetchLiveQueue = async (targetTenantId) => {
    if (!targetTenantId) return
    try {
      setQueueLoading(true)
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('tenant_id', targetTenantId)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        const formatted = data.map((b) => ({
          id: b.id,
          name: b.patient_name || 'Patient',
          age: b.patient_age || 30,
          gender: b.gender || 'M',
          tests: Array.isArray(b.tests) ? b.tests : [b.test_name || 'General Checkup'],
          status: b.status || 'waiting',
          time: new Date(b.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
        setPatients(formatted)
      } else {
        setPatients([])
      }
    } catch (err) {
      console.warn("Could not fetch live bookings queue from database:", err)
      setPatients([])
    } finally {
      setQueueLoading(false)
    }
  }

  // Resolve tenant subdomain to UUID
  useEffect(() => {
    const resolveTenant = async () => {
      try {
        setTenantLoading(true)
        setTenantError(null)
        
        const { data, error } = await supabase
          .from('tenants')
          .select('id')
          .eq('subdomain', currentTenantSlug)
          .maybeSingle()

        if (error) throw error
        
        if (!data || !data.id) {
          throw new Error("No database records match this tenant subdomain.")
        }

        setTenantId(data.id)
        fetchLiveQueue(data.id)
      } catch (err) {
        console.warn("Dynamic tenant lookup failed:", err)
        if (currentTenantSlug === 'invalid-tenant-slug') {
          setTenantError("Requested tenant profile could not be found in active server registries.")
          setTenantId(null)
        } else {
          const defaultTenantId = import.meta.env.VITE_PUBLIC_CURRENT_TENANT_ID || '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e'
          setTenantId(defaultTenantId)
          fetchLiveQueue(defaultTenantId)
        }
      } finally {
        setTenantLoading(false)
      }
    }

    resolveTenant()
  }, [currentTenantSlug])

  const advance = async (id) => {
    const target = patients.find(p => p.id === id)
    if (!target) return
    const newStatus = target.status === 'waiting' ? 'in-progress' : 'done'

    // Local state update
    setPatients((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p))

    // Persist to Supabase
    try {
      await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id)
    } catch (err) {
      console.error("Failed to update booking status in Supabase:", err)
    }
  }

  const filtered = filter === 'all' ? patients : patients.filter((p) => p.status === filter)

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-white/10 pb-md">
          <div>
            <h1 className="text-headline-lg font-bold text-admin-primary">Administrative Command</h1>
            <p className="text-admin-on-surface-variant text-body-md">Manage lab check-ins, medical catalogs, and team roles.</p>
          </div>
          
          {/* Tenant Selector Switcher */}
          <div className="flex items-center gap-sm bg-white/5 border border-white/10 p-1.5 rounded-2xl self-start">
            <span className="text-label-sm text-admin-on-surface-variant px-sm font-semibold uppercase">Location:</span>
            {[
              { id: 'jhansi-medilife-tenant-01', label: 'Jhansi Lab' },
              { id: 'tenant-delhi-01', label: 'Delhi Central' },
              { id: 'tenant-mumbai-02', label: 'Mumbai Lab' },
              { id: 'invalid-tenant-slug', label: '🚨 Simulate Error' }
            ].map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => setCurrentTenantSlug(tenant.id)}
                className={`px-md py-xs rounded-xl text-label-sm font-semibold transition-all ${
                  currentTenantSlug === tenant.id
                    ? tenant.id === 'invalid-tenant-slug' 
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-clinical-teal text-[#00363d] shadow-admin-glow'
                    : 'text-admin-on-surface-variant hover:text-white'
                }`}
              >
                {tenant.label}
              </button>
            ))}
          </div>

          {/* Dashboard View Selector */}
          <div className="flex items-center gap-sm bg-white/5 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setDashboardTab('operations')}
              className={`px-md py-sm rounded-lg text-label-sm font-semibold transition-all ${
                dashboardTab === 'operations'
                  ? 'bg-clinical-teal text-[#00363d]'
                  : 'text-admin-on-surface-variant hover:text-white'
              }`}
            >
              Operations Dashboard
            </button>
            <button
              onClick={() => setDashboardTab('staff')}
              className={`px-md py-sm rounded-lg text-label-sm font-semibold transition-all ${
                dashboardTab === 'staff'
                  ? 'bg-clinical-teal text-[#00363d]'
                  : 'text-admin-on-surface-variant hover:text-white'
              }`}
            >
              Staff & Role Control
            </button>
          </div>
        </div>

        {/* Tenant Loading State */}
        {tenantLoading ? (
          <div className="flex flex-col items-center justify-center py-xxl gap-md card-admin">
            <div className="w-10 h-10 border-2 border-clinical-teal border-t-transparent rounded-full animate-spin" />
            <p className="text-body-md text-admin-on-surface-variant animate-pulse">Resolving location subdomain UUID registry...</p>
          </div>
        ) : tenantError ? (
          /* High contrast Tenant Not Found error layout */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="p-xl bg-red-950/40 border border-red-500/30 rounded-3xl text-center space-y-md max-w-lg mx-auto shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">domain_disabled</span>
            </div>
            <h3 className="text-headline-md font-bold text-red-400">Pathology Location Registry Error</h3>
            <p className="text-body-md text-admin-on-surface-variant max-w-sm mx-auto">
              {tenantError}
            </p>
            <div className="pt-md">
              <button 
                onClick={() => setCurrentTenantSlug('jhansi-medilife-tenant-01')}
                className="px-xl py-sm bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-95 transition-all text-label-md font-semibold"
              >
                Reconnect to Jhansi Lab
              </button>
            </div>
          </motion.div>
        ) : (
          /* Render Tabs */
          dashboardTab === 'operations' ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                {[
                  { label: 'Total Today', value: patients.length, icon: 'groups', color: 'text-clinical-teal' },
                  { label: 'Waiting', value: patients.filter((p) => p.status === 'waiting').length, icon: 'schedule', color: 'text-amber-400' },
                  { label: 'In Progress', value: patients.filter((p) => p.status === 'in-progress').length, icon: 'hourglass_top', color: 'text-blue-400' },
                  { label: 'Completed', value: patients.filter((p) => p.status === 'done').length, icon: 'check_circle', color: 'text-emerald-400' },
                ].map(({ label, value, icon, color }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card-admin p-lg">
                    <div className="flex justify-between items-start mb-sm">
                      <p className="text-admin-on-surface-variant text-label-md">{label}</p>
                      <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
                    </div>
                    <p className={`text-display-lg-mobile font-bold font-mono ${color}`}>{value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Check-in Section */}
              <div className="space-y-md">
                <div className="flex items-center justify-between">
                  <h2 className="text-headline-md font-bold text-admin-primary">Live Queue</h2>
                  {/* Filter Tabs */}
                  <div className="flex gap-sm overflow-x-auto pb-sm">
                    {[{ k: 'all', l: 'All' }, { k: 'waiting', l: 'Waiting' }, { k: 'in-progress', l: 'In Progress' }, { k: 'done', l: 'Done' }].map(({ k, l }) => (
                      <button key={k} onClick={() => setFilter(k)}
                        className={`shrink-0 px-md py-xs rounded-full text-label-sm transition-all ${filter === k ? 'bg-clinical-teal text-[#00363d] font-bold' : 'glass-panel text-admin-on-surface-variant hover:bg-white/10'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Queue */}
                <div className="space-y-md">
                  {filtered.map((p, i) => {
                    const sc = statusConfig[p.status] || defaultStatusConfig
                    const displayId = p.id ? (String(p.id).includes('-') ? String(p.id).split('-')[1] : String(p.id).substring(0, 4)) : '001'
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="card-admin p-lg flex flex-col sm:flex-row sm:items-center gap-md justify-between"
                      >
                        <div className="flex items-center gap-md">
                          <div className="w-12 h-12 rounded-full bg-clinical-teal/10 border border-clinical-teal/20 flex items-center justify-center text-clinical-teal font-bold font-mono text-[12px]">
                            {displayId}
                          </div>
                          <div>
                            <div className="flex items-center gap-sm">
                              <p className="font-bold text-admin-on-surface text-headline-sm">{p.name}</p>
                              <span className="text-admin-on-surface-variant text-label-sm">{p.age}{p.gender}</span>
                            </div>
                            <div className="flex flex-wrap gap-xs mt-xs">
                              {p.tests.map((t) => (
                                <span key={t} className="px-sm py-0.5 rounded-full glass-panel text-label-sm text-admin-on-surface-variant">{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-md shrink-0">
                          <span className="text-label-sm text-admin-on-surface-variant">{p.time}</span>
                          <span className={`px-sm py-xs rounded-full border text-label-sm font-bold ${sc.color} ${sc.bg} flex items-center gap-xs`}>
                            <span className="material-symbols-outlined text-[14px]">{sc.icon}</span>
                            {sc.label}
                          </span>
                          {p.status !== 'done' && (
                            <button onClick={() => advance(p.id)} className="px-md py-sm bg-clinical-teal/10 border border-clinical-teal/20 text-clinical-teal rounded-lg text-label-sm hover:bg-clinical-teal/20 transition-all">
                              {p.status === 'waiting' ? 'Start' : 'Complete'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Multi-Tenant Catalog Section */}
              <div className="border-t border-admin-outline-variant/20 pt-xl space-y-md">
                <div>
                  <h2 className="text-headline-md font-bold text-admin-primary">Lab Pathology Catalog</h2>
                  <p className="text-admin-on-surface-variant text-body-md">Manage test profiles and report templates for location: <span className="text-clinical-teal font-semibold font-mono">{tenantId}</span></p>
                </div>

                {/* TestCatalog component with resolved UUID */}
                <TestCatalog tenantId={tenantId} />
              </div>
            </>
          ) : (
            /* Render new Multi-tenant Staff Role Management Component with resolved UUID */
            <div className="space-y-md">
              <StaffManagement tenantId={tenantId} />
            </div>
          )
        )}
      </div>
    </PageTransition>
  )
}
