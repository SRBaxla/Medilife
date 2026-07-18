import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import SendReport from './pages/admin/SendReport'
import Analytics from './pages/admin/Analytics'
import DaySchedule from './pages/admin/DaySchedule'

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard'
import Reports from './pages/patient/Reports'
import Statistics from './pages/patient/Statistics'
import Profile from './pages/patient/Profile'
import Settings from './pages/patient/Settings'
import Help from './pages/patient/Help'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public / Client Site */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/booking" element={<Booking />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="send-report" element={<SendReport />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="schedule" element={<DaySchedule />} />
        </Route>

        {/* Patient Portal */}
        <Route path="/portal" element={<PatientLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
        </Route>
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
