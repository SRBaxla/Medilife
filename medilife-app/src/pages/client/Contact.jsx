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
      <div className="bg-primary py-xxl px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-label-md uppercase tracking-widest opacity-80 mb-xs">Contact Us</p>
            <h1 className="text-display-lg-mobile font-bold mb-sm">We're Here to Help</h1>
            <p className="text-body-lg opacity-80 max-w-lg">Reach out for report queries, bookings, or any assistance.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-lg py-xxl grid grid-cols-1 lg:grid-cols-2 gap-xxl">
        {/* Contact Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-lg">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface mb-lg">Get in Touch</h2>
            <div className="space-y-md">
              {[
                { icon: 'location_on', title: 'Visit Us', lines: ['123 Clinic Road, Medical District', 'New Delhi — 110001'] },
                { icon: 'phone', title: 'Call Us', lines: ['+91 98765 43210', 'Mon–Sat: 7AM – 9PM'] },
                { icon: 'mail', title: 'Email Us', lines: ['care@medilife.in', 'reports@medilife.in'] },
                { icon: 'schedule', title: 'Working Hours', lines: ['Monday – Saturday: 7AM – 9PM', 'Sunday: 8AM – 2PM (Collection only)'] },
              ].map(({ icon, title, lines }) => (
                <div key={title} className="flex gap-md p-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-clinical">
                  <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-label-md text-on-surface">{title}</p>
                    {lines.map((l) => <p key={l} className="text-body-md text-on-surface-variant">{l}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-xl bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-lg"
              >
                <span className="material-symbols-outlined text-emerald-600 icon-fill" style={{ fontSize: '40px' }}>check_circle</span>
              </motion.div>
              <h2 className="text-headline-md font-bold text-on-surface mb-sm">Message Sent!</h2>
              <p className="text-body-md text-on-surface-variant mb-lg">We'll get back to you within 24 hours.</p>
              <button onClick={() => setSubmitted(false)} className="btn-outline">Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-md bg-surface-container-lowest p-xl rounded-2xl border border-outline-variant/30 shadow-clinical">
              <h2 className="text-headline-md font-bold text-on-surface mb-lg">Send a Message</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div>
                  <label className="text-label-md text-on-surface-variant mb-xs block">Full Name *</label>
                  <input required className="input-field" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant mb-xs block">Email *</label>
                  <input required type="email" className="input-field" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant mb-xs block">Phone Number</label>
                <input type="tel" className="input-field" placeholder="+91 xxxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant mb-xs block">Subject *</label>
                <select required className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                  <option value="">Select a subject</option>
                  <option>Booking Inquiry</option>
                  <option>Report Query</option>
                  <option>Home Collection</option>
                  <option>Corporate Health</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant mb-xs block">Message *</label>
                <textarea required rows={4} className="input-field resize-none" placeholder="Your message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary w-full justify-center">
                Send Message
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </PageTransition>
  )
}
