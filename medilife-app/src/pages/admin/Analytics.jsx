import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../supabaseClient'
import PageTransition from '../../components/common/PageTransition'

const topTests = [
  { name: 'CBC (Complete Blood Count)', count: 423, pct: 85 },
  { name: 'Lipid Profile (Cholesterol)', count: 312, pct: 63 },
  { name: 'TFT (Thyroid Profile)', count: 287, pct: 58 },
  { name: 'HbA1c (Glycated Hemoglobin)', count: 198, pct: 40 },
  { name: 'LFT (Liver Function)', count: 165, pct: 33 },
]

export default function Analytics() {
  const [totalBookingsCount, setTotalBookingsCount] = useState(0)
  const [completedReportsCount, setCompletedReportsCount] = useState(0)
  const [staffCount, setStaffCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLiveAnalytics = async () => {
      try {
        setLoading(true)

        // 1. Fetch total bookings count
        const { count: bookingsCount } = await supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })

        // 2. Fetch total completed reports count
        const { count: reportsCount } = await supabase
          .from('patient_reports')
          .select('id', { count: 'exact', head: true })

        // 3. Fetch active staff count
        const { count: userCount } = await supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })

        setTotalBookingsCount(bookingsCount || 0)
        setCompletedReportsCount(reportsCount || 0)
        setStaffCount(userCount || 0)
      } catch (err) {
        console.warn("Analytics fetch failed:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveAnalytics()
  }, [])

  const metrics = [
    { label: 'Total Lab Bookings', value: totalBookingsCount, change: '+12.4%', icon: 'payments', trend: 'up' },
    { label: 'Completed Reports', value: completedReportsCount, change: '+8.7%', icon: 'biotech', trend: 'up' },
    { label: 'Registered System Users', value: staffCount, change: '+5.2%', icon: 'groups', trend: 'up' },
    { label: 'Report Turnaround Time', value: '3.8h', change: '-0.4h', icon: 'speed', trend: 'up' },
  ]
  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-admin-primary">Business Analytics</h1>
          <p className="text-admin-on-surface-variant text-body-md">Performance overview — July 2026</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          {metrics.map(({ label, value, change, icon, trend }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card-admin p-md sm:p-lg"
            >
              <div className="flex justify-between items-start gap-xs mb-sm">
                <p className="text-admin-on-surface-variant text-label-sm sm:text-label-md font-bold leading-snug flex-1 min-w-0">{label}</p>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-clinical-teal/10 border border-clinical-teal/20 flex items-center justify-center text-clinical-teal shrink-0">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{icon}</span>
                </div>
              </div>
              <p className="text-display-lg-mobile font-bold text-admin-on-surface font-mono">{value}</p>
              <p className={`text-label-sm mt-xs ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend === 'up' ? '↑' : '↓'} {change} this month
              </p>
            </motion.div>
          ))}
        </div>

        {/* Revenue chart placeholder */}
        <div className="card-admin p-lg">
          <h3 className="font-bold text-admin-on-surface mb-lg">Revenue Trend (Jul 2026)</h3>
          <div className="h-48 flex items-end gap-2">
            {[40, 65, 45, 80, 70, 90, 60, 85, 75, 95, 55, 88, 72, 92, 68, 78, 88, 95, 82, 76, 90, 84, 96, 74, 88, 91, 85, 94, 78, 92].map((h, i) => (
              <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.02, duration: 0.4, origin: 'bottom' }}
                style={{ height: `${h}%`, originY: 1 }}
                className={`flex-1 rounded-t-sm ${i === 29 ? 'bg-clinical-teal' : 'bg-clinical-teal/30'}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-sm text-label-sm text-admin-on-surface-variant">
            <span>Jul 1</span><span>Jul 10</span><span>Jul 20</span><span>Jul 30</span>
          </div>
        </div>

        {/* Top Tests */}
        <div className="card-admin p-lg">
          <h3 className="font-bold text-admin-on-surface mb-lg">Top Performing Tests</h3>
          <div className="space-y-md">
            {topTests.map(({ name, count, pct }, i) => (
              <div key={name} className="space-y-xs">
                <div className="flex justify-between items-center">
                  <span className="text-label-md text-admin-on-surface">{name}</span>
                  <span className="font-mono font-bold text-clinical-teal text-label-sm">{count}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-clinical-teal to-admin-primary-container rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
