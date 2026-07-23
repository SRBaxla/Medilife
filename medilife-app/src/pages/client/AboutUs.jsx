import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageTransition from '../../components/common/PageTransition'

const team = [
  { name: 'Shivam Sharma', role: 'Franchise Owner & Operations Head', qual: 'Medipath Diagnostics Jhansi', icon: '👨‍💼' },
  { name: 'Redcliffe Pathology Team', role: 'Certified Pathologists', qual: 'MD Pathology Diagnostics', icon: '👩‍⚕️' },
  { name: 'Senior Phlebotomists', role: 'Home Collection Experts', qual: 'Certified DMLT Technicians', icon: '👩‍🔬' },
  { name: 'Lab Support Team', role: 'Patient Care Coordinators', qual: 'Fast Report Dispatch', icon: '👨‍⚕️' },
]

const values = [
  { icon: 'biotech', title: 'State-of-the-Art Technology', desc: 'Equipped with Redcliffe Labs automated machinery ensuring clinical accuracy.' },
  { icon: 'verified', title: 'Highest Quality Standards', desc: 'Multi-stage quality checks for every sample collected in Khati Baba.' },
  { icon: 'engineering', title: 'Experienced Technicians', desc: 'Skilled phlebotomists trained in painless and precise blood collection.' },
  { icon: 'home_health', title: 'Free Home Collection', desc: 'Convenient home sample pickup across Jhansi (T&C apply).' },
]

export default function AboutUs() {
  return (
    <PageTransition>
      {/* Hero */}
      <div className="bg-primary pt-24 pb-xl sm:py-xxl px-md sm:px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-lg lg:gap-xl items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-xs px-md py-xs bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider mb-sm">
              <span className="material-symbols-outlined text-[16px] text-[#E31837]">verified</span>
              <span>Redcliffe Labs Authorised Collection Center</span>
            </div>
            <h1 className="text-[28px] sm:text-display-lg-mobile font-bold mb-md sm:mb-lg">Medipath Diagnostics, Jhansi</h1>
            <p className="text-body-md sm:text-body-lg opacity-90 mb-md sm:mb-lg">
              Led by Shivam Sharma, Medipath Diagnostics provides top-tier pathology testing and health checkups in Khati Baba, Jhansi with national Redcliffe Labs precision.
            </p>
            <div className="flex flex-wrap items-center gap-md pt-xs">
              <Link to="/booking" className="btn-primary bg-[#E31837] hover:bg-red-700 text-white shrink-0">
                Book a Test
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link to="/contact" className="btn-outline border-white/40 text-white hover:bg-white/10 shrink-0">
                Contact Us
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:grid grid-cols-2 gap-md"
          >
            {[{ v: '50K+', l: 'Tests Completed' }, { v: 'Mon-Sun', l: '7AM – 8PM Open' }, { v: '200+', l: 'Tests Available' }, { v: '100%', l: 'Accurate Reports' }].map(({ v, l }) => (
              <div key={l} className="bg-on-primary/10 rounded-2xl p-lg text-center backdrop-blur-md">
                <p className="text-display-lg-mobile font-bold text-white">{v}</p>
                <p className="text-label-md opacity-80 text-white">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Mission */}
      <section className="py-xxl px-lg bg-surface">
        <div className="max-w-[1280px] mx-auto text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <p className="text-primary font-label-md uppercase tracking-widest mb-xs">Our Commitment</p>
            <h2 className="text-headline-lg font-bold text-on-surface mb-lg">Fast, Accurate & Affordable Diagnostics for Every Household in Jhansi.</h2>
            <p className="text-body-lg text-on-surface-variant">
              Located conveniently in front of Kalyan Petrol Pump, Khati Baba, Medipath Diagnostics combines cutting-edge laboratory technology with warm local care to make health testing accessible to all.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust & Quality Pillars */}
      <section className="py-xxl px-lg bg-surface-bright">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-xl">
            <p className="text-primary font-label-md uppercase tracking-widest mb-xs">Quality Pillars</p>
            <h2 className="text-headline-lg font-bold text-on-surface">Why Trust Medipath Diagnostics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {values.map(({ icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-white rounded-2xl p-lg shadow-clinical hover-lift border border-outline-variant/30 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center text-primary mx-auto mb-md">
                  <span className="material-symbols-outlined text-[28px]">{icon}</span>
                </div>
                <h3 className="font-bold text-headline-sm mb-sm text-on-surface">{title}</h3>
                <p className="text-body-md text-on-surface-variant">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Leadership */}
      <section className="py-xxl px-lg bg-surface">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-xl">
            <p className="text-primary font-label-md uppercase tracking-widest mb-xs">Our Leadership & Staff</p>
            <h2 className="text-headline-lg font-bold text-on-surface">Dedicated Healthcare Professionals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {team.map(({ name, role, qual, icon }, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-surface-container-lowest rounded-2xl p-lg shadow-clinical hover-lift border border-outline-variant/30 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center text-[40px] mx-auto mb-md">{icon}</div>
                <h3 className="font-bold text-headline-sm text-on-surface">{name}</h3>
                <p className="text-primary font-label-md mt-xs">{role}</p>
                <p className="text-label-sm text-on-surface-variant mt-xs">{qual}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
