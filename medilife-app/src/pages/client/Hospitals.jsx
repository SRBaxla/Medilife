import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '../../components/common/PageTransition'

export default function Hospitals() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    hospitalName: '',
    contactPerson: '',
    phone: '',
    email: '',
    serviceType: 'Hospital Sample Outsourcing',
    details: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const features = [
    { icon: 'local_hospital', title: 'Hospital Sample Outsourcing', desc: 'Outsource daily pathology tests to Medipath Diagnostics with Redcliffe quality & accuracy.' },
    { icon: 'bolt', title: 'Priority Emergency Processing', desc: 'Fast turnaround reports delivered in 4–6 hours directly to your clinical desk.' },
    { icon: 'directions_car', title: 'Dedicated Daily Pickups', desc: 'Our phlebotomist team visits your hospital or clinic twice daily for sample pick-up.' },
    { icon: 'request_quote', title: 'Institutional B2B Pricing', desc: 'Customized wholesale rates for partner hospitals, nursing homes, and doctor clinics.' },
  ]

  return (
    <PageTransition>
      {/* Header */}
      <div className="bg-primary pt-24 pb-xl sm:py-xxl px-md sm:px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-xs px-md py-xs bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider mb-sm">
              <span className="material-symbols-outlined text-[16px] text-[#E31837]">verified</span>
              <span>Redcliffe Labs B2B Hospital & Clinic Network</span>
            </div>
            <h1 className="text-[28px] sm:text-display-lg-mobile font-bold mb-sm">Hospital & Clinic Diagnostic Services</h1>
            <p className="text-body-md sm:text-body-lg opacity-90 max-w-2xl">
              Partner with Medipath Diagnostics in Jhansi for bulk patient test bookings, hospital sample collection, and doctor panel tie-ups.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-[1280px] mx-auto px-md sm:px-lg py-xl sm:py-xxl grid grid-cols-1 lg:grid-cols-2 gap-lg lg:gap-xxl">
        {/* Left Column: B2B Features & Quick Links */}
        <div className="space-y-lg">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface mb-md">Why Hospitals & Doctors Partner With Us</h2>
            <p className="text-body-md text-on-surface-variant mb-lg">
              Medipath Diagnostics (Redcliffe Labs Authorised Center) acts as an extended pathology wing for healthcare providers across Jhansi, offering reliable results and automated digital report dispatches.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              {features.map(({ icon, title, desc }) => (
                <div key={title} className="p-md bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-clinical flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center text-primary mb-sm">
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <h3 className="font-bold text-body-md text-on-surface mb-xs">{title}</h3>
                    <p className="text-body-sm text-on-surface-variant">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Direct Actions for Doctors */}
          <div className="p-lg bg-gradient-to-br from-primary to-primary-container rounded-3xl text-white space-y-md shadow-clinical-lg">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-[#E31837] text-[28px]">phone_in_talk</span>
              <div>
                <h3 className="font-bold text-headline-sm">Instant Hospital Helpline</h3>
                <p className="text-xs opacity-80">Direct line to Shivam Sharma for urgent hospital sample pickups</p>
              </div>
            </div>
            <a
              href="tel:+918299487062"
              className="inline-flex items-center gap-xs px-lg py-sm bg-white text-primary rounded-xl font-bold hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#E31837]">call</span>
              Call +91 8299487062
            </a>
          </div>
        </div>

        {/* Right Column: Hospital Test Booking & Tie-up Form */}
        <div>
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-xl bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-clinical">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-lg"
              >
                <span className="material-symbols-outlined text-emerald-600 icon-fill" style={{ fontSize: '40px' }}>check_circle</span>
              </motion.div>
              <h2 className="text-headline-md font-bold text-on-surface mb-sm">Hospital Request Received!</h2>
              <p className="text-body-md text-on-surface-variant mb-lg">Our Jhansi lab manager will contact your hospital/clinic within 1 hour.</p>
              <button onClick={() => setSubmitted(false)} className="btn-outline">Submit Another Request</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-md bg-surface-container-lowest p-xl rounded-2xl border border-outline-variant/30 shadow-clinical">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[28px]">medical_services</span>
                <div>
                  <h2 className="text-headline-md font-bold text-on-surface">Book Tests for Hospital / Clinic</h2>
                  <p className="text-body-sm text-on-surface-variant">Request bulk test booking or diagnostic tie-up</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div>
                  <label className="text-label-md text-on-surface-variant mb-xs block">Hospital / Clinic Name *</label>
                  <input required className="input-field" placeholder="e.g. City Care Hospital" value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant mb-xs block">Doctor / Contact Person *</label>
                  <input required className="input-field" placeholder="Doctor or Admin name" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div>
                  <label className="text-label-md text-on-surface-variant mb-xs block">Phone Number *</label>
                  <input required type="tel" className="input-field" placeholder="+91 xxxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant mb-xs block">Email Address</label>
                  <input type="email" className="input-field" placeholder="hospital@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="text-label-md text-on-surface-variant mb-xs block">Request Category *</label>
                <select required className="input-field" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
                  <option>Hospital Sample Outsourcing</option>
                  <option>Bulk Inpatient / Outpatient Test Booking</option>
                  <option>Doctor Panel Diagnostic Tie-Up</option>
                  <option>Daily Phlebotomist Pickup Schedule</option>
                </select>
              </div>

              <div>
                <label className="text-label-md text-on-surface-variant mb-xs block">Test Requirements / Patient Details</label>
                <textarea required rows={4} className="input-field resize-none" placeholder="List required tests (e.g. CBC, LFT, KFT for 5 patients)..." value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
              </div>

              <div className="pt-xs flex flex-col sm:flex-row gap-md">
                <button type="submit" className="btn-primary flex-1 justify-center bg-primary text-white">
                  Submit Hospital Booking
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate('/booking', { state: { selectedItem: 'Hospital Bulk Order' } })} 
                  className="btn-outline justify-center"
                >
                  Direct Patient Booking
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
