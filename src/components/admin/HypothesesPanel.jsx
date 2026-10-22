import { CheckCircle2, CircleDashed, CircleHelp, Lightbulb, XCircle } from 'lucide-react'
import { HYPOTHESIS_GROUPS } from '../../utils/hypotheses'

// Estilo y texto (en catalán) de cada veredicto.
const VERDICTS = {
  confirmada: {
    label: 'Confirmada',
    icon: CheckCircle2,
    badge: 'bg-emerald-50 text-emerald-700',
    card: 'bg-emerald-50 text-emerald-600',
  },
  parcial: {
    label: 'Parcialment confirmada',
    icon: CircleDashed,
    badge: 'bg-amber-50 text-amber-700',
    card: 'bg-amber-50 text-amber-600',
  },
  refutada: {
    label: 'Refutada',
    icon: XCircle,
    badge: 'bg-rose-50 text-rose-700',
    card: 'bg-rose-50 text-rose-600',
  },
  insuficient: {
    label: 'Dades insuficients',
    icon: CircleHelp,
    badge: 'bg-slate-100 text-slate-500',
    card: 'bg-slate-100 text-slate-500',
  },
}

function VerdictBadge({ verdict }) {
  const { label, icon: Icon, badge } = VERDICTS[verdict]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

function HypothesisCard({ hypothesis, result }) {
  const pendingText = result.pendingFinal
    ? "Pendent de l'enquesta final: quan els alumnes la responguin, aquí apareixerà la conclusió."
    : 'Encara no hi ha prou respostes per extreure una conclusió fiable.'

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">
            {hypothesis.id}
          </p>
          <h3 className="text-base font-semibold text-slate-900">{hypothesis.title}</h3>
        </div>
        <VerdictBadge verdict={result.verdict} />
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Hipòtesi</p>
        <p className="text-sm italic text-slate-600">{hypothesis.statement}</p>
      </div>

      {result.metrics.length > 0 && (
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {result.metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-slate-50 px-3.5 py-2.5">
              <dt className="text-xs text-slate-500">{metric.label}</dt>
              <dd className="text-lg font-semibold text-slate-900">{metric.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-500">
          Conclusió
        </p>
        <p className="text-sm text-slate-700">
          {result.verdict === 'insuficient' ? pendingText : result.conclusion}
        </p>
      </div>
    </article>
  )
}

// Panel de hipótesis y conclusiones del TDR, en catalán. Solo muestra
// resultados agregados: nunca el número ni la identidad de los participantes.
export default function HypothesesPanel({ data }) {
  const { results, summary } = data

  const decided = HYPOTHESIS_GROUPS.flatMap((g) => g.items).filter(
    (h) => results[h.id].verdict !== 'insuficient',
  )
  const confirmedIds = decided.filter((h) => results[h.id].verdict === 'confirmada').map((h) => h.id)
  const partialIds = decided.filter((h) => results[h.id].verdict === 'parcial').map((h) => h.id)
  const refutedIds = decided.filter((h) => results[h.id].verdict === 'refutada').map((h) => h.id)

  const list = (ids) => ids.join(', ')

  return (
    <div className="flex flex-col gap-6">
      {/* Resumen de veredictos */}
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Hipòtesis i conclusions</h2>
            <p className="text-xs text-slate-400">
              Calculades automàticament a partir del test inicial i l'enquesta final.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(VERDICTS).map(([key, { label, icon: Icon, card }]) => (
            <div key={key} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{summary[key]}</p>
                <p className="text-xs leading-tight text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {decided.length > 0 && (
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Conclusió general
            </p>
            <p>
              {confirmedIds.length > 0 && (
                <>Les dades confirmen les hipòtesis <strong>{list(confirmedIds)}</strong>. </>
              )}
              {partialIds.length > 0 && (
                <>Les hipòtesis <strong>{list(partialIds)}</strong> es confirmen només en part. </>
              )}
              {refutedIds.length > 0 && (
                <>En canvi, les dades no donen suport a <strong>{list(refutedIds)}</strong>. </>
              )}
            </p>
          </div>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Criteri: per a les relacions entre variables s'utilitza la correlació de Pearson (r).
          |r| ≥ 0,3 es considera una relació clara (confirmada) i 0,1–0,3 una relació feble
          (parcial). Les dades són orientatives i no tenen valor diagnòstic.
        </p>
      </section>

      {HYPOTHESIS_GROUPS.map((group) => (
        <section key={group.key} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-slate-900">{group.title}</h2>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {group.items.map((hypothesis) => (
              <HypothesisCard
                key={hypothesis.id}
                hypothesis={hypothesis}
                result={results[hypothesis.id]}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
