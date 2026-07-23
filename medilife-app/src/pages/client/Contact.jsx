import { useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <PageTransition>
      <div className="bg-primary pt-24 pb-xl sm:py-xxl px-md sm:px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-xs px-md py-xs bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider mb-sm">
              <span className="material-symbols-outlined text-[16px] text-[#E31837]">verified</span>
              <span>Redcliffe Labs Authorised Collection Center</span>
            </div>
            <h1 className="text-[28px] sm:text-display-lg-mobile font-bold mb-sm">Contact Medipath Diagnostics</h1>
            <p className="text-body-md sm:text-body-lg opacity-90 max-w-lg">Visit our Jhansi lab, call us for home collection, or drop us a message online.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-md sm:px-lg py-xl sm:py-xxl grid grid-cols-1 lg:grid-cols-2 gap-lg lg:gap-xxl">
        {/* Contact Info & Map */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-lg">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface mb-lg">Lab Details & Contact Information</h2>
            <div className="space-y-md">
              {/* Address Card */}
              <div className="flex gap-md p-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-clinical">
                <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[#E31837]">location_on</span>
                </div>
                <div>
                  <p className="font-bold text-label-md text-on-surface">Lab Address</p>
                  <p className="text-body-md font-semibold text-primary mt-xs">Medipath Diagnostics</p>
                  <p className="text-body-md text-on-surface-variant">In Front of Kalyan Petrol Pump, Khati Baba</p>
                  <p className="text-body-md text-on-surface-variant">Jhansi, Uttar Pradesh - 284003</p>
                </div>
              </div>

              {/* Phone Numbers Card */}
              <div className="flex gap-md p-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-clinical">
                <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[#E31837]">call</span>
                </div>
                <div>
                  <p className="font-bold text-label-md text-on-surface">Clickable Phone Helpline</p>
                  <div className="flex flex-col gap-xs mt-xs">
                    <a href="tel:+918299487062" className="text-body-md font-semibold text-primary hover:text-[#E31837] flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px]">phone_enabled</span>
                      +91 8299487062 (Shivam Sharma)
                    </a>
                  </div>
                </div>
              </div>

              {/* Operating Hours Card */}
              <div className="flex gap-md p-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-clinical">
                <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[#E31837]">schedule</span>
                </div>
                <div>
                  <p className="font-bold text-label-md text-on-surface">Operating Hours</p>
                  <p className="text-body-md font-semibold text-emerald-700 mt-xs">Mon - Sun | 7:00 AM - 8:00 PM</p>
                  <p className="text-body-sm text-on-surface-variant">Open All 7 Days a Week for Sample Collection & Walk-ins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="space-y-sm">
            <h3 className="font-bold text-headline-sm text-on-surface">Location Map</h3>
            <div className="w-full h-64 rounded-2xl overflow-hidden shadow-clinical border border-outline-variant/30">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14411.391672322316!2d78.5422896!3d25.443315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397776d4586d6349%3A0x6b447833504fb4!2sKhati%20Baba%2C%20Jhansi%2C%20Uttar%20Pradesh%20284003!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0, borderRadius: '0.5rem' }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Medipath Diagnostics Khati Baba Location"
              ></iframe>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-xl bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-clinical">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-lg"
              >
                <span className="material-symbols-outlined text-emerald-600 icon-fill" style={{ fontSize: '40px' }}>check_circle</span>
              </motion.div>
              <h2 className="text-headline-md font-bold text-on-surface mb-sm">Inquiry Received!</h2>
              <p className="text-body-md text-on-surface-variant mb-lg">Our Medipath Jhansi team will call or reply to you shortly.</p>
              <button onClick={() => setSubmitted(false)} className="btn-outline">Send Another Inquiry</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-md bg-surface-container-lowest p-xl rounded-2xl border border-outline-variant/30 shadow-clinical">
              <h2 className="text-headline-md font-bold text-on-surface mb-lg">Send a Direct Message</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div>
                  <label className="text-label-md text-on-surface-variant mb-xs block">Full Name *</label>
                  <input required className="input-field" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant mb-xs block">Phone Number *</label>
                  <input required type="tel" className="input-field" placeholder="+91 xxxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant mb-xs block">Email Address</label>
                <input type="email" className="input-field" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant mb-xs block">Subject *</label>
                <select required className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                  <option value="">Select an inquiry type</option>
                  <option>Free Home Sample Collection</option>
                  <option>Book a Health Checkup Package</option>
                  <option>Report Status / Query</option>
                  <option>General Inquiry</option>
                </select>
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant mb-xs block">Message / Address for Home Collection</label>
                <textarea required rows={4} className="input-field resize-none" placeholder="Your message or home address in Jhansi..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary w-full justify-center">
                Submit Inquiry
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </PageTransition>
  )
}
