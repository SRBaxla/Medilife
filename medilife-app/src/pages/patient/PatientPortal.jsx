import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../supabaseClient'
import PageTransition from '../../components/common/PageTransition'
import { 
  Calendar, 
  FileText, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  ChevronRight,
  Loader2
} from 'lucide-react'

export default function PatientPortal() {
  const navigate = useNavigate()
  
  // React Hooks State Management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [reports, setReports] = useState([])
  
  // Interactive UI States
  const [downloadingId, setDownloadingId] = useState(null)
  const [toasts, setToasts] = useState([])

  // Helper to add simulated toasts/notifications
  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  // Get active session and fetch user appointments on mount
  useEffect(() => {
    let isMounted = true

    const fetchPortalData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Verify authenticated session securely
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError
        
        if (!authUser) {
          if (isMounted) {
            setError('Unauthorized access. Please log in to view your portal.')
            setLoading(false)
          }
          return
        }

        if (isMounted) {
          setUser(authUser)
        }

        // 2. Fetch User Profile for personalizing dashboard greeting
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('full_name, role, tenant_id')
          .eq('user_id', authUser.id)
          .maybeSingle()

        if (!profileError && profileData) {
          if (isMounted) setProfile(profileData)
        }

        // 3. Query bookings table for user appointments
        // Backend RLS ensures patients can only query bookings where auth.uid() = patient_id
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('patient_id', authUser.id)
          .order('booking_date', { ascending: true })

        if (bookingsError) throw bookingsError

        if (isMounted) {
          setAppointments(bookingsData || [])
        }

        // 4. Query patient_reports table strictly enforcing RLS for authUser.id
        const { data: reportsData } = await supabase
          .from('patient_reports')
          .select('*, test_catalog(test_name)')
          .eq('patient_id', authUser.id)

        if (isMounted) {
          setReports(reportsData || [])
        }

      } catch (err) {
        console.error('Error fetching patient portal data:', err)
        if (isMounted) {
          setError(err.message || 'An unexpected error occurred while loading your clinical records.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchPortalData()

    return () => {
      isMounted = false
    }
  }, [])

  // Simulate PDF Document Download
  const handleDownloadReport = (report) => {
    if (downloadingId) return
    setDownloadingId(report.id)
    showToast(`Initializing secure download: ${report.name || 'Lab Report'}...`, 'info')

    setTimeout(() => {
      setDownloadingId(null)
      showToast(`Downloaded successfully: ${report.id}_Report.pdf`, 'success')
      
      // Clinical download action simulation
      const element = document.createElement("a")
      const file = new Blob([`PATHOLOGY REPORT: ${report.test_catalog?.test_name || report.name || 'Diagnostic Report'}\nPatient: ${profile?.full_name || 'Patient'}\nDate: ${report.created_at || report.date}\nStatus: ${report.status || 'Final'}\n\nClinical Disclaimer: This is a secure digital copy of your laboratory diagnostic report.`], {type: 'text/plain'})
      element.href = URL.createObjectURL(file)
      element.download = `${(report.test_catalog?.test_name || report.name || 'Report').replace(/\s+/g, '_')}_Report.pdf`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }, 2000)
  }

  // Format booking status badges
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return (
          <span className="badge badge-success bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Confirmed
          </span>
        )
      case 'pending':
        return (
          <span className="badge badge-warning bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            Pending
          </span>
        )
      case 'completed':
        return (
          <span className="badge bg-cyan-50 text-cyan-700 border border-cyan-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Completed
          </span>
        )
      default:
        return (
          <span className="badge bg-slate-100 text-slate-700 border border-slate-200">
            {status || 'Unknown'}
          </span>
        )
    }
  }

  // Format Date for clinical readability
  const formatClinicalDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Loading Skeleton State
  if (loading) {
    return (
      <PageTransition className="p-lg md:p-xl space-y-xl">
        <div className="max-w-6xl mx-auto space-y-lg">
          <div className="card p-xl flex justify-between items-center animate-pulse">
            <div className="space-y-sm">
              <div className="h-8 w-64 bg-outline-variant/30 rounded-lg"></div>
              <div className="h-4 w-48 bg-outline-variant/20 rounded-lg"></div>
            </div>
            <div className="h-10 w-24 bg-outline-variant/30 rounded-xl"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
            <div className="lg:col-span-2 space-y-md">
              <div className="h-8 w-48 bg-outline-variant/30 rounded-lg"></div>
              <div className="space-y-md">
                {[1, 2].map((i) => (
                  <div key={i} className="card p-lg h-28 animate-pulse bg-surface-container-low"></div>
                ))}
              </div>
            </div>
            <div className="space-y-md">
              <div className="h-8 w-48 bg-outline-variant/30 rounded-lg"></div>
              <div className="space-y-md">
                {[1, 2].map((i) => (
                  <div key={i} className="card p-lg h-24 animate-pulse bg-surface-container-low"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  // Unauthorized Error State
  if (error && !user) {
    return (
      <PageTransition className="p-lg md:p-xl flex items-center justify-center min-h-[70vh]">
        <div className="card p-xl max-w-md w-full text-center space-y-md">
          <div className="w-16 h-16 bg-error-container/20 text-error rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-xs">
            <h2 className="text-headline-md font-bold text-on-surface">Security Verification Failed</h2>
            <p className="text-body-md text-on-surface-variant">{error}</p>
          </div>
          <button 
            onClick={() => navigate('/login')} 
            className="btn-primary w-full justify-center"
          >
            Go to Login
          </button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="p-lg md:p-xl space-y-xl">
      
      {/* Toast Alert System Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
              className={`p-md rounded-xl shadow-clinical-lg flex items-center gap-sm border pointer-events-auto ${
                toast.type === 'success' 
                  ? 'bg-surface-container-lowest text-emerald-700 border-emerald-200' 
                  : toast.type === 'info'
                  ? 'bg-surface-container-lowest text-primary border-primary/20'
                  : 'bg-surface-container-lowest text-amber-700 border-amber-200'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />}
              {toast.type === 'info' && <Loader2 className="w-5 h-5 flex-shrink-0 text-primary animate-spin" />}
              {toast.type === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />}
              <span className="text-body-md font-medium text-on-surface">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-6xl mx-auto space-y-xl">
        
        {/* Welcome Banner */}
        <div className="card p-xl flex flex-col md:flex-row md:items-center justify-between gap-lg">
          <div className="space-y-xs">
            <h1 className="text-headline-lg font-bold text-on-surface">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Patient'} 👋
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Secure patient diagnostic panel • Jhansi Medilife Lab
            </p>
          </div>
          
          <div className="flex items-center gap-md">
            <div className="hidden sm:flex items-center gap-xs px-md py-xs rounded-xl bg-secondary-container text-primary text-label-sm font-medium">
              <Clock className="w-4 h-4 text-primary" />
              <span>Session: Active</span>
            </div>
            <Link 
              to="/booking" 
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Book Test
            </Link>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          
          {/* Section 1: Upcoming Appointments */}
          <div className="lg:col-span-2 space-y-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface">Upcoming Appointments</h2>
              </div>
              <span className="text-label-md text-on-surface-variant font-medium">
                {appointments.length} Total Booked
              </span>
            </div>

            {appointments.length === 0 ? (
              /* Clean Minimal Empty State for Appointments */
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-xl text-center space-y-md border-dashed"
              >
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center mx-auto text-primary">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-xs max-w-sm mx-auto">
                  <h3 className="text-headline-sm font-bold text-on-surface">No scheduled appointments</h3>
                  <p className="text-body-md text-on-surface-variant">
                    You don't have any appointments scheduled currently. Book a diagnostic evaluation to see details here.
                  </p>
                </div>
                <Link 
                  to="/booking"
                  className="btn-outline inline-flex items-center gap-xs mx-auto"
                >
                  Schedule your first appointment <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-md">
                {appointments.map((appointment, idx) => (
                  <motion.div
                    key={appointment.id || idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="card p-lg card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-md"
                  >
                    <div className="flex items-start gap-md">
                      <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary shrink-0">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="space-y-xs">
                        <h4 className="font-bold text-headline-sm text-on-surface">
                          Pathology Laboratory Screening
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-md gap-y-xs text-label-md text-on-surface-variant">
                          <span className="font-medium text-on-surface">
                            {formatClinicalDate(appointment.booking_date)}
                          </span>
                          <span className="hidden sm:inline text-outline-variant">•</span>
                          <span className="flex items-center gap-xs">
                            <Clock className="w-4 h-4 text-primary" />
                            Slot: {appointment.time_slot || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-md pt-sm sm:pt-0 border-t sm:border-t-0 border-outline-variant/30">
                      {getStatusBadge(appointment.status)}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Lab Reports */}
          <div className="space-y-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-headline-md font-bold text-on-surface">Past Lab Reports</h2>
              </div>
            </div>

            <div className="space-y-md">
              {reports.length === 0 ? (
                /* Empty state for reports */
                <div className="card p-xl text-center space-y-md border-dashed">
                  <FileText className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
                  <h4 className="font-bold text-headline-sm text-on-surface">No laboratory reports yet</h4>
                  <p className="text-body-md text-on-surface-variant max-w-xs mx-auto">
                    Once testing is finalized and validated by our medical team, your PDF reports will appear here for download.
                  </p>
                </div>
              ) : (
                reports.map((report, idx) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="card p-lg card-hover space-y-md"
                  >
                    <div className="flex items-start justify-between gap-sm">
                      <div className="space-y-xs">
                        <span className="text-label-sm text-primary font-bold uppercase tracking-wider">
                          Diagnostic
                        </span>
                        <h4 className="font-bold text-headline-sm text-on-surface">
                          {report.test_catalog?.test_name || report.name || 'Lab Report'}
                        </h4>
                        <p className="text-label-sm text-on-surface-variant">
                          {formatClinicalDate(report.created_at || report.date || new Date())}
                        </p>
                      </div>
                      <span className="badge badge-success bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {report.status || 'Final'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-sm border-t border-outline-variant/30">
                      <span className="text-label-sm font-mono text-on-surface-variant">
                        Ref: #{report.id?.slice(0, 8)}
                      </span>
                      
                      <button
                        onClick={() => handleDownloadReport(report)}
                        disabled={downloadingId !== null}
                        className="btn-outline py-xs text-[13px] flex items-center gap-xs"
                      >
                        {downloadingId === report.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span>PDF...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Clinical Note Block */}
        <div className="card p-lg flex items-start gap-md border border-primary/20 bg-secondary-container/20">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-xs">
            <h5 className="font-bold text-headline-sm text-on-surface">NABL Accreditation & ISO 15189 Standards Disclaimer</h5>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Results shown here reflect confirmed clinical screenings. Reports and medical evaluations are intended strictly for diagnostic consults with your prescribing healthcare practitioner. For questions regarding report metrics, please call patient support at Jhansi Medilife Pathology Lab.
            </p>
          </div>
        </div>

      </div>
    </PageTransition>
  )
}
