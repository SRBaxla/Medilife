import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../supabaseClient'

const serviceDropdownItems = [
  { to: '/tests', label: 'Individual Diagnostic Tests', desc: 'Blood, Urine, Thyroid, Diabetes & Pathology Tests', icon: 'biotech' },
  { to: '/packages', label: 'Health Packages (BharatFit)', desc: 'Full body checkup packages starting ₹599/-', icon: 'package_2' },
  { to: '/hospitals', label: 'Hospital & Clinic Test Booking', desc: 'B2B tie-ups, bulk sample pickups & doctor panels', icon: 'local_hospital' },
]

export default function ClientNav() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)
  const [patientUser, setPatientUser] = useState(null)
  const [tenantSlug, setTenantSlug] = useState('jhansi-medilife-tenant-01')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on route change
  useEffect(() => { 
    setMenuOpen(false)
    setServicesDropdownOpen(false)
  }, [location.pathname])

  // Listen for auth state changes
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const meta = session.user.user_metadata
        const role = meta?.role || session.user.app_metadata?.role
        if (!role || role === 'patient') {
          setPatientUser(session.user)
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

  const getFirstName = (user) => {
    if (!user) return null
    const meta = user.user_metadata
    if (meta?.full_name) return meta.full_name.split(' ')[0]
    if (meta?.name) return meta.name.split(' ')[0]
    if (meta?.first_name) return meta.first_name
    return user.email?.split('@')[0] || 'Patient'
  }

  const firstName = getFirstName(patientUser)
  const portalLink = patientUser
    ? `/${tenantSlug}/patient/dashboard`
    : '/portal'

  const isServicesActive = ['/tests', '/packages', '/hospitals'].includes(location.pathname)

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
          <Link to="/" className="flex items-center gap-sm group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center shadow-clinical group-hover:shadow-clinical-lg transition-shadow relative shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[20px]">science</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E31837] rounded-full border-2 border-surface"></span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[16px] sm:text-[18px] text-primary leading-tight">
                Medipath<span className="text-[#E31837]"> Diagnostics</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-on-surface-variant font-medium leading-none tracking-tight hidden xs:block">
                Redcliffe Labs Authorised Collection Center
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Visible on lg 1024px+) */}
          <div className="hidden lg:flex items-center gap-md xl:gap-lg">
            {/* Home */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `font-label-md text-label-md transition-colors duration-200 relative pb-1 whitespace-nowrap ${
                  isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">Home</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E31837] rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </>
              )}
            </NavLink>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setServicesDropdownOpen((v) => !v)}
                className={`flex items-center gap-xs font-label-md text-label-md transition-colors duration-200 relative pb-1 whitespace-nowrap ${
                  isServicesActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="relative z-10">Services</span>
                <span className="material-symbols-outlined text-[16px] transition-transform duration-200" style={{ transform: servicesDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  expand_more
                </span>
                {isServicesActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E31837] rounded-full shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {servicesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-80 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-sm shadow-clinical-xl z-50 space-y-xs"
                  >
                    {serviceDropdownItems.map(({ to, label, desc, icon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setServicesDropdownOpen(false)}
                        className={`flex items-start gap-md p-md rounded-xl transition-all ${
                          location.pathname === to
                            ? 'bg-secondary-container text-primary font-semibold'
                            : 'hover:bg-surface-container-low text-on-surface hover:text-primary'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[20px]">{icon}</span>
                        </div>
                        <div>
                          <p className="text-label-md font-bold leading-tight">{label}</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{desc}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* About Us */}
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `font-label-md text-label-md transition-colors duration-200 relative pb-1 whitespace-nowrap ${
                  isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">About Us</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E31837] rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </>
              )}
            </NavLink>

            {/* Contact */}
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `font-label-md text-label-md transition-colors duration-200 relative pb-1 whitespace-nowrap ${
                  isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">Contact</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E31837] rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-xs sm:gap-sm shrink-0">
            {/* Phone link */}
            <a
              href="tel:+918299487062"
              className="hidden xl:flex items-center gap-xs px-sm py-xs text-primary font-label-md hover:text-[#E31837] transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px] text-[#E31837]">call</span>
              <span className="text-label-sm font-semibold">+91 8299487062</span>
            </a>
            {/* Patient Portal / Greeting Button */}
            <Link
              to={portalLink}
              className={`hidden 2xl:flex items-center gap-xs px-md py-sm rounded-xl transition-all font-label-md text-label-md whitespace-nowrap ${
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
            <Link to="/booking" className="btn-primary hidden sm:flex shrink-0 whitespace-nowrap px-md sm:px-xl">
              Book Now
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            {/* Hamburger (Shown on screens < 1024px) */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden p-sm text-primary hover:bg-secondary-container/50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile & Tablet Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 bg-surface-container-lowest border-l border-outline-variant/30 z-50 lg:hidden flex flex-col p-lg shadow-clinical-xl overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-lg">
                {patientUser ? (
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <span className="font-bold text-primary text-[16px]">Hi, {firstName}!</span>
                  </div>
                ) : (
                  <span className="font-bold text-primary text-[18px]">Medipath <span className="text-[#E31837]">Diagnostics</span></span>
                )}
                <button onClick={() => setMenuOpen(false)} className="p-sm text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <nav className="flex flex-col gap-xs flex-grow">
                <NavLink
                  to="/"
                  end
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-md px-md py-sm rounded-xl font-label-md text-label-md transition-all ${
                      isActive ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[20px]">home</span>
                  Home
                </NavLink>

                {/* Mobile Services Group */}
                <div className="py-xs">
                  <p className="px-md text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest mb-xs">Services</p>
                  <div className="space-y-xs pl-xs">
                    {serviceDropdownItems.map(({ to, label, icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-md px-md py-xs rounded-xl font-label-md text-label-md transition-all ${
                            isActive ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                          }`
                        }
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#E31837]">{icon}</span>
                        <span>{label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>

                <NavLink
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-md px-md py-sm rounded-xl font-label-md text-label-md transition-all ${
                      isActive ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[20px]">info</span>
                  About Us
                </NavLink>

                <NavLink
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-md px-md py-sm rounded-xl font-label-md text-label-md transition-all ${
                      isActive ? 'bg-secondary-container text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[20px]">call</span>
                  Contact
                </NavLink>
              </nav>

              <div className="flex flex-col gap-sm mt-lg border-t border-outline-variant/30 pt-lg">
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
