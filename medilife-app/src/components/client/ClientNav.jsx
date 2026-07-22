import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../supabaseClient'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/tests', label: 'Tests' },
  { to: '/packages', label: 'Packages' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
]

export default function ClientNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [patientUser, setPatientUser] = useState(null)
  const [tenantSlug, setTenantSlug] = useState('jhansi-medilife-tenant-01')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [])

  // Listen for auth state changes
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const meta = session.user.user_metadata
        const role = meta?.role || session.user.app_metadata?.role
        // Only show greeting for patients, not admins
        if (!role || role === 'patient') {
          setPatientUser(session.user)
          // Try to detect tenant slug from URL or metadata
          const slug = meta?.tenant_slug || 'jhansi-medilife-tenant-01'
          setTenantSlug(slug)
        }
      }
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata
        const role = meta?.role || session.user.app_metadata?.role
        if (!role || role === 'patient') {
          setPatientUser(session.user)
          const slug = meta?.tenant_slug || 'jhansi-medilife-tenant-01'
          setTenantSlug(slug)
        } else {
          setPatientUser(null)
        }
      } else {
        setPatientUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Extract first name from user metadata or email
  const getFirstName = (user) => {
    if (!user) return null
    const meta = user.user_metadata
    if (meta?.full_name) return meta.full_name.split(' ')[0]
    if (meta?.name) return meta.name.split(' ')[0]
    if (meta?.first_name) return meta.first_name
    // Fallback: use part before @ in email
    return user.email?.split('@')[0] || 'Patient'
  }

  const firstName = getFirstName(patientUser)
  const portalLink = patientUser
    ? `/${tenantSlug}/patient/dashboard`
    : '/portal'

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-surface/90 backdrop-blur-xl shadow-clinical border-b border-outline-variant/20'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-[1280px] mx-auto px-lg py-sm flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-sm group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-clinical group-hover:shadow-clinical-lg transition-shadow">
              <span className="material-symbols-outlined text-on-primary text-[20px]">science</span>
            </div>
            <span className="font-bold text-[18px] text-primary">
              Medilife<span className="text-on-surface font-medium"> Pathology</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-lg">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `font-label-md text-label-md transition-colors duration-200 relative pb-1 ${
                    isActive
                      ? 'text-primary font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full'
                      : 'text-on-surface-variant hover:text-primary'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-sm">
            {/* Patient Portal / Greeting Button */}
            <Link
              to={portalLink}
              className={`hidden lg:flex items-center gap-xs px-md py-sm rounded-xl transition-all font-label-md text-label-md ${
                patientUser
                  ? 'bg-secondary-container text-primary border border-primary/30 hover:bg-secondary-container/80'
                  : 'border border-outline-variant text-primary hover:bg-secondary-container/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {patientUser ? 'waving_hand' : 'person'}
              </span>
              {patientUser ? `Hi, ${firstName}` : 'Patient Portal'}
            </Link>
            <Link to="/booking" className="btn-primary hidden sm:flex">
              Book Now
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-sm text-primary hover:bg-secondary-container/50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 bg-surface-container-lowest border-l border-outline-variant/30 z-50 md:hidden flex flex-col p-lg shadow-clinical-xl"
            >
              <div className="flex justify-between items-center mb-xl">
                {patientUser ? (
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <span className="font-bold text-primary text-[16px]">Hi, {firstName}!</span>
                  </div>
                ) : (
                  <span className="font-bold text-primary text-[18px]">Medilife</span>
                )}
                <button onClick={() => setMenuOpen(false)} className="p-sm text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <nav className="flex flex-col gap-xs flex-grow">
                {navLinks.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-md px-md py-sm rounded-xl font-label-md text-label-md transition-all ${
                        isActive
                          ? 'bg-secondary-container text-primary font-bold'
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
              <div className="flex flex-col gap-sm mt-xl border-t border-outline-variant/30 pt-lg">
                <Link to={portalLink} onClick={() => setMenuOpen(false)} className="btn-outline justify-center">
                  <span className="material-symbols-outlined text-[18px]">
                    {patientUser ? 'waving_hand' : 'person'}
                  </span>
                  {patientUser ? `Hi, ${firstName}` : 'Patient Portal'}
                </Link>
                <Link to="/booking" onClick={() => setMenuOpen(false)} className="btn-primary justify-center">
                  Book Now
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
