import { Outlet } from 'react-router-dom'
import ClientNav from '../components/client/ClientNav'
import ClientFooter from '../components/client/ClientFooter'
import ScrollToTop from '../components/common/ScrollToTop'

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <ScrollToTop />
      <ClientNav />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  )
}
