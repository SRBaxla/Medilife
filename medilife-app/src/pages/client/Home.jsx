import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const featuredSchemes = [
  {
    id: 1,
    badge: '★ Most Popular Scheme',
    title: 'BharatFit Pro',
    price: '₹599/-',
    originalPrice: '₹1,499',
    bullets: [
      '37+ Essential Health Parameters',
      'Free Home Sample Collection',
      'Express Digital Report in 4–6 Hours'
    ],
    targetItem: 'BharatFit Pro'
  },
  {
    id: 2,
    badge: '🔥 Best Value Checkup',
    title: 'Basic Health Checkup',
    price: '₹999/-',
    originalPrice: '₹2,200',
    bullets: [
      '29 Pathology & Blood Tests',
      'Includes HbA1c, LFT, KFT & Lipid',
      'Free Home Collection (Jhansi)'
    ],
    targetItem: 'Basic Health Checkup'
  },
  {
    id: 3,
    badge: '💎 Comprehensive Screening',
    title: 'Advanced Health Checkup',
    price: '₹1,599/-',
    originalPrice: '₹3,500',
    bullets: [
      '55 Full Body Health Tests',
      'Thyroid, Diabetes, Cardiac & Renal',
      'Priority Laboratory Processing'
    ],
    targetItem: 'Advanced Health Checkup'
  },
  {
    id: 4,
    badge: '🛡️ Complete Family Shield',
    title: 'BharatFit Complete',
    price: '₹3,999/-',
    originalPrice: '₹8,000',
    bullets: [
      '107–108 Total Health Parameters',
      'Complete Organ & Hormonal Profile',
      'Free Home Collection + Priority Delivery'
    ],
    targetItem: 'BharatFit Complete'
  }
]

const services = [
  { icon: 'bloodtype', title: 'Comprehensive Pathology', desc: 'Blood testing, CBC, Lipid profiles, HbA1c, Liver & Kidney profiles with Redcliffe accuracy.', price: 'Starting ₹599' },
  { icon: 'home_health', title: 'Free Home Sample Collection', desc: 'Trained phlebotomists collect samples from your home anywhere in Jhansi (T&C apply).', price: 'Free Home Collection' },
  { icon: 'medical_information', title: 'BharatFit Health Packages', desc: 'Curated wellness packages ranging from essential 37 parameters to 108+ full body tests.', price: 'Starting ₹599' },
  { icon: 'speed', title: 'Fast & On-Time Reports', desc: 'Accurate reports delivered digitally directly to your WhatsApp, Email & Patient Portal.', price: 'Fast Turnaround' },
]

const stats = [
  { value: '50,000+', label: 'Tests Conducted' },
  { value: '200+', label: 'Diagnostic Packages' },
  { value: 'On-Time', label: 'Accurate Reports' },
  { value: '7AM–8PM', label: 'Open Mon–Sun' },
]

const testimonials = [
  { name: 'Anjali Sharma', role: 'Jhansi Resident', text: 'The home collection service in Khati Baba was prompt and seamless. Got my Redcliffe test report on WhatsApp in no time!', rating: 5 },
  { name: 'Rajesh Kumar', role: 'Local Business Owner', text: 'Medipath Diagnostics Shivam Sharma and team provided genuine care. Highly professional and accurate results.', rating: 5 },
  { name: 'Priya Mehta', role: 'Regular Patient', text: 'Very clean collection center near Kalyan Petrol Pump. Staff is helpful and booking online is super easy.', rating: 5 },
]

function FlipCounter({ endValue, suffix = '', duration = 2200 }) {
  const [count, setCount] = useState(0)
  const [inView, setInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
        }
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeProgress * endValue))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [inView, endValue, duration])

  const formattedStr = count.toLocaleString('en-IN')

  return (
    <span ref={ref} className="inline-flex items-center justify-center font-bold tracking-tight">
      {formattedStr.split('').map((char, idx) => {
        if (char === ',') return <span key={`comma-${idx}`} className="mx-1 text-[#E31837]">,</span>
        return (
          <span key={`digit-${idx}`} className="inline-block relative overflow-hidden h-[1.25em] w-[0.72em] mx-[1px] perspective-[400px]">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={char}
                initial={{ y: '100%', rotateX: -90, opacity: 0 }}
                animate={{ y: '0%', rotateX: 0, opacity: 1 }}
                exit={{ y: '-100%', rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center bg-white/15 rounded-lg border border-white/30 backdrop-blur-md shadow-md text-white font-mono text-[0.9em]"
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </span>
        )
      })}
      {suffix && <span className="ml-1 text-[#E31837] font-extrabold">{suffix}</span>}
    </span>
  )
}

export default function Home() {
  const [activeSchemeIndex, setActiveSchemeIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-rotate featured schemes every 4.5 seconds
  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      setActiveSchemeIndex((prev) => (prev + 1) % featuredSchemes.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [isHovered])

  const currentScheme = featuredSchemes[activeSchemeIndex]

  return (
    <PageTransition>
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-surface pt-24 pb-xl">
        {/* BG blobs */}
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0A1F6E]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-[#E31837]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[1280px] mx-auto px-md sm:px-lg py-xl w-full grid grid-cols-1 lg:grid-cols-2 gap-[#E31837]/10 items-center relative z-10">
          {/* Left Text Content */}
          <div className="space-y-lg text-center lg:text-left">
            <motion.div custom={0} variants={fadeUp} initial="initial" animate="animate" className="space-y-md">
              <div className="inline-flex items-center gap-xs px-md py-xs bg-secondary-container rounded-full text-primary text-xs font-semibold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-[#E31837]">verified</span>
                <span>Redcliffe Labs Authorised Collection Center</span>
              </div>

              <h1 className="text-[32px] sm:text-display-lg-mobile lg:text-display-lg text-on-surface font-bold tracking-tight leading-tight">
                Medipath Diagnostics.{' '}
                <span className="text-[#E31837] block sm:inline">Accurate & On-Time.</span>
              </h1>

              <p className="text-body-md sm:text-body-lg text-on-surface-variant max-w-xl mx-auto lg:mx-0">
                Bringing Redcliffe Labs' national diagnostic precision right to your doorstep in Khati Baba, Jhansi. Comprehensive pathology tests with free home sample collection.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div custom={1} variants={fadeUp} initial="initial" animate="animate" className="flex flex-col sm:flex-row gap-md justify-center lg:justify-start">
              <Link to="/booking" className="btn-primary justify-center">
                Book a Test
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link to="/packages" className="btn-outline justify-center">
                View Health Packages
              </Link>
            </motion.div>

            {/* Trust badge */}
            <motion.div custom={2} variants={fadeUp} initial="initial" animate="animate" className="pt-md border-t border-outline-variant/30 flex items-center justify-center lg:justify-start gap-md">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="w-8 h-8 rounded-full bg-secondary-container border-2 border-surface flex items-center justify-center text-[10px] font-bold text-primary">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-label-md font-bold text-on-surface">Trusted in Jhansi</p>
                <p className="text-label-sm text-on-surface-variant">In Front of Kalyan Petrol Pump, Khati Baba</p>
              </div>
            </motion.div>
          </div>

          {/* Hero right-side visual: Static-Size Drag-to-Slide Schemes Card */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="relative hidden lg:flex items-center justify-center select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Fixed static dimension container (390px x 370px) */}
            <div className="w-[390px] h-[370px] relative z-1 bg-surface-container-lowest rounded-3xl p-lg shadow-clinical-xl border border-outline-variant/30 flex flex-col justify-between overflow-hidden">
              {/* Top controls & scheme count */}
              <div className="flex justify-between items-center pb-xs border-b border-outline-variant/20 shrink-0">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#E31837] animate-ping inline-block" />
                  Offers ({activeSchemeIndex + 1}/{featuredSchemes.length}) • Drag to slide
                </span>
                <div className="flex items-center gap-xs">
                  <button
                    type="button"
                    onClick={() => setActiveSchemeIndex((prev) => (prev === 0 ? featuredSchemes.length - 1 : prev - 1))}
                    className="p-1 rounded-full text-on-surface-variant hover:text-primary hover:bg-secondary-container transition-colors"
                    title="Previous Scheme"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSchemeIndex((prev) => (prev + 1) % featuredSchemes.length)}
                    className="p-1 rounded-full text-on-surface-variant hover:text-primary hover:bg-secondary-container transition-colors"
                    title="Next Scheme"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Draggable Animated Slide Area */}
              <div className="flex-grow flex flex-col justify-between py-xs cursor-grab active:cursor-grabbing overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentScheme.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_e, info) => {
                      if (info.offset.x < -40 || info.velocity.x < -200) {
                        setActiveSchemeIndex((prev) => (prev + 1) % featuredSchemes.length)
                      } else if (info.offset.x > 40 || info.velocity.x > 200) {
                        setActiveSchemeIndex((prev) => (prev === 0 ? featuredSchemes.length - 1 : prev - 1))
                      }
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col justify-between h-full"
                  >
                    {/* Header Info */}
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E31837]/10 text-[#E31837] text-[10px] font-bold uppercase tracking-wider mb-xs">
                            {currentScheme.badge}
                          </span>
                          <h3 className="font-bold text-headline-sm text-on-surface leading-tight line-clamp-1">{currentScheme.title}</h3>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-display-lg-mobile font-bold text-primary block leading-none">{currentScheme.price}</span>
                          <span className="text-[11px] line-through text-on-surface-variant font-medium">{currentScheme.originalPrice}</span>
                        </div>
                      </div>

                      {/* Bullets (Fixed height container) */}
                      <div className="space-y-xs py-xs my-xs border-y border-outline-variant/20 min-h-[96px]">
                        {currentScheme.bullets.map((bullet) => (
                          <div key={bullet} className="flex items-center gap-sm text-body-sm text-on-surface font-medium line-clamp-1">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                            <span className="truncate">{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Link */}
                    <Link
                      to="/booking"
                      state={{ selectedItem: currentScheme.targetItem }}
                      className="btn-primary w-full justify-center bg-primary hover:bg-[#E31837] text-white transition-colors py-xs text-body-sm shrink-0"
                    >
                      Book Scheme Now
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Indicator Dots (Fixed bottom) */}
              <div className="flex justify-center items-center gap-xs pt-xs border-t border-outline-variant/10 shrink-0">
                {featuredSchemes.map((scheme, idx) => (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => setActiveSchemeIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeSchemeIndex === idx ? 'w-5 bg-primary' : 'w-1.5 bg-outline-variant/40 hover:bg-primary/50'
                    }`}
                    aria-label={`Go to scheme ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Floating badge 1 (Top Right) */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -top-3 -right-4 z-20 bg-white/95 backdrop-blur-md px-md py-xs rounded-xl shadow-clinical border border-outline-variant/30 pointer-events-none"
            >
              <div className="flex items-center gap-xs">
                <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                  <span className="material-symbols-outlined text-[15px]">home_health</span>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-tight text-on-surface-variant">Doorstep Pickup</p>
                  <p className="text-[11px] font-bold text-on-surface">Free Home Collection</p>
                </div>
              </div>
            </motion.div>

            {/* Floating badge 2 (Bottom Left) */}
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="absolute -bottom-3 -left-4 z-20 bg-white/95 backdrop-blur-md px-md py-xs rounded-xl shadow-clinical border border-outline-variant/30 pointer-events-none"
            >
              <div className="flex items-center gap-xs">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-[#0A1F6E] shrink-0">
                  <span className="material-symbols-outlined text-[15px]">schedule</span>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-tight text-on-surface-variant">Working Hours</p>
                  <p className="text-[11px] font-bold text-on-surface">Mon–Sun | 7AM–8PM</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-[#071338] py-xxl border-y border-white/10 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-lg grid grid-cols-2 md:grid-cols-4 gap-lg">
          {stats.map(({ value, label }, i) => {
            const isNumeric50k = value.includes('50,000');
            const isNumeric200 = value.includes('200');
            return (
              <motion.div
                key={label}
                custom={i}
                variants={fadeUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: '-40px' }}
                className="text-center text-on-primary flex flex-col items-center justify-center p-md rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
              >
                <div className="text-[28px] sm:text-display-lg-mobile lg:text-display-lg font-bold min-h-[56px] flex items-center justify-center">
                  {isNumeric50k ? (
                    <FlipCounter endValue={50000} suffix="+" />
                  ) : isNumeric200 ? (
                    <FlipCounter endValue={200} suffix="+" />
                  ) : (
                    <span className="text-white font-bold tracking-tight">{value}</span>
                  )}
                </div>
                <p className="text-body-md opacity-85 mt-xs font-semibold text-slate-200">{label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Services Section ── */}
      <section className="py-xxl max-w-[1280px] mx-auto px-lg">
        <div className="text-center max-w-xl mx-auto mb-xxl space-y-xs">
          <span className="badge-primary inline-flex">Diagnostic Services</span>
          <h2 className="text-display-lg-mobile sm:text-headline-md font-bold text-on-surface">Comprehensive Pathology Care</h2>
          <p className="text-body-md text-on-surface-variant">State-of-the-art testing equipment powered by Redcliffe Labs quality control.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {services.map(({ icon, title, desc, price }, i) => (
            <motion.div
              key={title}
              custom={i}
              variants={fadeUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-60px' }}
              className="bg-white p-lg rounded-2xl shadow-clinical hover-lift border border-outline-variant/30 flex flex-col"
            >
              <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-primary mb-md">
                <span className="material-symbols-outlined">{icon}</span>
              </div>
              <h3 className="text-headline-sm font-bold mb-sm text-on-surface">{title}</h3>
              <p className="text-body-md text-on-surface-variant mb-lg flex-grow">{desc}</p>
              <div className="pt-md border-t border-outline-variant flex justify-between items-center">
                <span className="font-bold text-primary text-label-md">{price}</span>
                <Link 
                  to="/booking" 
                  state={{ selectedItem: title.includes('BharatFit') ? 'BharatFit Pro' : 'Complete Blood Count (CBC)' }}
                  className="p-sm rounded-full bg-secondary-container text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                  title="Book This Service"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="bg-surface-container-low py-xxl">
        <div className="max-w-[1280px] mx-auto px-lg">
          <div className="text-center max-w-2xl mx-auto mb-xl space-y-xs">
            <span className="badge-primary inline-flex">Why Choose Medipath</span>
            <h2 className="text-display-lg-mobile sm:text-headline-md font-bold text-on-surface">Redcliffe National Quality Right Here in Jhansi</h2>
            <p className="text-body-md text-on-surface-variant">
              Under the leadership of Shivam Sharma, Medipath Diagnostics ensures precision diagnostics, sample integrity, and compassionate patient care in Khati Baba, Jhansi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
            {[
              { icon: 'verified', title: 'NABL-Standard Quality', desc: 'Samples processed under strict quality controls and state-of-the-art calibrated machinery.' },
              { icon: 'home_health', title: 'Phlebotomist Doorstep Service', desc: 'Safe, hygienic sample collection right from your residence anywhere in Jhansi.' },
              { icon: 'send_to_mobile', title: 'Digital PDF Dispatch', desc: 'Receive instant report notifications on WhatsApp and view them in your secure patient portal.' },
            ].map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                custom={i}
                variants={fadeUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/30 shadow-clinical flex flex-col items-center text-center space-y-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px] text-[#E31837]">{icon}</span>
                </div>
                <h3 className="font-bold text-on-surface text-headline-sm">{title}</h3>
                <p className="text-body-md text-on-surface-variant">{desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/about" className="btn-primary">Learn More About Us</Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-xxl max-w-[1280px] mx-auto px-lg">
        <div className="text-center max-w-xl mx-auto mb-xxl space-y-xs">
          <span className="badge-primary inline-flex">Patient Reviews</span>
          <h2 className="text-display-lg-mobile sm:text-headline-md font-bold text-on-surface">Trusted by Families Across Jhansi</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {testimonials.map(({ name, role, text, rating }, i) => (
            <motion.div
              key={name}
              custom={i}
              variants={fadeUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/30 shadow-clinical flex flex-col justify-between"
            >
              <div className="space-y-md">
                <div className="flex gap-xs text-amber-500">
                  {[...Array(rating)].map((_, idx) => (
                    <span key={idx} className="material-symbols-outlined text-[18px] icon-fill">star</span>
                  ))}
                </div>
                <p className="text-body-md text-on-surface-variant font-italic">"{text}"</p>
              </div>
              <div className="pt-md border-t border-outline-variant/30 mt-md">
                <p className="font-bold text-on-surface text-label-md">{name}</p>
                <p className="text-label-sm text-on-surface-variant">{role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Strip ── */}
      <section className="bg-gradient-to-r from-primary via-primary-container to-primary py-xxl text-on-primary">
        <div className="max-w-[1280px] mx-auto px-lg text-center space-y-lg">
          <h2 className="text-display-lg-mobile sm:text-headline-md font-bold">Book Your Health Test Today</h2>
          <p className="text-body-lg opacity-90 max-w-xl mx-auto">Get accurate diagnostic results from Redcliffe Labs with free doorstep collection in Jhansi.</p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <Link to="/booking" className="btn-primary bg-on-primary text-primary hover:bg-secondary-container">
              Book Test Now
            </Link>
            <a href="tel:+918299487062" className="btn-outline border-white text-white hover:bg-white/10">
              Call +91 8299487062
            </a>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
