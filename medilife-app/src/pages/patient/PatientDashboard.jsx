import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { supabase } from '../../supabaseClient'
import PageTransition from '../../components/common/PageTransition'
import PathologyReportPDF from '../../components/admin/PathologyReportPDF'

export default function PatientDashboard() {
  const [userProfile, setUserProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) setUserProfile(profile)

      // Fetch appointments
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

      setAppointments(bookings || [])

      // Fetch reports
      const { data: reportsData } = await supabase
        .from('patient_reports')
        .select('*, test_catalog(test_name, report_schema)')
        .eq('patient_id', user.id)

      setReports(reportsData || [])
    } catch (err) {
      console.warn("Could not load patient dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Realtime channel subscription
    const channel = supabase
      .channel('patient_dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchDashboardData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_reports' }, () => {
        fetchDashboardData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const patientName = userProfile?.full_name || 'Patient'

  return (
    <PageTransition>
      <div className="p-lg md:p-xl lg:p-xxl space-y-xl">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">Welcome back, {patientName}. 👋</h1>
            <p className="text-body-lg text-on-surface-variant">Here's an overview of your pathological records and scheduled evaluations.</p>
          </div>
          <div className="flex items-center gap-sm bg-surface-container-lowest border border-outline-variant/30 rounded-full px-md py-sm shadow-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
            <span className="text-label-md text-on-surface-variant">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {[
            { icon: 'biotech', label: 'Total Diagnostic Tests', value: reports.length + appointments.length, sub: 'Lifetime evaluation records', color: 'bg-secondary-container text-primary' },
            { icon: 'assignment', label: 'Laboratory Reports', value: reports.length, sub: `${reports.filter(r => r.status === 'complete').length} finalized reports`, color: 'bg-emerald-50 text-emerald-700' },
            { icon: 'calendar_today', label: 'Upcoming Appointments', value: appointments.length, sub: `${appointments.filter(a => a.status === 'waiting' || a.status === 'pending').length} active bookings`, color: 'bg-amber-50 text-amber-700' },
          ].map(({ icon, label, value, sub, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card card-hover p-lg flex flex-col relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center mb-md z-10`}>
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
              <h3 className="text-label-md text-on-surface-variant z-10">{label}</h3>
              <div className="flex items-baseline gap-sm z-10">
                <span className="text-display-lg-mobile font-bold text-on-surface">{value}</span>
              </div>
              <span className="text-label-sm text-on-surface-variant z-10">{sub}</span>
            </motion.div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="card p-lg">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-bold text-headline-md text-on-surface">Recent Reports</h2>
            <Link to="/portal" className="text-primary text-label-md flex items-center gap-xs hover:underline">
              View Portal <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="space-y-md">
            {reports.length === 0 ? (
              <p className="text-body-md text-on-surface-variant italic">No finalized laboratory reports available.</p>
            ) : (
              reports.map((report, i) => (
                <motion.div key={report.id || i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between p-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">description</span>
                    </div>
                    <div>
                      <p className="font-bold text-label-md text-on-surface">{report.test_catalog?.test_name || 'Diagnostic Evaluation'}</p>
                      <p className="text-label-sm text-on-surface-variant">{report.booking_date || new Date().toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="badge badge-success bg-emerald-50 text-emerald-700 border border-emerald-200">{report.status || 'Final'}</span>
                    <PDFDownloadLink
                      document={<PathologyReportPDF report={report} formData={report.results_data || {}} />}
                      fileName={`Medilife_Report_${(report.patient_name || 'Patient').replace(/\s+/g, '_')}_${(report.id || 'ref').slice(0, 6)}.pdf`}
                      className="p-sm text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-secondary-container flex items-center justify-center"
                      title="Download Official PDF"
                    >
                      {({ loading: pdfLoading }) => (
                        <span className={`material-symbols-outlined text-[18px] ${pdfLoading ? 'animate-spin text-primary' : ''}`}>
                          {pdfLoading ? 'sync' : 'download'}
                        </span>
                      )}
                    </PDFDownloadLink>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming */}
        <div className="card p-lg">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-bold text-headline-md text-on-surface">Scheduled Appointments</h2>
            <Link to="/booking" className="btn-primary text-[13px] py-xs">
              Book New <span className="material-symbols-outlined text-[16px]">add</span>
            </Link>
          </div>
          <div className="space-y-md">
            {appointments.length === 0 ? (
              <p className="text-body-md text-on-surface-variant italic">No scheduled appointments. Book a new test to see it listed here.</p>
            ) : (
              appointments.map((app, i) => (
                <div key={app.id || i} className="flex items-center justify-between p-md rounded-xl bg-surface-container-low">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                      <span className="material-symbols-outlined text-[18px]">event</span>
                    </div>
                    <div>
                      <p className="font-bold text-label-md text-on-surface">{Array.isArray(app.tests) ? app.tests.join(', ') : app.test_name || 'Pathology Screening'}</p>
                      <p className="text-label-sm text-on-surface-variant">{app.booking_date || 'Today'} at {app.time_slot || '09:00 AM'}</p>
                    </div>
                  </div>
                  <span className="px-md py-xs rounded-full text-label-sm font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    {app.status || 'Scheduled'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
