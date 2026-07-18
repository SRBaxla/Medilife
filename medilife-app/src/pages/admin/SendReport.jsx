import { useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const reportQueue = [
  { id: 'ML-001', name: 'Priya Mehta', test: 'CBC', date: 'Jul 18, 2026', status: 'ready', email: 'priya@email.com' },
  { id: 'ML-002', name: 'Arjun Singh', test: 'Lipid Profile', date: 'Jul 18, 2026', status: 'pending', email: 'arjun@email.com' },
  { id: 'ML-003', name: 'Rekha Sharma', test: 'TFT', date: 'Jul 18, 2026', status: 'sent', email: 'rekha@email.com' },
  { id: 'ML-004', name: 'Vikram Rao', test: 'CBC', date: 'Jul 17, 2026', status: 'sent', email: 'vikram@email.com' },
  { id: 'ML-005', name: 'Sunita Patel', test: 'KFT', date: 'Jul 18, 2026', status: 'ready', email: 'sunita@email.com' },
]

export default function SendReport() {
  const [reports, setReports] = useState(reportQueue)
  const [sending, setSending] = useState(null)

  const send = (id) => {
    setSending(id)
    setTimeout(() => {
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: 'sent' } : r))
      setSending(null)
    }, 1500)
  }

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-admin-primary">Send Reports</h1>
          <p className="text-admin-on-surface-variant text-body-md">Dispatch patient reports via email, WhatsApp, or SMS.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-md">
          {[
            { label: 'Ready to Send', value: reports.filter((r) => r.status === 'ready').length, color: 'text-amber-400' },
            { label: 'Pending', value: reports.filter((r) => r.status === 'pending').length, color: 'text-red-400' },
            { label: 'Sent Today', value: reports.filter((r) => r.status === 'sent').length, color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card-admin p-lg text-center">
              <p className={`text-display-lg-mobile font-bold font-mono ${color}`}>{value}</p>
              <p className="text-admin-on-surface-variant text-label-md">{label}</p>
            </div>
          ))}
        </div>

        {/* Report List */}
        <div className="space-y-md">
          {reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card-admin p-lg flex flex-col sm:flex-row sm:items-center gap-md justify-between"
            >
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-clinical-teal">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                </div>
                <div>
                  <p className="font-bold text-admin-on-surface">{r.name}</p>
                  <p className="text-admin-on-surface-variant text-label-sm">{r.test} • {r.date} • {r.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-sm">
                {r.status === 'sent' ? (
                  <span className="flex items-center gap-xs text-emerald-400 text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[16px] icon-fill">check_circle</span>
                    Sent
                  </span>
                ) : r.status === 'pending' ? (
                  <span className="flex items-center gap-xs text-red-400 text-label-sm font-bold">
                    <span className="material-symbols-outlined text-[16px]">pending</span>
                    Processing
                  </span>
                ) : (
                  <button
                    onClick={() => send(r.id)}
                    disabled={sending === r.id}
                    className="flex items-center gap-sm px-md py-sm bg-clinical-teal/10 border border-clinical-teal/20 text-clinical-teal rounded-lg text-label-sm hover:bg-clinical-teal/20 transition-all disabled:opacity-50"
                  >
                    {sending === r.id ? (
                      <><div className="w-4 h-4 border-2 border-clinical-teal border-t-transparent rounded-full animate-spin" />Sending…</>
                    ) : (
                      <><span className="material-symbols-outlined text-[16px]">send</span>Send Report</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
