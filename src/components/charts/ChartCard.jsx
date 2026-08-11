// Contenedor visual reutilizable para cada gráfico del dashboard de progresión.
// Aporta cabecera (icono + título + subtítulo), altura fija para el gráfico y un
// estado vacío coherente cuando no hay datos en el rango seleccionado.

const ACCENTS = {
  violet: 'bg-violet-50 text-violet-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
}

export default function ChartCard({
  icon: Icon,
  title,
  subtitle,
  accent = 'violet',
  hasData = true,
  emptyLabel = 'Sin datos en este periodo todavía.',
  children,
}) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        {Icon && (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              ACCENTS[accent] || ACCENTS.violet
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>

      {hasData ? (
        <div className="h-64 w-full">{children}</div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-50 px-4 text-center text-sm text-slate-400">
          {emptyLabel}
        </div>
      )}
    </section>
  )
}
