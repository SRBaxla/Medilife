import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const faqs = [
  { q: 'How do I download my report?', a: 'Go to Reports page, expand the report, and click "Download PDF". The report will be downloaded to your device.' },
  { q: 'Can I share my report with my doctor?', a: 'Yes! In the Reports page, click "Share" and enter your doctor\'s email address. They\'ll receive a secure link.' },
  { q: 'How long does home collection take?', a: 'Our phlebotomist typically arrives within 30–45 minutes of the scheduled time. You\'ll get an SMS when they\'re on their way.' },
  { q: 'When will my results be ready?', a: 'Most routine tests are available within 4–6 hours. Specialised tests like hormones may take up to 24 hours.' },
  { q: 'Can I reschedule my appointment?', a: 'Yes, you can reschedule up to 2 hours before your appointment. Go to Dashboard > Upcoming Tests and click the options menu.' },
  { q: 'Is my health data secure?', a: 'Absolutely. All your data is encrypted using AES-256 and stored on ISO 27001-certified servers. We never share your data without consent.' },
]

export default function Help() {
  const [openFaq, setOpenFaq] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Help & Support</h1>
          <p className="text-body-md text-on-surface-variant">Find answers and get in touch with our team.</p>
        </div>

        {/* Quick Help */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {[
            { icon: 'phone', title: 'Call Us', desc: 'Mon–Sat 7AM–9PM', action: '+91 98765 43210', color: 'bg-emerald-50 text-emerald-600' },
            { icon: 'chat', title: 'Live Chat', desc: 'Usually replies in < 5 min', action: 'Start Chat', color: 'bg-blue-50 text-blue-600' },
            { icon: 'mail', title: 'Email Support', desc: 'Response within 24h', action: 'care@medilife.in', color: 'bg-purple-50 text-purple-600' },
          ].map(({ icon, title, desc, action, color }) => (
            <motion.button key={title} whileHover={{ y: -3 }} onClick={() => title === 'Live Chat' && setChatOpen(true)}
              className="card card-hover p-lg text-left flex flex-col items-start gap-md w-full"
            >
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                <span className="material-symbols-outlined">{icon}</span>
              </div>
              <div>
                <h3 className="font-bold text-headline-sm text-on-surface">{title}</h3>
                <p className="text-label-sm text-on-surface-variant">{desc}</p>
                <p className="text-primary font-bold text-label-md mt-xs">{action}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* FAQs */}
        <div className="card p-lg">
          <h2 className="text-headline-md font-bold text-on-surface mb-lg">Frequently Asked Questions</h2>
          <div className="space-y-sm">
            {faqs.map(({ q, a }, i) => (
              <div key={q} className="border border-outline-variant/30 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-md text-left hover:bg-surface-container-low transition-colors gap-md"
                >
                  <span className="font-medium text-label-md text-on-surface">{q}</span>
                  <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <p className="px-md pb-md text-body-md text-on-surface-variant">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Widget */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-80 bg-surface-container-lowest rounded-2xl shadow-clinical-xl border border-outline-variant/30 z-50 overflow-hidden"
            >
              <div className="bg-primary text-on-primary p-md flex justify-between items-center">
                <div className="flex items-center gap-sm">
                  <div className="w-8 h-8 rounded-full bg-on-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">support_agent</span>
                  </div>
                  <div>
                    <p className="font-bold text-label-md">Medilife Support</p>
                    <p className="text-[10px] opacity-80">🟢 Online</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-on-primary/70 hover:text-on-primary">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-md h-48 flex flex-col justify-end gap-sm">
                <div className="bg-secondary-container text-on-surface rounded-2xl rounded-tl-sm p-sm text-label-md max-w-[80%]">
                  Hi John! How can we help you today? 😊
                </div>
              </div>
              <div className="p-md border-t border-outline-variant/30 flex gap-sm">
                <input className="input-field text-[13px] py-xs flex-1" placeholder="Type a message…" />
                <button className="p-sm bg-primary text-on-primary rounded-xl hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat FAB */}
        {!chatOpen && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setChatOpen(true)}
            className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-clinical-xl flex items-center justify-center z-40"
          >
            <span className="material-symbols-outlined">chat</span>
          </motion.button>
        )}
      </div>
    </PageTransition>
  )
}
