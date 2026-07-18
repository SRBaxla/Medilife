import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const vitals = [
  { label: 'Haemoglobin', value: '13.8', unit: 'g/dL', normal: '12–16', status: 'normal', trend: 'stable' },
  { label: 'Total Cholesterol', value: '215', unit: 'mg/dL', normal: '<200', status: 'borderline', trend: 'up' },
  { label: 'Blood Glucose', value: '98', unit: 'mg/dL', normal: '70–99', status: 'normal', trend: 'down' },
  { label: 'TSH', value: '2.1', unit: 'mIU/L', normal: '0.4–4.0', status: 'normal', trend: 'stable' },
  { label: 'Creatinine', value: '1.0', unit: 'mg/dL', normal: '0.6–1.2', status: 'normal', trend: 'stable' },
  { label: 'HbA1c', value: '5.4', unit: '%', normal: '<5.7', status: 'normal', trend: 'down' },
]

const statusMap = {
  normal: { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Normal' },
  borderline: { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Borderline' },
  abnormal: { color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Abnormal' },
}

const trendIcon = { up: '↑', down: '↓', stable: '→' }
const trendColor = { up: 'text-red-500', down: 'text-emerald-500', stable: 'text-on-surface-variant' }

export default function Statistics() {
  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Health Statistics</h1>
          <p className="text-body-md text-on-surface-variant">Track your key health indicators over time.</p>
        </div>

        {/* Health Score */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="card p-xl text-center bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-3xl"
        >
          <p className="text-label-md opacity-80 uppercase tracking-wider mb-sm">Overall Health Score</p>
          <div className="text-[72px] font-bold leading-none">82</div>
          <p className="text-label-md opacity-80 mt-sm">out of 100 — Good Health</p>
          <div className="h-2 bg-on-primary/20 rounded-full max-w-xs mx-auto mt-lg overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              className="h-full bg-on-primary rounded-full"
            />
          </div>
        </motion.div>

        {/* Vitals Grid */}
        <div>
          <h2 className="text-headline-md font-bold text-on-surface mb-lg">Key Biomarkers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {vitals.map(({ label, value, unit, normal, status, trend }, i) => {
              const sc = statusMap[status]
              return (
                <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="card card-hover p-lg"
                >
                  <div className="flex justify-between items-start mb-md">
                    <p className="text-label-md text-on-surface-variant">{label}</p>
                    <span className={`badge border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                  </div>
                  <div className="flex items-baseline gap-sm mb-sm">
                    <span className="text-display-lg-mobile font-bold text-on-surface">{value}</span>
                    <span className="text-label-md text-on-surface-variant">{unit}</span>
                    <span className={`ml-auto font-bold ${trendColor[trend]}`}>{trendIcon[trend]}</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${status === 'normal' ? 'bg-emerald-400 w-3/4' : status === 'borderline' ? 'bg-amber-400 w-[88%]' : 'bg-red-400 w-full'}`} />
                  </div>
                  <p className="text-label-sm text-on-surface-variant mt-sm">Normal: {normal}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
