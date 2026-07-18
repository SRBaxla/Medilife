import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const packages = [
  {
    name: 'Basic Health Checkup',
    badge: 'Most Popular',
    badgeColor: 'badge-success',
    price: 999,
    tests: ['CBC', 'Blood Glucose', 'Urine Routine', 'Lipid Profile'],
    color: 'from-teal-500 to-cyan-600',
    icon: 'favorite',
  },
  {
    name: 'Comprehensive Wellness',
    badge: 'Best Value',
    badgeColor: 'badge-primary',
    price: 1999,
    tests: ['Everything in Basic', 'Thyroid (TFT)', 'Liver Function', 'Kidney Function', 'Vitamin D & B12'],
    color: 'from-primary to-primary-container',
    icon: 'health_and_safety',
  },
  {
    name: 'Senior Care Package',
    badge: 'For Seniors 60+',
    badgeColor: 'badge-warning',
    price: 2499,
    tests: ['Everything in Comprehensive', 'Bone Density Markers', 'Cardiac Risk Panel', 'Diabetes Management', 'Free Home Collection'],
    color: 'from-violet-500 to-purple-600',
    icon: 'elderly',
  },
  {
    name: "Women's Health Panel",
    badge: "Women's Special",
    badgeColor: 'badge-error',
    price: 1499,
    tests: ['CBC', 'Iron Studies', 'Hormonal Panel', 'Thyroid', 'Pap Smear Guidance'],
    color: 'from-pink-500 to-rose-600',
    icon: 'female',
  },
  {
    name: 'Diabetes Care Profile',
    badge: 'Diabetic Friendly',
    badgeColor: 'badge-warning',
    price: 799,
    tests: ['Fasting Blood Glucose', 'HbA1c', 'Insulin Levels', 'Kidney Function'],
    color: 'from-amber-500 to-orange-500',
    icon: 'glucose',
  },
  {
    name: 'Corporate Fitness Pack',
    badge: 'Corporate',
    badgeColor: 'badge-primary',
    price: 1299,
    tests: ['CBC', 'Lipid Profile', 'Blood Glucose', 'Liver', 'Chest X-Ray Reference', 'ECG Reference'],
    color: 'from-slate-600 to-blue-700',
    icon: 'corporate_fare',
  },
]

export default function Packages() {
  return (
    <PageTransition>
      <div className="bg-primary py-xxl px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-label-md uppercase tracking-widest opacity-80 mb-xs">Health Packages</p>
            <h1 className="text-display-lg-mobile font-bold mb-sm">Curated Health Packages</h1>
            <p className="text-body-lg opacity-80 max-w-lg">Comprehensive health checkups designed by medical experts for all life stages.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-lg py-xxl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {packages.map(({ name, badge, badgeColor, price, tests, color, icon }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-clinical hover-lift overflow-hidden flex flex-col"
            >
              <div className={`bg-gradient-to-br ${color} p-lg text-white`}>
                <div className="flex justify-between items-start mb-md">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <span className={`badge ${badgeColor}`}>{badge}</span>
                </div>
                <h3 className="text-headline-sm font-bold">{name}</h3>
                <p className="text-display-lg-mobile font-bold mt-sm">₹{price}</p>
              </div>
              <div className="p-lg flex flex-col flex-grow">
                <ul className="space-y-sm flex-grow">
                  {tests.map((t) => (
                    <li key={t} className="flex items-center gap-sm text-body-md text-on-surface">
                      <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <Link to="/booking" className="btn-primary justify-center mt-lg">
                  Book This Package
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
