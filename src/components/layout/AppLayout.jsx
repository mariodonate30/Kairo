import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CheckinProvider } from '../../contexts/CheckinContext'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import MotivationalBanner from '../ui/MotivationalBanner'

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <CheckinProvider>
      <div className="flex min-h-screen bg-slate-50 lg:flex-row">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <div className="flex min-h-screen flex-1 flex-col">
          <MobileNav onMenuClick={() => setMobileMenuOpen(true)} />
          <MotivationalBanner />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </CheckinProvider>
  )
}
