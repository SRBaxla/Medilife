import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const categories = ['All', 'Blood Tests', 'Urine Tests', 'Hormones', 'Thyroid', 'Diabetes', 'Heart', 'Liver', 'Kidney']

const tests = [
  { name: 'Complete Blood Count (CBC)', cat: 'Blood Tests', price: 299, time: '4h', popular: true },
  { name: 'Lipid Profile', cat: 'Blood Tests', price: 499, time: '4h', popular: true },
  { name: 'Blood Glucose Fasting', cat: 'Diabetes', price: 149, time: '2h', popular: false },
  { name: 'HbA1c (Glycated Haemoglobin)', cat: 'Diabetes', price: 399, time: '6h', popular: false },
  { name: 'Thyroid Function Test (TFT)', cat: 'Thyroid', price: 599, time: '6h', popular: true },
  { name: 'T3, T4, TSH', cat: 'Thyroid', price: 449, time: '6h', popular: false },
  { name: 'Liver Function Test (LFT)', cat: 'Liver', price: 549, time: '4h', popular: false },
  { name: 'Kidney Function Test (KFT)', cat: 'Kidney', price: 549, time: '4h', popular: false },
  { name: 'Testosterone (Total)', cat: 'Hormones', price: 699, time: '24h', popular: false },
  { name: 'Oestradiol (E2)', cat: 'Hormones', price: 699, time: '24h', popular: false },
  { name: 'Urine Routine & Microscopy', cat: 'Urine Tests', price: 149, time: '2h', popular: false },
  { name: 'Cardiac Risk Markers', cat: 'Heart', price: 999, time: '6h', popular: true },
]

export default function Tests() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = tests.filter((t) => {
    const matchCat = activeCategory === 'All' || t.cat === activeCategory
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <PageTransition>
      {/* Header */}
      <div className="bg-primary py-xxl px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-label-md uppercase tracking-widest opacity-80 mb-xs">Our Tests</p>
            <h1 className="text-display-lg-mobile font-bold mb-md">Find Your Test</h1>
            <p className="text-body-lg opacity-80 max-w-lg mb-xl">200+ tests available. Book online, collect from home or walk in.</p>
            {/* Search */}
            <div className="relative max-w-lg">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-primary/60">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tests, e.g. Thyroid, CBC..."
                className="w-full pl-12 pr-md py-sm bg-white/15 border border-white/20 rounded-xl text-on-primary placeholder:text-on-primary/50 focus:outline-none focus:bg-white/25 transition-all font-body-md"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-lg py-xl">
        {/* Category tabs */}
        <div className="flex gap-sm overflow-x-auto pb-sm mb-xl scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-md py-sm rounded-full font-label-md text-label-md transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary shadow-clinical'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-secondary-container hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-label-md text-on-surface-variant mb-lg">{filtered.length} tests found</p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {filtered.map((test, i) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30 shadow-clinical hover-lift flex flex-col gap-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-headline-sm text-on-surface">{test.name}</h3>
                  <span className="badge-primary mt-xs inline-flex">{test.cat}</span>
                </div>
                {test.popular && (
                  <span className="badge badge-success">Popular</span>
                )}
              </div>
              <div className="flex items-center gap-md pt-md border-t border-outline-variant/30">
                <div className="flex items-center gap-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span className="text-label-sm">{test.time} results</span>
                </div>
                <div className="ml-auto font-bold text-primary text-headline-sm">₹{test.price}</div>
                <Link to="/booking" className="p-sm rounded-xl bg-primary text-on-primary hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                </Link>
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
