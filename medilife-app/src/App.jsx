import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Layouts
import ClientLayout from './layouts/ClientLayout'
import AdminLayout from './layouts/AdminLayout'
import PatientLayout from './layouts/PatientLayout'

// Client pages
import Home from './pages/client/Home'
import Tests from './pages/client/Tests'
import Packages from './pages/client/Packages'
import AboutUs from './pages/client/AboutUs'
import Contact from './pages/client/Contact'
import Booking from './pages/client/Booking'

// Auth
import Login from './pages/auth/Login'
import Unauthorized from './pages/auth/Unauthorized'
import ProtectedRoute from './components/common/ProtectedRoute'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import SendReport from './pages/admin/SendReport'
import Analytics from './pages/admin/Analytics'
import DaySchedule from './pages/admin/DaySchedule'
import AdminSettings from './pages/admin/AdminSettings'

// Patient pages
import PatientPortal from './pages/patient/PatientPortal'
import Reports from './pages/patient/Reports'
import Statistics from './pages/patient/Statistics'
import Profile from './pages/patient/Profile'
import Settings from './pages/patient/Settings'
import Help from './pages/patient/Help'

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Public / Client Site */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/booking" element={<Booking />} />
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
