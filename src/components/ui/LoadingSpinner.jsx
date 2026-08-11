export default function LoadingSpinner({ label = 'Cargando…' }) {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}
