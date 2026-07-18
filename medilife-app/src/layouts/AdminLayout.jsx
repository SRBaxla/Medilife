import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ScrollToTop from '../components/common/ScrollToTop'

const adminNavItems = [
  { to: '/admin', icon: 'how_to_reg', label: 'Check-in', end: true },
  { to: '/admin/send-report', icon: 'send', label: 'Send Reports' },
  { to: '/admin/analytics', icon: 'insights', label: 'Business Analytics' },
  { to: '/admin/schedule', icon: 'calendar_today', label: 'Day Schedule' },
]

const bottomNavItems = [
  { to: '/admin', icon: 'how_to_reg', label: 'Check-in' },
  { to: '/admin/send-report', icon: 'send', label: 'Reports' },
  { to: '/admin/analytics', icon: 'insights', label: 'Analytics' },
  { to: '/admin/schedule', icon: 'calendar_today', label: 'Schedule' },
]

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

        {/* Staff Well-being */}
        <div className="mt-auto mb-4">
          <h3 className="text-label-sm text-admin-on-surface-variant uppercase mb-2 px-4">Staff Well-being</h3>
          <div className="px-4 flex gap-2">
            <button className="flex-1 glass-panel text-admin-on-surface-variant text-label-sm py-2 rounded-lg hover:glass-panel-teal hover:text-clinical-teal transition-all">15m Break</button>
            <button className="flex-1 glass-panel text-admin-on-surface-variant text-label-sm py-2 rounded-lg hover:glass-panel-teal hover:text-clinical-teal transition-all">30m Break</button>
          </div>
        </div>

        {/* Bottom */}
        <ul className="flex flex-col gap-2 border-t border-white/10 pt-4">
          {[{ icon: 'settings', label: 'Settings' }, { icon: 'logout', label: 'Log Out' }].map(({ icon, label }) => (
            <li key={label}>
              <Link to="/login" className="flex items-center gap-3 px-4 py-2 text-admin-on-surface-variant hover:bg-white/5 rounded-lg transition-colors text-label-sm">
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                {label}
              </Link>
            </li>
          ))}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 md:ml-64 mt-14 md:mt-0 min-h-screen overflow-y-auto">
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
