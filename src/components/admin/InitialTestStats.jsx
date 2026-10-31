import { Heart, HeartPulse, Users } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartCard from '../charts/ChartCard'
import {
  AXIS_TICK,
  GRID_STROKE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_STYLE,
} from '../charts/chartTheme'

const GROUP_COLORS = { Todos: '#8b5cf6', Chicos: '#0ea5e9', Chicas: '#f43f5e' }

// Tarjeta de estadística (mismo estilo que el dashboard de admin).
function StatCard({ icon: Icon, label, value, hint, accent }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`flex items-center gap-2 ${accent}`}>
        <Icon className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      </div>
      <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

// Gráfico de barras: media de autoestima (/40) por grupo.
function GroupMeanChart({ data, min, max }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="group" tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <YAxis
          domain={[min, max]}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={34}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          contentStyle={TOOLTIP_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          formatter={(value, _name, entry) => [
            `${value} / ${max}  (${entry?.payload?.count ?? 0} alumnes)`,
            'Mitjana',
          ]}
        />
        <Bar dataKey="mean" radius={[6, 6, 0, 0]} maxBarSize={64}>
          <LabelList dataKey="mean" position="top" className="fill-slate-500 text-xs" />
          {data.map((entry) => (
            <Cell key={entry.group} fill={GROUP_COLORS[entry.group] || '#8b5cf6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Barra de distribución por nivel (baja / media / alta).
function LevelDistribution({ levels }) {
  const total = levels.baja + levels.media + levels.alta
  const rows = [
    { key: 'baja', label: 'Autoestima baixa', color: 'bg-rose-500', hint: '10-25 punts' },
    { key: 'media', label: 'Autoestima mitjana', color: 'bg-amber-500', hint: '26-29 punts' },
    { key: 'alta', label: 'Autoestima alta', color: 'bg-emerald-500', hint: '30-40 punts' },
  ]

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const count = levels[row.key]
        const pct = total ? Math.round((count / total) * 100) : 0
        return (
          <div key={row.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{row.label}</span>
              <span className="text-slate-500">
                {count} {count === 1 ? 'alumne' : 'alumnes'} · {pct}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-0.5 text-xs text-slate-400">{row.hint}</p>
          </div>
        )
      })}
    </div>
  )
}

export default function InitialTestStats({ stats }) {
  const { all, chico, chica, levels, min, max } = stats

  // Datos del gráfico por grupo: siempre "Todos"; chicos/chicas solo si hay.
  const groupData = [{ group: 'Tots', mean: all.mean, count: all.count }]
  if (chico.count > 0) groupData.push({ group: 'Nois', mean: chico.mean, count: chico.count })
  if (chica.count > 0) groupData.push({ group: 'Noies', mean: chica.mean, count: chica.count })

  const hasData = all.count > 0

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-sm text-violet-800">
        <p>
          <strong>Autoestima (escala de Rosenberg).</strong> Cada alumne respon 10 frases (1-4) al test inicial. S'inverteixen les frases negatives i se sumen: la puntuació va de{' '}
          <strong>{min}</strong> (autoestima més baixa) a <strong>{max}</strong> (més alta). Aquí veus les mitjanes de l'institut, en conjunt i separades per sexe.
        </p>
      </section>

      {!hasData ? (
        <section className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Heart className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate-500">
            Encara no hi ha tests inicials completats. Quan els alumnes omplin el qüestionari en registrar-se, aquí apareixeran les puntuacions d'autoestima.
          </p>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label="Tests completats"
              value={all.count}
              hint="Amb les 10 respostes"
              accent="text-violet-500"
            />
            <StatCard
              icon={HeartPulse}
              label="Mitjana general"
              value={`${all.mean} / ${max}`}
              hint={`${all.meanPct}% del màxim`}
              accent="text-rose-500"
            />
            <StatCard
              icon={Heart}
              label="Mitjana nois"
              value={chico.count ? `${chico.mean} / ${max}` : '—'}
              hint={chico.count ? `${chico.count} alumnes` : 'Sense dades'}
              accent="text-sky-500"
            />
            <StatCard
              icon={Heart}
              label="Mitjana noies"
              value={chica.count ? `${chica.mean} / ${max}` : '—'}
              hint={chica.count ? `${chica.count} alumnes` : 'Sense dades'}
              accent="text-rose-500"
            />
          </section>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ChartCard
              icon={HeartPulse}
              title="Autoestima mitjana per grup"
              subtitle={`Puntuació de Rosenberg (${min}-${max})`}
              accent="violet"
              hasData={hasData}
            >
              <GroupMeanChart data={groupData} min={min} max={max} />
            </ChartCard>

            <ChartCard
              icon={Heart}
              title="Distribució per nivell"
              subtitle="Repartiment d'alumnes segons la seva autoestima"
              accent="rose"
              hasData={hasData}
            >
              <div className="flex h-full items-center">
                <div className="w-full">
                  <LevelDistribution levels={levels} />
                </div>
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}
