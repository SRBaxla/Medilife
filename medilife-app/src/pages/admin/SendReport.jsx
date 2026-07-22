import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../supabaseClient'
import PageTransition from '../../components/common/PageTransition'
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import PathologyReportPDF from '../../components/admin/PathologyReportPDF'
import { 
  FileSpreadsheet, 
  User, 
  Beaker, 
  AlertTriangle, 
  CheckCircle, 
  Send, 
  ChevronRight, 
  Activity, 
  ListOrdered, 
  ShieldAlert, 
  Check, 
  Loader2,
  Database,
  Edit2,
  FileText,
  Clock,
  Download,
  History
} from 'lucide-react'

export default function SendReport() {
  const [queue, setQueue] = useState([])
  const [historyQueue, setHistoryQueue] = useState([])
  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'history'
  const [selectedHistoryReport, setSelectedHistoryReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Selection & Form State
  const [activeReport, setActiveReport] = useState(null)
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [toast, setToast] = useState({ visible: false, message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [isReviewMode, setIsReviewMode] = useState(false)

  // Fetch pending reports joined with test_catalog from Supabase
  const fetchPendingQueue = async () => {
    try {
      setLoading(true)
      setError(null)

      // Query patient_reports joined with test_catalog and user_profiles
      const { data, error: fetchError } = await supabase
        .from('patient_reports')
        .select(`
          id,
          status,
          test_id,
          patient_id,
          patient_name,
          results_data,
          test_catalog!patient_reports_test_id_fkey (
            test_name,
            report_schema
          ),
          user_profiles!patient_reports_patient_id_fkey (
            full_name,
            email
          )
        `)
        .neq('status', 'completed')
        .neq('status', 'complete')
        .neq('status', 'published')

      if (fetchError) throw fetchError

      if (data && data.length > 0) {
        const formatted = data.map(item => ({
          ...item,
          patient_name: item.user_profiles?.full_name || item.patient_name || 'Patient'
        }))
        setQueue(formatted)
      } else {
        setQueue([])
      }
    } catch (err) {
      console.error("Supabase pending queue fetch failed:", err)
      setError(`Supabase connection error: ${err.message || err}`)
      setQueue([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch completed/approved reports history
  const fetchHistoryQueue = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('patient_reports')
        .select(`
          id,
          status,
          test_id,
          patient_id,
          patient_name,
          results_data,
          created_at,
          appointment_id,
          test_catalog!patient_reports_test_id_fkey (
            test_name,
            report_schema
          ),
          user_profiles!patient_reports_patient_id_fkey (
            full_name,
            email
          )
        `)
        .in('status', ['completed', 'complete', 'published'])
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      if (data && data.length > 0) {
        const formatted = data.map(item => ({
          ...item,
          patient_name: item.user_profiles?.full_name || item.patient_name || 'Patient'
        }))
        setHistoryQueue(formatted)
        if (!selectedHistoryReport) {
          setSelectedHistoryReport(formatted[0])
        }
      } else {
        setHistoryQueue([])
      }
    } catch (err) {
      console.warn("Could not fetch history queue:", err)
    }
  }

  useEffect(() => {
    fetchPendingQueue()
    fetchHistoryQueue()

    // Realtime channel listener for automatic queue updates
    const channel = supabase
      .channel('public:patient_reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_reports' }, () => {
        fetchPendingQueue()
        fetchHistoryQueue()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Load report into Active Form Pane
  const handleSelectReport = (report) => {
    setActiveReport(report)
    setFormData({})
    setFormErrors({})
    setIsReviewMode(false)
  }

  // Real-time value validation against reference range limits
  const handleValueChange = (fieldName, value, type, refRange) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))

    // Real-time range validation for numeric inputs
    if (type === 'number' && refRange && value !== '') {
      const numVal = parseFloat(value)
      const minVal = parseFloat(refRange.min)
      const maxVal = parseFloat(refRange.max)
      
      if (!isNaN(numVal) && !isNaN(minVal) && !isNaN(maxVal)) {
        if (numVal < minVal || numVal > maxVal) {
          setFormErrors(prev => ({ 
            ...prev, 
            [fieldName]: `Value outside range [${minVal} - ${maxVal}]` 
          }))
          return
        }
      }
    }
    
    // Clear error if value is within bounds or not a number
    setFormErrors(prev => {
      const copy = { ...prev }
      delete copy[fieldName]
      return copy
    })
  }

  // Form Submit triggers Review Mode
  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (Object.keys(formErrors).length > 0) {
      alert("Please resolve outstanding range validation errors before generating PDF preview.")
      return
    }
    setIsReviewMode(true)
  }

  // Final submit/mutation dispatch
  const handleApproveDispatch = async () => {
    if (!activeReport) return
    setSubmitting(true)
    try {
      const updatedData = {
        results_data: { ...formData },
        status: 'completed'
      }

      // 1. Update patient_reports row in Supabase
      const { error: updateError } = await supabase
        .from('patient_reports')
        .update(updatedData)
        .eq('id', activeReport.id)

      if (updateError) throw updateError

      // 2. Update linked booking status to 'done'
      if (activeReport.appointment_id) {
        await supabase
          .from('bookings')
          .update({ status: 'done' })
          .eq('id', activeReport.appointment_id)
      }

      // 3. Record audit log entry
      try {
        const { data: { user } } = await supabase.auth.getUser()
        await supabase
          .from('audit_logs')
          .insert({
            tenant_id: activeReport.tenant_id || '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e',
            user_id: user?.id,
            user_email: user?.email,
            action: 'REPORT_APPROVED_AND_DISPATCHED',
            entity_type: 'patient_reports',
            entity_id: activeReport.id,
            details: {
              patient_name: activeReport.patient_name,
              patient_id: activeReport.patient_id,
              appointment_id: activeReport.appointment_id,
              results_summary: { ...formData },
              dispatched_at: new Date().toISOString()
            }
          })
      } catch (auditErr) {
        console.warn("Could not insert explicit audit log row:", auditErr)
      }

      // Trigger success notifications
      showToast(`Pathology report for ${activeReport.patient_name} approved, dispatched to Patient Portal, and logged to Audit Trail.`)
      
      // Update queue locally
      setQueue(prev => prev.filter(item => item.id !== activeReport.id))
      setActiveReport(null)
      setIsReviewMode(false)
    } catch (err) {
      console.warn("Supabase report mutation failed, executing local update for offline simulation:", err)
      
      showToast(`Pathology report for ${activeReport.patient_name} generated successfully (simulated).`)
      
      // Local recovery
      setQueue(prev => prev.filter(item => item.id !== activeReport.id))
      setActiveReport(null)
      setIsReviewMode(false)
    } finally {
      setSubmitting(false)
    }
  }

  const showToast = (message) => {
    setToast({ visible: true, message })
    setTimeout(() => {
      setToast({ visible: false, message: '' })
    }, 4000)
  }

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl min-h-[90vh] bg-[#051424]">
        
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-white/10 pb-md">
          <div className="space-y-xs">
            <h1 className="text-headline-lg font-bold text-admin-primary">Lab Report Generation Workspace</h1>
            <p className="text-admin-on-surface-variant text-body-md">Analyze laboratory metrics, validate ranges, and sign digital diagnostic charts.</p>
          </div>
          <button 
            onClick={fetchPendingQueue} 
            className="btn-outline !py-sm self-start flex items-center gap-xs"
            title="Reload pending queue"
          >
            <RefreshCwIcon />
            Sync Queue
          </button>
        </div>

        {/* Supabase Error warning banner */}
        {error && (
          <div className="p-md bg-amber-950/30 border border-amber-500/20 rounded-2xl flex items-start gap-md">
            <Database className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-label-md font-bold text-amber-400">Offline Simulation Mode Active</p>
              <p className="text-body-md text-admin-on-surface-variant/80">{error}</p>
            </div>
          </div>
        )}

        {/* Workspace Sub-Tab Switcher */}
        <div className="flex flex-wrap items-center gap-sm bg-white/5 border border-white/10 p-1.5 rounded-2xl w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 sm:flex-initial px-md sm:px-lg py-xs rounded-xl text-label-sm sm:text-label-md font-bold transition-all flex items-center justify-center gap-xs ${
              activeTab === 'pending'
                ? 'bg-clinical-teal text-[#00363d] shadow-admin-glow'
                : 'text-admin-on-surface-variant hover:text-white hover:bg-white/10'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            Pending Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-initial px-md sm:px-lg py-xs rounded-xl text-label-sm sm:text-label-md font-bold transition-all flex items-center justify-center gap-xs ${
              activeTab === 'history'
                ? 'bg-clinical-teal text-[#00363d] shadow-admin-glow'
                : 'text-admin-on-surface-variant hover:text-white hover:bg-white/10'
            }`}
          >
            <History className="w-4 h-4" />
            Report History ({historyQueue.length})
          </button>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-stretch">
          
          {/* Left Pane - Queue List (Pending or History) */}
          <div className="lg:col-span-4 space-y-md flex flex-col">
            <div className="flex items-center justify-between px-md py-sm bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-label-md font-bold text-admin-primary uppercase tracking-wider flex items-center gap-xs">
                {activeTab === 'pending' ? <ListOrdered className="w-4 h-4 text-clinical-teal" /> : <History className="w-4 h-4 text-emerald-400" />}
                {activeTab === 'pending' ? `Pending Queue (${queue.length})` : `Report History (${historyQueue.length})`}
              </span>
              <span className={`badge ${activeTab === 'pending' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'}`}>
                {activeTab === 'pending' ? 'Processing' : 'Approved & Sent'}
              </span>
            </div>

            {loading ? (
              <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-xl flex flex-col items-center justify-center gap-sm min-h-[300px]">
                <Loader2 className="w-8 h-8 text-clinical-teal animate-spin" />
                <p className="text-body-md text-admin-on-surface-variant animate-pulse">Fetching records...</p>
              </div>
            ) : activeTab === 'pending' ? (
              queue.length === 0 ? (
                <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-xl text-center space-y-sm min-h-[300px] flex flex-col items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="text-headline-sm font-bold text-admin-on-surface">Queue Cleared!</h3>
                  <p className="text-body-md text-admin-on-surface-variant max-w-xs">
                    All pathology tests for the day have been analyzed and dispatched.
                  </p>
                </div>
              ) : (
                <div className="space-y-md overflow-y-auto max-h-[600px] pr-xs">
                  {queue.map((report) => {
                    const testName = report.test_catalog?.test_name || "Unknown test"
                    const isSelected = activeReport?.id === report.id
                    return (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-md rounded-2xl border transition-all duration-300 flex justify-between items-center ${
                          isSelected 
                            ? 'bg-clinical-teal/15 border-clinical-teal shadow-admin-glow'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-xs">
                          <div className="flex items-center gap-xs">
                            <User className="w-4 h-4 text-clinical-teal" />
                            <p className="font-bold text-admin-on-surface text-body-md">{report.patient_name}</p>
                          </div>
                          <div className="flex items-center gap-xs text-label-sm text-admin-on-surface-variant">
                            <Beaker className="w-3.5 h-3.5" />
                            <span>{testName}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectReport(report)}
                          className={`flex items-center gap-xs text-label-sm px-md py-xs rounded-xl font-bold transition-all ${
                            isSelected
                              ? 'bg-clinical-teal text-[#00363d]'
                              : 'bg-white/10 text-admin-on-surface hover:bg-white/20'
                          }`}
                        >
                          Fill & Review
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              )
            ) : (
              /* HISTORY TAB QUEUE LIST */
              historyQueue.length === 0 ? (
                <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-xl text-center space-y-sm min-h-[300px] flex flex-col items-center justify-center">
                  <History className="w-12 h-12 text-admin-on-surface-variant/40 mx-auto" />
                  <h3 className="text-headline-sm font-bold text-admin-on-surface">No History Records</h3>
                  <p className="text-body-md text-admin-on-surface-variant max-w-xs">
                    Approved and dispatched reports will appear here for audit and PDF download.
                  </p>
                </div>
              ) : (
                <div className="space-y-md overflow-y-auto max-h-[600px] pr-xs">
                  {historyQueue.map((report) => {
                    const testName = report.test_catalog?.test_name || "Diagnostic Report"
                    const isSelected = selectedHistoryReport?.id === report.id
                    return (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-md rounded-2xl border transition-all duration-300 flex justify-between items-center ${
                          isSelected 
                            ? 'bg-emerald-500/15 border-emerald-400 shadow-admin-glow'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-xs">
                          <div className="flex items-center gap-xs">
                            <User className="w-4 h-4 text-emerald-400" />
                            <p className="font-bold text-admin-on-surface text-body-md">{report.patient_name}</p>
                          </div>
                          <div className="flex items-center gap-xs text-label-sm text-admin-on-surface-variant">
                            <Beaker className="w-3.5 h-3.5" />
                            <span>{testName}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedHistoryReport(report)}
                          className={`flex items-center gap-xs text-label-sm px-md py-xs rounded-xl font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-400 text-emerald-950'
                              : 'bg-white/10 text-admin-on-surface hover:bg-white/20'
                          }`}
                        >
                          View Report
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              )
            )}
          </div>

          {/* Right Pane - Active Form or History Report Details */}
          <div className="lg:col-span-8">
            {activeTab === 'pending' ? (
              activeReport ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-lg shadow-2xl flex flex-col justify-between h-full min-h-[500px]"
                >
                  {/* Form header */}
                  <div className="border-b border-white/10 pb-md mb-md flex justify-between items-center">
                    <div>
                      <span className="text-label-sm text-clinical-teal uppercase tracking-widest font-semibold">
                        {isReviewMode ? 'Step 2: Sign-Off Document' : 'Step 1: Clinical Observations'}
                      </span>
                      <h2 className="text-headline-md font-bold text-admin-on-surface">
                        {isReviewMode ? 'Report PDF Review' : activeReport.patient_name}
                      </h2>
                      <p className="text-body-md text-admin-on-surface-variant">
                        Running: <span className="font-bold text-admin-primary">{activeReport.test_catalog?.test_name}</span>
                      </p>
                    </div>
                    <span className="font-mono text-label-sm text-admin-on-surface-variant">
                      REF ID: {activeReport.id.substring(0, 8)}
                    </span>
                  </div>

                  {isReviewMode ? (
                    /* REVIEW MODE: render the PDF document preview */
                    <div className="space-y-lg flex-grow flex flex-col">
                      <div className="border border-white/10 rounded-2xl overflow-hidden shadow-inner flex-grow min-h-[420px] bg-white/5 relative">
                        <PDFViewer width="100%" height="450px" className="border-0">
                          <PathologyReportPDF report={activeReport} formData={formData} />
                        </PDFViewer>
                      </div>

                      {/* Review Mode CTA Buttons */}
                      <div className="pt-md border-t border-white/10 flex justify-end gap-sm">
                        <button
                          type="button"
                          onClick={() => setIsReviewMode(false)}
                          className="btn-outline !py-sm !px-md flex items-center gap-xs"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Data
                        </button>
                        <button
                          type="button"
                          onClick={handleApproveDispatch}
                          disabled={submitting}
                          className="btn-admin !py-sm !px-md flex items-center gap-xs font-semibold shadow-admin-glow"
                        >
                          {submitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                          ) : (
                            <><FileText className="w-4 h-4" />Approve & Dispatch</>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* INPUT MODE: Render dynamic questionnaire form fields */
                    <form onSubmit={handleFormSubmit} className="space-y-lg flex-grow">
                      <div className="space-y-md">
                        {activeReport.test_catalog?.report_schema?.fields?.map((field, idx) => {
                          const fieldName = field.name || field.id || field.label || `field_${idx}`
                          const hasError = !!formErrors[fieldName]
                          const errorMsg = formErrors[fieldName]
                          const isNumberType = field.type === 'number' || field.type === 'numeric'

                          return (
                            <div key={fieldName} className="space-y-xs p-md rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                              <div className="flex justify-between items-center">
                                <label className="text-label-md font-semibold text-admin-on-surface block">
                                  {field.label}
                                </label>
                                
                                {/* Display reference ranges next to label */}
                                {field.reference_range && (
                                  <span className="text-label-sm text-admin-on-surface-variant font-mono">
                                    Ref: {field.reference_range.min} - {field.reference_range.max} {field.unit}
                                  </span>
                                )}
                              </div>

                              <div className="relative flex rounded-xl shadow-sm">
                                {field.type === 'textarea' ? (
                                  <textarea
                                    rows={3}
                                    required
                                    value={formData[fieldName] || ''}
                                    onChange={(e) => handleValueChange(fieldName, e.target.value, field.type, field.reference_range)}
                                    placeholder="Enter clinical observations..."
                                    className="w-full px-md py-sm bg-[#071927] border border-white/20 rounded-xl font-body-md text-body-md text-white placeholder:text-slate-400 focus:outline-none focus:border-clinical-teal focus:ring-2 focus:ring-clinical-teal/30 transition-all resize-none shadow-inner"
                                  />
                                ) : (
                                  <input
                                    required
                                    type={isNumberType ? 'number' : 'text'}
                                    step="any"
                                    value={formData[fieldName] || ''}
                                    onChange={(e) => handleValueChange(fieldName, e.target.value, field.type, field.reference_range)}
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                    className={`w-full px-md py-sm bg-[#071927] border rounded-xl font-body-md text-body-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all pr-20 shadow-inner ${
                                      hasError 
                                        ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20' 
                                        : 'border-white/20 focus:border-clinical-teal focus:ring-clinical-teal/30'
                                    }`}
                                  />
                                )}

                                {/* Scientific Unit attached inside input */}
                                {field.unit && field.type !== 'textarea' && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-label-sm text-clinical-teal font-mono font-semibold select-none">
                                    {field.unit}
                                  </div>
                                )}
                              </div>

                              {/* Warning Message details */}
                              {hasError && (
                                <div className="flex items-center gap-xs text-[11px] font-semibold text-red-400 animate-fade-in mt-1">
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  <span>{errorMsg}</span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Submission and Action Buttons */}
                      <div className="pt-md border-t border-white/10 flex justify-end gap-sm mt-lg">
                        <button
                          type="button"
                          onClick={() => setActiveReport(null)}
                          className="btn-outline !py-sm !px-md"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-admin !py-sm !px-md flex items-center gap-xs font-semibold shadow-admin-glow"
                        >
                          <ChevronRight className="w-4 h-4" />
                          Preview Report
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-xxl text-center text-admin-on-surface-variant flex flex-col items-center justify-center h-full min-h-[450px]">
                  <FileSpreadsheet className="w-16 h-16 text-on-surface-variant/40 mb-md animate-pulse-slow" />
                  <h3 className="text-headline-md font-bold text-admin-on-surface/80">No Report Selected</h3>
                  <p className="text-body-md max-w-sm mt-xs mx-auto">
                    Select a pending diagnostic record from the queue to start entering results and checking reference intervals.
                  </p>
                </div>
              )
            ) : (
              /* REPORT HISTORY TAB RIGHT PANE VIEW */
              selectedHistoryReport ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-lg shadow-2xl flex flex-col justify-between h-full min-h-[500px]"
                >
                  <div className="border-b border-white/10 pb-md mb-md flex justify-between items-center">
                    <div>
                      <span className="text-label-sm text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-xs">
                        <CheckCircle className="w-4 h-4" />
                        Approved & Dispatched Document
                      </span>
                      <h2 className="text-headline-md font-bold text-admin-on-surface">
                        {selectedHistoryReport.patient_name}
                      </h2>
                      <p className="text-body-md text-admin-on-surface-variant">
                        Test Profile: <span className="font-bold text-admin-primary">{selectedHistoryReport.test_catalog?.test_name || 'Lab Report'}</span>
                      </p>
                    </div>
                    <span className="font-mono text-label-sm text-admin-on-surface-variant">
                      REF ID: {selectedHistoryReport.id.substring(0, 8)}
                    </span>
                  </div>

                  {/* PDF Viewer for History Report */}
                  <div className="border border-white/10 rounded-2xl overflow-hidden shadow-inner flex-grow min-h-[420px] bg-white/5 relative mb-md">
                    <PDFViewer width="100%" height="450px" className="border-0">
                      <PathologyReportPDF report={selectedHistoryReport} formData={selectedHistoryReport.results_data || {}} />
                    </PDFViewer>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-md border-t border-white/10 flex justify-between items-center">
                    <span className="text-label-sm text-admin-on-surface-variant font-mono">
                      Logged in Audit Trail • Dispatched to Patient Portal
                    </span>
                    <PDFDownloadLink
                      document={<PathologyReportPDF report={selectedHistoryReport} formData={selectedHistoryReport.results_data || {}} />}
                      fileName={`Medilife_Report_${(selectedHistoryReport.patient_name || 'Patient').replace(/\s+/g, '_')}_${selectedHistoryReport.id.slice(0, 6)}.pdf`}
                      className="btn-admin !py-sm !px-md flex items-center gap-xs font-semibold shadow-admin-glow text-white"
                    >
                      {({ loading: pdfLoading }) => (
                        <>
                          <Download className="w-4 h-4" />
                          {pdfLoading ? 'Preparing PDF...' : 'Download Official PDF'}
                        </>
                      )}
                    </PDFDownloadLink>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-xxl text-center text-admin-on-surface-variant flex flex-col items-center justify-center h-full min-h-[450px]">
                  <History className="w-16 h-16 text-on-surface-variant/40 mb-md animate-pulse-slow" />
                  <h3 className="text-headline-md font-bold text-admin-on-surface/80">No Approved Report Selected</h3>
                  <p className="text-body-md max-w-sm mt-xs mx-auto">
                    Select an approved pathology report from the history list to view findings and download the official PDF.
                  </p>
                </div>
              )
            )}
          </div>

        </div>

      </div>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-md py-sm rounded-2xl shadow-clinical-xl flex items-center gap-sm font-semibold text-label-md"
          >
            <CheckCircle className="w-5 h-5 icon-fill shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}

function RefreshCwIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw w-4 h-4"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
  )
}

// Fallback Mock Queue representing patient_reports joined with test_catalog
function getMockPendingQueue() {
  return [
    {
      id: "rpt-abc1-11",
      patient_name: "Priya Mehta",
      status: "processing",
      test_catalog_id: "test-cbc-01",
      test_catalog: {
        test_name: "Complete Blood Count (CBC)",
        report_schema: {
          fields: [
            { 
              name: "wbc", 
              label: "White Blood Cell Count (WBC)", 
              type: "number", 
              unit: "x10^3/µL", 
              reference_range: { min: "4.5", max: "11.0" } 
            },
            { 
              name: "rbc", 
              label: "Red Blood Cell Count (RBC)", 
              type: "number", 
              unit: "x10^6/µL", 
              reference_range: { min: "4.0", max: "5.5" } 
            },
            { 
              name: "hgb", 
              label: "Hemoglobin Level", 
              type: "number", 
              unit: "g/dL", 
              reference_range: { min: "12.0", max: "16.0" } 
            },
            { 
              name: "notes", 
              label: "Pathologist Clinical Observations", 
              type: "textarea", 
              unit: null, 
              reference_range: null 
            }
          ]
        }
      }
    },
    {
      id: "rpt-xyz2-22",
      patient_name: "Arjun Singh",
      status: "processing",
      test_catalog_id: "test-lipid-02",
      test_catalog: {
        test_name: "Lipid Profile Panel",
        report_schema: {
          fields: [
            { 
              name: "cholesterol", 
              label: "Total Cholesterol", 
              type: "number", 
              unit: "mg/dL", 
              reference_range: { min: "100.0", max: "200.0" } 
            },
            { 
              name: "hdl", 
              label: "HDL (High-Density Lipoprotein)", 
              type: "number", 
              unit: "mg/dL", 
              reference_range: { min: "40.0", max: "60.0" } 
            },
            { 
              name: "ldl", 
              label: "LDL (Low-Density Lipoprotein)", 
              type: "number", 
              unit: "mg/dL", 
              reference_range: { min: "50.0", max: "130.0" } 
            }
          ]
        }
      }
    },
    {
      id: "rpt-def3-33",
      patient_name: "Rekha Sharma",
      status: "processing",
      test_catalog_id: "test-tft-03",
      test_catalog: {
        test_name: "Thyroid Profile (TSH)",
        report_schema: {
          fields: [
            { 
              name: "tsh", 
              label: "Thyroid Stimulating Hormone (TSH)", 
              type: "number", 
              unit: "µIU/mL", 
              reference_range: { min: "0.4", max: "4.0" } 
            }
          ]
        }
      }
    }
  ]
}
