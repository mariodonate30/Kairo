import { useState } from 'react'
import { ArrowRight, MessageSquareText, Power, TrendingUp, Wrench } from 'lucide-react'
import { toCatalan } from '../../utils/catalan'

// Formatea una puntuación de autoestima o un guion si falta.
const fmt = (v) => (v == null ? '—' : v)

// Etiqueta de la variación con color (verde sube, rojo baja).
function DeltaBadge({ delta }) {
  if (delta == null) return <span className="text-slate-400">—</span>
  const up = delta > 0
  const down = delta < 0
  const cls = up ? 'text-emerald-600' : down ? 'text-rose-600' : 'text-slate-500'
  const sign = up ? '+' : ''
  return <span className={`font-semibold ${cls}`}>{sign}{delta}</span>
}

// Interruptor de activación de la encuesta final.
function ActivationCard({ active, count, onToggle }) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    const message = active
      ? 'Vols desactivar l\'enquesta final? Deixarà de mostrar-se als alumnes.'
      : 'Vols activar l\'enquesta final? A partir d\'ara, tots els alumnes l\'hauran de completar per poder fer servir l\'app.'
    if (!window.confirm(message)) return
    setBusy(true)
    await onToggle(!active)
    setBusy(false)
  }

  return (
    <section
      className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${
        active ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-100 bg-white'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Power className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Enquesta final: {active ? 'ACTIVADA' : 'desactivada'}
            </h2>
            <p className="mt-0.5 max-w-md text-xs text-slate-500">
              {active
                ? 'Els alumnes la veuen i l\'han de completar per fer servir l\'app. Ja hi ha ' +
                  count +
                  ' respondida(s).'
                : 'Està amagada per a tothom. Activeu-la quan vulgueu tancar l\'estudi.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClick}
          disabled={busy}
          className={[
            'rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60',
            active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700',
          ].join(' ')}
        >
          {busy ? 'Desant…' : active ? 'Desactivar' : 'Activar l\'enquesta final'}
        </button>
      </div>
    </section>
  )
}

// Tarjeta de estadística.
function StatCard({ label, value, hint, accent }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className={`text-xs font-medium uppercase tracking-wide ${accent}`}>{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

// Barra simple de distribución (herramienta más útil, mejora percibida).
function DistributionBars({ rows, total, color = 'bg-violet-500' }) {
  if (!total) return <p className="text-sm text-slate-400">Encara no hi ha respostes.</p>
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const pct = total ? Math.round((row.count / total) * 100) : 0
        return (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{row.label}</span>
              <span className="text-slate-500">
                {row.count} · {pct}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function EvolutionPanel({
  active,
  onToggle,
  initialStats,
  finalStats,
  evolution,
  impact,
}) {
  const completedCount = finalStats.all.count
  const deltaMean =
    initialStats.all.mean != null && finalStats.all.mean != null
      ? Number((finalStats.all.mean - initialStats.all.mean).toFixed(1))
      : null

  const genderLabel = (g) => (g === 'chico' ? 'Noi' : g === 'chica' ? 'Noia' : '—')
  const comments = evolution.filter((row) => row.comment && row.comment.trim())

  const improvementRows = [
    { label: 'Sí', count: impact.improvement['Sí'] },
    { label: 'Una mica', count: impact.improvement['Un poco'] },
    { label: 'No', count: impact.improvement['No'] },
  ]
  const improvementTotal = improvementRows.reduce((s, r) => s + r.count, 0)
  const toolTotal = impact.toolRows.reduce((s, r) => s + r.count, 0)

  return (
    <div className="flex flex-col gap-4">
      {onToggle && <ActivationCard active={active} count={completedCount} onToggle={onToggle} />}

      {completedCount === 0 ? (
        <section className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate-500">
            Encara no hi ha enquestes finals completades. Quan els alumnes la responguin, aquí veuràs l'evolució de cadascun (inicial → final) i l'impacte de l'app.
          </p>
        </section>
      ) : (
        <>
          {/* Resumen de autoestima inicial vs final */}
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Finals completades"
              value={completedCount}
              hint="Alumnes que l'han feta"
              accent="text-violet-500"
            />
            <StatCard
              label="Autoestima inicial"
              value={initialStats.all.mean != null ? `${initialStats.all.mean} / ${initialStats.max}` : '—'}
              hint="Mitjana en començar"
              accent="text-sky-500"
            />
            <StatCard
              label="Autoestima final"
              value={finalStats.all.mean != null ? `${finalStats.all.mean} / ${finalStats.max}` : '—'}
              hint="Mitjana en acabar"
              accent="text-emerald-500"
            />
            <StatCard
              label="Variació mitjana"
              value={deltaMean == null ? '—' : `${deltaMean > 0 ? '+' : ''}${deltaMean}`}
              hint="Final − inicial"
              accent={deltaMean > 0 ? 'text-emerald-500' : deltaMean < 0 ? 'text-rose-500' : 'text-slate-500'}
            />
          </section>

          {/* Tabla de evolución por alumno */}
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Evolució per alumne</h2>
                <p className="text-xs text-slate-400">
                  Autoestima (Rosenberg) i notes, aparellades per persona. Identitat anònima.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-2 font-medium">Alumne</th>
                    <th className="px-3 py-2 font-medium">Gènere</th>
                    <th className="px-3 py-2 font-medium">Autoest. inicial</th>
                    <th className="px-3 py-2 font-medium">Autoest. final</th>
                    <th className="px-3 py-2 font-medium">Δ</th>
                    <th className="px-3 py-2 font-medium">Nota base</th>
                    <th className="px-3 py-2 font-medium">Nota examen</th>
                    <th className="px-3 py-2 font-medium">Millora?</th>
                  </tr>
                </thead>
                <tbody>
                  {evolution.map((row) => (
                    <tr key={row.anonId} className="border-b border-slate-50 last:border-0">
                      <td className="px-3 py-2 font-medium text-slate-700">Alumne {row.anonId}</td>
                      <td className="px-3 py-2 text-slate-500">{genderLabel(row.gender)}</td>
                      <td className="px-3 py-2 text-slate-600">{fmt(row.initialScore)}</td>
                      <td className="px-3 py-2 text-slate-600">{fmt(row.finalScore)}</td>
                      <td className="px-3 py-2"><DeltaBadge delta={row.delta} /></td>
                      <td className="px-3 py-2 text-slate-500">{row.gradeBaseline || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row.gradeExam ? toCatalan(row.gradeExam) : '—'}</td>
                      <td className="px-3 py-2 text-slate-500">{row.improvement ? toCatalan(row.improvement) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Impacto de la app: herramienta más útil + mejora percibida */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Eina més útil</h2>
                  <p className="text-xs text-slate-400">Hipòtesi H3.1</p>
                </div>
              </div>
              <DistributionBars
                rows={impact.toolRows.map((r) => ({ label: toCatalan(r.tool), count: r.count }))}
                total={toolTotal}
                color="bg-amber-500"
              />
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Millora percebuda</h2>
                  <p className="text-xs text-slate-400">Hipòtesi H3.2 (autopercepció)</p>
                </div>
              </div>
              <DistributionBars rows={improvementRows} total={improvementTotal} color="bg-emerald-500" />
            </section>
          </div>

          {/* Comentarios abiertos */}
          {comments.length > 0 && (
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Comentaris dels alumnes</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {comments.map((row) => (
                  <li key={row.anonId} className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="mb-1 text-xs font-semibold text-slate-400">Alumne {row.anonId}</p>
                    <p className="text-sm text-slate-700">{row.comment}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
