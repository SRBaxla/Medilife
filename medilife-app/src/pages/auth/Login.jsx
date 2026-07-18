import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Login() {
  const [tab, setTab] = useState('patient')
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(tab === 'admin' ? '/admin' : '/portal')
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-lg py-xxl ${tab === 'admin' ? 'bg-admin-bg admin-portal' : 'bg-surface'}`}>
      <div className="w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Logo */}
          <div className="flex justify-center mb-xl">
            <Link to="/" className="flex items-center gap-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-clinical-lg">
                <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '28px' }}>science</span>
              </div>
              <span className={`font-bold text-[20px] ${tab === 'admin' ? 'text-admin-primary' : 'text-primary'}`}>Medilife</span>
            </Link>
          </div>

          {/* Tab Switcher */}
          <div className={`flex rounded-xl p-1 mb-xl ${tab === 'admin' ? 'bg-white/10' : 'bg-surface-container-low'}`}>
            {['patient', 'admin'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-sm rounded-lg font-label-md text-label-md capitalize transition-all duration-200 ${
                  tab === t
                    ? tab === 'admin' ? 'bg-clinical-teal text-admin-on-primary' : 'bg-primary text-on-primary shadow-clinical'
                    : tab === 'admin' ? 'text-admin-on-surface-variant' : 'text-on-surface-variant'
                }`}
              >
                {t === 'patient' ? '🧑‍💊 Patient' : '🔬 Admin / Staff'}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className={`rounded-2xl p-xl shadow-clinical-lg ${tab === 'admin' ? 'glass-panel' : 'bg-surface-container-lowest border border-outline-variant/30'}`}>
            <h1 className={`text-headline-md font-bold mb-xs ${tab === 'admin' ? 'text-admin-primary' : 'text-on-surface'}`}>
              {tab === 'admin' ? 'Staff Login' : 'Welcome Back'}
            </h1>
            <p className={`text-body-md mb-xl ${tab === 'admin' ? 'text-admin-on-surface-variant' : 'text-on-surface-variant'}`}>
              {tab === 'admin' ? 'Access the lab management portal.' : 'Sign in to view your test results.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-md">
              <div>
                <label className={`text-label-md mb-xs block ${tab === 'admin' ? 'text-admin-on-surface-variant' : 'text-on-surface-variant'}`}>
                  {tab === 'admin' ? 'Staff ID / Email' : 'Email / Phone'}
                </label>
                <input required type="text" className={`w-full px-md py-sm rounded-xl font-body-md focus:outline-none transition-all ${
                  tab === 'admin'
                    ? 'bg-white/10 border border-white/20 text-admin-on-surface placeholder:text-admin-on-surface-variant focus:border-clinical-teal focus:bg-white/15'
                    : 'input-field'
                }`} placeholder={tab === 'admin' ? 'staff@medilife.in' : 'you@email.com'} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className={`text-label-md mb-xs block ${tab === 'admin' ? 'text-admin-on-surface-variant' : 'text-on-surface-variant'}`}>Password</label>
                <input required type="password" className={`w-full px-md py-sm rounded-xl font-body-md focus:outline-none transition-all ${
                  tab === 'admin'
                    ? 'bg-white/10 border border-white/20 text-admin-on-surface placeholder:text-admin-on-surface-variant focus:border-clinical-teal focus:bg-white/15'
                    : 'input-field'
                }`} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <button type="button" className={`text-label-sm hover:underline ${tab === 'admin' ? 'text-clinical-teal' : 'text-primary'}`}>Forgot password?</button>
              </div>
              <button type="submit" className={`w-full py-sm rounded-xl font-label-md font-bold transition-all active:scale-[0.98] ${
                tab === 'admin' ? 'bg-clinical-teal text-admin-on-primary hover:opacity-90' : 'bg-primary text-on-primary hover:opacity-90'
              }`}>
                Sign In
              </button>
            </form>
          </div>

          {tab === 'patient' && (
            <p className="text-center text-body-md text-on-surface-variant mt-lg">
              New patient?{' '}
              <Link to="/booking" className="text-primary font-bold hover:underline">Book your first test</Link>
            </p>
          )}
          <div className="text-center mt-md">
            <Link to="/" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">
              ← Back to Medilife.in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
