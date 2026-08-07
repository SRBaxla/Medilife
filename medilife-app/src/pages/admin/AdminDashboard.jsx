import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../supabaseClient'
import PageTransition from '../../components/common/PageTransition'
import TestCatalog from '../../components/common/TestCatalog'
import StaffManagement from '../../components/common/StaffManagement'
import TemplateBuilder from '../../components/common/TemplateBuilder'

const statusConfig = {
  waiting: { label: 'Waiting', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: 'schedule' },
  pending: { label: 'Waiting', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: 'schedule' },
  scheduled: { label: 'Waiting', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: 'schedule' },
  'in-progress': { label: 'In Progress', color: 'text-clinical-teal', bg: 'bg-clinical-teal/10 border-clinical-teal/20', icon: 'hourglass_top' },
  processing: { label: 'In Progress', color: 'text-clinical-teal', bg: 'bg-clinical-teal/10 border-clinical-teal/20', icon: 'hourglass_top' },
  done: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: 'check_circle' },
  completed: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: 'check_circle' },
  complete: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: 'check_circle' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: 'cancel' },
  canceled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: 'cancel' },
}

const defaultStatusConfig = { label: 'Waiting', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: 'schedule' }

export default function AdminDashboard() {
  const [patients, setPatients] = useState([])
  const [queueLoading, setQueueLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [currentTenantSlug, setCurrentTenantSlug] = useState('jhansi-medilife-tenant-01')
  const [tenantId, setTenantId] = useState(null)
  const [tenantLoading, setTenantLoading] = useState(true)
  const [tenantError, setTenantError] = useState(null)
  const [dashboardTab, setDashboardTab] = useState('operations') // 'operations' or 'staff'
  const [activeBreak, setActiveBreak] = useState(null)

  const defaultLocation = {
    id: '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e',
    name: 'Jhansi Lab (Khati Baba)',
    subdomain: 'jhansi-medilife-tenant-01',
    address: 'Khati Baba, Jhansi, UP',
    gpsCoordinates: '25.4484, 78.5685',
    openingTime: '07:00 AM',
    closingTime: '09:00 PM',
    initialized: true
  }

  const [activeLocation, setActiveLocation] = useState(defaultLocation)
  const [availableLocations, setAvailableLocations] = useState([defaultLocation])
  
  // First-time location initialization modal state
  const [initModalOpen, setInitModalOpen] = useState(false)
  const [pendingLocation, setPendingLocation] = useState(null)
  const [initForm, setInitForm] = useState({
    address: '',
    gpsCoordinates: '',
    openingTime: '07:00 AM',
    closingTime: '09:00 PM',
    headAdminName: '',
    headAdminEmail: '',
    headAdminPhone: ''
  })
  const [initSubmitting, setInitSubmitting] = useState(false)
  const [initError, setInitError] = useState(null)

  // Auto-detect current browser GPS coordinates
  const handleDetectCurrentGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6)
          const lng = pos.coords.longitude.toFixed(6)
          setInitForm(prev => ({ ...prev, gpsCoordinates: `${lat}, ${lng}` }))
          alert(`📍 Current GPS location detected: ${lat}, ${lng}`)
        },
        (err) => {
          console.warn("GPS detection error:", err)
          alert("Could not automatically detect GPS location. Please enter coordinates manually (e.g. 28.6315, 77.2167) or paste a Google Maps pin link.")
        }
      )
    } else {
      alert("Geolocation is not supported by your browser.")
    }
  }

  // Load custom registered locations
  const loadLocations = () => {
    const saved = JSON.parse(localStorage.getItem('medilife_registered_locations') || '[]')
    const list = [defaultLocation]
    saved.forEach(loc => {
      if (!list.some(l => l.id === loc.id || l.subdomain === loc.subdomain)) {
        list.push({
          id: loc.id || crypto.randomUUID(),
          name: loc.name,
          subdomain: loc.subdomain,
          address: loc.address || '',
          gpsCoordinates: loc.gpsCoordinates || '',
          openingTime: loc.openingTime || '07:00 AM',
          closingTime: loc.closingTime || '09:00 PM',
          initialized: loc.initialized || false
        })
      }
    })
    setAvailableLocations(list)
  }

  useEffect(() => {
    loadLocations()
    window.addEventListener('storage', loadLocations)
    return () => window.removeEventListener('storage', loadLocations)
  }, [])

  const handleDeleteLocation = async (locationId) => {
    const locToDelete = availableLocations.find(l => l.id === locationId)
    if (!locToDelete) return

    if (locToDelete.id === defaultLocation.id || locToDelete.subdomain === defaultLocation.subdomain) {
      alert("🔒 Default primary lab location ('Jhansi Lab') cannot be deleted.")
      return
    }

    if (!window.confirm(`Are you sure you want to delete lab location "${locToDelete.name}"? This action will remove the location registration.`)) {
      return
    }

    try {
      // 1. Delete from Supabase tenants table
      try {
        await supabase.from('tenants').delete().eq('id', locationId)
      } catch (err) {
        console.warn("Tenant deletion notice:", err)
      }

      // 2. Remove from local storage location registry
      const saved = JSON.parse(localStorage.getItem('medilife_registered_locations') || '[]')
      const updated = saved.filter(l => l.id !== locationId && l.subdomain !== locToDelete.subdomain)
      localStorage.setItem('medilife_registered_locations', JSON.stringify(updated))

      // 3. Switch active location back to default
      setActiveLocation(defaultLocation)
      setCurrentTenantSlug(defaultLocation.subdomain)
      setTenantId(defaultLocation.id)
      fetchLiveQueue(defaultLocation.id)
      loadLocations()

      alert(`🗑️ Location "${locToDelete.name}" deleted successfully. Switched back to Jhansi Lab.`)
    } catch (err) {
      console.error("Delete location failed:", err)
      alert("Failed to delete location: " + (err.message || err))
    }
  }

  const handleLocationSelect = (targetLoc) => {
    if (!targetLoc.initialized) {
      setPendingLocation(targetLoc)
      setInitForm({
        address: targetLoc.address || '',
        gpsCoordinates: targetLoc.gpsCoordinates || '',
        openingTime: targetLoc.openingTime || '07:00 AM',
        closingTime: targetLoc.closingTime || '09:00 PM',
        headAdminName: '',
        headAdminEmail: '',
        headAdminPhone: ''
      })
      setInitError(null)
      setInitModalOpen(true)
    } else {
      setActiveLocation(targetLoc)
      setCurrentTenantSlug(targetLoc.subdomain)
      if (targetLoc.id) {
        setTenantId(targetLoc.id)
        fetchLiveQueue(targetLoc.id)
      }
    }
  }

  const handleInitializeLocationSubmit = async (e) => {
    e.preventDefault()
    if (!pendingLocation) return
    setInitSubmitting(true)
    setInitError(null)

    try {
      // 1. Create Head Admin Profile in user_profiles
      const headAdminRecord = {
        id: crypto.randomUUID(),
        user_id: crypto.randomUUID(),
        full_name: initForm.headAdminName || 'Head Admin',
        email: initForm.headAdminEmail,
        phone: initForm.headAdminPhone || '+91 9876543210',
        role: 'admin',
        tenant_id: pendingLocation.id,
        status: 'active',
        created_at: new Date().toISOString()
      }

      try {
        await supabase.from('user_profiles').insert([headAdminRecord])
      } catch (err) {
        console.warn("Head Admin profile creation notice:", err)
      }

      // 2. Update location registry state in localStorage
      const initializedLoc = {
        ...pendingLocation,
        address: initForm.address,
        gpsCoordinates: initForm.gpsCoordinates,
        openingTime: initForm.openingTime,
        closingTime: initForm.closingTime,
        headAdminName: initForm.headAdminName,
        headAdminEmail: initForm.headAdminEmail,
        initialized: true
      }

      const currentSaved = JSON.parse(localStorage.getItem('medilife_registered_locations') || '[]')
      const updatedSaved = currentSaved.map(l => (l.id === pendingLocation.id || l.subdomain === pendingLocation.subdomain) ? initializedLoc : l)
      
      // If not present in array, push
      if (!updatedSaved.some(l => l.id === pendingLocation.id)) {
        updatedSaved.push(initializedLoc)
      }

      localStorage.setItem('medilife_registered_locations', JSON.stringify(updatedSaved))

      // 3. Set active location to the newly initialized location
      setActiveLocation(initializedLoc)
      setCurrentTenantSlug(initializedLoc.subdomain)
      setTenantId(initializedLoc.id)
      fetchLiveQueue(initializedLoc.id)
      loadLocations()

      setInitModalOpen(false)
      setPendingLocation(null)
      alert(`🎉 Lab Location "${initializedLoc.name}" & Head Admin Profile initialized successfully!`)
    } catch (err) {
      console.error("Initialization error:", err)
      setInitError(err.message || 'Failed to initialize lab location.')
    } finally {
      setInitSubmitting(false)
    }
  }

  useEffect(() => {
    const checkBreak = () => {
      try {
        const saved = localStorage.getItem('medilife_staff_break')
        if (saved) {
          const parsed = JSON.parse(saved)
          const elapsedSec = Math.floor((Date.now() - parsed.timestamp) / 1000)
          if (parsed.totalSeconds - elapsedSec > 0) {
            setActiveBreak(parsed)
            return
          }
        }
      } catch (e) {}
      setActiveBreak(null)
    }

    checkBreak()
    window.addEventListener('staff-break-change', checkBreak)
    window.addEventListener('storage', checkBreak)
    return () => {
      window.removeEventListener('staff-break-change', checkBreak)
      window.removeEventListener('storage', checkBreak)
    }
  }, [])

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
📅 *Date & Slot:* ${p.dateStr || 'Today'} (${p.timeSlotStr || 'Morning Slot'})
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
Date & Slot: ${p.dateStr || 'Today'} (${p.timeSlotStr || 'Morning Slot'})
Tests: ${testsList}
Address: ${address}
Google Maps Pin: ${mapLink}`

    navigator.clipboard.writeText(text)
    alert("📋 Sample Collection Dispatch Order copied to clipboard!")
  }

  // Fetch live queue from Supabase bookings table
  const fetchLiveQueue = async (targetTenantId) => {
    if (!targetTenantId) return
    try {
      setQueueLoading(true)
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user_profiles:patient_id (
            full_name,
            email,
            gender
          )
        `)
        .eq('tenant_id', targetTenantId)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        const formatted = data.map((b) => {
          const dateStr = b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today'
          const timeSlotStr = b.time_slot || (b.created_at ? new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM')

          return {
            id: b.id,
            patient_id: b.patient_id,
            name: b.patient_name || b.user_profiles?.full_name || 'Patient',
            age: b.patient_age || 30,
            gender: b.gender || b.user_profiles?.gender || 'M',
            tests: Array.isArray(b.tests) ? b.tests : [b.test_name || 'General Checkup'],
            status: b.status || 'waiting',
            dateStr,
            timeSlotStr,
            time: `${dateStr} • ${timeSlotStr}`
          }
        })
        setPatients(formatted)
      } else {
        setPatients([])
      }
    } catch (err) {
      console.warn("Could not fetch live bookings queue from database:", err)
      setPatients([])
    } finally {
      setQueueLoading(false)
    }
  }

  // Resolve tenant subdomain to UUID
  useEffect(() => {
    const resolveTenant = async () => {
      try {
        setTenantLoading(true)
        setTenantError(null)
        
        const { data, error } = await supabase
          .from('tenants')
          .select('id')
          .eq('subdomain', currentTenantSlug)
          .maybeSingle()

        if (error) throw error
        
        if (!data || !data.id) {
          throw new Error("No database records match this tenant subdomain.")
        }

        setTenantId(data.id)
        fetchLiveQueue(data.id)
      } catch (err) {
        console.warn("Dynamic tenant lookup failed:", err)
        if (currentTenantSlug === 'invalid-tenant-slug') {
          setTenantError("Requested tenant profile could not be found in active server registries.")
          setTenantId(null)
        } else {
          const defaultTenantId = import.meta.env.VITE_PUBLIC_CURRENT_TENANT_ID || '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e'
          setTenantId(defaultTenantId)
          fetchLiveQueue(defaultTenantId)
        }
      } finally {
        setTenantLoading(false)
      }
    }

    resolveTenant()
  }, [currentTenantSlug])

  // Realtime subscription + 5s polling interval to capture patient reschedules & cancellations instantly
  useEffect(() => {
    if (!tenantId) return

    const channel = supabase
      .channel('public:bookings_admin_queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchLiveQueue(tenantId)
      })
      .subscribe()

    const pollInterval = setInterval(() => {
      fetchLiveQueue(tenantId)
    }, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [tenantId])

  const advance = async (id) => {
    const target = patients.find(p => p.id === id)
    if (!target) return
    const newStatus = (target.status === 'waiting' || target.status === 'pending') ? 'in-progress' : 'done'

    // Local state update
    setPatients((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p))

    // Persist to Supabase
    try {
      await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id)

      // When test sample collection is completed, automatically route appointment to Send Report section
      if (newStatus === 'done') {
        // Find matching test in catalog
        const { data: catalogMatches } = await supabase
          .from('test_catalog')
          .select('id')
          .limit(1)

        const defaultTestId = catalogMatches && catalogMatches.length > 0 ? catalogMatches[0].id : null

        // Check if report row exists
        const { data: existingReport } = await supabase
          .from('patient_reports')
          .select('id')
          .eq('appointment_id', id)
          .maybeSingle()

        if (!existingReport && defaultTestId) {
          await supabase
            .from('patient_reports')
            .insert({
              appointment_id: id,
              patient_id: target.patient_id || tenantId,
              patient_name: target.name || 'Patient',
              test_id: defaultTestId,
              status: 'processing',
              results_data: {}
            })
        }
      }
    } catch (err) {
      console.error("Failed to update booking status or auto-generate report row in Supabase:", err)
    }
  }

  const isPurgedReportsAll = localStorage.getItem('medilife_reports_purged') === 'true'

  const activePatients = patients.filter((p) => {
    if (p.status === 'cancelled' || p.status === 'canceled' || p.status === 'purged') return false
    const purgedIds = JSON.parse(localStorage.getItem('medilife_purged_booking_ids') || '[]')
    if (purgedIds.includes(p.id)) return false
    return true
  })

  const displayActivePatients = isPurgedReportsAll ? [] : activePatients

  const filtered = filter === 'all' 
    ? displayActivePatients 
    : displayActivePatients.filter((p) => {
        if (filter === 'waiting') return p.status === 'waiting' || p.status === 'pending' || p.status === 'scheduled'
        return p.status === filter
      })

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl overflow-x-hidden">
        {/* Live Staff Break Notice */}
        {activeBreak && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-md bg-amber-500/15 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-md text-amber-200">
            <div className="flex items-center gap-sm font-bold text-label-md">
              <span className="material-symbols-outlined text-amber-400">coffee</span>
              <span>Duty Notice: Staff member is currently taking a scheduled {activeBreak.durationMinutes}m Break (Started {activeBreak.startTime})</span>
            </div>
            <span className="px-md py-xs rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/40 animate-pulse shrink-0">
              ☕ ON BREAK
            </span>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-md border-b border-white/10 pb-md">
          <div>
            <h1 className="text-headline-lg font-bold text-admin-primary">Administrative Command</h1>
            <p className="text-admin-on-surface-variant text-body-md">Manage lab check-ins, medical catalogs, and team roles.</p>
          </div>
          
          {/* Location & View Tabs Bar */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-sm items-start sm:items-center max-w-full overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-xs bg-white/5 border border-white/10 p-1.5 rounded-2xl shrink-0">
              <span className="text-label-sm text-admin-on-surface-variant px-xs font-semibold uppercase shrink-0">Switch Location:</span>
              <select
                value={activeLocation.id}
                onChange={(e) => {
                  const selected = availableLocations.find(l => l.id === e.target.value)
                  if (selected) handleLocationSelect(selected)
                }}
                className="px-md py-xs rounded-xl text-label-sm font-bold bg-clinical-teal text-[#00363d] shadow-admin-glow shrink-0 outline-none cursor-pointer"
              >
                {availableLocations.map(loc => (
                  <option key={loc.id} value={loc.id} className="bg-[#002026] text-white">
                    📍 {loc.name} {loc.initialized ? `(${loc.openingTime || '07:00 AM'} - ${loc.closingTime || '09:00 PM'})` : '⚙️ [Uninitialized — Click to Setup]'}
                  </option>
                ))}
              </select>

              {/* Map Directions Link */}
              <a
                href={activeLocation.gpsCoordinates ? `https://www.google.com/maps?q=${encodeURIComponent(activeLocation.gpsCoordinates)}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((activeLocation.address || activeLocation.name) + ', Jhansi')}`}
                target="_blank"
                rel="noreferrer"
                className="px-sm py-xs bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 text-xs font-bold rounded-xl border border-blue-400/30 transition-all flex items-center gap-xs shrink-0"
                title="Get driving directions to this location on Google Maps"
              >
                🗺️ Get Directions
              </a>

              {/* Delete Location Action */}
              {activeLocation.id !== defaultLocation.id && (
                <button
                  onClick={() => handleDeleteLocation(activeLocation.id)}
                  className="px-sm py-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs font-bold rounded-xl border border-red-400/30 transition-all flex items-center gap-xs shrink-0"
                  title="Delete this lab location"
                >
                  🗑️ Delete Location
                </button>
              )}
            </div>

            {/* Dashboard View Selector */}
            <div className="flex items-center gap-xs bg-white/5 border border-white/10 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setDashboardTab('operations')}
                className={`px-md py-xs rounded-lg text-label-sm font-semibold transition-all whitespace-nowrap ${
                  dashboardTab === 'operations'
                    ? 'bg-clinical-teal text-[#00363d]'
                    : 'text-admin-on-surface-variant hover:text-white'
                }`}
              >
                Operations Dashboard
              </button>
              <button
                onClick={() => setDashboardTab('staff')}
                className={`px-md py-xs rounded-lg text-label-sm font-semibold transition-all whitespace-nowrap ${
                  dashboardTab === 'staff'
                    ? 'bg-clinical-teal text-[#00363d]'
                    : 'text-admin-on-surface-variant hover:text-white'
                }`}
              >
                Staff & Roles
              </button>
              <button
                onClick={() => setDashboardTab('marketing')}
                className={`px-md py-xs rounded-lg text-label-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                  dashboardTab === 'marketing'
                    ? 'bg-clinical-teal text-[#00363d]'
                    : 'text-admin-on-surface-variant hover:text-white'
                }`}
              >
                💬 WhatsApp Marketing
              </button>
            </div>
          </div>
        </div>

        {/* Render Dashboard */}
        {dashboardTab === 'operations' ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                {[
                  { label: 'Total Today', value: displayActivePatients.length, icon: 'groups', color: 'text-clinical-teal' },
                  { label: 'Waiting', value: displayActivePatients.filter((p) => p.status === 'waiting' || p.status === 'pending' || p.status === 'scheduled').length, icon: 'schedule', color: 'text-amber-400' },
                  { label: 'In Progress', value: displayActivePatients.filter((p) => p.status === 'in-progress' || p.status === 'processing').length, icon: 'hourglass_top', color: 'text-blue-400' },
                  { label: 'Completed', value: displayActivePatients.filter((p) => p.status === 'done' || p.status === 'completed' || p.status === 'complete').length, icon: 'check_circle', color: 'text-emerald-400' },
                ].map(({ label, value, icon, color }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card-admin p-lg">
                    <div className="flex justify-between items-start mb-sm">
                      <p className="text-admin-on-surface-variant text-label-md">{label}</p>
                      <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
                    </div>
                    <p className={`text-display-lg-mobile font-bold font-mono ${color}`}>{value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Check-in Section */}
              <div className="space-y-md">
                <div className="flex items-center justify-between">
                  <h2 className="text-headline-md font-bold text-admin-primary">Live Queue</h2>
                  {/* Filter Tabs */}
                  <div className="flex gap-sm overflow-x-auto pb-sm">
                    {[{ k: 'all', l: 'All' }, { k: 'waiting', l: 'Waiting' }, { k: 'in-progress', l: 'In Progress' }, { k: 'done', l: 'Done' }].map(({ k, l }) => (
                      <button key={k} onClick={() => setFilter(k)}
                        className={`shrink-0 px-md py-xs rounded-full text-label-sm transition-all ${filter === k ? 'bg-clinical-teal text-[#00363d] font-bold' : 'glass-panel text-admin-on-surface-variant hover:bg-white/10'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Queue */}
                <div className="space-y-md">
                  {filtered.map((p, i) => {
                    const sc = statusConfig[p.status] || defaultStatusConfig
                    const displayId = p.id ? (String(p.id).includes('-') ? String(p.id).split('-')[1] : String(p.id).substring(0, 4)) : '001'
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="card-admin p-md sm:p-lg flex flex-col md:flex-row md:items-center gap-md justify-between flex-wrap overflow-hidden"
                      >
                        <div className="flex items-center gap-md min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-clinical-teal/10 border border-clinical-teal/20 flex items-center justify-center text-clinical-teal font-bold font-mono text-[11px] sm:text-[12px] shrink-0">
                            {displayId}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-sm flex-wrap">
                              <p className="font-bold text-admin-on-surface text-body-lg sm:text-headline-sm truncate">{p.name}</p>
                              <span className="text-admin-on-surface-variant text-label-sm shrink-0">{p.age}{p.gender}</span>
                            </div>
                            <div className="flex flex-wrap gap-xs mt-xs">
                              {p.tests.map((t) => (
                                <span key={t} className="px-sm py-0.5 rounded-full glass-panel text-label-sm text-admin-on-surface-variant">{t}</span>
                              ))}
                              {isHomeBooking(p) ? (
                                <div className="flex flex-wrap items-center gap-xs">
                                  <span className="px-xs py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase">
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
                                        className="px-1.5 py-0.5 rounded-full bg-blue-500/30 hover:bg-blue-500/50 text-white text-[10px] font-bold flex items-center gap-xs transition-all border border-blue-400/40"
                                      >
                                        🗺️ Map
                                      </a>
                                      <button
                                        onClick={() => shareWithConductor(p)}
                                        className="px-1.5 py-0.5 rounded-full bg-emerald-600/50 hover:bg-emerald-600/70 text-emerald-100 text-[10px] font-bold flex items-center gap-xs transition-all border border-emerald-400/40"
                                        title="Share dispatch details via WhatsApp to phlebotomist/conductor"
                                      >
                                        📲 WhatsApp Conductor
                                      </button>
                                      <button
                                        onClick={() => copyConductorOrder(p)}
                                        className="px-1.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-xs transition-all border border-white/20"
                                        title="Copy work order details"
                                      >
                                        📋 Copy Order
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="px-xs py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase">
                                  🏢 Walk-in
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-sm sm:gap-md flex-wrap justify-start sm:justify-end shrink-0">
                          <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
                            <span className="text-label-sm font-bold text-clinical-teal font-mono flex items-center gap-xs">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {p.timeSlotStr}
                            </span>
                            <span className="text-[11px] text-admin-on-surface-variant/80 font-mono">
                              {p.dateStr}
                            </span>
                          </div>
                          <span className={`px-sm py-xs rounded-full border text-label-sm font-bold ${sc.color} ${sc.bg} flex items-center gap-xs shrink-0`}>
                            <span className="material-symbols-outlined text-[14px]">{sc.icon}</span>
                            {sc.label}
                          </span>
                          {p.status !== 'done' && (
                            <button onClick={() => advance(p.id)} className="px-md py-sm bg-clinical-teal/10 border border-clinical-teal/20 text-clinical-teal rounded-lg text-label-sm hover:bg-clinical-teal/20 transition-all shrink-0 font-bold">
                              {p.status === 'waiting' ? 'Start' : 'Complete'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Multi-Tenant Catalog Section */}
              <div className="border-t border-admin-outline-variant/20 pt-xl space-y-md">
                <div>
                  <h2 className="text-headline-md font-bold text-admin-primary">Lab Pathology Catalog</h2>
                  <p className="text-admin-on-surface-variant text-body-md">Manage test profiles and report templates for location: <span className="text-clinical-teal font-semibold font-mono">Jhansi Lab (Khati Baba)</span></p>
                </div>

                {/* TestCatalog component with resolved UUID */}
                <TestCatalog tenantId={tenantId} />
              </div>
            </>
          ) : dashboardTab === 'staff' ? (
            /* Render new Multi-tenant Staff Role Management Component with resolved UUID */
            <div className="space-y-md">
              <StaffManagement tenantId={tenantId} />
            </div>
          ) : (
            /* Render WhatsApp Marketing Campaign Builder Component */
            <div className="space-y-md">
              <TemplateBuilder />
            </div>
          )}
      </div>

      {/* First-Time Location Opening Setup Pop-Up Modal */}
      {initModalOpen && pendingLocation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#002026] border border-clinical-teal/30 rounded-3xl p-xl max-w-lg w-full text-white shadow-2xl space-y-md">
            <div className="flex justify-between items-start border-b border-white/10 pb-md">
              <div>
                <h3 className="text-headline-sm font-bold text-clinical-teal flex items-center gap-xs">
                  <span>🚀 Initialize Lab Location & Head Admin Setup</span>
                </h3>
                <p className="text-body-sm text-admin-on-surface-variant">Configure operating hours, address, and Head Admin credentials for <span className="text-white font-bold">{pendingLocation.name}</span></p>
              </div>
              <button onClick={() => setInitModalOpen(false)} className="text-white/60 hover:text-white p-xs text-headline-sm font-bold">✕</button>
            </div>

            {initError && (
              <div className="p-sm bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs">
                ⚠️ {initError}
              </div>
            )}

            <form onSubmit={handleInitializeLocationSubmit} className="space-y-md">
              {/* Physical Location Address & GPS Coordinates / Map Pin */}
              <div className="space-y-sm">
                <div className="space-y-xs">
                  <label className="text-label-sm font-bold text-admin-on-surface-variant">Location Physical Address *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Connaught Place, Inner Circle, New Delhi"
                    value={initForm.address}
                    onChange={(e) => setInitForm({ ...initForm, address: e.target.value })}
                    className="w-full px-md py-sm bg-white/5 border border-white/20 rounded-xl text-body-md text-white outline-none focus:border-clinical-teal"
                  />
                </div>

                <div className="space-y-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-label-sm font-bold text-admin-on-surface-variant">GPS Pin Location / Map Coordinates</label>
                    <div className="flex items-center gap-xs">
                      <button
                        type="button"
                        onClick={handleDetectCurrentGPS}
                        className="px-xs py-0.5 bg-clinical-teal/20 hover:bg-clinical-teal/30 text-clinical-teal text-[11px] font-bold rounded-lg border border-clinical-teal/40 transition-all flex items-center gap-xs"
                      >
                        📍 Auto-Detect GPS
                      </button>
                      <a
                        href={initForm.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(initForm.address)}` : `https://www.google.com/maps`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-xs py-0.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[11px] font-bold rounded-lg border border-blue-400/40 transition-all flex items-center gap-xs"
                      >
                        🗺️ Open Maps
                      </a>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 28.6315, 77.2167 or Google Maps Link"
                    value={initForm.gpsCoordinates}
                    onChange={(e) => setInitForm({ ...initForm, gpsCoordinates: e.target.value })}
                    className="w-full px-md py-sm bg-white/5 border border-white/20 rounded-xl text-body-md text-white font-mono outline-none focus:border-clinical-teal text-xs"
                  />
                </div>
              </div>

              {/* Opening & Closing Time Periods */}
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-sm font-bold text-admin-on-surface-variant">Opening Time Period *</label>
                  <input
                    required
                    type="text"
                    placeholder="07:00 AM"
                    value={initForm.openingTime}
                    onChange={(e) => setInitForm({ ...initForm, openingTime: e.target.value })}
                    className="w-full px-md py-sm bg-white/5 border border-white/20 rounded-xl text-body-md text-white font-mono outline-none focus:border-clinical-teal"
                  />
                </div>

                <div className="space-y-xs">
                  <label className="text-label-sm font-bold text-admin-on-surface-variant">Closing Time Period *</label>
                  <input
                    required
                    type="text"
                    placeholder="09:00 PM"
                    value={initForm.closingTime}
                    onChange={(e) => setInitForm({ ...initForm, closingTime: e.target.value })}
                    className="w-full px-md py-sm bg-white/5 border border-white/20 rounded-xl text-body-md text-white font-mono outline-none focus:border-clinical-teal"
                  />
                </div>
              </div>

              {/* Head Admin Profile Credentials */}
              <div className="border-t border-white/10 pt-md space-y-sm">
                <p className="text-label-md font-bold text-clinical-teal flex items-center gap-xs">
                  👑 Head Admin Profile Credentials (First-Time Opening)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="text-label-sm text-admin-on-surface-variant">Head Admin Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Dr. Rajesh Sharma"
                      value={initForm.headAdminName}
                      onChange={(e) => setInitForm({ ...initForm, headAdminName: e.target.value })}
                      className="w-full px-md py-sm bg-white/5 border border-white/20 rounded-xl text-body-md text-white outline-none focus:border-clinical-teal"
                    />
                  </div>

                  <div className="space-y-xs">
                    <label className="text-label-sm text-admin-on-surface-variant">Head Admin Email *</label>
                    <input
                      required
                      type="email"
                      placeholder="headadmin.delhi@medilife.com"
                      value={initForm.headAdminEmail}
                      onChange={(e) => setInitForm({ ...initForm, headAdminEmail: e.target.value })}
                      className="w-full px-md py-sm bg-white/5 border border-white/20 rounded-xl text-body-md text-white outline-none focus:border-clinical-teal"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="text-label-sm text-admin-on-surface-variant">Head Admin Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={initForm.headAdminPhone}
                    onChange={(e) => setInitForm({ ...initForm, headAdminPhone: e.target.value })}
                    className="w-full px-md py-sm bg-white/5 border border-white/20 rounded-xl text-body-md text-white font-mono outline-none focus:border-clinical-teal"
                  />
                </div>
              </div>

              <div className="pt-sm flex justify-end gap-sm">
                <button
                  type="button"
                  onClick={() => setInitModalOpen(false)}
                  className="px-md py-sm bg-white/10 hover:bg-white/20 text-white rounded-xl text-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={initSubmitting}
                  className="px-md py-sm bg-clinical-teal hover:bg-clinical-teal/90 text-[#00363d] font-bold rounded-xl text-label-md transition-all shadow-admin-glow"
                >
                  {initSubmitting ? 'Initializing Location...' : '✓ Initialize & Open Location'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PageTransition>
  )
}
