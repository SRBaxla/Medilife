import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../supabaseClient'
import PageTransition from '../../components/common/PageTransition'

const SLOTS_LIST = [
  '07:00 AM - 08:00 AM',
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '02:00 PM - 04:00 PM',
  '05:00 PM - 07:00 PM',
]

export default function DaySchedule() {
  const [allBookings, setAllBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState('schedule') // 'schedule' or 'audit'
  const [searchAudit, setSearchAudit] = useState('')

  const isHomeBooking = (p) => {
    if (p.collection_type?.toLowerCase().includes('home')) return true
    if (p.address && p.address.length > 2) return true
    const testsStr = Array.isArray(p.tests) ? p.tests.join(' ') : String(p.test_name || '')
    return testsStr.toLowerCase().includes('home visit') || testsStr.toLowerCase().includes('home collection')
  }

  const getBookingAddress = (p) => {
    if (p.address) return p.address
    const testsStr = Array.isArray(p.tests) ? p.tests.join(' ') : String(p.test_name || '')
    if (testsStr.includes('Home Visit:')) {
      const match = testsStr.match(/Home Visit:\s*(.*?)(?:GPS:|\||\))/i)
      if (match && match[1].trim()) return match[1].trim()
    }
    if (p.collection_type && p.collection_type.includes('[Address:')) {
      const match = p.collection_type.match(/\[Address:\s*(.*?)(?:\||\])/)
      return match ? match[1].trim() : 'Jhansi Home Address'
    }
    return isHomeBooking(p) ? 'Jhansi Home Pickup' : 'Lab Visit'
  }

  const getBookingGps = (p) => {
    if (p.gps_coordinates) return p.gps_coordinates
    const testsStr = Array.isArray(p.tests) ? p.tests.join(' ') : String(p.test_name || '')
    if (testsStr.includes('GPS:')) {
      const match = testsStr.match(/GPS:\s*([\d\.-]+,[\d\.-]+)/i)
      if (match) return match[1].trim()
    }
    if (p.collection_type && p.collection_type.includes('GPS:')) {
      const match = p.collection_type.match(/GPS:\s*([\d\.-]+,[\d\.-]+)/)
      return match ? match[1].trim() : null
    }
    return null
  }

  const shareWithConductor = (p) => {
    const address = getBookingAddress(p)
    const gps = getBookingGps(p)
    const mapLink = gps 
      ? `https://www.google.com/maps?q=${gps}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Jhansi')}`

    const testsList = Array.isArray(p.tests) ? p.tests.join(', ') : p.test_name || 'Diagnostic Screening'

    const text = `🧪 *MEDILIFE HOME SAMPLE COLLECTION DISPATCH*
----------------------------------------
👤 *Patient:* ${p.patient_name || 'Patient'}
📞 *Phone:* ${p.phone || '+91 8299487062'}
📅 *Date & Slot:* ${p.booking_date || selectedDate} (${p.time_slot || 'Morning Slot'})
🔬 *Tests:* ${testsList}
📍 *Address:* ${address}
🗺️ *Google Maps Pin:* ${mapLink}
----------------------------------------
⚠️ Please collect samples safely with proper cold chain vacutainer transport.`

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const copyConductorOrder = (p) => {
    const address = getBookingAddress(p)
    const gps = getBookingGps(p)
    const mapLink = gps 
      ? `https://www.google.com/maps?q=${gps}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Jhansi')}`

    const testsList = Array.isArray(p.tests) ? p.tests.join(', ') : p.test_name || 'Diagnostic Screening'

    const text = `🧪 MEDILIFE HOME SAMPLE COLLECTION DISPATCH
Patient: ${p.patient_name || 'Patient'}
Phone: ${p.phone || '+91 8299487062'}
Date & Slot: ${p.booking_date || selectedDate} (${p.time_slot || 'Morning Slot'})
Tests: ${testsList}
Address: ${address}
Google Maps Pin: ${mapLink}`

    navigator.clipboard.writeText(text)
    alert("📋 Sample Collection Dispatch Order copied to clipboard!")
  }

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllBookings(data || [])
    } catch (err) {
      console.warn("Could not fetch bookings database:", err)
      setAllBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()

    const handleStorage = () => fetchSchedule()
    window.addEventListener('storage', handleStorage)

    // Realtime channel + 5s polling timer for instant reschedule & cancellation updates
    const channel = supabase
      .channel('public:bookings_dayschedule_audit')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchSchedule()
      })
      .subscribe()

    const pollInterval = setInterval(() => {
      fetchSchedule()
    }, 5000)

    return () => {
      window.removeEventListener('storage', handleStorage)
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [])

  // Filter bookings strictly for the selected date
  const dayBookings = useMemo(() => {
    const purgedIds = JSON.parse(localStorage.getItem('medilife_purged_booking_ids') || '[]')
    return allBookings.filter((b) => {
      if (b.status === 'purged' || purgedIds.includes(b.id)) return false
      if (!b.booking_date) {
        if (!b.created_at) return false
        return b.created_at.startsWith(selectedDate)
      }
      return b.booking_date === selectedDate || b.booking_date.startsWith(selectedDate)
    })
  }, [allBookings, selectedDate])

  const scheduledCount = dayBookings.length
  const completedCount = dayBookings.filter(b => b.status === 'done' || b.status === 'completed' || b.status === 'complete').length
  const cancelledCount = dayBookings.filter(b => b.status === 'cancelled' || b.status === 'canceled').length
  const homeVisits = dayBookings.filter(b => b.collection_type === 'home' || b.address).length
  const walkIns = Math.max(0, scheduledCount - homeVisits)

  // Map bookings to time slots accurately
  const timeSlots = useMemo(() => {
    const slotMap = {}
    SLOTS_LIST.forEach((s) => { slotMap[s] = [] })
    slotMap['Other / Walk-in'] = []

    dayBookings.forEach((b) => {
      const matchedSlot = SLOTS_LIST.find((s) => b.time_slot && b.time_slot.trim() === s.trim())
      if (matchedSlot) {
        slotMap[matchedSlot].push(b)
      } else {
        slotMap['Other / Walk-in'].push(b)
      }
    })

    return Object.keys(slotMap).map((slotLabel) => ({
      time: slotLabel,
      patients: slotMap[slotLabel]
    }))
  }, [dayBookings])

  // Filter audit logs
  const auditLogs = useMemo(() => {
    if (!searchAudit) return allBookings
    const query = searchAudit.toLowerCase()
    return allBookings.filter((b) => {
      const pName = (b.patient_name || '').toLowerCase()
      const tNames = (Array.isArray(b.tests) ? b.tests.join(' ') : b.test_name || '').toLowerCase()
      const status = (b.status || '').toLowerCase()
      const date = (b.booking_date || b.created_at || '').toLowerCase()
      return pName.includes(query) || tNames.includes(query) || status.includes(query) || date.includes(query)
    })
  }, [allBookings, searchAudit])

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <h1 className="text-headline-lg font-bold text-admin-primary">Daily Schedule & Audit Registry</h1>
            <p className="text-admin-on-surface-variant text-body-md">
              Medipath Jhansi • Phlebotomist Dispatch & Test Audit Trail
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-sm">
            {/* View Mode Toggle */}
            <div className="glass-panel p-1 rounded-xl flex items-center gap-1 border border-white/10">
              <button
                onClick={() => setViewMode('schedule')}
                className={`px-md py-xs rounded-lg text-label-sm font-bold transition-all ${
                  viewMode === 'schedule'
                    ? 'bg-clinical-teal text-[#00363d] shadow-sm'
                    : 'text-admin-on-surface-variant hover:text-white'
                }`}
              >
                Day Timeline
              </button>
              <button
                onClick={() => setViewMode('audit')}
                className={`px-md py-xs rounded-lg text-label-sm font-bold transition-all ${
                  viewMode === 'audit'
                    ? 'bg-clinical-teal text-[#00363d] shadow-sm'
                    : 'text-admin-on-surface-variant hover:text-white'
                }`}
              >
                All Audit Logs ({allBookings.length})
              </button>
            </div>

            <button onClick={fetchSchedule} className="glass-panel flex items-center gap-xs px-md py-xs rounded-xl text-admin-on-surface-variant text-label-md hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-[18px]">sync</span>
              Sync
            </button>
          </div>
        </div>

        {viewMode === 'schedule' ? (
          <>
            {/* Date Selector Strip */}
            <div className="card-admin p-md flex flex-wrap items-center justify-between gap-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-clinical-teal text-[22px]">event</span>
                <span className="text-label-md text-admin-on-surface font-bold">Select Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-md py-xs bg-white/10 border border-white/20 rounded-xl text-white font-mono text-label-md focus:outline-none focus:border-clinical-teal"
                />
              </div>

              <div className="flex items-center gap-xs">
                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-md py-xs rounded-xl text-label-sm font-bold border transition-all ${
                    selectedDate === todayStr
                      ? 'bg-clinical-teal/20 border-clinical-teal text-clinical-teal'
                      : 'border-white/15 text-admin-on-surface-variant hover:bg-white/10'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const tom = new Date()
                    tom.setDate(tom.getDate() + 1)
                    setSelectedDate(tom.toISOString().split('T')[0])
                  }}
                  className="px-md py-xs rounded-xl text-label-sm font-bold border border-white/15 text-admin-on-surface-variant hover:bg-white/10 transition-all"
                >
                  Tomorrow
                </button>
              </div>
            </div>

            {/* Quick stats for selected date */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-sm md:gap-md">
              {[
                { label: 'Total Scheduled', value: scheduledCount, color: 'text-clinical-teal' },
                { label: 'Completed (Done)', value: completedCount, color: 'text-emerald-400' },
                { label: 'Home Visits', value: homeVisits, color: 'text-amber-400' },
                { label: 'Cancelled Slots', value: cancelledCount, color: 'text-red-400' },
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
                <h3 className="font-bold text-admin-on-surface">
                  Timeline for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </h3>
                <span className="text-label-sm text-emerald-400 font-mono flex items-center gap-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync Active
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {timeSlots.map(({ time, patients }, i) => (
                  <motion.div key={time} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex flex-col sm:flex-row gap-sm sm:gap-md p-md items-start"
                  >
                    <div className="w-44 shrink-0 font-mono text-clinical-teal text-label-sm font-bold pt-1 flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {time}
                    </div>
                    <div className="flex-1 min-h-[40px] flex flex-wrap gap-sm w-full">
                      {patients.length === 0 ? (
                        <div className="h-8 border-l-2 border-white/10 pl-sm flex items-center">
                          <span className="text-admin-on-surface-variant/30 text-label-sm">No bookings in this slot</span>
                        </div>
                      ) : (
                        patients.map((p) => {
                          const isDone = p.status === 'done' || p.status === 'completed' || p.status === 'complete'
                          const isCancelled = p.status === 'cancelled' || p.status === 'canceled'

                          return (
                            <div 
                              key={p.id} 
                              className={`px-md py-sm rounded-xl border flex flex-wrap items-center gap-xs text-label-md font-bold transition-all shadow-sm ${
                                isDone
                                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                  : isCancelled
                                  ? 'bg-red-500/20 border-red-500/50 text-red-300'
                                  : 'bg-amber-400/10 border-amber-400/30 text-amber-200'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isDone ? 'check_circle' : isCancelled ? 'cancel' : 'schedule'}
                              </span>
                              <span>{p.patient_name || 'Patient'}</span>
                              <span className="opacity-60">•</span>
                              <span className="font-normal opacity-90">{Array.isArray(p.tests) ? p.tests.join(', ') : p.test_name || 'Diagnostic Screening'}</span>
                              {isHomeBooking(p) ? (
                                <div className="flex flex-wrap items-center gap-xs ml-xs">
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 font-extrabold uppercase border border-blue-400/30 flex items-center gap-xs">
                                    🏠 Home Visit
                                  </span>
                                  {p.address && (
                                    <span className="text-[11px] text-blue-200/90 font-normal italic max-w-xs truncate" title={p.address}>
                                      📍 {p.address}
                                    </span>
                                  )}
                                  {(p.gps_coordinates || p.address) && (
                                    <div className="flex items-center gap-xs flex-wrap">
                                      <a
                                        href={p.gps_coordinates ? `https://www.google.com/maps?q=${p.gps_coordinates}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address + ', Jhansi')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-1.5 py-0.5 rounded bg-blue-500/40 hover:bg-blue-500/60 text-white text-[10px] font-bold flex items-center gap-xs transition-all border border-blue-400/40"
                                      >
                                        🗺️ Map Navigation
                                      </a>
                                      <button
                                        onClick={() => shareWithConductor(p)}
                                        className="px-1.5 py-0.5 rounded bg-emerald-600/50 hover:bg-emerald-600/70 text-emerald-100 text-[10px] font-bold flex items-center gap-xs transition-all border border-emerald-400/40"
                                        title="Share dispatch details via WhatsApp to phlebotomist/conductor"
                                      >
                                        📲 WhatsApp Conductor
                                      </button>
                                      <button
                                        onClick={() => copyConductorOrder(p)}
                                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-xs transition-all border border-white/20"
                                        title="Copy work order details"
                                      >
                                        📋 Copy Order
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="ml-xs text-[10px] px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 font-extrabold uppercase border border-purple-400/30 flex items-center gap-xs">
                                  🏢 Walk-in
                                </span>
                              )}
                              {isDone && (
                                <span className="ml-xs text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/40 text-emerald-200 font-extrabold uppercase">
                                  Done ✓
                                </span>
                              )}
                              {isCancelled && (
                                <span className="ml-xs text-[10px] px-1.5 py-0.5 rounded bg-red-500/40 text-red-200 font-extrabold uppercase">
                                  Cancelled
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
          </>
        ) : (
          /* Audit & Full Database Log Table */
          <div className="card-admin space-y-md p-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
              <div>
                <h3 className="font-bold text-headline-sm text-admin-on-surface">Diagnostic Audit Log & Database History</h3>
                <p className="text-body-sm text-admin-on-surface-variant">All patient test records stored in Supabase database for quality audits.</p>
              </div>
              <div className="relative max-w-xs w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant">search</span>
                <input
                  value={searchAudit}
                  onChange={(e) => setSearchAudit(e.target.value)}
                  placeholder="Search patient, test, date, status..."
                  className="w-full pl-9 pr-md py-xs bg-white/10 border border-white/20 rounded-xl text-white text-body-sm placeholder:text-white/40 focus:outline-none focus:border-clinical-teal"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm text-admin-on-surface-variant">
                <thead className="bg-white/5 text-admin-on-surface uppercase text-[11px] tracking-wider font-bold">
                  <tr>
                    <th className="p-md">Date & Time</th>
                    <th className="p-md">Patient Name</th>
                    <th className="p-md">Diagnostic Test(s)</th>
                    <th className="p-md">Collection Type</th>
                    <th className="p-md">Status</th>
                    <th className="p-md">Audit Ref ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-body-sm">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-xl text-center text-admin-on-surface-variant">
                        No audit records found matching query.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-md font-mono text-clinical-teal">
                          {b.booking_date || b.created_at?.split('T')[0] || 'N/A'}
                          <span className="block text-[11px] text-admin-on-surface-variant font-sans">{b.time_slot || 'N/A'}</span>
                        </td>
                        <td className="p-md font-bold text-white">
                          {b.patient_name || 'Patient'}
                          <span className="block text-[11px] font-normal text-admin-on-surface-variant">{b.phone || 'No phone'}</span>
                        </td>
                        <td className="p-md text-white">
                          {Array.isArray(b.tests) ? b.tests.join(', ') : b.test_name || 'General Pathology'}
                        </td>
                        <td className="p-md">
                          <span className={`px-sm py-xs rounded-full text-[11px] font-semibold ${b.collection_type === 'home' || b.address ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-500/20 text-slate-300'}`}>
                            {b.collection_type === 'home' || b.address ? 'Home Pickup' : 'Lab Visit'}
                          </span>
                        </td>
                        <td className="p-md">
                          <span className={`px-sm py-xs rounded-full text-[11px] font-bold uppercase ${
                            b.status === 'done' || b.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : b.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {b.status || 'waiting'}
                          </span>
                        </td>
                        <td className="p-md font-mono text-xs opacity-70">
                          #{b.id?.slice(0, 8)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
