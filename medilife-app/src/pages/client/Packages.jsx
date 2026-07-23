import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const redcliffePackages = [
  { id: 1, name: "BharatFit Pro", tests: "Essential Parameters", price: 599, badge: "Budget Friendly", gradient: "bg-gradient-to-r from-green-600 to-emerald-700", icon: "health_and_safety" },
  { id: 2, name: "BharatFit-1", tests: "37 Parameters", price: 899, badge: "Great Deal", gradient: "bg-gradient-to-r from-teal-600 to-cyan-700", icon: "biotech" },
  { id: 3, name: "Basic Health Checkup", tests: "29 Tests", price: 999, badge: "Most Popular", gradient: "bg-gradient-to-r from-blue-700 to-indigo-800", featured: true, icon: "favorite" },
  { id: 4, name: "Advanced Health Checkup", tests: "55 Tests", price: 1599, badge: "Best Value", gradient: "bg-gradient-to-r from-indigo-600 to-blue-700", icon: "clinical_notes" },
  { id: 5, name: "Premium Health Checkup", tests: "80+ Tests", price: 2499, badge: "Comprehensive", gradient: "bg-gradient-to-r from-blue-900 to-violet-900", icon: "workspace_premium" },
  { id: 6, name: "BharatFit Complete", tests: "107-108 Tests", price: 3999, badge: "Most Complete", gradient: "bg-gradient-to-r from-amber-600 to-yellow-700", icon: "shield_with_heart" }
];

export default function Packages() {
  const navigate = useNavigate()

  const handleBookPackage = (packageName) => {
    navigate('/booking', { state: { selectedItem: packageName } })
  }

  return (
    <PageTransition>
      <div className="bg-primary pt-24 pb-xl sm:py-xxl px-md sm:px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-xs px-md py-xs bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider mb-sm">
              <span className="material-symbols-outlined text-[16px] text-[#E31837]">verified</span>
              <span>Redcliffe Labs Authorised Catalog</span>
            </div>
            <h1 className="text-[28px] sm:text-display-lg-mobile font-bold mb-sm">Curated Health Packages</h1>
            <p className="text-body-md sm:text-body-lg opacity-90 max-w-lg">Comprehensive health checkups designed by medical experts for all life stages in Jhansi.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-md sm:px-lg py-xl sm:py-xxl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md sm:gap-lg">
          {redcliffePackages.map(({ id, name, badge, price, tests, gradient, featured, icon }, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`bg-surface-container-lowest rounded-2xl border ${
                featured ? 'border-primary ring-2 ring-primary/20 shadow-clinical-lg' : 'border-outline-variant/30 shadow-clinical'
              } hover-lift overflow-hidden flex flex-col relative`}
            >
              {featured && (
                <div className="bg-[#E31837] text-white text-[10px] font-bold uppercase tracking-widest text-center py-1 font-mono">
                  ★ Recommended Package ★
                </div>
              )}
              <div className={`${gradient} p-lg text-white`}>
                <div className="flex justify-between items-start mb-md">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <span className="px-md py-xs rounded-full bg-white/20 text-white font-label-sm text-xs font-semibold backdrop-blur-md">
                    {badge}
                  </span>
                </div>
                <h3 className="text-headline-sm font-bold">{name}</h3>
                <p className="text-display-lg-mobile font-bold mt-sm">₹{price}/-</p>
              </div>
              <div className="p-lg flex flex-col flex-grow justify-between">
                <div className="space-y-sm mb-lg">
                  <div className="flex items-center gap-sm text-body-md font-semibold text-on-surface">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                    <span>{tests} Included</span>
                  </div>
                  <div className="flex items-center gap-sm text-label-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[18px]">home_health</span>
                    <span>Free Home Sample Collection (T&C Apply)</span>
                  </div>
                  <div className="flex items-center gap-sm text-label-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                    <span>Fast & On-Time Accurate Reports</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBookPackage(name)}
                  className="btn-primary justify-center w-full bg-primary hover:bg-[#E31837] transition-colors"
                >
                  Book Package
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
