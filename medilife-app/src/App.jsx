import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense } from 'react'

// Layouts
import ClientLayout from './layouts/ClientLayout'
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const PatientLayout = lazy(() => import('./layouts/PatientLayout'))

// Client pages (kept eager — these are the public landing pages)
import Home from './pages/client/Home'
const Tests = lazy(() => import('./pages/client/Tests'))
const Packages = lazy(() => import('./pages/client/Packages'))
const Hospitals = lazy(() => import('./pages/client/Hospitals'))
const AboutUs = lazy(() => import('./pages/client/AboutUs'))
const Contact = lazy(() => import('./pages/client/Contact'))
const Booking = lazy(() => import('./pages/client/Booking'))
const Faq = lazy(() => import('./pages/client/Faq'))
import DataPrivacy from './pages/client/DataPrivacy'
const Terms = lazy(() => import('./pages/client/Terms'))

// Auth
const Login = lazy(() => import('./pages/auth/Login'))
const Unauthorized = lazy(() => import('./pages/auth/Unauthorized'))
import ProtectedRoute from './components/common/ProtectedRoute'

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const SendReport = lazy(() => import('./pages/admin/SendReport'))
const Analytics = lazy(() => import('./pages/admin/Analytics'))
const DaySchedule = lazy(() => import('./pages/admin/DaySchedule'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

// Patient pages
const PatientPortal = lazy(() => import('./pages/patient/PatientPortal'))
const Reports = lazy(() => import('./pages/patient/Reports'))
const Statistics = lazy(() => import('./pages/patient/Statistics'))
const Profile = lazy(() => import('./pages/patient/Profile'))
const Settings = lazy(() => import('./pages/patient/Settings'))
const Help = lazy(() => import('./pages/patient/Help'))

// Page loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="flex flex-col items-center gap-md">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-body-md text-on-surface-variant">Loading...</p>
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          {/* Public / Client Site */}
          <Route element={<ClientLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/privacy-policy" element={<DataPrivacy />} />
            <Route path="/terms" element={<Terms />} />
          </Route>

          {/* Multi-Tenant Public Login routes */}
          <Route path="/:tenantSlug/admin/login" element={<Login />} />
          <Route path="/:tenantSlug/patient/login" element={<Login />} />
          
          {/* Global Fallback paths redirecting to Default Tenant Jhansi */}
          <Route path="/login" element={<Navigate to="/jhansi-medilife-tenant-01/patient/login" replace />} />
          <Route path="/admin/login" element={<Navigate to="/jhansi-medilife-tenant-01/admin/login" replace />} />
          <Route path="/patient/login" element={<Navigate to="/jhansi-medilife-tenant-01/patient/login" replace />} />
          <Route path="/403" element={<Unauthorized />} />

          {/* Protected Admin Portal (Requires 'super_admin', 'admin', 'lab_tech', or 'worker' roles) */}
          <Route 
            path="/:tenantSlug/admin" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'lab_tech', 'worker']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reports" element={<SendReport />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="schedule" element={<DaySchedule />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Protected Patient Portal (Requires 'patient' role) */}
          <Route 
            path="/:tenantSlug/patient" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<PatientPortal />} />
            <Route path="reports" element={<Reports />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>

          {/* Redirect empty portals to dashboard */}
          <Route path="/admin" element={<Navigate to="/jhansi-medilife-tenant-01/admin/dashboard" replace />} />
          <Route path="/portal" element={<Navigate to="/jhansi-medilife-tenant-01/patient/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
