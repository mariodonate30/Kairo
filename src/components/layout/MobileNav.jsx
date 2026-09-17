import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useCheckin } from '../../hooks/useCheckin'

// Aviso compacto de check-in pendiente, siempre visible en la cabecera móvil
// (el sidebar está oculto en móvil). Enlaza directamente a la pantalla de
// check-in. Si ya está completado, no mostramos nada para no distraer.
function MobilePendingBadge() {
  const { loading, isCompleted } = useCheckin()

  if (loading || isCompleted) return null

  return (
    <Link
      to="/"
      className="ml-auto flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
      </span>
      Check-in pendiente
    </Link>
  )
}

export default function MobileNav({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="Kairo" className="h-7 w-7 rounded-lg" />
        <span className="text-base font-bold text-slate-900">Kairo</span>
      </div>
      <MobilePendingBadge />
    </header>
  )
}
