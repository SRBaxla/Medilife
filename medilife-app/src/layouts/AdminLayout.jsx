import { useState, useEffect } from 'react'
import { NavLink, Outlet, Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import ScrollToTop from '../components/common/ScrollToTop'

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { tenantSlug } = useParams()
  const activeSlug = tenantSlug || 'jhansi-medilife-tenant-01'

  // Staff Break System State (Persisted in localStorage across reloads)
  const [breakStatus, setBreakStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('medilife_staff_break')
      if (saved) {
        const parsed = JSON.parse(saved)
        const elapsedSec = Math.floor((Date.now() - parsed.timestamp) / 1000)
        const remaining = parsed.totalSeconds - elapsedSec
        if (remaining > 0) {
          return { ...parsed, secondsLeft: remaining }
        }
      }
    } catch (e) {}
    return null
  })

  useEffect(() => {
    let interval = null
    if (breakStatus && breakStatus.secondsLeft > 0) {
      interval = setInterval(() => {
        setBreakStatus((prev) => {
          if (!prev || prev.secondsLeft <= 1) {
            clearInterval(interval)
            localStorage.removeItem('medilife_staff_break')
            window.dispatchEvent(new Event('staff-break-change'))
            alert("⏰ Break Time Completed! Welcome back to shift duty.")
            return null
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 }
        })
      }, 1000)
    } else if (breakStatus && breakStatus.secondsLeft <= 0) {
      localStorage.removeItem('medilife_staff_break')
      window.dispatchEvent(new Event('staff-break-change'))
      setBreakStatus(null)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [breakStatus?.secondsLeft])

  const startBreak = (minutes) => {
    const seconds = minutes * 60
    const breakData = {
      durationMinutes: minutes,
      totalSeconds: seconds,
      secondsLeft: seconds,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    }
    
    setBreakStatus(breakData)
    try {
      localStorage.setItem('medilife_staff_break', JSON.stringify(breakData))
      window.dispatchEvent(new Event('staff-break-change'))
    } catch (e) {}
  }

  const endBreakEarly = () => {
    localStorage.removeItem('medilife_staff_break')
    setBreakStatus(null)
    window.dispatchEvent(new Event('staff-break-change'))
  }

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const adminNavItems = [
    { to: `/${activeSlug}/admin/dashboard`, icon: 'how_to_reg', label: 'Check-in', end: true },
    { to: `/${activeSlug}/admin/reports`, icon: 'send', label: 'Send Reports' },
    { to: `/${activeSlug}/admin/analytics`, icon: 'insights', label: 'Business Analytics' },
    { to: `/${activeSlug}/admin/schedule`, icon: 'calendar_today', label: 'Day Schedule' },
  ]

  const bottomNavItems = [
    { to: `/${activeSlug}/admin/dashboard`, icon: 'how_to_reg', label: 'Check-in' },
    { to: `/${activeSlug}/admin/reports`, icon: 'send', label: 'Reports' },
    { to: `/${activeSlug}/admin/analytics`, icon: 'insights', label: 'Analytics' },
    { to: `/${activeSlug}/admin/schedule`, icon: 'calendar_today', label: 'Schedule' },
    { to: `/${activeSlug}/admin/settings`, icon: 'settings', label: 'Settings' },
  ]

  return (
    <div className="admin-portal min-h-screen flex bg-admin-bg text-admin-on-background font-sans">
      <ScrollToTop />

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 p-md pt-xxl border-r border-admin-outline-variant/20 bg-admin-surface overflow-y-auto">
        {/* Logo */}
        <div className="flex flex-col items-center mb-xl">
          <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center mb-md text-clinical-teal teal-glow">
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>science</span>
          </div>
          <h1 className="font-bold text-[16px] text-admin-primary text-center">Pathology Portal</h1>
          <p className="text-label-sm text-admin-on-surface-variant uppercase mt-1">Admin Dashboard</p>
        </div>

        {/* Nav Links */}
        <ul className="flex flex-col gap-2 flex-grow">
          {adminNavItems.map(({ to, icon, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 select-none font-label-md text-label-md ${
                    isActive
                      ? 'bg-admin-secondary-container text-admin-on-secondary-container font-bold'
                      : 'text-admin-on-surface-variant hover:bg-white/5 hover:translate-x-1'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined ${isActive ? 'icon-fill' : ''}`}>{icon}</span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Staff Well-being & Worker Break System */}
        <div className="mt-auto mb-4 px-2 space-y-2">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-bold text-admin-on-surface-variant uppercase tracking-wider">Staff Well-being</h3>
            {breakStatus && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>

          {breakStatus ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-center">
              <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                <span>☕ On Break</span>
                <span className="font-mono text-base font-extrabold text-amber-200">{formatSeconds(breakStatus.secondsLeft)}</span>
              </div>
              <p className="text-[11px] text-amber-400/80">Started at {breakStatus.startTime}</p>
              <button
                onClick={endBreakEarly}
                className="w-full py-1 mt-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition-all border border-amber-500/40"
              >
                End Break Early
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => startBreak(15)}
                className="flex-1 glass-panel text-admin-on-surface-variant text-label-sm py-2 rounded-lg hover:glass-panel-teal hover:text-clinical-teal transition-all font-bold"
              >
                15m Break
              </button>
              <button
                onClick={() => startBreak(30)}
                className="flex-1 glass-panel text-admin-on-surface-variant text-label-sm py-2 rounded-lg hover:glass-panel-teal hover:text-clinical-teal transition-all font-bold"
              >
                30m Break
              </button>
            </div>
          )}
        </div>

        {/* Bottom */}
        <ul className="flex flex-col gap-2 border-t border-white/10 pt-4">
          <li>
            <NavLink 
              to={`/${activeSlug}/admin/settings`} 
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-label-sm ${
                  isActive
                    ? 'bg-admin-secondary-container text-admin-on-secondary-container font-bold'
                    : 'text-admin-on-surface-variant hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Settings
            </NavLink>
          </li>
          <li>
            <button 
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = `/${activeSlug}/admin/login`
              }} 
              className="w-full flex items-center gap-3 px-4 py-2 text-admin-on-surface-variant hover:bg-white/5 hover:text-red-400 rounded-lg transition-colors text-label-sm text-left"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Log Out
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 frosted-glass-dark border-b border-white/10 flex justify-between items-center px-lg h-14">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-clinical-teal">science</span>
          <span className="font-bold text-admin-primary">Admin Portal</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="text-admin-on-surface-variant">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-64 z-[60] bg-admin-surface border-r border-white/10 p-md pt-xl flex flex-col md:hidden"
            >
              <div className="flex justify-between items-center mb-xl">
                <span className="font-bold text-admin-primary">Pathology Portal</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-admin-on-surface-variant"><span className="material-symbols-outlined">close</span></button>
              </div>
              <ul className="flex flex-col gap-2 flex-grow">
                {adminNavItems.map(({ to, icon, label, end }) => (
                  <li key={to}>
                    <NavLink to={to} end={end} onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-label-md ${isActive ? 'bg-admin-secondary-container text-admin-on-secondary-container font-bold' : 'text-admin-on-surface-variant hover:bg-white/5'}`}
                    >
                      {({ isActive }) => (
                        <><span className={`material-symbols-outlined ${isActive ? 'icon-fill' : ''}`}>{icon}</span>{label}</>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>

              {/* Mobile Staff Well-being & Worker Break System */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[11px] font-bold text-admin-on-surface-variant uppercase tracking-wider">Staff Well-being</h3>
                  {breakStatus && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>

                {breakStatus ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-center">
                    <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                      <span>☕ On Break</span>
                      <span className="font-mono text-base font-extrabold text-amber-200">{formatSeconds(breakStatus.secondsLeft)}</span>
                    </div>
                    <p className="text-[11px] text-amber-400/80">Started at {breakStatus.startTime}</p>
                    <button
                      onClick={endBreakEarly}
                      className="w-full py-1 mt-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition-all border border-amber-500/40"
                    >
                      End Break Early
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startBreak(15)}
                      className="flex-1 glass-panel text-admin-on-surface-variant text-label-sm py-2 rounded-lg hover:glass-panel-teal hover:text-clinical-teal transition-all font-bold"
                    >
                      15m Break
                    </button>
                    <button
                      onClick={() => startBreak(30)}
                      className="flex-1 glass-panel text-admin-on-surface-variant text-label-sm py-2 rounded-lg hover:glass-panel-teal hover:text-clinical-teal transition-all font-bold"
                    >
                      30m Break
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Bottom: Settings + Logout */}
              <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
                <NavLink
                  to={`/${activeSlug}/admin/settings`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-label-md ${
                      isActive ? 'bg-admin-secondary-container text-admin-on-secondary-container font-bold' : 'text-admin-on-surface-variant hover:bg-white/5'
                    }`
                  }
                >
                  <span className="material-symbols-outlined">settings</span>
                  Settings
                </NavLink>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false)
                    await supabase.auth.signOut()
                    window.location.href = `/${activeSlug}/admin/login`
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-label-md text-admin-on-surface-variant hover:bg-white/5 hover:text-red-400 w-full text-left"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 md:ml-64 mt-14 md:mt-0 min-h-screen pb-20 md:pb-0 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-admin-surface border-t border-white/10 flex justify-around py-2 px-2">
        {bottomNavItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/admin'}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${isActive ? 'text-clinical-teal' : 'text-admin-on-surface-variant'}`}
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined text-[22px] ${isActive ? 'icon-fill' : ''}`}>{icon}</span>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
