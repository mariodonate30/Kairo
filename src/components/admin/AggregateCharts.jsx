import {
  Activity,
  BarChart3,
  LayoutGrid,
  Moon,
  Smile,
  Zap,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartCard from '../charts/ChartCard'
import MoodChart from '../charts/MoodChart'
import SleepChart from '../charts/SleepChart'
import StressChart from '../charts/StressChart'
import {
  AXIS_TICK,
  GRID_STROKE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_STYLE,
} from '../charts/chartTheme'

// Paleta para las barras de categorías de encuesta.
const CATEGORY_COLORS = ['#f43f5e', '#0ea5e9', '#f59e0b', '#6366f1', '#10b981']

// Distribución media (0-100 %) de respuestas por categoría de encuesta.
function CategoryDistributionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          contentStyle={TOOLTIP_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          formatter={(value) => [`${value}%`, 'Media']}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((entry, index) => (
            <Cell key={entry.category} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Uso de cada sección de la app (número de registros).
function SectionUsageChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
        <XAxis
          type="number"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="section"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          contentStyle={TOOLTIP_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          formatter={(value) => [`${value} registros`, 'Uso']}
        />
        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Tasa de retención diaria: % de estudiantes activos cada día.
function RetentionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis
          dataKey="label"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={16}
        />
        <YAxis
          domain={[0, 100]}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={34}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          formatter={(value, _name, entry) => [
            `${value}% (${entry?.payload?.active ?? 0} usuarios)`,
            'Activos',
          ]}
        />
        <Line
          type="monotone"
          dataKey="percent"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Rejilla completa de gráficos agregados y anonimizados del instituto.
export default function AggregateCharts({ dailyRows, categoryRows, sectionRows, retentionRows }) {
  const hasDaily = dailyRows.length > 0
  const hasCategory = categoryRows.length > 0
  const hasSection = sectionRows.some((row) => row.count > 0)
  const hasRetention = retentionRows.length > 0

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard
        icon={Smile}
        title="Ánimo medio del instituto"
        subtitle="Media diaria (escala 1-5)"
        accent="violet"
        hasData={hasDaily}
      >
        <MoodChart data={dailyRows} />
      </ChartCard>

      <ChartCard
        icon={Moon}
        title="Horas de sueño medias"
        subtitle="Media diaria de horas dormidas"
        accent="indigo"
        hasData={hasDaily}
      >
        <SleepChart data={dailyRows} />
      </ChartCard>

      <ChartCard
        icon={Zap}
        title="Nivel de estrés medio"
        subtitle="Media diaria (escala 1-5)"
        accent="rose"
        hasData={hasDaily}
      >
        <StressChart data={dailyRows} />
      </ChartCard>

      <ChartCard
        icon={Activity}
        title="Tasa de retención"
        subtitle="% de estudiantes activos cada día"
        accent="emerald"
        hasData={hasRetention}
        emptyLabel="Aún no hay actividad registrada en este periodo."
      >
        <RetentionChart data={retentionRows} />
      </ChartCard>

      <ChartCard
        icon={BarChart3}
        title="Respuestas por categoría de encuesta"
        subtitle="Media normalizada (0-100 %)"
        accent="rose"
        hasData={hasCategory}
        emptyLabel="Todavía no hay encuestas completadas en este periodo."
      >
        <CategoryDistributionChart data={categoryRows} />
      </ChartCard>

      <ChartCard
        icon={LayoutGrid}
        title="Secciones más usadas"
        subtitle="Número de registros por sección"
        accent="violet"
        hasData={hasSection}
        emptyLabel="Aún no hay actividad en este periodo."
      >
        <SectionUsageChart data={sectionRows} />
      </ChartCard>
    </div>
  )
}
