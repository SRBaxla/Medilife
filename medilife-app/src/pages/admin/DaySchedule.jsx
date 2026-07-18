import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const timeSlots = [
  { time: '7:00', patients: [{ name: 'Priya M.', test: 'CBC', color: 'bg-clinical-teal/20 border-clinical-teal/30 text-clinical-teal' }] },
  { time: '7:30', patients: [] },
  { time: '8:00', patients: [{ name: 'Arjun S.', test: 'Lipid', color: 'bg-amber-400/20 border-amber-400/30 text-amber-400' }, { name: 'Rekha S.', test: 'TFT', color: 'bg-purple-400/20 border-purple-400/30 text-purple-400' }] },
  { time: '8:30', patients: [{ name: 'Vikram R.', test: 'CBC', color: 'bg-clinical-teal/20 border-clinical-teal/30 text-clinical-teal' }] },
  { time: '9:00', patients: [{ name: 'Sunita P.', test: 'KFT', color: 'bg-blue-400/20 border-blue-400/30 text-blue-400' }] },
  { time: '9:30', patients: [] },
  { time: '10:00', patients: [{ name: 'Anand K.', test: 'HbA1c', color: 'bg-amber-400/20 border-amber-400/30 text-amber-400' }, { name: 'Meera J.', test: 'LFT', color: 'bg-emerald-400/20 border-emerald-400/30 text-emerald-400' }] },
  { time: '10:30', patients: [{ name: 'Ravi T.', test: 'CBC', color: 'bg-clinical-teal/20 border-clinical-teal/30 text-clinical-teal' }] },
  { time: '11:00', patients: [] },
  { time: '11:30', patients: [{ name: 'Geeta N.', test: 'Vitamin D', color: 'bg-yellow-400/20 border-yellow-400/30 text-yellow-400' }] },
  { time: '12:00', patients: [{ name: 'Sanjay B.', test: 'Thyroid', color: 'bg-purple-400/20 border-purple-400/30 text-purple-400' }] },
  { time: '12:30', patients: [] },
]

export default function DaySchedule() {
  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <h1 className="text-headline-lg font-bold text-admin-primary">Day Schedule</h1>
            <p className="text-admin-on-surface-variant text-body-md">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-sm">
            <button className="glass-panel flex items-center gap-sm px-md py-sm rounded-xl text-admin-on-surface-variant text-label-md hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="glass-panel px-md py-sm rounded-xl text-admin-on-surface-variant text-label-md hover:bg-white/10 transition-all">Today</button>
            <button className="glass-panel flex items-center gap-sm px-md py-sm rounded-xl text-admin-on-surface-variant text-label-md hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-md">
          {[
            { label: 'Scheduled', value: 12, color: 'text-clinical-teal' },
            { label: 'Home Visits', value: 3, color: 'text-amber-400' },
            { label: 'Walk-ins', value: 4, color: 'text-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card-admin p-lg text-center">
              <p className={`text-display-lg-mobile font-bold font-mono ${color}`}>{value}</p>
              <p className="text-admin-on-surface-variant text-label-md">{label}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="card-admin overflow-hidden">
          <div className="p-lg border-b border-white/10">
            <h3 className="font-bold text-admin-on-surface">Today's Timeline</h3>
          </div>
          <div className="divide-y divide-white/5">
            {timeSlots.map(({ time, patients }, i) => (
              <motion.div key={time} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex gap-md p-md items-start"
              >
                <div className="w-16 shrink-0 font-mono text-clinical-teal text-label-sm pt-1">{time}</div>
                <div className="flex-1 min-h-[40px] flex flex-wrap gap-sm">
                  {patients.length === 0 ? (
                    <div className="h-8 border-l-2 border-white/10 pl-sm flex items-center">
                      <span className="text-admin-on-surface-variant/30 text-label-sm">Free slot</span>
                    </div>
                  ) : (
                    patients.map(({ name, test, color }) => (
                      <div key={name} className={`px-sm py-xs rounded-lg border ${color} text-label-sm font-bold`}>
                        {name} — {test}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
