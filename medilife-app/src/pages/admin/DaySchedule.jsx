import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../supabaseClient'
import PageTransition from '../../components/common/PageTransition'

export default function DaySchedule() {
  const [scheduledBookings, setScheduledBookings] = useState([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    fetchSchedule()

    // Realtime channel for instant status updates when reports are approved
    const channel = supabase
      .channel('public:bookings_dayschedule')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchSchedule()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const scheduledCount = scheduledBookings.length
  const completedCount = scheduledBookings.filter(b => b.status === 'done' || b.status === 'completed' || b.status === 'complete').length
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
            <button onClick={fetchSchedule} className="glass-panel flex items-center gap-sm px-md py-sm rounded-xl text-admin-on-surface-variant text-label-md hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-[18px]">sync</span>
              Sync
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-sm md:gap-md">
          {[
            { label: 'Total Scheduled', value: scheduledCount, color: 'text-clinical-teal' },
            { label: 'Completed (Done)', value: completedCount, color: 'text-emerald-400' },
            { label: 'Home Visits', value: homeVisits, color: 'text-amber-400' },
            { label: 'Walk-ins', value: walkIns, color: 'text-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card-admin p-md md:p-lg text-center">
              <p className={`text-headline-lg sm:text-display-lg-mobile font-bold font-mono ${color}`}>{value}</p>
              <p className="text-admin-on-surface-variant text-label-sm sm:text-label-md">{label}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="card-admin overflow-hidden">
          <div className="p-lg border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-admin-on-surface">Today's Timeline</h3>
            <span className="text-label-sm text-emerald-400 font-mono flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Green = Completed
            </span>
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
                    patients.map((p) => {
                      const isDone = p.status === 'done' || p.status === 'completed' || p.status === 'complete'

                      return (
                        <div 
                          key={p.id} 
                          className={`px-md py-xs rounded-xl border flex items-center gap-xs text-label-sm font-bold transition-all shadow-sm ${
                            isDone
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-emerald-950/20'
                              : 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {isDone ? 'check_circle' : 'schedule'}
                          </span>
                          <span>{p.patient_name || 'Patient'}</span>
                          <span className="opacity-60">•</span>
                          <span className="font-normal opacity-90">{Array.isArray(p.tests) ? p.tests.join(', ') : p.test_name || 'Diagnostic Screening'}</span>
                          {isDone && (
                            <span className="ml-xs text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-extrabold uppercase tracking-wider">
                              Done
                            </span>
                          )}
                        </div>
                      )
                    })
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
