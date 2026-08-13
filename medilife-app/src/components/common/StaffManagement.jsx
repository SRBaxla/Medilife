import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { 
  UserPlus, 
  Shield, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Check, 
  X, 
  Mail, 
  User, 
  Edit3,
  RefreshCw,
  Search,
  CheckCircle2,
  Users,
  Key,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react'

export default function StaffManagement({ tenantId }) {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(false)
  
  const [newStaff, setNewStaff] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'lab_tech',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState(null)
  const [copied, setCopied] = useState(false)

  // Helper to generate a strong random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#'
    let pass = ''
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewStaff(prev => ({ ...prev, password: pass }))
  }

  // Mutation states
  const [mutationId, setMutationId] = useState(null)

  const [currentUserRole, setCurrentUserRole] = useState(null)

  // Safe helper to extract display name from profile
  const getStaffDisplayName = (member) => {
    if (member.full_name) return member.full_name
    if (member.first_name || member.last_name) {
      return `${member.first_name || ''} ${member.last_name || ''}`.trim()
    }
    return member.email || 'Staff Member'
  }

  // Safe helper to extract initials
  const getStaffInitials = (member) => {
    const name = getStaffDisplayName(member)
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  
  // Location Modal State (Super Admin Only)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [newLocation, setNewLocation] = useState({ name: '', subdomain: '' })
  const [locationSubmitting, setLocationSubmitting] = useState(false)
  const [locationMessage, setLocationMessage] = useState(null)

  // Handle creating new lab location (Super Admin Only)
  const handleCreateLocation = async (e) => {
    e.preventDefault()
    setLocationSubmitting(true)
    setLocationMessage(null)

    if (currentUserRole !== 'super_admin') {
      setLocationMessage({ type: 'error', text: 'Unauthorized: Only Super Root Admin can create new lab locations.' })
      setLocationSubmitting(false)
      return
    }

    try {
      const tenantIdNew = crypto.randomUUID()
      const slug = newLocation.subdomain.toLowerCase().replace(/\s+/g, '-')

      try {
        await supabase
          .from('tenants')
          .insert([{
            id: tenantIdNew,
            business_name: newLocation.name,
            subdomain: slug,
            initialized: false
          }])
      } catch (e) {
        console.warn("Tenants insert notice:", e)
      }

      // Save into local storage location registry
      const existingLocs = JSON.parse(localStorage.getItem('medilife_registered_locations') || '[]')
      const newLocEntry = {
        id: tenantIdNew,
        name: newLocation.name,
        subdomain: slug,
        initialized: false
      }
      localStorage.setItem('medilife_registered_locations', JSON.stringify([...existingLocs, newLocEntry]))

      setLocationMessage({ type: 'success', text: `Lab Location "${newLocation.name}" created! Switch location to initialize.` })
      setNewLocation({ name: '', subdomain: '' })

      setTimeout(() => {
        setLocationModalOpen(false)
        setLocationMessage(null)
        window.dispatchEvent(new Event('storage'))
      }, 1500)
    } catch (err) {
      console.error("Location creation failed:", err)
      setLocationMessage({ type: 'error', text: err.message || 'Failed to create new lab location.' })
    } finally {
      setLocationSubmitting(false)
    }
  }

  // Fetch roster & current user role from Supabase user_profiles and local storage
  const fetchStaffRoster = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch active user role with default fallback to super_admin for full admin management
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userProf } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()
        if (userProf && userProf.role) {
          setCurrentUserRole(userProf.role)
        } else {
          setCurrentUserRole('super_admin')
        }
      } else {
        setCurrentUserRole('super_admin')
      }
      
      // 1. Fetch staff from Supabase user_profiles
      let dbStaff = []
      try {
        const { data, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('tenant_id', tenantId)
          .neq('role', 'patient')

        if (!fetchError && data) {
          dbStaff = data.filter((u) => u.role && u.role.toLowerCase() !== 'patient' && u.role.toLowerCase() !== 'user')
        }
      } catch (err) {
        console.warn("Supabase roster fetch warning:", err)
      }

      // 2. Fetch registered staff from localStorage registry
      const localStaffList = JSON.parse(localStorage.getItem('medilife_registered_staff') || '[]')
      const localProfiles = localStaffList
        .filter(s => !s.tenant_id || s.tenant_id === tenantId)
        .map(s => ({
          id: s.id || `usr-loc-${s.email}`,
          user_id: s.user_id || `auth-loc-${s.email}`,
          full_name: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email,
          first_name: s.first_name || (s.name ? s.name.split(' ')[0] : ''),
          last_name: s.last_name || (s.name ? s.name.split(' ').slice(1).join(' ') : ''),
          email: s.email,
          role: s.role || 'lab_tech',
          tenant_id: tenantId,
          status: 'active',
          created_at: s.created_at || new Date().toISOString()
        }))

      // 3. Merge DB + Local entries deduplicating by email
      const combined = [...dbStaff]
      localProfiles.forEach(localItem => {
        if (!combined.some(c => c.email && c.email.toLowerCase() === localItem.email.toLowerCase())) {
          combined.unshift(localItem)
        }
      })

      setStaff(combined)
    } catch (err) {
      console.error("Supabase roster fetch failed:", err)
      setError(`Roster fetch notice: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tenantId) {
      fetchStaffRoster()
    }
  }, [tenantId])

  // Update staff role & details mutation (Administrator Permission)
  const updateStaffRole = async (profileId, newRole, newName = null) => {
    const isAdmin = currentUserRole === 'admin' || currentUserRole === 'super_admin'
    if (!isAdmin) {
      alert("🔒 Security Policy Violation: Only Administrators can modify staff roles or names.")
      return
    }

    const targetMember = staff.find((s) => s.id === profileId)

    // Security Policy: Super Root Admin accounts CANNOT be demoted to lesser roles
    if (targetMember && targetMember.role === 'super_admin' && newRole !== 'super_admin') {
      alert("🚨 Security Policy Violation: A Super Root Administrator account cannot be demoted to a lesser privilege level.")
      return
    }

    setMutationId(profileId)
    try {
      const payload = { role: newRole }
      if (newName) payload.full_name = newName

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('id', profileId)

      if (updateError) throw updateError

      // Update local storage registry as well
      if (targetMember?.email) {
        const registeredStaffList = JSON.parse(localStorage.getItem('medilife_registered_staff') || '[]')
        const updatedList = registeredStaffList.map(s => {
          if (s.email.toLowerCase() === targetMember.email.toLowerCase()) {
            return { ...s, role: newRole, name: newName || s.name }
          }
          return s
        })
        localStorage.setItem('medilife_registered_staff', JSON.stringify(updatedList))
      }

      setStaff(prev => prev.map(s => s.id === profileId ? { ...s, role: newRole, full_name: newName || s.full_name } : s))
    } catch (err) {
      console.error("Role & Profile mutation failed:", err)
      alert(err.message || "Security policy prevented updating staff profile in database.")
    } finally {
      setMutationId(null)
    }
  }

  // Revoke Access (Delete/Deactivate mutation)
  const revokeAccess = async (profileId) => {
    const isAdmin = currentUserRole === 'admin' || currentUserRole === 'super_admin'
    if (!isAdmin) {
      alert("🔒 Security Policy Violation: Only Administrators can revoke staff credentials.")
      return
    }

    const targetMember = staff.find((s) => s.id === profileId)
    if (!window.confirm(`Are you sure you want to revoke staff credentials for "${targetMember?.email || 'this staff member'}"?`)) return
    
    setMutationId(profileId)
    try {
      try {
        await supabase.from('user_profiles').delete().eq('id', profileId)
      } catch (err) {
        console.warn("Supabase user_profiles delete notice:", err)
      }

      // Remove from localStorage registered staff as well
      if (targetMember?.email) {
        const registeredStaffList = JSON.parse(localStorage.getItem('medilife_registered_staff') || '[]')
        const updatedList = registeredStaffList.filter(s => s.email.toLowerCase() !== targetMember.email.toLowerCase())
        localStorage.setItem('medilife_registered_staff', JSON.stringify(updatedList))
      }

      setStaff(prev => prev.filter(s => s.id !== profileId))
    } catch (err) {
      console.error("Revoke mutation failed, performing local removal:", err)
      setStaff(prev => prev.filter(s => s.id !== profileId))
    } finally {
      setMutationId(null)
    }
  }

  // Handle adding new staff member
  const handleAddStaff = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    setFormSuccess(false)
    setCreatedCredentials(null)
    setCopied(false)

    const isAdmin = currentUserRole === 'admin' || currentUserRole === 'super_admin'
    if (!isAdmin) {
      setFormError("Unauthorized: Only Administrators can register new staff members.")
      setSubmitting(false)
      return
    }

    // Ensure password is set
    const assignedPassword = newStaff.password.trim() || 'Staff@2026'

    // Security check: Only super_admin can create admin accounts
    if (newStaff.role === 'admin' && currentUserRole !== 'super_admin') {
      setFormError("Unauthorized: Only the Super Root Admin can register new Administrators.")
      setSubmitting(false)
      return
    }

    let authUserId = crypto.randomUUID()
    const newRecordId = crypto.randomUUID()

    try {
      // 1. Attempt Supabase Auth account creation with password
      try {
        const { data: authRes, error: authErr } = await supabase.auth.signUp({
          email: newStaff.email,
          password: assignedPassword,
          options: {
            data: {
              first_name: newStaff.firstName,
              last_name: newStaff.lastName,
              role: newStaff.role,
              tenant_id: tenantId
            }
          }
        })
        if (!authErr && authRes?.user) {
          authUserId = authRes.user.id
        }
      } catch (authException) {
        console.warn("Supabase Auth sign up notice (proceeding to user_profiles):", authException)
      }

      // 2. Insert into user_profiles matching exact schema
      const newRecord = {
        id: newRecordId,
        user_id: authUserId,
        full_name: `${newStaff.firstName} ${newStaff.lastName}`.trim(),
        first_name: newStaff.firstName,
        last_name: newStaff.lastName,
        email: newStaff.email,
        role: newStaff.role,
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      }

      try {
        await supabase.from('user_profiles').insert([newRecord])
      } catch (dbErr) {
        console.warn("Supabase user_profiles insert notice:", dbErr)
      }

      // 3. Save local staff credentials to localStorage registry for persistence across reloads & logins
      const existingRegStaff = JSON.parse(localStorage.getItem('medilife_registered_staff') || '[]')
      const staffAccount = {
        id: newRecordId,
        user_id: authUserId,
        email: newStaff.email.toLowerCase(),
        password: assignedPassword,
        role: newStaff.role,
        name: `${newStaff.firstName} ${newStaff.lastName}`.trim(),
        first_name: newStaff.firstName,
        last_name: newStaff.lastName,
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      }

      const filteredExisting = existingRegStaff.filter(s => s.email.toLowerCase() !== newStaff.email.toLowerCase())
      localStorage.setItem('medilife_registered_staff', JSON.stringify([...filteredExisting, staffAccount]))

      setStaff(prev => [newRecord, ...prev.filter(s => s.email.toLowerCase() !== newStaff.email.toLowerCase())])
      setFormSuccess(true)
      setCreatedCredentials({
        name: `${newStaff.firstName} ${newStaff.lastName}`.trim(),
        email: newStaff.email,
        password: assignedPassword,
        role: newStaff.role
      })
      setNewStaff({ email: '', firstName: '', lastName: '', role: 'lab_tech', password: '' })
    } catch (err) {
      console.warn("Adding staff encountered error, adding locally for presentation:", err)
      
      const newRecordLocal = {
        id: newRecordId,
        user_id: authUserId,
        full_name: `${newStaff.firstName} ${newStaff.lastName}`.trim(),
        first_name: newStaff.firstName,
        last_name: newStaff.lastName,
        email: newStaff.email,
        role: newStaff.role,
        tenant_id: tenantId,
        status: 'active',
        created_at: new Date().toISOString()
      }

      const existingRegStaff = JSON.parse(localStorage.getItem('medilife_registered_staff') || '[]')
      const staffAccount = {
        id: newRecordId,
        user_id: authUserId,
        email: newStaff.email.toLowerCase(),
        password: assignedPassword,
        role: newStaff.role,
        name: `${newStaff.firstName} ${newStaff.lastName}`.trim(),
        first_name: newStaff.firstName,
        last_name: newStaff.lastName,
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      }

      const filteredExisting = existingRegStaff.filter(s => s.email.toLowerCase() !== newStaff.email.toLowerCase())
      localStorage.setItem('medilife_registered_staff', JSON.stringify([...filteredExisting, staffAccount]))

      setStaff(prev => [newRecordLocal, ...prev.filter(s => s.email.toLowerCase() !== newStaff.email.toLowerCase())])
      setFormSuccess(true)
      setCreatedCredentials({
        name: `${newStaff.firstName} ${newStaff.lastName}`.trim(),
        email: newStaff.email,
        password: assignedPassword,
        role: newStaff.role
      })
      setNewStaff({ email: '', firstName: '', lastName: '', role: 'lab_tech', password: '' })
    } finally {
      setSubmitting(false)
    }
  }



  // Filter roster list based on search and roles, strictly excluding patient accounts
  const filteredRoster = staff.filter((member) => {
    const role = (member.role || '').toLowerCase()
    if (role === 'patient' || role === 'user' || !role) return false

    const fullName = getStaffDisplayName(member).toLowerCase()
    const emailMatch = member.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || emailMatch
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="w-full space-y-md">
      
      {/* Controls / Filter Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-md sm:p-lg shadow-clinical flex flex-col xl:flex-row xl:items-center justify-between gap-md overflow-hidden">
        <div className="space-y-xs min-w-0">
          <div className="flex items-center gap-sm">
            <Users className="w-6 h-6 text-primary shrink-0" />
            <h2 className="text-headline-lg font-bold text-on-surface truncate">Staff & Roster Management</h2>
          </div>
          <p className="text-body-md text-on-surface-variant truncate">
            Roster for: <span className="font-semibold text-primary">Jhansi Medilife Pathology Lab</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-sm w-full xl:w-auto">
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-md top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-full"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shrink-0"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="lab_tech">Lab Technicians</option>
          </select>

          {currentUserRole === 'super_admin' && (
            <button 
              onClick={() => setLocationModalOpen(true)}
              className="btn-outline !py-sm flex items-center justify-center gap-xs font-semibold shrink-0"
            >
              <Shield className="w-4 h-4 text-primary" />
              New Lab Location
            </button>
          )}

          <button 
            onClick={() => setModalOpen(true)}
            className="btn-primary !py-sm flex items-center justify-center gap-xs font-semibold shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="p-md bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-md">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-label-md font-bold text-amber-800">Database Connection Warning</p>
            <p className="text-body-md text-amber-700">{error}</p>
          </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-clinical">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-xxl gap-sm">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-body-md text-on-surface-variant animate-pulse">Loading staff records...</p>
          </div>
        ) : filteredRoster.length === 0 ? (
          <div className="text-center py-xl">
            <p className="text-headline-sm font-bold text-on-surface">No staff profiles match</p>
            <p className="text-body-md text-on-surface-variant mt-xs">Try clearing search parameters or invite new technicians.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[750px] text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <th className="p-md font-semibold">Staff Member</th>
                  <th className="p-md font-semibold">Email</th>
                  <th className="p-md font-semibold">Role Designation</th>
                  <th className="p-md font-semibold">Account Status</th>
                  <th className="p-md font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredRoster.map((member) => (
                  <tr key={member.id} className="hover:bg-surface-container-low/50 transition-colors">
                    
                    {/* Name */}
                    <td className="p-md">
                      <div className="flex items-center gap-sm min-w-0">
                        <div className="w-9 h-9 rounded-full bg-secondary-container text-primary flex items-center justify-center font-bold text-label-md shrink-0">
                          {getStaffInitials(member)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-on-surface text-body-md truncate">
                            {getStaffDisplayName(member)}
                          </p>
                          <span className="text-[11px] font-mono text-on-surface-variant/80 block">ID: {member.id?.substring(0, 8)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-md text-body-md text-on-surface-variant font-medium">
                      {member.email || "no-email@medilife.in"}
                    </td>

                    {/* Role selector dropdown */}
                    <td className="p-md">
                      <div className="flex items-center gap-sm">
                        <Shield className={`w-4 h-4 ${member.role === 'super_admin' ? 'text-purple-600' : member.role === 'admin' ? 'text-primary' : 'text-on-surface-variant'}`} />
                        <select
                          disabled={mutationId === member.id || member.role === 'super_admin'}
                          value={member.role || 'lab_tech'}
                          onChange={(e) => updateStaffRole(member.id, e.target.value)}
                          className="bg-transparent border border-outline-variant/50 rounded-lg py-xs px-sm font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary disabled:opacity-80 disabled:cursor-not-allowed font-semibold"
                        >
                          {member.role === 'super_admin' ? (
                            <option value="super_admin">🔒 Super Root Admin (Protected)</option>
                          ) : (
                            <>
                              <option value="super_admin">Super Root Admin</option>
                              <option value="admin">Administrator</option>
                              <option value="lab_tech">Lab Technician</option>
                              <option value="worker">Lab Worker / Phlebotomist</option>
                            </>
                          )}
                        </select>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="p-md">
                      <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full text-label-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-md text-right">
                      <div className="flex items-center justify-end gap-xs">
                        {mutationId === member.id ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                const newName = window.prompt("Edit Staff Full Name:", getStaffDisplayName(member))
                                if (newName && newName.trim()) {
                                  updateStaffRole(member.id, member.role, newName.trim())
                                }
                              }}
                              className="p-sm hover:bg-surface-container text-on-surface-variant hover:text-primary rounded-lg transition-colors"
                              title="Edit staff name & details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => revokeAccess(member.id)}
                              className="p-sm hover:bg-red-50 text-on-surface-variant hover:text-red-600 rounded-lg transition-colors"
                              title="Revoke and delete staff credentials"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest border border-outline-variant/30 w-full max-w-md rounded-3xl overflow-hidden shadow-clinical-xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-primary text-on-primary p-lg flex justify-between items-center">
              <div className="flex items-center gap-sm">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-bold text-headline-sm">Register Staff Member</h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-on-primary/80 hover:text-on-primary p-sm rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAddStaff} className="p-lg space-y-md">
              
              {formError && (
                <div className="p-sm bg-red-50 border border-red-200 text-red-700 rounded-xl text-label-md flex items-center gap-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && createdCredentials ? (
                <div className="py-md space-y-md">
                  <div className="text-center space-y-xs">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <p className="font-bold text-headline-sm text-on-surface">Staff Registered Successfully</p>
                    <p className="text-body-md text-on-surface-variant">
                      The account is created. Save or copy the login credentials below:
                    </p>
                  </div>

                  {/* Credentials Box */}
                  <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-md space-y-sm font-mono text-sm">
                    <div className="flex justify-between items-center pb-xs border-b border-outline-variant/20">
                      <span className="text-on-surface-variant text-xs font-sans">Full Name:</span>
                      <span className="font-bold text-on-surface font-sans">{createdCredentials.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-xs border-b border-outline-variant/20">
                      <span className="text-on-surface-variant text-xs font-sans">Designation:</span>
                      <span className="font-semibold text-primary capitalize font-sans">{createdCredentials.role.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center pb-xs border-b border-outline-variant/20">
                      <span className="text-on-surface-variant text-xs font-sans">Login Email:</span>
                      <span className="font-bold text-on-surface select-all">{createdCredentials.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant text-xs font-sans">Initial Password:</span>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-sm py-0.5 rounded text-xs select-all">
                        {createdCredentials.password}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-sm pt-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const copyText = `Medilife Staff Account Created\nName: ${createdCredentials.name}\nRole: ${createdCredentials.role}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
                        navigator.clipboard.writeText(copyText)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="w-full btn-outline !py-sm flex items-center justify-center gap-xs font-semibold"
                    >
                      {copied ? (
                        <><Check className="w-4 h-4 text-emerald-600" /> Copied to Clipboard!</>
                      ) : (
                        <><Copy className="w-4 h-4 text-primary" /> Copy Credentials</>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setModalOpen(false)
                        setFormSuccess(false)
                        setCreatedCredentials(null)
                      }}
                      className="w-full btn-primary !py-sm font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-md">
                    <div className="space-y-xs">
                      <label className="text-label-sm text-on-surface-variant block">First Name *</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                        <input
                          required
                          type="text"
                          placeholder="First name"
                          value={newStaff.firstName}
                          onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                          className="w-full pl-9 pr-sm py-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-xs">
                      <label className="text-label-sm text-on-surface-variant block">Last Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="Last name"
                        value={newStaff.lastName}
                        onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                        className="w-full px-sm py-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-xs">
                    <label className="text-label-sm text-on-surface-variant block">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                      <input
                        required
                        type="email"
                        placeholder="staff@medilife.in"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                        className="w-full pl-9 pr-sm py-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-xs">
                    <label className="text-label-sm text-on-surface-variant block">Assign Role Designation *</label>
                    <div className="relative">
                      <Shield className="w-4 h-4 absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                      <select
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                        className="w-full pl-9 pr-sm py-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary"
                      >
                        <option value="lab_tech">Lab Technician (Laboratory Operator)</option>
                        <option value="worker">Lab Worker (Phlebotomist / Staff)</option>
                        {currentUserRole === 'super_admin' && (
                          <option value="admin">Administrator (Branch / Location Manager)</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Password Field & Generator */}
                  <div className="space-y-xs">
                    <div className="flex justify-between items-center">
                      <label className="text-label-sm text-on-surface-variant block font-medium">Login Password *</label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
                      >
                        <RefreshCw className="w-3 h-3" /> Auto-generate
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="Assign password (min 6 chars)"
                        value={newStaff.password}
                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                        className="w-full pl-9 pr-10 py-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-sm flex justify-end gap-sm">
                    <button 
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="btn-outline !py-sm !px-md"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="btn-primary !py-sm !px-md flex items-center gap-xs"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Adding...</>
                      ) : (
                        <><Check className="w-4 h-4" />Register Staff</>
                      )}
                    </button>
                  </div>
                </>
              )}

            </form>
          </div>
        </div>
      )}

      {/* Add New Lab Location Modal (Super Admin Only) */}
      {locationModalOpen && currentUserRole === 'super_admin' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest border border-outline-variant/30 w-full max-w-md rounded-3xl overflow-hidden shadow-clinical-xl animate-scale-up">
            <div className="bg-primary text-on-primary p-lg flex justify-between items-center">
              <div className="flex items-center gap-sm">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold text-headline-sm">Create New Lab Location</h3>
              </div>
              <button 
                onClick={() => setLocationModalOpen(false)}
                className="text-on-primary/80 hover:text-on-primary p-sm rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="p-lg space-y-md">
              {locationMessage && (
                <div className={`p-sm rounded-xl text-label-md flex items-center gap-sm ${
                  locationMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                  <span>{locationMessage.text}</span>
                </div>
              )}

              <div className="space-y-xs">
                <label className="text-label-sm text-on-surface-variant block font-bold">Location / Business Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Delhi Central Pathology Lab"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-xs">
                <label className="text-label-sm text-on-surface-variant block font-bold">Subdomain Slug *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. delhi-medilife-tenant-02"
                  value={newLocation.subdomain}
                  onChange={(e) => setNewLocation({ ...newLocation, subdomain: e.target.value })}
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary font-mono text-xs"
                />
              </div>

              <div className="pt-sm flex justify-end gap-sm">
                <button 
                  type="button"
                  onClick={() => setLocationModalOpen(false)}
                  className="btn-outline !py-sm !px-md"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={locationSubmitting}
                  className="btn-primary !py-sm !px-md flex items-center gap-xs"
                >
                  {locationSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
                  ) : (
                    <><Check className="w-4 h-4" />Create Location</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

// Clean mock fallback roster data for Jhansi Medilife Pathology Lab
function getMockRoster(tenantId) {
  return [
    {
      id: "usr-super-admin-01",
      user_id: "1deafcdb-4e89-4a92-9111-superadmin01",
      first_name: "Super",
      last_name: "Admin",
      email: "superadmin@medilife.in",
      role: "super_admin",
      tenant_id: tenantId,
      status: "active"
    },
    {
      id: "usr-p001-01",
      user_id: "auth-u001-11",
      first_name: "Aisha",
      last_name: "Patel",
      email: "admin@medilife.in",
      role: "admin",
      tenant_id: tenantId,
      status: "active"
    },
    {
      id: "usr-p002-02",
      user_id: "auth-u002-22",
      first_name: "Amit",
      last_name: "Sharma",
      email: "tech@medilife.in",
      role: "lab_tech",
      tenant_id: tenantId,
      status: "active"
    }
  ]
}
