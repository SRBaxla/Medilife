import { useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const queue = [
  { id: 'ML-001', name: 'Priya Mehta', age: 34, gender: 'F', tests: ['CBC', 'LFT'], status: 'waiting', time: '8:30 AM' },
  { id: 'ML-002', name: 'Arjun Singh', age: 52, gender: 'M', tests: ['Lipid Profile', 'Glucose'], status: 'in-progress', time: '8:45 AM' },
  { id: 'ML-003', name: 'Rekha Sharma', age: 67, gender: 'F', tests: ['TFT', 'Vitamin D'], status: 'waiting', time: '9:00 AM' },
  { id: 'ML-004', name: 'Vikram Rao', age: 28, gender: 'M', tests: ['CBC'], status: 'done', time: '9:15 AM' },
  { id: 'ML-005', name: 'Sunita Patel', age: 44, gender: 'F', tests: ['KFT', 'Urine R/M'], status: 'waiting', time: '9:30 AM' },
]

const statusConfig = {
  waiting: { label: 'Waiting', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: 'schedule' },
  'in-progress': { label: 'In Progress', color: 'text-clinical-teal', bg: 'bg-clinical-teal/10 border-clinical-teal/20', icon: 'hourglass_top' },
  done: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: 'check_circle' },
}

export default function AdminDashboard() {
  const [patients, setPatients] = useState(queue)
  const [filter, setFilter] = useState('all')

  const advance = (id) => {
    setPatients((prev) => prev.map((p) => {
      if (p.id !== id) return p
      if (p.status === 'waiting') return { ...p, status: 'in-progress' }
      if (p.status === 'in-progress') return { ...p, status: 'done' }
      return p
    }))
  }

  const filtered = filter === 'all' ? patients : patients.filter((p) => p.status === filter)

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <h1 className="text-headline-lg font-bold text-admin-primary">Patient Check-in</h1>
            <p className="text-admin-on-surface-variant text-body-md">Today's queue — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="flex items-center gap-sm">
            <div className="px-md py-sm glass-panel rounded-xl flex items-center gap-sm text-label-md text-admin-on-surface-variant">
              <span className="material-symbols-outlined text-clinical-teal text-[18px]">circle</span>
              Lab Active
            </div>
            <button className="btn-admin flex items-center gap-sm">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Walk-in
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {[
            { label: 'Total Today', value: patients.length, icon: 'groups', color: 'text-clinical-teal' },
            { label: 'Waiting', value: patients.filter((p) => p.status === 'waiting').length, icon: 'schedule', color: 'text-amber-400' },
            { label: 'In Progress', value: patients.filter((p) => p.status === 'in-progress').length, icon: 'hourglass_top', color: 'text-blue-400' },
            { label: 'Completed', value: patients.filter((p) => p.status === 'done').length, icon: 'check_circle', color: 'text-emerald-400' },
          ].map(({ label, value, icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card-admin p-lg">
              <div className="flex justify-between items-start mb-sm">
                <p className="text-admin-on-surface-variant text-label-md">{label}</p>
                <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
              </div>
              <p className={`text-display-lg-mobile font-bold font-mono ${color}`}>{value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-sm overflow-x-auto pb-sm">
          {[{ k: 'all', l: 'All Patients' }, { k: 'waiting', l: 'Waiting' }, { k: 'in-progress', l: 'In Progress' }, { k: 'done', l: 'Done' }].map(({ k, l }) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`shrink-0 px-md py-sm rounded-full text-label-md transition-all ${filter === k ? 'bg-clinical-teal text-admin-on-primary font-bold' : 'glass-panel text-admin-on-surface-variant hover:bg-white/10'}`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Queue */}
        <div className="space-y-md">
          {filtered.map((p, i) => {
            const sc = statusConfig[p.status]
            return (
              <motion.div key={p.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="card-admin p-lg flex flex-col sm:flex-row sm:items-center gap-md justify-between"
              >
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-clinical-teal/10 border border-clinical-teal/20 flex items-center justify-center text-clinical-teal font-bold font-mono text-[12px]">
                    {p.id.split('-')[1]}
                  </div>
                  <div>
                    <div className="flex items-center gap-sm">
                      <p className="font-bold text-admin-on-surface text-headline-sm">{p.name}</p>
                      <span className="text-admin-on-surface-variant text-label-sm">{p.age}{p.gender}</span>
                    </div>
                    <div className="flex flex-wrap gap-xs mt-xs">
                      {p.tests.map((t) => (
                        <span key={t} className="px-sm py-0.5 rounded-full glass-panel text-label-sm text-admin-on-surface-variant">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-md shrink-0">
                  <span className="text-label-sm text-admin-on-surface-variant">{p.time}</span>
                  <span className={`px-sm py-xs rounded-full border text-label-sm font-bold ${sc.color} ${sc.bg} flex items-center gap-xs`}>
                    <span className="material-symbols-outlined text-[14px]">{sc.icon}</span>
                    {sc.label}
                  </span>
                  {p.status !== 'done' && (
                    <button onClick={() => advance(p.id)} className="px-md py-sm bg-clinical-teal/10 border border-clinical-teal/20 text-clinical-teal rounded-lg text-label-sm hover:bg-clinical-teal/20 transition-all">
                      {p.status === 'waiting' ? 'Start' : 'Complete'}
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </PageTransition>
  )
}
