import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../supabaseClient'
import PageTransition from '../../components/common/PageTransition'

export default function Analytics() {
  const [bookings, setBookings] = useState([])
  const [reports, setReports] = useState([])
  const [staffCount, setStaffCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchLiveAnalytics = async () => {
    try {
      setLoading(true)
      const isPurged = localStorage.getItem('medilife_reports_purged') === 'true'
      const purgedBookingIds = JSON.parse(localStorage.getItem('medilife_purged_booking_ids') || '[]')
      const purgedReportIds = JSON.parse(localStorage.getItem('medilife_purged_report_ids') || '[]')

      if (isPurged) {
        setBookings([])
        setReports([])
      } else {
        // 1. Fetch active bookings (exclude purged & cancelled)
        const { data: bData } = await supabase
          .from('bookings')
          .select('*')
          .neq('status', 'purged')
          .neq('status', 'cancelled')
          .neq('status', 'canceled')

        const activeB = (bData || []).filter(b => b.status !== 'purged' && b.status !== 'cancelled' && b.status !== 'canceled' && !purgedBookingIds.includes(b.id))
        setBookings(activeB)

        // 2. Fetch completed patient reports
        const { data: rData } = await supabase
          .from('patient_reports')
          .select('*, test_catalog(test_name)')
          .neq('status', 'purged')
          .in('status', ['completed', 'complete', 'published'])

        const activeR = (rData || []).filter(r => r.status !== 'purged' && !purgedReportIds.includes(r.id))
        setReports(activeR)
      }

      // 3. Fetch registered user profiles count
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })

      setStaffCount(userCount || 0)
    } catch (err) {
      console.warn("Analytics live fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveAnalytics()

    const handleStorage = () => fetchLiveAnalytics()
    window.addEventListener('storage', handleStorage)

    const channel = supabase
      .channel('public:analytics_live_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchLiveAnalytics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_reports' }, () => fetchLiveAnalytics())
      .subscribe()

    return () => {
      window.removeEventListener('storage', handleStorage)
      supabase.removeChannel(channel)
    }
  }, [])

  // Calculate live average turnaround time
  const turnaroundTimeStr = useMemo(() => {
    if (!reports || reports.length === 0) return '0h'
    let totalMs = 0
    let count = 0
    reports.forEach(r => {
      if (r.created_at && r.appointment_id) {
        const matchingB = bookings.find(b => b.id === r.appointment_id)
        if (matchingB && matchingB.created_at) {
          const diff = new Date(r.created_at) - new Date(matchingB.created_at)
          if (diff > 0) {
            totalMs += diff
            count++
          }
        }
      }
    })
    if (count === 0) return '0h'
    const avgHours = (totalMs / (count * 1000 * 3600)).toFixed(1)
    return `${avgHours}h`
  }, [reports, bookings])

  // Aggregate live top performing tests breakdown
  const topTests = useMemo(() => {
    const testCounts = {}
    
    bookings.forEach(b => {
      const tests = Array.isArray(b.tests) ? b.tests : [b.test_name || 'General Checkup']
      tests.forEach(t => {
        if (!t) return
        testCounts[t] = (testCounts[t] || 0) + 1
      })
    })

    reports.forEach(r => {
      const name = r.test_catalog?.test_name || r.test_name || 'Diagnostic Evaluation'
      testCounts[name] = (testCounts[name] || 0) + 1
    })

    const entries = Object.entries(testCounts)
    if (entries.length === 0) return []

    const maxCount = Math.max(...entries.map(([, c]) => c)) || 1
    return entries
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / maxCount) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [bookings, reports])

  // Compute live revenue per day for July 2026 (days 1 to 31)
  const dailyRevenue = useMemo(() => {
    const days = Array(31).fill(0)
    bookings.forEach(b => {
      const dateObj = new Date(b.booking_date || b.created_at || Date.now())
      if (dateObj.getMonth() === 6) { // July (0-indexed 6)
        const dayNum = dateObj.getDate()
        if (dayNum >= 1 && dayNum <= 31) {
          const price = b.price ? parseFloat(b.price) : 500
          days[dayNum - 1] += price
        }
      }
    })
    return days
  }, [bookings])

  const maxRevenue = Math.max(...dailyRevenue, 1)

  const metrics = [
    { label: 'Total Lab Bookings', value: bookings.length, sub: 'Active live bookings', icon: 'payments', trend: 'up' },
    { label: 'Completed Reports', value: reports.length, sub: 'Validated lab charts', icon: 'biotech', trend: 'up' },
    { label: 'Registered System Users', value: staffCount, sub: 'Patients & clinical team', icon: 'groups', trend: 'up' },
    { label: 'Report Turnaround Time', value: turnaroundTimeStr, sub: 'Avg processing speed', icon: 'speed', trend: 'up' },
  ]

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl bg-[#051424] min-h-[90vh]">
        <div>
          <h1 className="text-headline-lg font-bold text-admin-primary">Business Analytics</h1>
          <p className="text-admin-on-surface-variant text-body-md">Real-time performance overview — July 2026</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          {metrics.map(({ label, value, sub, icon }, i) => (
            <motion.div 
              key={label} 
              initial={{ opacity: 0, y: 16 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.08 }}
              className="card-admin p-md sm:p-lg bg-white/5 border border-white/10"
            >
              <div className="flex justify-between items-start gap-xs mb-sm">
                <p className="text-admin-on-surface-variant text-label-sm sm:text-label-md font-bold leading-snug flex-1 min-w-0">{label}</p>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-clinical-teal/10 border border-clinical-teal/20 flex items-center justify-center text-clinical-teal shrink-0">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{icon}</span>
                </div>
              </div>
              <p className="text-display-lg-mobile font-bold text-admin-on-surface font-mono">{value}</p>
              <p className="text-label-sm mt-xs text-admin-on-surface-variant/80">
                {sub}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Live Revenue Chart */}
        <div className="card-admin p-lg bg-white/5 border border-white/10">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-bold text-admin-on-surface text-headline-sm">Live Revenue Trend (July 2026)</h3>
            <span className="text-label-sm font-mono text-clinical-teal font-bold bg-clinical-teal/10 px-md py-xs rounded-full border border-clinical-teal/20">
              Total: ₹{dailyRevenue.reduce((a, b) => a + b, 0).toLocaleString('en-IN')}
            </span>
          </div>

          {dailyRevenue.every(v => v === 0) ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-md border border-dashed border-white/10 rounded-2xl">
              <span className="material-symbols-outlined text-clinical-teal text-[36px] mb-xs">analytics</span>
              <p className="text-label-md font-bold text-admin-on-surface">No revenue transactions recorded for July 2026</p>
              <p className="text-label-sm text-admin-on-surface-variant max-w-sm mt-xs">
                Live daily revenue bars will populate automatically as new diagnostic test bookings are completed.
              </p>
            </div>
          ) : (
            <>
              <div className="h-48 flex items-end gap-1.5 pt-md">
                {dailyRevenue.map((val, i) => {
                  const pct = Math.max(8, Math.round((val / maxRevenue) * 100))
                  return (
                    <motion.div 
                      key={i} 
                      initial={{ scaleY: 0 }} 
                      animate={{ scaleY: 1 }} 
                      transition={{ delay: i * 0.015, duration: 0.3, origin: 'bottom' }}
                      style={{ height: `${pct}%`, originY: 1 }}
                      className={`flex-1 rounded-t-sm transition-all group relative ${val > 0 ? 'bg-clinical-teal' : 'bg-white/5'}`}
                      title={`Jul ${i + 1}: ₹${val}`}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-sm text-label-sm text-admin-on-surface-variant font-mono">
                <span>Jul 1</span><span>Jul 10</span><span>Jul 20</span><span>Jul 31</span>
              </div>
            </>
          )}
        </div>

        {/* Dynamic Live Top Performing Tests */}
        <div className="card-admin p-lg bg-white/5 border border-white/10">
          <h3 className="font-bold text-admin-on-surface mb-lg text-headline-sm">Top Performing Tests (Live Demand)</h3>
          
          {topTests.length === 0 ? (
            <div className="p-xl text-center border border-dashed border-white/10 rounded-2xl space-y-xs">
              <span className="material-symbols-outlined text-clinical-teal text-[36px] mb-xs">biotech</span>
              <p className="text-label-md font-bold text-admin-on-surface">No test metrics recorded</p>
              <p className="text-label-sm text-admin-on-surface-variant max-w-md mx-auto">
                Test frequency and diagnostic demand metrics will update live here as patients schedule evaluations.
              </p>
            </div>
          ) : (
            <div className="space-y-md">
              {topTests.map(({ name, count, pct }, i) => (
                <div key={name} className="space-y-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-label-md text-admin-on-surface font-bold">{name}</span>
                    <span className="font-mono font-bold text-clinical-teal text-label-sm">{count} bookings</span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${pct}%` }} 
                      transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-clinical-teal to-admin-primary-container rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
