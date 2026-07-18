import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const services = [
  { icon: 'bloodtype', title: 'Routine Blood Tests', desc: 'Complete Blood Count (CBC), Lipid Profile, and more with clinical precision.', price: 'Starting ₹499' },
  { icon: 'home_health', title: 'Home Collection', desc: 'Trained phlebotomists collect samples from the comfort of your home or office.', price: 'Free for Seniors' },
  { icon: 'medical_information', title: 'Health Packages', desc: 'Comprehensive wellness checkups designed for all life stages and needs.', price: 'Starting ₹1,199' },
  { icon: 'vaccines', title: 'Specialised Tests', desc: 'Advanced hormonal, genetic, and cancer marker diagnostics by certified labs.', price: 'Starting ₹799' },
]

const stats = [
  { value: '15,000+', label: 'Happy Patients' },
  { value: '200+', label: 'Tests Offered' },
  { value: '4 Hrs', label: 'Report Turnaround' },
  { value: '12+', label: 'Years of Excellence' },
]

const testimonials = [
  { name: 'Anjali Sharma', role: 'Senior Patient', text: 'The home collection service is a lifesaver. Reports were delivered digitally within hours. Excellent precision and care!', rating: 5 },
  { name: 'Rajesh Kumar', role: 'Corporate Client', text: 'We run corporate health camps with Medilife every quarter. Efficient, professional, and always accurate results.', rating: 5 },
  { name: 'Priya Mehta', role: 'Regular Patient', text: 'Booking online is so convenient. The staff is courteous and the lab is spotlessly clean. Highly recommended!', rating: 5 },
]

export default function Home() {
  return (
    <PageTransition>
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-surface">
        {/* BG blobs */}
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary-fixed/30 rounded-full blur-2xl" />
        </div>

        <div className="max-w-[1280px] mx-auto px-lg grid grid-cols-1 lg:grid-cols-2 gap-xl items-center relative z-10 py-xxl">
          {/* Text */}
          <div className="space-y-lg">
            <motion.div custom={0} variants={fadeUp} initial="initial" animate="animate"
              className="inline-flex items-center gap-sm px-md py-xs bg-secondary-container text-primary rounded-full border border-outline-variant"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Trusted Local Clinic</span>
            </motion.div>

            <motion.h1 custom={1} variants={fadeUp} initial="initial" animate="animate"
              className="text-display-lg-mobile md:text-display-lg font-bold text-on-surface leading-tight"
            >
              Professional Care,{' '}
              <span className="text-primary">Local Heart.</span>
            </motion.h1>

            <motion.p custom={2} variants={fadeUp} initial="initial" animate="animate"
              className="text-body-lg text-on-surface-variant max-w-lg"
            >
              Medilife Pathology brings world-class clinical diagnostics to your doorstep. We prioritize accuracy and your comfort above all else.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} initial="initial" animate="animate" className="flex flex-wrap gap-md">
              <Link to="/booking" className="btn-primary">
                Book a Test
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link to="/packages" className="btn-secondary">
                View All Packages
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div custom={4} variants={fadeUp} initial="initial" animate="animate" className="flex items-center gap-lg pt-md">
              <div className="flex -space-x-3">
                {['👩‍⚕️','👨‍⚕️','👩‍🔬','👨‍🔬'].map((e, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-surface bg-secondary-container flex items-center justify-center text-[18px]">
                    {e}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-on-surface">15,000+</p>
                <p className="text-label-sm text-on-surface-variant">Happy Local Patients</p>
              </div>
            </motion.div>
          </div>

          {/* Hero image */}
          <motion.div custom={1} variants={fadeUp} initial="initial" animate="animate" className="relative hidden lg:block">
            <div className="relative z-10 rounded-4xl overflow-hidden shadow-clinical-xl border-8 border-white aspect-[4/5] bg-secondary-container flex items-center justify-center">
              <div className="text-center p-xl">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '96px' }}>local_hospital</span>
                <p className="text-headline-md font-bold text-primary mt-md">Modern Pathology Lab</p>
                <p className="text-body-md text-on-surface-variant mt-sm">ISO Certified • NABL Accredited</p>
              </div>
            </div>
            {/* Decorative blobs */}
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-primary-fixed-dim/30 rounded-3xl -z-10 blur-2xl" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary-fixed/50 rounded-full -z-10 blur-xl" />
            {/* Floating badge */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute top-1/4 -right-6 frosted-glass-white p-md rounded-2xl shadow-clinical-lg border border-white/60"
            >
              <div className="flex items-center gap-sm">
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-tight text-on-surface-variant">Fast Results</p>
                  <p className="text-xs font-bold text-on-surface">Reports in 4 Hours</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="absolute bottom-1/4 -left-6 frosted-glass-white p-md rounded-2xl shadow-clinical-lg border border-white/60"
            >
              <div className="flex items-center gap-sm">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-tight text-on-surface-variant">NABL Certified</p>
                  <p className="text-xs font-bold text-on-surface">ISO 15189:2022</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-primary py-xl">
        <div className="max-w-[1280px] mx-auto px-lg grid grid-cols-2 md:grid-cols-4 gap-lg">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              custom={i}
              variants={fadeUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-display-lg-mobile font-bold text-on-primary">{value}</p>
              <p className="text-label-md text-on-primary/70">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-xxl px-lg bg-surface-bright">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-xl gap-md">
            <div className="max-w-xl">
              <p className="text-primary font-label-md uppercase tracking-widest mb-xs">Our Expertise</p>
              <h2 className="text-headline-lg font-bold text-on-surface">Comprehensive Diagnostic Services</h2>
            </div>
            <Link to="/tests" className="text-primary font-label-md flex items-center gap-xs hover:underline shrink-0">
              Browse all tests <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </Link>
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
                  <Link to="/booking" className="p-sm rounded-full bg-surface-container hover:bg-primary-container hover:text-on-primary-container transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="py-xxl px-lg bg-surface">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xxl items-center">
          <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
            <p className="text-primary font-label-md uppercase tracking-widest mb-xs">Why Choose Us</p>
            <h2 className="text-headline-lg font-bold text-on-surface mb-lg">Clinical Excellence, Every Time</h2>
            <div className="space-y-lg">
              {[
                { icon: 'verified', title: 'NABL Accredited', desc: 'All tests conducted in our ISO 15189:2022 certified laboratory.' },
                { icon: 'speed', title: 'Fast Reports', desc: 'Most routine results delivered digitally within 4–6 hours of sample collection.' },
                { icon: 'home', title: 'Home Collection', desc: 'Trained phlebotomists come to you — no need to visit the clinic.' },
                { icon: 'support_agent', title: '24/7 Support', desc: 'Our medical helpline is always available for report interpretation guidance.' },
              ].map(({ icon, title, desc }, i) => (
                <motion.div key={title} custom={i} variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} className="flex gap-md">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-headline-sm text-on-surface">{title}</h3>
                    <p className="text-body-md text-on-surface-variant">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-primary-container rounded-4xl p-xl text-on-primary space-y-lg"
          >
            <h3 className="text-headline-md font-bold">Book Your Test Today</h3>
            <p className="text-body-lg opacity-90">Schedule online, collect at home or visit our clinic. Get digital reports instantly.</p>
            <div className="space-y-sm">
              {['Select your tests', 'Choose home or walk-in', 'Pay securely online', 'Get reports on WhatsApp & email'].map((step, i) => (
                <div key={step} className="flex items-center gap-sm">
                  <div className="w-6 h-6 rounded-full bg-on-primary/20 flex items-center justify-center text-[12px] font-bold shrink-0">{i + 1}</div>
                  <span className="text-body-md">{step}</span>
                </div>
              ))}
            </div>
            <Link to="/booking" className="inline-flex items-center gap-sm px-xl py-sm bg-on-primary text-primary rounded-xl font-label-md hover:bg-on-primary/90 transition-all">
              Book Now <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-xxl px-lg bg-surface-bright">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-xl">
            <p className="text-primary font-label-md uppercase tracking-widest mb-xs">Testimonials</p>
            <h2 className="text-headline-lg font-bold text-on-surface">What Our Patients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {testimonials.map(({ name, role, text, rating }, i) => (
              <motion.div key={name} custom={i} variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}
                className="bg-white p-lg rounded-2xl shadow-clinical border border-outline-variant/30 flex flex-col gap-md hover-lift"
              >
                <div className="flex gap-xs">
                  {Array.from({ length: rating }).map((_, j) => (
                    <span key={j} className="material-symbols-outlined text-amber-400 text-[18px] icon-fill">star</span>
                  ))}
                </div>
                <p className="text-body-md text-on-surface-variant flex-grow italic">"{text}"</p>
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold text-[16px]">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-label-md text-on-surface">{name}</p>
                    <p className="text-label-sm text-on-surface-variant">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-xxl px-lg bg-surface">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="max-w-[1280px] mx-auto bg-primary rounded-4xl p-xl md:p-xxl text-center text-on-primary"
        >
          <h2 className="text-display-lg-mobile md:text-headline-lg font-bold mb-md">Ready to prioritise your health?</h2>
          <p className="text-body-lg opacity-90 mb-xl max-w-lg mx-auto">Book a test today and get results you can trust — fast, accurate, and right at your fingertips.</p>
          <div className="flex flex-wrap gap-md justify-center">
            <Link to="/booking" className="px-xl py-sm bg-on-primary text-primary rounded-xl font-label-md hover:bg-on-primary/90 transition-all flex items-center gap-sm">
              Book a Test <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link to="/contact" className="px-xl py-sm border border-on-primary/30 text-on-primary rounded-xl font-label-md hover:bg-on-primary/10 transition-all">
              Contact Us
            </Link>
          </div>
        </motion.div>
      </section>
    </PageTransition>
  )
}
