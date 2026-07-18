import { useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'

export default function Profile() {
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'John Doe', dob: '1990-03-15', gender: 'Male', blood: 'A+',
    email: 'john.doe@email.com', phone: '+91 98765 43210', address: '45 Green Avenue, New Delhi – 110001',
    emergency: 'Jane Doe (+91 87654 32100)',
  })

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl">
        {/* Header */}
        <div className="card p-xl flex flex-col md:flex-row items-center md:items-start gap-xl">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
            className="w-28 h-28 rounded-full bg-secondary-container flex items-center justify-center text-primary text-[56px] shrink-0 shadow-clinical border-4 border-surface-container-lowest"
          >
            🧑‍💊
          </motion.div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-headline-lg font-bold text-on-surface">{profile.name}</h1>
            <div className="flex flex-wrap gap-sm justify-center md:justify-start mt-sm">
              <span className="badge-primary">Patient ID: ML-00412</span>
              <span className="badge badge-success bg-emerald-50 text-emerald-700 border border-emerald-200">Blood: {profile.blood}</span>
            </div>
            <p className="text-body-md text-on-surface-variant mt-sm">{profile.email}</p>
          </div>
          <button onClick={() => setEditing((v) => !v)} className={`shrink-0 ${editing ? 'btn-secondary' : 'btn-outline'}`}>
            <span className="material-symbols-outlined text-[18px]">{editing ? 'close' : 'edit'}</span>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {[
            { label: 'Full Name', key: 'name', icon: 'person' },
            { label: 'Date of Birth', key: 'dob', icon: 'cake' },
            { label: 'Gender', key: 'gender', icon: 'wc' },
            { label: 'Blood Group', key: 'blood', icon: 'bloodtype' },
            { label: 'Email Address', key: 'email', icon: 'mail' },
            { label: 'Phone Number', key: 'phone', icon: 'phone' },
            { label: 'Address', key: 'address', icon: 'location_on' },
            { label: 'Emergency Contact', key: 'emergency', icon: 'emergency' },
          ].map(({ label, key, icon }, i) => (
            <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card p-lg">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</label>
              </div>
              {editing ? (
                <input className="input-field" value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
              ) : (
                <p className="text-body-md font-medium text-on-surface">{profile[key]}</p>
              )}
            </motion.div>
          ))}
        </div>

        {editing && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setEditing(false)} className="btn-primary w-full justify-center">
            Save Changes <span className="material-symbols-outlined text-[18px]">save</span>
          </motion.button>
        )}
      </div>
    </PageTransition>
  )
}
