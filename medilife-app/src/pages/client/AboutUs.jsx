import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageTransition from '../../components/common/PageTransition'

const team = [
  { name: 'Dr. Aisha Patel', role: 'Chief Pathologist', qual: 'MD Pathology, AIIMS Delhi', icon: '👩‍⚕️' },
  { name: 'Dr. Rajan Mehta', role: 'Lab Director', qual: 'MD Microbiology, MAMC', icon: '👨‍⚕️' },
  { name: 'Ms. Sunita Gupta', role: 'Lead Technician', qual: 'DMLT, 10 years experience', icon: '👩‍🔬' },
  { name: 'Mr. Amit Sharma', role: 'Operations Head', qual: 'MBA Healthcare Management', icon: '👨‍💼' },
]

const values = [
  { icon: 'verified', title: 'Accuracy First', desc: 'Every result undergoes double-blind verification before release.' },
  { icon: 'favorite', title: 'Patient-Centric', desc: 'We design every service around what matters most to our patients.' },
  { icon: 'groups', title: 'Community Rooted', desc: 'Serving families in our community for over 12 years.' },
  { icon: 'science', title: 'Innovation Led', desc: 'Latest diagnostics technology paired with experienced medical minds.' },
]

export default function AboutUs() {
  return (
    <PageTransition>
      {/* Hero */}
      <div className="bg-primary py-xxl px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-label-md uppercase tracking-widest opacity-80 mb-xs">About Us</p>
            <h1 className="text-display-lg-mobile font-bold mb-lg">Science, Care & Community.</h1>
            <p className="text-body-lg opacity-90 mb-lg">Founded in 2012, Medilife Pathology has served thousands of families with accurate, affordable, and compassionate diagnostic services.</p>
            <div className="flex gap-md">
              <Link to="/booking" className="px-xl py-sm bg-on-primary text-primary rounded-xl font-label-md hover:bg-on-primary/90 transition-all flex items-center gap-sm">
                Book a Test <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link to="/contact" className="px-xl py-sm border border-on-primary/30 text-on-primary rounded-xl font-label-md hover:bg-on-primary/10 transition-all">Contact Us</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:grid grid-cols-2 gap-md"
          >
            {[{ v: '12+', l: 'Years Serving' }, { v: '15K+', l: 'Patients Served' }, { v: '200+', l: 'Tests Available' }, { v: '4 Hrs', l: 'Report Time' }].map(({ v, l }) => (
              <div key={l} className="bg-on-primary/10 rounded-2xl p-lg text-center">
                <p className="text-display-lg-mobile font-bold">{v}</p>
                <p className="text-label-md opacity-80">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Mission */}
      <section className="py-xxl px-lg bg-surface">
        <div className="max-w-[1280px] mx-auto text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <p className="text-primary font-label-md uppercase tracking-widest mb-xs">Our Mission</p>
            <h2 className="text-headline-lg font-bold text-on-surface mb-lg">Accurate diagnostics should be accessible to everyone.</h2>
            <p className="text-body-lg text-on-surface-variant">We believe that world-class laboratory services shouldn't be a privilege. Our mission is to make precise, affordable, and timely diagnostics available to every family in our community.</p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-xxl px-lg bg-surface-bright">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-xl">
            <p className="text-primary font-label-md uppercase tracking-widest mb-xs">Our Values</p>
            <h2 className="text-headline-lg font-bold text-on-surface">What We Stand For</h2>
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

      {/* Team */}
      <section className="py-xxl px-lg bg-surface">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-xl">
            <p className="text-primary font-label-md uppercase tracking-widest mb-xs">Our Team</p>
            <h2 className="text-headline-lg font-bold text-on-surface">The Experts Behind Your Results</h2>
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
