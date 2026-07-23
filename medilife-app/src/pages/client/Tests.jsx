import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const categories = ['All', 'Blood Tests', 'Urine Tests', 'Hormones', 'Thyroid', 'Diabetes', 'Heart', 'Liver', 'Kidney']

const tests = [
  { name: 'Complete Blood Count (CBC)', cat: 'Blood Tests', price: 299, time: '4h', popular: true, desc: 'Evaluates overall health and detects a wide range of disorders including anemia and infection.' },
  { name: 'Lipid Profile', cat: 'Blood Tests', price: 499, time: '4h', popular: true, desc: 'Measures cholesterol levels and triglycerides to assess cardiovascular risk.' },
  { name: 'Blood Glucose Fasting', cat: 'Diabetes', price: 149, time: '2h', popular: false, desc: 'Measures blood sugar levels after overnight fasting.' },
  { name: 'HbA1c (Glycated Haemoglobin)', cat: 'Diabetes', price: 399, time: '6h', popular: false, desc: 'Measures average blood sugar control over the past 2-3 months.' },
  { name: 'Thyroid Function Test (TFT)', cat: 'Thyroid', price: 599, time: '6h', popular: true, desc: 'Evaluates thyroid gland performance via T3, T4, and TSH levels.' },
  { name: 'T3, T4, TSH', cat: 'Thyroid', price: 449, time: '6h', popular: false, desc: 'Comprehensive hormonal panel checking thyroid activity.' },
  { name: 'Liver Function Test (LFT)', cat: 'Liver', price: 549, time: '4h', popular: false, desc: 'Checks liver enzymes, proteins, and bilirubin levels.' },
  { name: 'Kidney Function Test (KFT)', cat: 'Kidney', price: 549, time: '4h', popular: false, desc: 'Evaluates renal health via creatinine, urea, and electrolytes.' },
  { name: 'Testosterone (Total)', cat: 'Hormones', price: 699, time: '24h', popular: false, desc: 'Assesses total testosterone hormone levels.' },
  { name: 'Oestradiol (E2)', cat: 'Hormones', price: 699, time: '24h', popular: false, desc: 'Measures key estrogen hormone levels.' },
  { name: 'Urine Routine & Microscopy', cat: 'Urine Tests', price: 149, time: '2h', popular: false, desc: 'Screens for urinary tract infections, kidney disease, and diabetes.' },
  { name: 'Cardiac Risk Markers', cat: 'Heart', price: 999, time: '6h', popular: true, desc: 'Advanced biomarkers assessing heart health and cardiac risk.' },
]

export default function Tests() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = tests.filter((t) => {
    const matchCat = activeCategory === 'All' || t.cat === activeCategory
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                        t.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleBookTest = (testName) => {
    navigate('/booking', { state: { selectedItem: testName } })
  }

  return (
    <PageTransition>
      {/* Header */}
      <div className="bg-primary pt-24 pb-xl sm:py-xxl px-md sm:px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-xs px-md py-xs bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider mb-sm">
              <span className="material-symbols-outlined text-[16px] text-[#E31837]">verified</span>
              <span>Redcliffe Labs Certified Diagnostics</span>
            </div>
            <h1 className="text-[28px] sm:text-display-lg-mobile font-bold mb-md">Individual Pathology Tests</h1>
            <p className="text-body-md sm:text-body-lg opacity-90 max-w-lg mb-xl">Browse individual diagnostic tests with fast report turnarounds and free home sample collection in Jhansi.</p>
            {/* Search */}
            <div className="relative max-w-lg">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-primary/60">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tests, e.g. Thyroid, CBC, Glucose..."
                className="w-full pl-12 pr-md py-sm bg-white/15 border border-white/20 rounded-xl text-on-primary placeholder:text-on-primary/50 focus:outline-none focus:bg-white/25 transition-all font-body-md"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-md sm:px-lg py-xl">
        {/* Category tabs */}
        <div className="flex gap-sm overflow-x-auto pb-sm mb-xl scrollbar-hide">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`relative shrink-0 px-md py-sm rounded-full font-label-md text-label-md transition-colors duration-200 ${
                  isActive ? 'text-on-primary font-bold' : 'bg-surface-container-low text-on-surface-variant hover:bg-secondary-container hover:text-primary'
                }`}
              >
                <span className="relative z-10">{cat}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryPillTests"
                    className="absolute inset-0 bg-primary rounded-full shadow-clinical"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-label-md text-on-surface-variant mb-lg font-semibold">{filtered.length} tests available</p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {filtered.map((test, i) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30 shadow-clinical hover-lift flex flex-col justify-between gap-md"
            >
              <div>
                <div className="flex justify-between items-start mb-xs">
                  <h3 className="font-bold text-headline-sm text-on-surface leading-tight">{test.name}</h3>
                  {test.popular && (
                    <span className="badge badge-success shrink-0 ml-xs">Popular</span>
                  )}
                </div>
                <div className="flex items-center gap-xs mb-sm">
                  <span className="badge-primary inline-flex">{test.cat}</span>
                  <span className="text-xs text-on-surface-variant flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {test.time} turnaround
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant line-clamp-2">{test.desc}</p>
              </div>

              <div className="pt-md border-t border-outline-variant/30 flex items-center justify-between gap-md">
                <div>
                  <span className="text-[10px] uppercase text-on-surface-variant font-bold tracking-wider block">Price</span>
                  <span className="font-bold text-primary text-headline-sm">₹{test.price}/-</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleBookTest(test.name)}
                  className="btn-primary text-xs py-xs px-md gap-xs bg-primary hover:bg-[#E31837] text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                  Book Test
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-xxl">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '64px' }}>search_off</span>
            <p className="text-headline-md text-on-surface-variant mt-md">No tests found for "{search}"</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All') }} className="mt-md btn-outline">Clear filters</button>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
