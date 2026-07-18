import { useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const reports = [
  { id: 'R001', name: 'Complete Blood Count', date: 'Oct 12, 2024', status: 'Normal', doctor: 'Dr. Patel', tests: ['Haemoglobin: 13.8 g/dL', 'WBC: 6.2 K/µL', 'Platelets: 245 K/µL'] },
  { id: 'R002', name: 'Lipid Profile', date: 'Sep 28, 2024', status: 'Borderline', doctor: 'Dr. Patel', tests: ['Total Cholesterol: 215 mg/dL', 'LDL: 142 mg/dL', 'HDL: 45 mg/dL'] },
  { id: 'R003', name: 'Thyroid Function (TFT)', date: 'Aug 15, 2024', status: 'Normal', doctor: 'Dr. Mehta', tests: ['TSH: 2.1 mIU/L', 'T3: 1.2 ng/mL', 'T4: 8.5 µg/dL'] },
  { id: 'R004', name: 'HbA1c', date: 'Jul 10, 2024', status: 'Normal', doctor: 'Dr. Patel', tests: ['HbA1c: 5.4%', 'Estimated Average Glucose: 108 mg/dL'] },
]

const statusMap = { Normal: 'badge-success', Borderline: 'badge-warning', Abnormal: 'badge-error' }

export default function Reports() {
  const [expanded, setExpanded] = useState(null)

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        <div className="flex flex-col md:flex-row justify-between gap-md">
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">My Reports</h1>
            <p className="text-body-md text-on-surface-variant">All your diagnostic reports in one place.</p>
          </div>
          <div className="flex items-center gap-sm">
            <div className="input-field flex items-center gap-sm py-sm max-w-xs">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
              <input className="bg-transparent outline-none text-body-md text-on-surface placeholder:text-on-surface-variant/50 w-full" placeholder="Search reports…" />
            </div>
          </div>
        </div>

        <div className="space-y-md">
          {reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card card-hover overflow-hidden">
              <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="w-full p-lg flex items-center justify-between text-left">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div>
                    <p className="font-bold text-headline-sm text-on-surface">{r.name}</p>
                    <p className="text-label-sm text-on-surface-variant">{r.date} • {r.doctor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <span className={statusMap[r.status]}>{r.status}</span>
                  <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${expanded === r.id ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
              </button>

              {expanded === r.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                  className="px-lg pb-lg border-t border-outline-variant/30 pt-md"
                >
                  <div className="space-y-sm mb-md">
                    {r.tests.map((t) => (
                      <div key={t} className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-primary text-[16px]">arrow_right</span>
                        <span className="text-body-md text-on-surface">{t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-sm">
                    <button className="btn-primary text-[13px] py-xs">
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      Download PDF
                    </button>
                    <button className="btn-outline text-[13px] py-xs">
                      <span className="material-symbols-outlined text-[16px]">share</span>
                      Share
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
