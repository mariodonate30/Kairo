import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CheckinProvider } from '../../contexts/CheckinContext'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import MotivationalBanner from '../ui/MotivationalBanner'
import { exitGuestMode, isGuestMode } from '../../lib/guestClient'

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <CheckinProvider>
      <div className="flex min-h-screen bg-slate-50 lg:flex-row">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <div className="flex min-h-screen flex-1 flex-col">
          <MobileNav onMenuClick={() => setMobileMenuOpen(true)} />
          {isGuestMode() && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-emerald-600 px-4 py-2 text-center text-sm text-white">
              <span>
                Estàs en <strong>mode convidat</strong>: pots provar-ho tot, però res no es desa a l'estudi.
              </span>
              <button
                type="button"
                onClick={exitGuestMode}
                className="rounded-lg bg-white/15 px-2.5 py-0.5 font-medium hover:bg-white/25"
              >
                Sortir
              </button>
            </div>
          )}
          <MotivationalBanner />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </CheckinProvider>
  )
}
