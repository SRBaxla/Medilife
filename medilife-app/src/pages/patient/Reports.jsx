import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PDFDownloadLink } from '@react-pdf/renderer'
import PageTransition from '../../components/common/PageTransition'
import PathologyReportPDF from '../../components/admin/PathologyReportPDF'
import { supabase } from '../../supabaseClient'

const statusMap = { 
  Normal: 'badge-success', 
  Borderline: 'badge-warning', 
  Abnormal: 'badge-error',
  Final: 'badge-success',
  Pending: 'badge-warning'
}

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetchReports = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('patient_reports')
          .select('*, test_catalog(test_name, report_schema)')
          .eq('patient_id', user.id)

        if (error) throw error
        if (isMounted) setReports(data || [])
      } catch (err) {
        console.error("Error fetching reports:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchReports()

    // Realtime channel listener for instant report updates
    const channel = supabase
      .channel('patient_reports_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_reports' }, () => {
        if (isMounted) fetchReports()
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredReports = reports.filter((r) => {
    const name = r.test_catalog?.test_name || r.name || ''
    return name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        <div className="flex flex-col md:flex-row justify-between gap-md">
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">My Reports</h1>
            <p className="text-body-md text-on-surface-variant">All your diagnostic reports in one place.</p>
          </div>
          <div className="flex items-center gap-sm">
            <div className="input-field flex items-center gap-sm py-sm max-w-xs">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
              <input 
                className="bg-transparent outline-none text-body-md text-on-surface placeholder:text-on-surface-variant/50 w-full" 
                placeholder="Search reports…" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-xl text-center text-on-surface-variant">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="card p-xl text-center space-y-sm">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">description</span>
            <p className="font-bold text-on-surface">No diagnostic reports found</p>
            <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
              {searchTerm ? 'No reports matched your search term.' : 'Your lab reports will appear here automatically once processed by our pathology team.'}
            </p>
          </div>
        ) : (
          <div className="space-y-md">
            {filteredReports.map((r, i) => {
              const reportName = r.test_catalog?.test_name || r.name || 'Diagnostic Report'
              const dateStr = new Date(r.created_at || r.date || Date.now()).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })
              const status = r.status || 'Final'

              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card card-hover overflow-hidden">
                  <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="w-full p-lg flex items-center justify-between text-left">
                    <div className="flex items-center gap-md">
                      <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">description</span>
                      </div>
                      <div>
                        <p className="font-bold text-headline-sm text-on-surface">{reportName}</p>
                        <p className="text-label-sm text-on-surface-variant">{dateStr} • Ref: #{r.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-md">
                      <span className={statusMap[status] || 'badge-success'}>{status}</span>
                      <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${expanded === r.id ? 'rotate-180' : ''}`}>expand_more</span>
                    </div>
                  </button>

                  {expanded === r.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="px-lg pb-lg border-t border-outline-variant/30 pt-md"
                    >
                      <div className="flex gap-sm">
                        <PDFDownloadLink
                          document={<PathologyReportPDF report={r} formData={r.results_data || {}} />}
                          fileName={`Medilife_Report_${(r.patient_name || 'Patient').replace(/\s+/g, '_')}_${r.id.slice(0, 6)}.pdf`}
                          className="btn-primary text-[13px] py-xs inline-flex items-center gap-xs text-white"
                        >
                          {({ loading: pdfLoading }) => (
                            <>
                              <span className="material-symbols-outlined text-[16px]">download</span>
                              {pdfLoading ? 'Preparing PDF...' : 'Download Official PDF'}
                            </>
                          )}
                        </PDFDownloadLink>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
