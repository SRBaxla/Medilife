import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../supabaseClient'
import PageTransition from '../../components/common/PageTransition'
import { 
  Building2, 
  ShieldCheck, 
  Sliders, 
  History, 
  Save, 
  CheckCircle, 
  Loader2, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Radio, 
  FileText,
  User,
  Database
} from 'lucide-react'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'automation' | 'audit'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })

  // Lab Profile Form State
  const [labProfile, setLabProfile] = useState({
    business_name: 'Jhansi Medilife Pathology Lab',
    license_no: 'NABL-MED-2026-8819',
    subdomain: 'jhansi-medilife-tenant-01',
    email: 'support@medilife.com',
    phone: '+91 98765 43210',
    address: '124 Diagnostics Avenue, Jhansi, Uttar Pradesh, 284001',
  })

  // Automation Switches
  const [settings, setSettings] = useState({
    autoDispatch: true,
    flagOutOfRange: true,
    enableAuditLog: true,
    smsAlerts: false,
    emailNotifications: true
  })

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([])
  const [loadingAudit, setLoadingAudit] = useState(false)

  // Data Purge Modal State
  const [purgeModal, setPurgeModal] = useState({ open: false, type: 'all' }) // 'reports' | 'audit' | 'all'
  const [verifyText, setVerifyText] = useState('')
  const [purging, setPurging] = useState(false)

  const handleConfirmPurge = async () => {
    const expected = purgeModal.type === 'reports' ? 'CLEAR REPORTS' : purgeModal.type === 'audit' ? 'CLEAR LOGS' : 'PURGE ALL DATA'
    if (verifyText.trim().toUpperCase() !== expected) {
      alert(`Verification text mismatch. Please type "${expected}" exactly to confirm deletion.`)
      return
    }

    setPurging(true)
    try {
      if (purgeModal.type === 'audit' || purgeModal.type === 'all') {
        // Purge audit logs table
        await supabase.from('audit_logs').delete().not('id', 'is', null)
        await supabase.from('audit_logs').delete().gt('created_at', '1970-01-01T00:00:00Z')

        // Purge staff break logs table & localStorage
        await supabase.from('staff_break_logs').delete().not('id', 'is', null)
        await supabase.from('staff_break_logs').delete().gt('created_at', '1970-01-01T00:00:00Z')
        localStorage.removeItem('medilife_staff_break')
        setAuditLogs([])
      }

      if (purgeModal.type === 'reports' || purgeModal.type === 'all') {
        // Purge bookings table using multiple target strategies
        await supabase.from('bookings').delete().not('id', 'is', null)
        await supabase.from('bookings').delete().neq('status', 'non_existent_xyz')
        await supabase.from('bookings').delete().gt('created_at', '1970-01-01T00:00:00Z')
        await supabase.from('bookings').delete().eq('tenant_id', '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e')
        localStorage.removeItem('medilife_patient_bookings')
      }

      // Broadcast storage and break event
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new Event('staff-break-change'))

      showToast(`Data purge completed successfully (${expected}).`, "success")
      setPurgeModal({ open: false, type: 'all' })
      setVerifyText('')

      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err) {
      console.error("Purge execution error:", err)
      showToast(err.message || "Failed to purge database records.", "error")
      setPurgeModal({ open: false, type: 'all' })
      setVerifyText('')
    } finally {
      setPurging(false)
    }
  }

  // Fetch Tenant Info and Audit Logs
  useEffect(() => {
    fetchTenantDetails()
    fetchAuditLogs()
  }, [])

  const fetchTenantDetails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('subdomain', 'jhansi-medilife-tenant-01')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setLabProfile(prev => ({
          ...prev,
          business_name: data.business_name || prev.business_name,
          subdomain: data.subdomain || prev.subdomain
        }))
      }
    } catch (err) {
      console.warn("Could not fetch tenant configuration:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true)
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setAuditLogs(data || [])
    } catch (err) {
      console.warn("Could not fetch audit logs:", err)
    } finally {
      setLoadingAudit(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Update tenant name in Supabase
      await supabase
        .from('tenants')
        .update({ business_name: labProfile.business_name })
        .eq('subdomain', 'jhansi-medilife-tenant-01')

      showToast("Laboratory profile settings saved successfully.", "success")
    } catch (err) {
      console.error("Save profile error:", err)
      showToast("Updated locally (offline mode).", "info")
    } finally {
      setSaving(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' })
    }, 4000)
  }

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl min-h-[90vh] bg-[#051424]">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-white/10 pb-md">
          <div>
            <h1 className="text-headline-lg font-bold text-admin-primary">System & Portal Settings</h1>
            <p className="text-admin-on-surface-variant text-body-md">Configure facility profiles, diagnostic automation rules, and review compliance audit logs.</p>
          </div>
          <span className="badge badge-success bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-md py-xs rounded-xl flex items-center gap-xs font-mono text-label-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            NABL Accredited • Realtime Active
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-sm bg-white/5 border border-white/10 p-1.5 rounded-2xl w-full sm:w-fit">
          {[
            { id: 'profile', label: 'Facility & Lab Profile', icon: Building2 },
            { id: 'automation', label: 'Diagnostic Automation', icon: Sliders },
            { id: 'audit', label: 'Compliance Audit Trail', icon: History },
            { id: 'purge', label: 'Clear Data & Logs', icon: Database }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 sm:flex-initial px-md sm:px-lg py-xs rounded-xl text-label-sm sm:text-label-md font-bold transition-all flex items-center justify-center gap-xs ${
                activeTab === id
                  ? 'bg-clinical-teal text-[#00363d] shadow-admin-glow'
                  : id === 'purge'
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                  : 'text-admin-on-surface-variant hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1: FACILITY PROFILE */}
        {activeTab === 'profile' && (
          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSaveProfile}
            className="bg-white/5 border border-white/10 rounded-3xl p-xl max-w-4xl space-y-lg shadow-2xl"
          >
            <div className="border-b border-white/10 pb-md">
              <h3 className="text-headline-sm font-bold text-admin-on-surface">Laboratory Header & Legal Branding</h3>
              <p className="text-body-md text-admin-on-surface-variant">These details appear directly on all official pathology PDF reports generated by your lab.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="space-y-xs">
                <label className="text-label-md font-semibold text-admin-on-surface block">Laboratory Full Name</label>
                <input
                  type="text"
                  required
                  value={labProfile.business_name}
                  onChange={(e) => setLabProfile({ ...labProfile, business_name: e.target.value })}
                  className="w-full px-md py-sm bg-[#071927] border border-white/20 rounded-xl text-white focus:outline-none focus:border-clinical-teal focus:ring-2 focus:ring-clinical-teal/30"
                />
              </div>

              <div className="space-y-xs">
                <label className="text-label-md font-semibold text-admin-on-surface block">NABL Accreditation ID</label>
                <input
                  type="text"
                  required
                  value={labProfile.license_no}
                  onChange={(e) => setLabProfile({ ...labProfile, license_no: e.target.value })}
                  className="w-full px-md py-sm bg-[#071927] border border-white/20 rounded-xl text-white font-mono focus:outline-none focus:border-clinical-teal focus:ring-2 focus:ring-clinical-teal/30"
                />
              </div>

              <div className="space-y-xs">
                <label className="text-label-md font-semibold text-admin-on-surface block">Official Support Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-admin-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={labProfile.email}
                    onChange={(e) => setLabProfile({ ...labProfile, email: e.target.value })}
                    className="w-full pl-10 pr-md py-sm bg-[#071927] border border-white/20 rounded-xl text-white focus:outline-none focus:border-clinical-teal focus:ring-2 focus:ring-clinical-teal/30"
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="text-label-md font-semibold text-admin-on-surface block">Helpline Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-admin-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={labProfile.phone}
                    onChange={(e) => setLabProfile({ ...labProfile, phone: e.target.value })}
                    className="w-full pl-10 pr-md py-sm bg-[#071927] border border-white/20 rounded-xl text-white focus:outline-none focus:border-clinical-teal focus:ring-2 focus:ring-clinical-teal/30"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-xs">
                <label className="text-label-md font-semibold text-admin-on-surface block">Physical Address & Location ID</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-admin-on-surface-variant absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    required
                    value={labProfile.address}
                    onChange={(e) => setLabProfile({ ...labProfile, address: e.target.value })}
                    className="w-full pl-10 pr-md py-sm bg-[#071927] border border-white/20 rounded-xl text-white focus:outline-none focus:border-clinical-teal focus:ring-2 focus:ring-clinical-teal/30 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-md border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-admin !py-sm !px-lg flex items-center gap-xs font-semibold shadow-admin-glow"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Facility Settings
              </button>
            </div>
          </motion.form>
        )}

        {/* TAB 2: DIAGNOSTIC AUTOMATION */}
        {activeTab === 'automation' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-xl max-w-4xl space-y-lg shadow-2xl"
          >
            <div className="border-b border-white/10 pb-md">
              <h3 className="text-headline-sm font-bold text-admin-on-surface">Automation & Realtime Dispatch Controls</h3>
              <p className="text-body-md text-admin-on-surface-variant">Control report publishing flows and diagnostic safety checks.</p>
            </div>

            <div className="space-y-md">
              {[
                { key: 'autoDispatch', label: 'Instant Realtime Patient Portal Dispatch', desc: 'Automatically sync approved reports to patient portal without delay.' },
                { key: 'flagOutOfRange', label: 'Highlight Biomarker Out-of-Range Flag Indicators (*)', desc: 'Automatically add flag markers on PDF reports when numeric values breach reference limits.' },
                { key: 'enableAuditLog', label: 'Automatic PostgreSQL Audit Trail Logging', desc: 'Record database triggers on patient_reports and bookings status changes.' },
                { key: 'emailNotifications', label: 'Email Notification on Report Dispatch', desc: 'Send digital copy alert to patient upon report sign-off.' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-md bg-white/5 border border-white/10 rounded-2xl">
                  <div className="space-y-xs pr-md">
                    <p className="font-bold text-admin-on-surface text-body-md">{label}</p>
                    <p className="text-label-sm text-admin-on-surface-variant">{desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSettings(prev => ({ ...prev, [key]: !prev[key] }))
                      showToast(`Setting "${label}" updated.`, 'info')
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 shrink-0 ${
                      settings[key] ? 'bg-clinical-teal' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      settings[key] ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 3: COMPLIANCE AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-xl space-y-md shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-white/10 pb-md">
              <div>
                <h3 className="text-headline-sm font-bold text-admin-on-surface">Compliance Audit Trail Stream</h3>
                <p className="text-body-md text-admin-on-surface-variant">Immutable system activity logs stored in public.audit_logs table.</p>
              </div>
              <button
                onClick={fetchAuditLogs}
                className="btn-outline !py-xs !px-md flex items-center gap-xs text-label-sm"
              >
                <Database className="w-3.5 h-3.5 text-clinical-teal" />
                Refresh Logs
              </button>
            </div>

            {loadingAudit ? (
              <div className="p-xl text-center text-admin-on-surface-variant flex items-center justify-center gap-sm">
                <Loader2 className="w-6 h-6 text-clinical-teal animate-spin" />
                <span>Fetching audit logs...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-xl text-center text-admin-on-surface-variant">
                <History className="w-10 h-10 text-white/20 mx-auto mb-sm" />
                <p className="font-bold text-admin-on-surface">No Audit Records Found</p>
                <p className="text-label-sm">Audit records will automatically record here when reports are generated or approved.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-label-md">
                  <thead>
                    <tr className="border-b border-white/10 text-admin-on-surface-variant uppercase text-[11px] font-mono tracking-wider">
                      <th className="py-sm px-md">Timestamp</th>
                      <th className="py-sm px-md">Action</th>
                      <th className="py-sm px-md">Performer</th>
                      <th className="py-sm px-md">Entity</th>
                      <th className="py-sm px-md">Details Snapshot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-sm px-md font-mono text-admin-on-surface-variant text-[12px] whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('en-IN')}
                        </td>
                        <td className="py-sm px-md font-bold text-emerald-400">
                          {log.action}
                        </td>
                        <td className="py-sm px-md text-admin-on-surface">
                          {log.user_email || 'Staff / System Trigger'}
                        </td>
                        <td className="py-sm px-md font-mono text-clinical-teal text-[12px]">
                          {log.entity_type}
                        </td>
                        <td className="py-sm px-md text-admin-on-surface-variant font-mono text-[11px] max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 4: CLEAR DATA & LOGS (DANGER ZONE) */}
        {activeTab === 'purge' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 rounded-3xl p-xl max-w-4xl space-y-lg">
            <div className="border-b border-red-500/20 pb-md flex items-center justify-between">
              <div>
                <h3 className="text-headline-sm font-bold text-red-400 flex items-center gap-xs">
                  <Database className="w-6 h-6 text-red-400" />
                  System Data Purge & Log Clear (Super Admin)
                </h3>
                <p className="text-body-md text-red-200/80">Permanently delete diagnostic test reports, audit trail entries, or worker break logs with security verification.</p>
              </div>
              <span className="px-md py-xs rounded-full bg-red-500/20 text-red-300 font-mono text-xs font-bold border border-red-500/40">
                🔒 Verification Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="p-lg bg-[#071927] border border-white/10 rounded-2xl space-y-md text-center flex flex-col justify-between">
                <div className="space-y-xs">
                  <h4 className="font-bold text-white text-body-lg">Clear All Test Reports & Bookings</h4>
                  <p className="text-xs text-admin-on-surface-variant">Deletes all patient test bookings and diagnostic report records.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setPurgeModal({ open: true, type: 'reports' }); setVerifyText('') }}
                  className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-xl text-xs border border-red-500/40 transition-all"
                >
                  Clear Test Reports
                </button>
              </div>

              <div className="p-lg bg-[#071927] border border-white/10 rounded-2xl space-y-md text-center flex flex-col justify-between">
                <div className="space-y-xs">
                  <h4 className="font-bold text-white text-body-lg">Clear Audit Trail & Break Logs</h4>
                  <p className="text-xs text-admin-on-surface-variant">Deletes compliance audit trail entries and staff shift break history.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setPurgeModal({ open: true, type: 'audit' }); setVerifyText('') }}
                  className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-xl text-xs border border-red-500/40 transition-all"
                >
                  Clear Audit Logs
                </button>
              </div>

              <div className="p-lg bg-red-500/20 border border-red-500/50 rounded-2xl space-y-md text-center flex flex-col justify-between">
                <div className="space-y-xs">
                  <h4 className="font-bold text-red-200 text-body-lg">Full System Purge (All Data)</h4>
                  <p className="text-xs text-red-300/80">Purges all test records, bookings, and audit logs simultaneously.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setPurgeModal({ open: true, type: 'all' }); setVerifyText('') }}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-lg transition-all"
                >
                  Purge All Data
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Verification Modal */}
        {purgeModal.open && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#091e30] border border-red-500/50 rounded-3xl p-xl max-w-md w-full space-y-md text-white shadow-2xl">
              <div className="flex items-center gap-sm text-red-400 font-bold text-headline-sm border-b border-white/10 pb-sm">
                <span className="material-symbols-outlined text-[24px]">warning</span>
                <span>Security Purge Verification</span>
              </div>
              <p className="text-body-sm text-admin-on-surface-variant">
                You are about to clear: <strong className="text-red-300 uppercase">{purgeModal.type === 'reports' ? 'All Test Reports & Bookings' : purgeModal.type === 'audit' ? 'All Audit Logs & Shift Logs' : 'EVERYTHING (All Test Reports & Audit Logs)'}</strong>.
              </p>
              <div className="p-md bg-red-500/10 border border-red-500/30 rounded-2xl space-y-xs">
                <label className="text-label-sm text-red-200 font-semibold block">
                  To confirm, type <span className="font-mono font-bold underline select-all">{purgeModal.type === 'reports' ? 'CLEAR REPORTS' : purgeModal.type === 'audit' ? 'CLEAR LOGS' : 'PURGE ALL DATA'}</span> below:
                </label>
                <input
                  type="text"
                  value={verifyText}
                  onChange={(e) => setVerifyText(e.target.value)}
                  placeholder={`Type "${purgeModal.type === 'reports' ? 'CLEAR REPORTS' : purgeModal.type === 'audit' ? 'CLEAR LOGS' : 'PURGE ALL DATA'}"`}
                  className="w-full px-md py-sm bg-[#051424] border border-red-500/40 rounded-xl text-white font-mono focus:outline-none focus:border-red-400"
                />
              </div>
              <div className="flex gap-sm pt-xs">
                <button
                  type="button"
                  onClick={() => setPurgeModal({ open: false, type: 'all' })}
                  className="flex-1 py-sm bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-label-md transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPurge}
                  disabled={purging || verifyText.trim().toUpperCase() !== (purgeModal.type === 'reports' ? 'CLEAR REPORTS' : purgeModal.type === 'audit' ? 'CLEAR LOGS' : 'PURGE ALL DATA')}
                  className="flex-1 py-sm bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-label-md shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {purging ? 'Purging...' : 'Confirm Purge'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.visible && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-md py-sm rounded-2xl shadow-clinical-xl flex items-center gap-sm font-semibold text-label-md">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{toast.message}</span>
          </div>
        )}

      </div>
    </PageTransition>
  )
}
