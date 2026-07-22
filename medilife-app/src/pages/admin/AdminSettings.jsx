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
            { id: 'audit', label: 'Compliance Audit Trail', icon: History }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 sm:flex-initial px-md sm:px-lg py-xs rounded-xl text-label-sm sm:text-label-md font-bold transition-all flex items-center justify-center gap-xs ${
                activeTab === id
                  ? 'bg-clinical-teal text-[#00363d] shadow-admin-glow'
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
