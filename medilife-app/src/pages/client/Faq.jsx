import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageTransition from '../../components/common/PageTransition'

const faqCategories = [
  { id: 'general', label: 'General & Booking' },
  { id: 'collection', label: 'Home Sample Collection' },
  { id: 'reports', label: 'Reports & Results' },
  { id: 'prep', label: 'Test Preparation' },
]

const faqs = [
  {
    cat: 'general',
    q: 'What are the operating hours of Medipath Diagnostics in Jhansi?',
    a: 'We are open Monday to Sunday, from 7:00 AM to 8:00 PM. Our center is located In Front of Kalyan Petrol Pump, Khati Baba, Jhansi, UP - 284003.'
  },
  {
    cat: 'general',
    q: 'Is Medipath Diagnostics affiliated with Redcliffe Labs?',
    a: 'Yes, Medipath Diagnostics (Franchise Owner: Shivam Sharma) is an Authorised Collection Center for Redcliffe Labs, adhering to strict NABL-standard quality controls and automated testing equipment.'
  },
  {
    cat: 'collection',
    q: 'How does free home sample collection work?',
    a: 'You can book a test or package online or call us at +91 8299487062. Our trained phlebotomist visits your home anywhere in Jhansi at your preferred time slot to collect blood or urine samples safely.'
  },
  {
    cat: 'collection',
    q: 'Are there any extra charges for home sample collection?',
    a: 'Home collection is FREE for orders above the minimum threshold (Terms & Conditions apply). For smaller test orders, a minimal nominal distance fee may apply.'
  },
  {
    cat: 'reports',
    q: 'How long does it take to receive my diagnostic report?',
    a: 'Routine blood tests (CBC, Glucose, Lipid, LFT, KFT) are delivered within 4 to 6 hours. Specialized hormonal or antibody panels are delivered within 24 hours.'
  },
  {
    cat: 'reports',
    q: 'How will I receive my pathology test reports?',
    a: 'Reports are sent directly to your registered phone number via WhatsApp PDF, emailed to you, and logged into your online Patient Portal for easy lifetime access.'
  },
  {
    cat: 'prep',
    q: 'Do I need to fast before a blood test or health checkup?',
    a: 'For Fasting Blood Glucose, Lipid Profile, and Full Body Health Checkups (BharatFit packages), 8 to 12 hours of overnight fasting is recommended. Water is permitted.'
  },
  {
    cat: 'prep',
    q: 'Can I cancel or reschedule my booking slot?',
    a: 'Yes, you can reschedule or cancel your sample collection slot anytime up to 1 hour before the scheduled time by calling +91 8299487062 or contacting us online.'
  }
]

export default function Faq() {
  const [activeCat, setActiveCat] = useState('general')
  const [openIdx, setOpenIdx] = useState(null)
  const [search, setSearch] = useState('')

  const filteredFaqs = faqs.filter((f) => {
    const matchCat = activeCat === 'all' || f.cat === activeCat
    const matchSearch = f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <PageTransition>
      {/* Header */}
      <div className="bg-primary pt-24 pb-xl sm:py-xxl px-md sm:px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-xs px-md py-xs bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider mb-sm">
              <span className="material-symbols-outlined text-[16px] text-[#E31837]">help</span>
              <span>Frequently Asked Questions</span>
            </div>
            <h1 className="text-[28px] sm:text-display-lg-mobile font-bold mb-sm">How Can We Help You?</h1>
            <p className="text-body-md sm:text-body-lg opacity-90 max-w-xl mx-auto mb-xl">Find answers about pathology tests, home sample collection in Jhansi, report turnarounds, and preparation.</p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-primary/60">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search FAQs e.g. Home collection, Fasting, Reports..."
                className="w-full pl-12 pr-md py-sm bg-white/15 border border-white/20 rounded-xl text-on-primary placeholder:text-on-primary/50 focus:outline-none focus:bg-white/25 transition-all font-body-md"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main FAQ Section */}
      <div className="max-w-[960px] mx-auto px-md sm:px-lg py-xl sm:py-xxl">
        {/* Categories */}
        <div className="flex gap-sm overflow-x-auto pb-sm mb-xl justify-center scrollbar-hide">
          {faqCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`shrink-0 px-md py-xs rounded-full text-xs font-semibold transition-all ${
                activeCat === c.id
                  ? 'bg-primary text-white shadow-clinical'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-secondary-container'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Accordions */}
        <div className="space-y-md">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={faq.q}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-clinical transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-lg text-left flex justify-between items-center gap-md hover:bg-surface-container-low/40 transition-colors"
                >
                  <span className="font-bold text-body-lg text-on-surface">{faq.q}</span>
                  <span className="material-symbols-outlined text-primary shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-lg pb-lg text-body-md text-on-surface-variant border-t border-outline-variant/20 pt-sm leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Contact Strip */}
        <div className="mt-xxl p-xl bg-secondary-container rounded-3xl text-center space-y-md border border-primary/20">
          <h3 className="font-bold text-headline-sm text-primary">Still Have Questions?</h3>
          <p className="text-body-md text-on-surface-variant max-w-md mx-auto">Call our Jhansi pathology center directly to speak with Shivam Sharma or our phlebotomy team.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-md">
            <a href="tel:+918299487062" className="btn-primary bg-primary text-white justify-center">
              <span className="material-symbols-outlined text-[18px] text-[#E31837]">call</span>
              Call +91 8299487062
            </a>
            <Link to="/contact" className="btn-outline justify-center">
              Contact Center
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
