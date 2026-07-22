import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition'
import TimeSlotPicker from '../../components/client/TimeSlotPicker';
import { supabase } from '../../supabaseClient'

const steps = ['Select Tests', 'Collection Method', 'Schedule', 'Patient Details', 'Confirm']

const sampleTests = [
  { name: 'Complete Blood Count (CBC)', price: 299 },
  { name: 'Lipid Profile', price: 499 },
  { name: 'Thyroid Function Test', price: 599 },
  { name: 'Blood Glucose Fasting', price: 149 },
  { name: 'Liver Function Test', price: 549 },
  { name: 'Kidney Function Test', price: 549 },
]

const DEFAULT_TENANT_ID = import.meta.env.VITE_PUBLIC_CURRENT_TENANT_ID || '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e';

export default function Booking() {
  const navigate = useNavigate()
  const { tenantSlug } = useParams()

  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState([])
  const [collection, setCollection] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [bookedAppointments, setBookedAppointments] = useState([])
  const [technicianCount, setTechnicianCount] = useState(3)

  // Patient Input States
  const [patientName, setPatientName] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [patientGender, setPatientGender] = useState('Male')
  const [patientPhone, setPatientPhone] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [patientPassword, setPatientPassword] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authenticatedUser, setAuthenticatedUser] = useState(null)
  
  // Submission / Overlay States
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState(null)
  const [showLoginIntercept, setShowLoginIntercept] = useState(false)
  const [showRegisterIntercept, setShowRegisterIntercept] = useState(false)

  // Tenant Context Resolution
  const [resolvedTenant, setResolvedTenant] = useState(null)

  useEffect(() => {
    const resolveActiveTenant = async () => {
      try {
        const activeSlug = tenantSlug || 'jhansi-medilife-tenant-01'
        const { data, error } = await supabase
          .from('tenants')
          .select('id, name, subdomain')
          .eq('subdomain', activeSlug)
          .maybeSingle()
        if (error) throw error
        if (!data) throw new Error("Tenant not found")
        setResolvedTenant(data)
      } catch (err) {
        console.warn("Tenant lookup in Booking failed, fallback to default:", err)
        setResolvedTenant({
          id: DEFAULT_TENANT_ID,
          name: 'Jhansi Medilife Pathology Lab',
          subdomain: 'jhansi-medilife-tenant-01'
        })
      }
    }
    resolveActiveTenant()
  }, [tenantSlug])

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        if (session?.user) {
          setAuthenticatedUser(session.user)
          // Prefill details from user_profiles
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, email, phone_number, dob, gender')
            .eq('user_id', session.user.id)
            .maybeSingle()

          if (profile) {
            setPatientName(profile.full_name || '')
            setPatientEmail(profile.email || session.user.email || '')
            setPatientPhone(profile.phone_number || '')
            if (profile.gender) setPatientGender(profile.gender)
            if (profile.dob) {
              const birthYear = new Date(profile.dob).getFullYear()
              const currentYear = new Date().getFullYear()
              if (birthYear && birthYear > 1900) {
                setPatientAge(String(currentYear - birthYear))
              }
            }
          } else {
            setPatientEmail(session.user.email || '')
          }
        }
      } catch (err) {
        console.warn("Error checking user session:", err)
      }
    }
    checkUserSession()
  }, [])

  const getCalculatedDob = (ageStr) => {
    if (!ageStr) return null
    const ageNum = parseInt(ageStr, 10)
    if (isNaN(ageNum) || ageNum <= 0) return null
    const birthYear = new Date().getFullYear() - ageNum
    return `${birthYear}-01-01`
  }

  const getLocalDateStr = (d) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const todayStr = getLocalDateStr(new Date())
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 3)
  const maxStr = getLocalDateStr(maxDate)

  const [selectedDate, setSelectedDate] = useState(todayStr)

  const handleConfirmBooking = async (e) => {
    if (e) e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);

    try {
      const tenantId = resolvedTenant?.id || DEFAULT_TENANT_ID;

      // Check if user is already authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userId = session.user.id;

        const calculatedDob = getCalculatedDob(patientAge);
        // Make sure we update the profile with latest details if they edited them
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            full_name: patientName,
            phone_number: patientPhone,
            email: patientEmail,
            dob: calculatedDob,
            gender: patientGender
          })
          .eq('user_id', userId);

        if (profileError) {
          console.warn("Could not update profile on direct booking:", profileError);
        }

        // Insert booking directly
        const { error: insertError } = await supabase
          .from('bookings')
          .insert({
            tenant_id: tenantId,
            patient_id: userId,
            patient_name: patientName || 'Patient',
            patient_age: patientAge || '30',
            gender: patientGender || 'Male',
            tests: selected.length > 0 ? selected : ['General Checkup'],
            booking_date: selectedDate,
            time_slot: selectedSlot || '09:00 AM',
            status: 'waiting'
          });

        if (insertError) throw insertError;

        setSubmitted(true);
        setBookingLoading(false);
        return;
      }

      // 1. Invoke RPC check_user_exists
      const { data: checkData, error: checkError } = await supabase.rpc('check_user_exists', {
        p_email: patientEmail,
        p_phone: patientPhone,
        p_tenant_id: tenantId
      });

      if (checkError) throw checkError;

      const userExists = checkData && checkData.length > 0 && checkData[0].user_exists;

      if (userExists) {
        // 2. User exists: intercept UI to request credentials
        setShowLoginIntercept(true);
        setBookingLoading(false);
        return;
      }

      // 3. User does not exist: intercept UI to request password creation
      setShowRegisterIntercept(true);
      setBookingLoading(false);
    } catch (err) {
      console.error("Booking verification error:", err);
      setBookingError(err.message || "An unexpected error occurred during booking.");
      setBookingLoading(false);
    }
  };

  const handleRegisterAndConfirm = async (e) => {
    if (e) e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);

    if (registerPassword !== confirmPassword) {
      setBookingError("Passwords do not match.");
      setBookingLoading(false);
      return;
    }

    try {
      const tenantId = resolvedTenant?.id || DEFAULT_TENANT_ID;

      // 1. Sign up new user with chosen password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: patientEmail,
        password: registerPassword,
        options: {
          data: {
            full_name: patientName,
            tenant_id: tenantId
          }
        }
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Failed to register new account.");

      const calculatedDob = getCalculatedDob(patientAge);
      // Update the user profile phone number, dob, and gender
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          full_name: patientName,
          phone_number: patientPhone,
          dob: calculatedDob,
          gender: patientGender
        })
        .eq('user_id', userId);

      if (profileError) {
        console.warn("Could not update profile phone number after register:", profileError);
      }

      // 2. Insert booking
      console.log("Tenant ID being inserted:", tenantId);
      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          tenant_id: tenantId,
          patient_id: userId,
          patient_name: patientName || 'Patient',
          patient_age: patientAge || '30',
          gender: patientGender || 'Male',
          tests: selected.length > 0 ? selected : ['General Checkup'],
          booking_date: selectedDate,
          time_slot: selectedSlot || '09:00 AM',
          status: 'waiting'
        });

      if (insertError) throw insertError;

      setShowRegisterIntercept(false);
      setSubmitted(true);
    } catch (err) {
      console.error("Register/booking submission error:", err);
      setBookingError(err.message || "Failed to create account or confirm booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLoginAndConfirm = async (e) => {
    if (e) e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: patientEmail,
        password: patientPassword
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Failed to sign in.");

      const tenantId = resolvedTenant?.id || DEFAULT_TENANT_ID;

      // Insert booking using existing user UUID
      console.log("Tenant ID being inserted:", tenantId);
      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          tenant_id: tenantId,
          patient_id: userId,
          patient_name: patientName || 'Patient',
          patient_age: patientAge || '30',
          gender: patientGender || 'Male',
          tests: selected.length > 0 ? selected : ['General Checkup'],
          booking_date: selectedDate,
          time_slot: selectedSlot || '09:00 AM',
          status: 'waiting'
        });

      if (insertError) throw insertError;

      setShowLoginIntercept(false);
      setSubmitted(true);
    } catch (err) {
      console.error("Sign-in/booking submission error:", err);
      setBookingError(err.message || "Invalid credentials or booking failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  const toggle = (name) =>
    setSelected((prev) => prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name])

  const total = sampleTests.filter((t) => selected.includes(t.name)).reduce((a, t) => a + t.price, 0)

  if (submitted) {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-lg py-xxl text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14 }}
            className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-xl"
          >
            <span className="material-symbols-outlined text-emerald-600 icon-fill" style={{ fontSize: '56px' }}>check_circle</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="text-headline-lg font-bold text-on-surface mb-md">Booking Confirmed!</h1>
            <p className="text-body-lg text-on-surface-variant mb-sm">Booking ID: <span className="font-mono font-bold text-primary">#ML-{Math.random().toString(36).slice(2, 8).toUpperCase()}</span></p>
            
            {/* Pre-Test Fasting & Email Notification Notice Box */}
            <div className="max-w-md mx-auto mb-lg p-md bg-surface-container border border-outline-variant/30 rounded-2xl text-left space-y-xs">
              <div className="flex items-center gap-xs font-bold text-label-md text-primary">
                <span className="material-symbols-outlined text-[20px] text-primary">mail</span>
                <span>Pre-Test Guidelines Dispatched to Email & Portal</span>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                We have sent an email with your test preparation rules and fasting requirements to your registered address. You can also access these guidelines directly in your Patient Portal.
              </p>
            </div>

            <div className="flex gap-md justify-center flex-wrap">
              <Link to="/" className="btn-primary">Back to Home</Link>
              <Link to="/portal" className="btn-outline">View Portal</Link>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="bg-primary py-xl px-lg text-on-primary">
        <div className="max-w-[1280px] mx-auto">
          <h1 className="text-display-lg-mobile font-bold mb-lg">Book a Test</h1>
          {/* Progress Steps */}
          <div className="flex items-center justify-between w-full">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-0.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all shrink-0 ${
                    i < step ? 'bg-on-primary text-primary' : i === step ? 'bg-on-primary text-primary ring-2 ring-white/50' : 'bg-on-primary/20 text-on-primary/50'
                  }`}>
                    {i < step ? <span className="material-symbols-outlined text-[14px]">check</span> : i + 1}
                  </div>
                  <span className={`text-[9px] sm:text-label-sm font-semibold text-center leading-tight max-w-[56px] sm:max-w-none ${
                    i <= step ? 'text-on-primary' : 'text-on-primary/50'
                  }`}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded transition-all ${
                    i < step ? 'bg-on-primary' : 'bg-on-primary/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-lg py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Main step content */}
          <div className="lg:col-span-2">
            {/* Form navigation at the top */}
            <div className="flex gap-md mb-xl items-center pb-md border-b border-outline-variant/30">
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} className="btn-outline flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back
                </button>
              )}
              <div className="text-label-md text-on-surface-variant font-medium ml-xs">
                Step {step + 1} of {steps.length}: <span className="text-on-surface font-bold">{steps[step]}</span>
              </div>
              {step < steps.length - 1 ? (
                <button onClick={() => setStep((s) => s + 1)} className="btn-primary ml-auto flex items-center gap-xs"
                  disabled={
                    (step === 0 && selected.length === 0) ||
                    (step === 2 && (!selectedDate || !selectedSlot)) ||
                    (step === 3 && (!patientName || !patientAge || !patientPhone || !patientEmail))
                  }
                >
                  Next
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleConfirmBooking}
                  className="btn-primary ml-auto bg-emerald-600 hover:opacity-90 flex items-center gap-xs"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

                {step === 0 && (
                  <div className="space-y-md">
                    <h2 className="text-headline-md font-bold text-on-surface">Select Your Tests</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                      {sampleTests.map((t) => (
                        <button key={t.name} onClick={() => toggle(t.name)}
                          className={`p-lg rounded-2xl border-2 text-left transition-all duration-200 ${selected.includes(t.name) ? 'border-primary bg-secondary-container shadow-clinical' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-label-md text-on-surface">{t.name}</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected.includes(t.name) ? 'bg-primary border-primary' : 'border-outline-variant'}`}>
                              {selected.includes(t.name) && <span className="material-symbols-outlined text-on-primary text-[14px]">check</span>}
                            </div>
                          </div>
                          <span className="text-label-md font-bold text-primary mt-sm block">₹{t.price}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-label-sm text-on-surface-variant">
                      <Link to="/tests" className="text-primary underline">Browse all 200+ tests</Link>
                    </p>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-md">
                    <h2 className="text-headline-md font-bold text-on-surface">Collection Method</h2>
                    <p className="text-body-md text-on-surface-variant -mt-1">Tap an option to continue automatically.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                      {[
                        { value: 'home', icon: 'home', title: 'Home Collection', desc: 'Trained phlebotomist visits your home. Free for orders above ₹999.' },
                        { value: 'walkin', icon: 'local_hospital', title: 'Walk-in to Clinic', desc: 'Visit our clinic at your convenience. No wait time with booking.' },
                      ].map(({ value, icon, title, desc }) => (
                        <button
                          key={value}
                          onClick={() => {
                            setCollection(value)
                            // Auto-advance to Schedule step after a brief highlight
                            setTimeout(() => setStep(2), 250)
                          }}
                          className={`p-lg rounded-2xl border-2 text-left transition-all ${collection === value ? 'border-primary bg-secondary-container shadow-clinical' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40'}`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-md transition-all ${
                            collection === value ? 'bg-primary text-on-primary' : 'bg-secondary-container text-primary'
                          }`}>
                            <span className="material-symbols-outlined">{icon}</span>
                          </div>
                          <h3 className="font-bold text-on-surface mb-xs">{title}</h3>
                          <p className="text-body-md text-on-surface-variant">{desc}</p>
                          {collection === value && (
                            <div className="mt-sm flex items-center gap-xs text-primary text-label-sm font-semibold">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              Selected — moving to next step…
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-md">
                    <h2 className="text-headline-md font-bold text-on-surface">Choose a Time Slot</h2>
                    {/* Date Picker for selecting appointment date */}
                    <div className="mb-md">
                      <label className="text-label-md text-on-surface-variant mb-xs block">Select Date</label>
                      <input type="date" className="input-field" value={selectedDate} min={todayStr} max={maxStr} onChange={(e) => setSelectedDate(e.target.value)} />
                    </div>
                    <TimeSlotPicker
                      slots={['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']}
                      booked={bookedAppointments}
                      technicianCount={technicianCount}
                      selected={selectedSlot}
                      onSelect={setSelectedSlot}
                      selectedDate={selectedDate}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-md">
                    <h2 className="text-headline-md font-bold text-on-surface">Patient Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                      <div>
                        <label className="text-label-md text-on-surface-variant mb-xs block">Full Name *</label>
                        <input required className="input-field" placeholder="Patient name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-label-md text-on-surface-variant mb-xs block">Age *</label>
                        <input required type="number" className="input-field" placeholder="Age" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-label-md text-on-surface-variant mb-xs block">Gender *</label>
                        <select className="input-field" value={patientGender} onChange={(e) => setPatientGender(e.target.value)}>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-label-md text-on-surface-variant mb-xs block">Phone *</label>
                        <input required type="tel" className="input-field" placeholder="+91 xxxxxxxxxx" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-label-md text-on-surface-variant mb-xs block">Email *</label>
                        <input required type="email" className="input-field" placeholder="email@example.com" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-md">
                    <h2 className="text-headline-md font-bold text-on-surface">Confirm Booking</h2>
                    {bookingError && !showLoginIntercept && (
                      <div className="flex gap-xs text-error text-label-md p-md bg-error-container/10 rounded-xl border border-error/20">
                        <span className="material-symbols-outlined text-[16px] text-error">error</span>
                        <span>{bookingError}</span>
                      </div>
                    )}
                    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-lg space-y-md">
                      <div className="flex gap-sm items-center">
                        <span className="material-symbols-outlined text-primary">science</span>
                        <span className="font-label-md text-on-surface">Selected Tests: <span className="font-bold">{selected.join(', ') || 'None'}</span></span>
                      </div>
                      <div className="flex gap-sm items-center">
                        <span className="material-symbols-outlined text-primary">{collection === 'home' ? 'home' : 'local_hospital'}</span>
                        <span className="font-label-md text-on-surface">Collection: <span className="font-bold capitalize">{collection || 'Not selected'}</span></span>
                      </div>
                      <div className="flex gap-sm items-center">
                        <span className="material-symbols-outlined text-primary">calendar_month</span>
                        <span className="font-label-md text-on-surface">Date: <span className="font-bold">{selectedDate || 'Not selected'}</span></span>
                      </div>
                      <div className="flex gap-sm items-center">
                        <span className="material-symbols-outlined text-primary">schedule</span>
                        <span className="font-label-md text-on-surface">Time Slot: <span className="font-bold">{selectedSlot || 'Not selected'}</span></span>
                      </div>
                      <div className="border-t border-outline-variant/30 pt-md flex justify-between items-center">
                        <span className="font-bold text-headline-md text-on-surface">Total</span>
                        <span className="font-bold text-headline-md text-primary">₹{total}</span>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-clinical p-lg">
              <h3 className="font-bold text-headline-sm text-on-surface mb-md">Order Summary</h3>
              {selected.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">No tests selected yet.</p>
              ) : (
                <div className="space-y-sm">
                  {sampleTests.filter((t) => selected.includes(t.name)).map((t) => (
                    <div key={t.name} className="flex justify-between items-center text-label-md">
                      <span className="text-on-surface">{t.name}</span>
                      <span className="font-bold text-primary">₹{t.price}</span>
                    </div>
                  ))}
                  <div className="border-t border-outline-variant/30 pt-sm flex justify-between font-bold text-headline-sm">
                    <span className="text-on-surface">Total</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showLoginIntercept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-lg bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant/30 p-xl shadow-clinical relative"
            >
              <button
                type="button"
                onClick={() => setShowLoginIntercept(false)}
                className="absolute top-md right-md text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="flex flex-col items-center text-center mb-lg">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-primary flex items-center justify-center mb-md">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <h3 className="text-headline-md font-bold text-on-surface">Account Exists</h3>
                <p className="text-body-md text-on-surface-variant mt-xs">
                  An account is already linked with <span className="font-semibold text-primary">{patientEmail}</span>. Please verify your password to finalize your booking.
                </p>
              </div>

              <form onSubmit={handleLoginAndConfirm} className="space-y-md">
                <div>
                  <label className="text-label-md text-on-surface-variant mb-xs block">Password</label>
                  <input
                    required
                    type="password"
                    className="input-field"
                    placeholder="Enter your account password"
                    value={patientPassword}
                    onChange={(e) => setPatientPassword(e.target.value)}
                  />
                </div>

                {bookingError && (
                  <div className="flex gap-xs text-error text-label-md p-md bg-error-container/10 rounded-xl border border-error/20">
                    <span className="material-symbols-outlined text-[16px] text-error">error</span>
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="flex gap-md mt-lg">
                  <button
                    type="button"
                    onClick={() => setShowLoginIntercept(false)}
                    className="btn-outline flex-1 justify-center"
                    disabled={bookingLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 justify-center bg-primary text-on-primary"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Verifying...' : 'Log In & Book'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegisterIntercept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-lg bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant/30 p-xl shadow-clinical relative"
            >
              <button 
                type="button"
                onClick={() => setShowRegisterIntercept(false)} 
                className="absolute top-md right-md text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="flex flex-col items-center text-center mb-lg">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-primary flex items-center justify-center mb-md">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <h3 className="text-headline-md font-bold text-on-surface">Create Account</h3>
                <p className="text-body-md text-on-surface-variant mt-xs">
                  Create a secure password to protect your patient account and view pathology reports online.
                </p>
              </div>

              <form onSubmit={handleRegisterAndConfirm} className="space-y-md">
                <div>
                  <label className="text-label-md text-on-surface-variant mb-xs block">Choose Password</label>
                  <input 
                    required 
                    type="password" 
                    className="input-field" 
                    placeholder="Choose a password (min 6 characters)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-label-md text-on-surface-variant mb-xs block">Confirm Password</label>
                  <input 
                    required 
                    type="password" 
                    className="input-field" 
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {bookingError && (
                  <div className="flex gap-xs text-error text-label-md p-md bg-error-container/10 rounded-xl border border-error/20">
                    <span className="material-symbols-outlined text-[16px] text-error">error</span>
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="flex gap-md mt-lg">
                  <button 
                    type="button" 
                    onClick={() => setShowRegisterIntercept(false)} 
                    className="btn-outline flex-1 justify-center"
                    disabled={bookingLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary flex-1 justify-center bg-primary text-on-primary"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Registering...' : 'Register & Book'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
