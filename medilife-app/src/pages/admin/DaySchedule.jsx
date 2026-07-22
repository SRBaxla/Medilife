import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../supabaseClient'
import PageTransition from '../../components/common/PageTransition'

export default function DaySchedule() {
  const [scheduledBookings, setScheduledBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error
        setScheduledBookings(data || [])
      } catch (err) {
        console.warn("Could not fetch day schedule:", err)
        setScheduledBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  const scheduledCount = scheduledBookings.length
  const homeVisits = scheduledBookings.filter(b => b.collection_type === 'home' || b.address).length
  const walkIns = Math.max(0, scheduledCount - homeVisits)

  const timeSlots = [
    { time: '08:00 AM', patients: scheduledBookings.slice(0, 2) },
    { time: '10:00 AM', patients: scheduledBookings.slice(2, 4) },
    { time: '12:00 PM', patients: scheduledBookings.slice(4, 6) },
    { time: '02:00 PM', patients: scheduledBookings.slice(6, 8) },
    { time: '04:00 PM', patients: scheduledBookings.slice(8) },
  ]

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <h1 className="text-headline-lg font-bold text-admin-primary">Day Schedule</h1>
            <p className="text-admin-on-surface-variant text-body-md">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-sm">
            <button className="glass-panel flex items-center gap-sm px-md py-sm rounded-xl text-admin-on-surface-variant text-label-md hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="glass-panel px-md py-sm rounded-xl text-admin-on-surface-variant text-label-md hover:bg-white/10 transition-all">Today</button>
            <button className="glass-panel flex items-center gap-sm px-md py-sm rounded-xl text-admin-on-surface-variant text-label-md hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-md">
          {[
            { label: 'Scheduled', value: scheduledCount, color: 'text-clinical-teal' },
            { label: 'Home Visits', value: homeVisits, color: 'text-amber-400' },
            { label: 'Walk-ins', value: walkIns, color: 'text-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card-admin p-lg text-center">
              <p className={`text-display-lg-mobile font-bold font-mono ${color}`}>{value}</p>
              <p className="text-admin-on-surface-variant text-label-md">{label}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="card-admin overflow-hidden">
          <div className="p-lg border-b border-white/10">
            <h3 className="font-bold text-admin-on-surface">Today's Timeline</h3>
          </div>
          <div className="divide-y divide-white/5">
            {timeSlots.map(({ time, patients }, i) => (
              <motion.div key={time} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex gap-md p-md items-start"
              >
                <div className="w-24 shrink-0 font-mono text-clinical-teal text-label-sm pt-1">{time}</div>
                <div className="flex-1 min-h-[40px] flex flex-wrap gap-sm">
                  {patients.length === 0 ? (
                    <div className="h-8 border-l-2 border-white/10 pl-sm flex items-center">
                      <span className="text-admin-on-surface-variant/30 text-label-sm">Free slot</span>
                    </div>
                  ) : (
                    patients.map((p) => (
                      <div key={p.id} className="px-sm py-xs rounded-lg border bg-clinical-teal/20 border-clinical-teal/30 text-clinical-teal text-label-sm font-bold">
                        {p.patient_name || 'Patient'} — {Array.isArray(p.tests) ? p.tests.join(', ') : p.test_name || 'General Test'}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
