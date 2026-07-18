import { useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

const settingsSections = [
  {
    title: 'Notifications',
    settings: [
      { label: 'Report Ready Alerts', desc: 'Get notified when your test results are available', key: 'reportAlerts', default: true },
      { label: 'Appointment Reminders', desc: 'Reminders 24h and 1h before your appointment', key: 'apptReminders', default: true },
      { label: 'Health Tips', desc: 'Weekly health and wellness tips from our doctors', key: 'healthTips', default: false },
      { label: 'Promotional Offers', desc: 'Discounts and special packages', key: 'promos', default: false },
    ],
  },
  {
    title: 'Privacy',
    settings: [
      { label: 'Share Reports with Doctor', desc: 'Allow your doctor to access your latest reports', key: 'shareDoctor', default: true },
      { label: 'Anonymous Usage Data', desc: 'Help us improve by sharing anonymous usage data', key: 'usageData', default: false },
    ],
  },
]

export default function Settings() {
  const [toggles, setToggles] = useState(
    Object.fromEntries(settingsSections.flatMap((s) => s.settings.map((st) => [st.key, st.default])))
  )

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Settings</h1>
          <p className="text-body-md text-on-surface-variant">Manage your preferences and account settings.</p>
        </div>

        {settingsSections.map(({ title, settings }, si) => (
          <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.15 }} className="card p-lg">
            <h2 className="text-headline-sm font-bold text-on-surface mb-lg">{title}</h2>
            <div className="space-y-md">
              {settings.map(({ label, desc, key }) => (
                <div key={key} className="flex items-center justify-between gap-md py-sm border-b border-outline-variant/20 last:border-0">
                  <div>
                    <p className="font-medium text-label-md text-on-surface">{label}</p>
                    <p className="text-label-sm text-on-surface-variant">{desc}</p>
                  </div>
                  <button
                    onClick={() => setToggles((t) => ({ ...t, [key]: !t[key] }))}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0 ${toggles[key] ? 'bg-primary' : 'bg-outline-variant'}`}
                  >
                    <motion.div
                      animate={{ x: toggles[key] ? '24px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Account Actions */}
        <div className="card p-lg">
          <h2 className="text-headline-sm font-bold text-on-surface mb-lg">Account</h2>
          <div className="space-y-sm">
            <button className="w-full flex items-center gap-md p-md rounded-xl hover:bg-surface-container-low transition-colors text-on-surface text-label-md text-left">
              <span className="material-symbols-outlined text-primary">lock</span>
              Change Password
              <span className="ml-auto material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
            </button>
            <button className="w-full flex items-center gap-md p-md rounded-xl hover:bg-surface-container-low transition-colors text-on-surface text-label-md text-left">
              <span className="material-symbols-outlined text-primary">download</span>
              Export My Data
              <span className="ml-auto material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
            </button>
            <button className="w-full flex items-center gap-md p-md rounded-xl hover:bg-red-50 transition-colors text-error text-label-md text-left">
              <span className="material-symbols-outlined">delete_forever</span>
              Delete Account
              <span className="ml-auto material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
