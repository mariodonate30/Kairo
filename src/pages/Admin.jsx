import { useMemo, useState } from 'react'
import { BarChart3, ClipboardList, Database } from 'lucide-react'
import { useAdminData } from '../hooks/useAdminData'
import { daysAgo } from '../utils/dateHelpers'
import {
  buildCategoryDistribution,
  buildDailyAverages,
  buildRetention,
  buildSectionUsage,
  computeDashboardStats,
  countByGender,
  filterDataByGender,
} from '../utils/adminStats'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import AdminDashboard from '../components/admin/AdminDashboard'
import AggregateCharts from '../components/admin/AggregateCharts'
import SurveyManager from '../components/admin/SurveyManager'
import DataExport from '../components/admin/DataExport'

// Rangos temporales para los gráficos agregados. `days` a null = todo el historial.
const RANGES = [
  { key: 'week', label: 'Última semana', days: 7 },
  { key: 'month', label: 'Último mes', days: 30 },
  { key: 'all', label: 'Todo', days: null },
]

const TABS = [
  { key: 'overview', label: 'Datos agregados', icon: BarChart3 },
  { key: 'surveys', label: 'Encuestas', icon: ClipboardList },
  { key: 'export', label: 'Exportar', icon: Database },
]

export default function Admin() {
  const admin = useAdminData()
  const {
    loading,
    error,
    questions,
    anonIds,
    genderById,
    createQuestion,
    updateQuestion,
    toggleQuestion,
  } = admin

  const [tab, setTab] = useState('overview')
  const [rangeKey, setRangeKey] = useState('month')
  const [genderKey, setGenderKey] = useState('all')

  const range = RANGES.find((r) => r.key === rangeKey) || RANGES[1]
  const fromDate = range.days ? daysAgo(range.days) : null

  const stats = useMemo(() => computeDashboardStats(admin), [admin])

  const genderCounts = useMemo(
    () => countByGender(admin.profiles, genderById),
    [admin.profiles, genderById],
  )

  // Opciones del filtro por sexo. La vista conjunta ('all') muestra a todos.
  const GENDER_FILTERS = [
    { key: 'all', label: 'Todos', count: genderCounts.chico + genderCounts.chica },
    { key: 'chico', label: 'Chicos', count: genderCounts.chico },
    { key: 'chica', label: 'Chicas', count: genderCounts.chica },
  ]

  // Datos filtrados al sexo seleccionado (o todos). Todos los gráficos de la
  // pestaña "Datos agregados" se calculan sobre esta vista.
  const scoped = useMemo(
    () => filterDataByGender(admin, genderById, genderKey),
    [admin, genderById, genderKey],
  )

  const dailyRows = useMemo(
    () => buildDailyAverages(scoped.checkins, fromDate),
    [scoped.checkins, fromDate],
  )
  const categoryRows = useMemo(
    () => buildCategoryDistribution(scoped.surveys, scoped.questions, fromDate),
    [scoped.surveys, scoped.questions, fromDate],
  )
  const sectionRows = useMemo(() => buildSectionUsage(scoped, fromDate), [scoped, fromDate])
  const retentionRows = useMemo(() => buildRetention(scoped, fromDate), [scoped, fromDate])

  if (loading) {
    return <LoadingSpinner label="Cargando datos de administración…" />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de administración</h1>
        <p className="mt-1 text-slate-500">
          Datos agregados y anonimizados del instituto, gestión de encuestas y exportación.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}

      {/* Estadísticas generales (siempre visibles) */}
      <AdminDashboard stats={stats} />

      {/* Navegación por pestañas */}
      <div className="flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={[
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
              tab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filtro por sexo: separa los datos por chicos/chicas o los junta */}
            <div className="flex rounded-2xl bg-slate-100 p-1">
              {GENDER_FILTERS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setGenderKey(option.key)}
                  className={[
                    'rounded-xl px-3.5 py-1.5 text-sm font-medium transition',
                    genderKey === option.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700',
                  ].join(' ')}
                >
                  {option.label}
                  <span className="ml-1.5 text-xs text-slate-400">{option.count}</span>
                </button>
              ))}
            </div>

            {/* Filtro por rango temporal */}
            <div className="flex rounded-2xl bg-slate-100 p-1">
              {RANGES.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setRangeKey(option.key)}
                  className={[
                    'rounded-xl px-3.5 py-1.5 text-sm font-medium transition',
                    rangeKey === option.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700',
                  ].join(' ')}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {genderKey !== 'all' && (
            <p className="rounded-xl bg-violet-50 px-4 py-2.5 text-sm text-violet-700">
              Mostrando solo <strong>{genderKey === 'chico' ? 'chicos' : 'chicas'}</strong>. Los
              alumnos que no indicaron su género ({genderCounts.none}) no aparecen en esta vista.
            </p>
          )}

          <AggregateCharts
            dailyRows={dailyRows}
            categoryRows={categoryRows}
            sectionRows={sectionRows}
            retentionRows={retentionRows}
          />
        </div>
      )}

      {tab === 'surveys' && (
        <SurveyManager
          questions={questions}
          onCreate={createQuestion}
          onUpdate={updateQuestion}
          onToggle={toggleQuestion}
        />
      )}

      {tab === 'export' && (
        <DataExport
          data={admin}
          anonIds={anonIds}
          questions={questions}
          genderById={genderById}
        />
      )}
    </div>
  )
}
