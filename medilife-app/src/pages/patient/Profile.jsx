import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'
import { supabase } from '../../supabaseClient'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [user, setUser] = useState(null)

  const [profile, setProfile] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    blood: '',
    email: '',
    phone: '',
    address: '',
    emergency: ''
  })

  // Password Change State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        if (authError || !authUser) return

        setUser(authUser)

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle()

        if (!error && data) {
          setProfile({
            name: data.full_name || '',
            dob: data.dob || '',
            gender: data.gender || 'Male',
            blood: data.blood_group || '',
            email: data.email || authUser.email || '',
            phone: data.phone_number || '',
            address: data.address || '',
            emergency: data.emergency_contact || ''
          })
        } else {
          setProfile((prev) => ({ ...prev, email: authUser.email || '' }))
        }
      } catch (err) {
        console.error("Error loading user profile:", err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      if (!user) throw new Error("Not authenticated.")

      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profile.name,
          dob: profile.dob || null,
          gender: profile.gender,
          blood_group: profile.blood,
          phone_number: profile.phone,
          address: profile.address,
          emergency_contact: profile.emergency
        })
        .eq('user_id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile details updated successfully!' })
      setEditing(false)
    } catch (err) {
      console.error("Error saving profile:", err)
      setMessage({ type: 'error', text: err.message || 'Failed to update profile details.' })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    try {
      setPasswordLoading(true)
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error("Error updating password:", err)
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="p-xl text-center text-on-surface-variant">Loading profile information...</div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="p-lg md:p-xl space-y-xl max-w-5xl mx-auto">
        
        {/* Header Banner */}
        <div className="card p-xl flex flex-col md:flex-row items-center md:items-start gap-xl">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
            className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center text-primary text-[48px] shrink-0 shadow-clinical border-4 border-surface-container-lowest"
          >
            🧑‍⚕️
          </motion.div>
          <div className="flex-1 text-center md:text-left space-y-xs">
            <h1 className="text-headline-lg font-bold text-on-surface">{profile.name || 'Patient Profile'}</h1>
            <div className="flex flex-wrap gap-sm justify-center md:justify-start">
              <span className="badge-primary">ID: {user?.id?.slice(0, 8).toUpperCase() || 'ML-PATIENT'}</span>
              {profile.blood && (
                <span className="badge badge-success bg-emerald-50 text-emerald-700 border border-emerald-200">Blood: {profile.blood}</span>
              )}
            </div>
            <p className="text-body-md text-on-surface-variant">{profile.email}</p>
          </div>
          <button onClick={() => setEditing((v) => !v)} className={`shrink-0 ${editing ? 'btn-secondary' : 'btn-outline'}`}>
            <span className="material-symbols-outlined text-[18px]">{editing ? 'close' : 'edit'}</span>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Global Feedback Message */}
        {message && (
          <div className={`p-md rounded-xl text-label-md flex items-center gap-sm ${
            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-error-container/10 text-error border border-error/20'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{message.text}</span>
          </div>
        )}

        {/* Personal Details Section */}
        <form onSubmit={handleSaveProfile} className="space-y-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            
            {/* Full Name */}
            <div className="card p-lg">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Full Name</label>
              </div>
              {editing ? (
                <input required className="input-field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              ) : (
                <p className="text-body-md font-medium text-on-surface">{profile.name || 'Not provided'}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="card p-lg">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">cake</span>
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Date of Birth</label>
              </div>
              {editing ? (
                <input type="date" className="input-field" value={profile.dob} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} />
              ) : (
                <p className="text-body-md font-medium text-on-surface">{profile.dob || 'Not provided'}</p>
              )}
            </div>

            {/* Gender */}
            <div className="card p-lg">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">wc</span>
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Gender</label>
              </div>
              {editing ? (
                <select className="input-field" value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-body-md font-medium text-on-surface">{profile.gender}</p>
              )}
            </div>

            {/* Blood Group */}
            <div className="card p-lg">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">bloodtype</span>
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Blood Group</label>
              </div>
              {editing ? (
                <select className="input-field" value={profile.blood} onChange={(e) => setProfile({ ...profile, blood: e.target.value })}>
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              ) : (
                <p className="text-body-md font-medium text-on-surface">{profile.blood || 'Not provided'}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="card p-lg">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">phone</span>
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Phone Number</label>
              </div>
              {editing ? (
                <input type="tel" className="input-field" placeholder="+91 xxxxxxxxxx" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              ) : (
                <p className="text-body-md font-medium text-on-surface">{profile.phone || 'Not provided'}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="card p-lg">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">mail</span>
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Email Address</label>
              </div>
              <p className="text-body-md font-medium text-on-surface">{profile.email}</p>
            </div>

            {/* Address */}
            <div className="card p-lg md:col-span-2">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Residential Address</label>
              </div>
              {editing ? (
                <textarea className="input-field min-h-[80px]" placeholder="Enter full address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
              ) : (
                <p className="text-body-md font-medium text-on-surface">{profile.address || 'Not provided'}</p>
              )}
            </div>

            {/* Emergency Contact */}
            <div className="card p-lg md:col-span-2">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">emergency</span>
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Emergency Contact</label>
              </div>
              {editing ? (
                <input className="input-field" placeholder="Contact person name & number" value={profile.emergency} onChange={(e) => setProfile({ ...profile, emergency: e.target.value })} />
              ) : (
                <p className="text-body-md font-medium text-on-surface">{profile.emergency || 'Not provided'}</p>
              )}
            </div>

          </div>

          {editing && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} type="submit" disabled={saving} className="btn-primary w-full justify-center py-md">
              {saving ? 'Saving Changes...' : 'Save Profile Changes'} <span className="material-symbols-outlined text-[18px]">save</span>
            </motion.button>
          )}
        </form>

        {/* Password Update Security Section */}
        <div className="card p-xl space-y-md border-2 border-primary/20">
          <div className="flex items-center gap-md pb-sm border-b border-outline-variant/30">
            <div className="w-10 h-10 rounded-xl bg-secondary-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">Security & Password Update</h3>
              <p className="text-body-md text-on-surface-variant">Update your account password to protect your patient records.</p>
            </div>
          </div>

          {passwordMessage && (
            <div className={`p-md rounded-xl text-label-md flex items-center gap-sm ${
              passwordMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-error-container/10 text-error border border-error/20'
            }`}>
              <span className="material-symbols-outlined text-[18px]">
                {passwordMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-2 gap-md pt-sm">
            <div>
              <label className="text-label-md text-on-surface-variant mb-xs block">New Password</label>
              <input 
                required 
                type="password" 
                className="input-field" 
                placeholder="Enter new password (min 6 chars)" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant mb-xs block">Confirm New Password</label>
              <input 
                required 
                type="password" 
                className="input-field" 
                placeholder="Confirm new password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 pt-xs">
              <button 
                type="submit" 
                disabled={passwordLoading}
                className="btn-primary justify-center flex items-center gap-xs"
              >
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
                <span className="material-symbols-outlined text-[18px]">key</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </PageTransition>
  )
}
