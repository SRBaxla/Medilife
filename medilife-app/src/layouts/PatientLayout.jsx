import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ScrollToTop from '../components/common/ScrollToTop'

const mainNav = [
  { to: '/portal', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/portal/reports', icon: 'description', label: 'Reports' },
  { to: '/portal/statistics', icon: 'insights', label: 'Statistics' },
  { to: '/portal/profile', icon: 'person', label: 'Profile' },
]
const bottomNav = [
  { to: '/portal', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/portal/reports', icon: 'description', label: 'Reports' },
  { to: '/portal/statistics', icon: 'insights', label: 'Stats' },
  { to: '/portal/profile', icon: 'person', label: 'Profile' },
  { to: '/portal/settings', icon: 'settings', label: 'Settings' },
]
const footerNav = [
  { to: '/portal/settings', icon: 'settings', label: 'Settings' },
  { to: '/portal/help', icon: 'help', label: 'Help' },
]

export default function PatientLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-surface text-on-surface font-sans selection:bg-primary-container selection:text-on-primary-container">
      <ScrollToTop />

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 p-md pt-xxl border-r border-outline-variant/20 bg-surface-container-lowest overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-xl">
          <div className="w-16 h-16 rounded-full bg-surface-container-low border border-outline-variant/30 flex items-center justify-center mb-md shadow-sm overflow-hidden">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>account_circle</span>
          </div>
          <h1 className="font-bold text-[16px] text-primary text-center">Pathology Portal</h1>
          <p className="text-label-sm text-on-surface-variant mt-1">Clinical Excellence</p>
        </div>

        {/* Book CTA */}
        <Link to="/booking" className="w-full bg-primary text-on-primary font-label-md py-sm px-md rounded-xl shadow-sm hover:shadow-clinical-lg transition-all duration-200 mb-lg flex items-center justify-center gap-sm group">
          <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">add_circle</span>
          Book New Test
        </Link>

        {/* Main Nav */}
        <div className="flex flex-col gap-xs flex-grow">
          {mainNav.map(({ to, icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-md px-md py-sm rounded-xl font-label-md text-label-md transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-secondary-container text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:translate-x-1'
                }`
              }
            >
              {({ isActive }) => (
                <><span className={`material-symbols-outlined ${isActive ? 'icon-fill' : ''}`}>{icon}</span>{label}</>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer Nav */}
        <div className="flex flex-col gap-xs mt-auto pt-lg border-t border-outline-variant/20">
          {footerNav.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-md px-md py-sm rounded-xl font-label-md text-label-md transition-all duration-200 select-none ${
                  isActive ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:translate-x-1'
                }`
              }
            >
              <span className="material-symbols-outlined">{icon}</span>{label}
            </NavLink>
          ))}
          <Link to="/" className="flex items-center gap-md px-md py-sm rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined">home</span>
            Back to Site
          </Link>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden bg-surface/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/30 shadow-sm flex justify-between items-center px-lg py-sm h-14">
        <h1 className="font-bold text-[16px] text-primary">Medilife Portal</h1>
        <div className="flex items-center gap-md">
          <button className="text-on-surface-variant hover:bg-surface-container-low p-sm rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button onClick={() => setMenuOpen(true)} className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-50 md:hidden" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-72 z-[60] bg-surface-container-lowest border-r border-outline-variant/30 p-md pt-xl flex flex-col md:hidden shadow-clinical-xl"
            >
              <div className="flex justify-between items-center mb-xl">
                <span className="font-bold text-primary">Patient Portal</span>
                <button onClick={() => setMenuOpen(false)} className="text-on-surface-variant"><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="flex flex-col gap-xs flex-grow">
                {[...mainNav, ...footerNav].map(({ to, icon, label, end }) => (
                  <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-md px-md py-sm rounded-xl font-label-md text-label-md transition-all ${isActive ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                  >
                    <span className="material-symbols-outlined">{icon}</span>{label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mt-14 md:mt-0 min-h-screen pb-20 md:pb-0 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant/30 flex justify-around py-1.5 px-2">
        {bottomNav.map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
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
