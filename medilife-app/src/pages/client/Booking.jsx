import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const steps = ['Select Tests', 'Collection Method', 'Schedule', 'Patient Details', 'Confirm']

const sampleTests = [
  { name: 'Complete Blood Count (CBC)', price: 299 },
  { name: 'Lipid Profile', price: 499 },
  { name: 'Thyroid Function Test', price: 599 },
  { name: 'Blood Glucose Fasting', price: 149 },
  { name: 'Liver Function Test', price: 549 },
  { name: 'Kidney Function Test', price: 549 },
]

export default function Booking() {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState([])
  const [collection, setCollection] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const toggle = (name) =>
    setSelected((prev) => prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name])

  const total = sampleTests.filter((t) => selected.includes(t.name)).reduce((a, t) => a + t.price, 0)

  if (submitted) {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-lg py-xxl text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14 }}
            className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-xl"
          >
            <span className="material-symbols-outlined text-emerald-600 icon-fill" style={{ fontSize: '56px' }}>check_circle</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="text-headline-lg font-bold text-on-surface mb-md">Booking Confirmed!</h1>
            <p className="text-body-lg text-on-surface-variant mb-sm">Booking ID: <span className="font-mono font-bold text-primary">#ML-{Math.random().toString(36).slice(2, 8).toUpperCase()}</span></p>
            <p className="text-body-md text-on-surface-variant max-w-md mx-auto mb-xl">You'll receive a confirmation on WhatsApp & email. Our team will contact you to confirm the collection time.</p>
            <div className="flex gap-md justify-center flex-wrap">
              <Link to="/" className="btn-primary">Back to Home</Link>
              <Link to="/portal" className="btn-outline">View Portal</Link>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="bg-primary py-xl px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto">
          <h1 className="text-display-lg-mobile font-bold mb-lg">Book a Test</h1>
          {/* Progress Steps */}
          <div className="flex items-center gap-xs overflow-x-auto pb-sm">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-xs shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${i <= step ? 'bg-on-primary text-primary' : 'bg-on-primary/20 text-on-primary/60'}`}>
                  {i < step ? <span className="material-symbols-outlined text-[16px]">check</span> : i + 1}
                </div>
                <span className={`text-label-sm hidden sm:block ${i <= step ? 'text-on-primary font-bold' : 'text-on-primary/60'}`}>{s}</span>
                {i < steps.length - 1 && <div className={`h-0.5 w-8 rounded ${i < step ? 'bg-on-primary' : 'bg-on-primary/20'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-lg py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Main step content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

                {step === 0 && (
                  <div className="space-y-md">
                    <h2 className="text-headline-md font-bold text-on-surface">Select Your Tests</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                      {sampleTests.map((t) => (
                        <button key={t.name} onClick={() => toggle(t.name)}
                          className={`p-lg rounded-2xl border-2 text-left transition-all duration-200 ${selected.includes(t.name) ? 'border-primary bg-secondary-container shadow-clinical' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-label-md text-on-surface">{t.name}</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected.includes(t.name) ? 'bg-primary border-primary' : 'border-outline-variant'}`}>
                              {selected.includes(t.name) && <span className="material-symbols-outlined text-on-primary text-[14px]">check</span>}
                            </div>
                          </div>
                          <span className="text-label-md font-bold text-primary mt-sm block">₹{t.price}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-label-sm text-on-surface-variant">
                      <Link to="/tests" className="text-primary underline">Browse all 200+ tests</Link>
                    </p>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-md">
                    <h2 className="text-headline-md font-bold text-on-surface">Collection Method</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                      {[
                        { value: 'home', icon: 'home', title: 'Home Collection', desc: 'Trained phlebotomist visits your home. Free for orders above ₹999.' },
                        { value: 'walkin', icon: 'local_hospital', title: 'Walk-in to Clinic', desc: 'Visit our clinic at your convenience. No wait time with booking.' },
                      ].map(({ value, icon, title, desc }) => (
                        <button key={value} onClick={() => setCollection(value)}
                          className={`p-lg rounded-2xl border-2 text-left transition-all ${collection === value ? 'border-primary bg-secondary-container' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40'}`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary mb-md">
                            <span className="material-symbols-outlined">{icon}</span>
                          </div>
                          <h3 className="font-bold text-on-surface mb-xs">{title}</h3>
                          <p className="text-body-md text-on-surface-variant">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-md">
                    <h2 className="text-headline-md font-bold text-on-surface">Choose a Time Slot</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-sm">
                      {['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'].map((slot) => (
                        <button key={slot} className="py-sm px-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-label-md text-on-surface hover:bg-secondary-container hover:text-primary hover:border-primary transition-all">
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-md">
                    <h2 className="text-headline-md font-bold text-on-surface">Patient Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                      <div><label className="text-label-md text-on-surface-variant mb-xs block">Full Name *</label><input className="input-field" placeholder="Patient name" /></div>
                      <div><label className="text-label-md text-on-surface-variant mb-xs block">Age *</label><input type="number" className="input-field" placeholder="Age" /></div>
                      <div><label className="text-label-md text-on-surface-variant mb-xs block">Gender *</label>
                        <select className="input-field"><option>Male</option><option>Female</option><option>Other</option></select>
                      </div>
                      <div><label className="text-label-md text-on-surface-variant mb-xs block">Phone *</label><input type="tel" className="input-field" placeholder="+91 xxxxxxxxxx" /></div>
                      <div className="sm:col-span-2"><label className="text-label-md text-on-surface-variant mb-xs block">Email</label><input type="email" className="input-field" placeholder="email@example.com" /></div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-md">
                    <h2 className="text-headline-md font-bold text-on-surface">Confirm Booking</h2>
                    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-lg space-y-md">
                      <div className="flex gap-sm items-center">
                        <span className="material-symbols-outlined text-primary">science</span>
                        <span className="font-label-md text-on-surface">Selected Tests: <span className="font-bold">{selected.join(', ') || 'None'}</span></span>
                      </div>
                      <div className="flex gap-sm items-center">
                        <span className="material-symbols-outlined text-primary">{collection === 'home' ? 'home' : 'local_hospital'}</span>
                        <span className="font-label-md text-on-surface">Collection: <span className="font-bold capitalize">{collection || 'Not selected'}</span></span>
                      </div>
                      <div className="border-t border-outline-variant/30 pt-md flex justify-between items-center">
                        <span className="font-bold text-headline-md text-on-surface">Total</span>
                        <span className="font-bold text-headline-md text-primary">₹{total}</span>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            <div className="flex gap-md mt-xl">
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} className="btn-outline">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back
                </button>
              )}
              {step < steps.length - 1 ? (
                <button onClick={() => setStep((s) => s + 1)} className="btn-primary ml-auto"
                  disabled={step === 0 && selected.length === 0}
                >
                  Next
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button onClick={() => setSubmitted(true)} className="btn-primary ml-auto bg-emerald-600 hover:opacity-90">
                  Confirm Booking
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>
              )}
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-clinical p-lg">
              <h3 className="font-bold text-headline-sm text-on-surface mb-md">Order Summary</h3>
              {selected.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">No tests selected yet.</p>
              ) : (
                <div className="space-y-sm">
                  {sampleTests.filter((t) => selected.includes(t.name)).map((t) => (
                    <div key={t.name} className="flex justify-between items-center text-label-md">
                      <span className="text-on-surface">{t.name}</span>
                      <span className="font-bold text-primary">₹{t.price}</span>
                    </div>
                  ))}
                  <div className="border-t border-outline-variant/30 pt-sm flex justify-between font-bold text-headline-sm">
                    <span className="text-on-surface">Total</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
