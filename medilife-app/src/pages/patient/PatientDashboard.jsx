import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const recentTests = [
  { name: 'CBC Panel', date: 'Oct 12, 2024', status: 'Normal', color: 'badge-success' },
  { name: 'Lipid Profile', date: 'Sep 28, 2024', status: 'Borderline', color: 'badge-warning' },
  { name: 'Thyroid (TFT)', date: 'Aug 15, 2024', status: 'Normal', color: 'badge-success' },
]

const upcomingTests = [
  { name: 'HbA1c (Quarterly)', date: 'Oct 30, 2024', time: '9:00 AM', type: 'Home Collection' },
  { name: 'Annual Wellness Check', date: 'Nov 10, 2024', time: '8:00 AM', type: 'Walk-in' },
]

export default function PatientDashboard() {
  return (
    <PageTransition>
      <div className="p-lg md:p-xl lg:p-xxl space-y-xl">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">Welcome back, John. 👋</h1>
            <p className="text-body-lg text-on-surface-variant">Here's an overview of your recent pathological data.</p>
          </div>
          <div className="flex items-center gap-sm bg-surface-container-lowest border border-outline-variant/30 rounded-full px-md py-sm shadow-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
            <span className="text-label-md text-on-surface-variant">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {[
            { icon: 'biotech', label: 'Total Tests', value: '14', sub: 'Lifetime', color: 'bg-secondary-container text-primary' },
            { icon: 'assignment', label: 'Latest Report', value: 'Oct 12', sub: 'CBC Panel – Normal', color: 'bg-emerald-50 text-emerald-700' },
            { icon: 'calendar_today', label: 'Next Test', value: 'Oct 30', sub: 'HbA1c – Home Collection', color: 'bg-amber-50 text-amber-700' },
          ].map(({ icon, label, value, sub, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card card-hover p-lg flex flex-col relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center mb-md z-10`}>
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
              <h3 className="text-label-md text-on-surface-variant z-10">{label}</h3>
              <div className="flex items-baseline gap-sm z-10">
                <span className="text-display-lg-mobile font-bold text-on-surface">{value}</span>
              </div>
              <span className="text-label-sm text-on-surface-variant z-10">{sub}</span>
            </motion.div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="card p-lg">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-bold text-headline-md text-on-surface">Recent Reports</h2>
            <Link to="/portal/reports" className="text-primary text-label-md flex items-center gap-xs hover:underline">
              View all <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="space-y-md">
            {recentTests.map(({ name, date, status, color }, i) => (
              <motion.div key={name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between p-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <div>
                    <p className="font-bold text-label-md text-on-surface">{name}</p>
                    <p className="text-label-sm text-on-surface-variant">{date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  <span className={color}>{status}</span>
                  <button className="p-sm text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-secondary-container">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div className="card p-lg">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-bold text-headline-md text-on-surface">Upcoming Tests</h2>
            <Link to="/booking" className="btn-primary text-[13px] py-xs">
              Book New <span className="material-symbols-outlined text-[16px]">add</span>
            </Link>
          </div>
          <div className="space-y-md">
            {upcomingTests.map(({ name, date, time, type }, i) => (
              <div key={name} className="flex items-center justify-between p-md rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <span className="material-symbols-outlined text-[18px]">event</span>
                  </div>
                  <div>
                    <p className="font-bold text-label-md text-on-surface">{name}</p>
                    <p className="text-label-sm text-on-surface-variant">{date} at {time} • {type}</p>
                  </div>
                </div>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">more_vert</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
