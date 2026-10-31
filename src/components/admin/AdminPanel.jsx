import { useMemo, useState } from 'react'
import { BarChart3, ClipboardList, Database, Download, HeartPulse, TrendingUp, Users } from 'lucide-react'
import { daysAgo } from '../../utils/dateHelpers'
import { PUBLIC_EXCLUDED_KEYS, buildStudentRecords, downloadJson } from '../../utils/studentResponses'
import { buildPublicPanelSnapshot } from '../../utils/publicSnapshot'
import {
  buildCategoryDistribution,
  buildDailyAverages,
  buildEvolution,
  buildFinalImpact,
  buildRetention,
  buildSectionUsage,
  buildSelfEsteemStats,
  computeDashboardStats,
  countByGender,
  filterDataByGender,
} from '../../utils/adminStats'
import LoadingSpinner from '../ui/LoadingSpinner'
import AdminDashboard from './AdminDashboard'
import AggregateCharts from './AggregateCharts'
import InitialTestStats from './InitialTestStats'
import EvolutionPanel from './EvolutionPanel'
import StudentResponses from './StudentResponses'
import SurveyManager from './SurveyManager'
import DataExport from './DataExport'

// Rangos temporales para los gráficos agregados. `days` a null = todo el historial.
const RANGES = [
  { key: 'week', label: 'Última semana', days: 7 },
  { key: 'month', label: 'Último mes', days: 30 },
  { key: 'all', label: 'Todo', days: null },
]

const TABS = [
  { key: 'overview', label: 'Datos agregados', icon: BarChart3 },
  { key: 'initial', label: 'Test inicial', icon: HeartPulse },
  { key: 'final', label: 'Encuesta final', icon: TrendingUp },
  { key: 'students', label: 'Respuestas por alumno', icon: Users },
  { key: 'surveys', label: 'Encuestas', icon: ClipboardList },
  { key: 'export', label: 'Exportar', icon: Database },
]

// Panel de administración completo. Lo usan la página /admin (datos en vivo de
// Supabase) y la web pública de resultados (public-panel/), que le pasa una
// copia fija con `publicView`: sin editar nada, sin la exportación de la copia
// pública y sin el gráfico de retención. `referenceDate` es la fecha de la
// copia, para que las tarjetas de "hoy" y "esta semana" tengan sentido.
export default function AdminPanel({ admin, publicView = false, referenceDate }) {
  const {
    loading,
    error,
    questions,
    anonIds,
    genderById,
    finalTestActive,
    createQuestion,
    updateQuestion,
    toggleQuestion,
    setFinalTestActive,
  } = admin

  const [tab, setTab] = useState('overview')
  const [rangeKey, setRangeKey] = useState('month')
  const [genderKey, setGenderKey] = useState('all')

  const range = RANGES.find((r) => r.key === rangeKey) || RANGES[1]
  const fromDate = range.days ? daysAgo(range.days) : null

  const stats = useMemo(
    () => computeDashboardStats(admin, referenceDate),
    [admin, referenceDate],
  )

  const genderCounts = useMemo(
    () => countByGender(admin.profiles, genderById),
    [admin.profiles, genderById],
  )

  const selfEsteemStats = useMemo(
    () => buildSelfEsteemStats(admin.initialTests, genderById),
    [admin.initialTests, genderById],
  )

  const finalSelfEsteemStats = useMemo(
    () => buildSelfEsteemStats(admin.finalTests, genderById),
    [admin.finalTests, genderById],
  )

  const evolution = useMemo(
    () => buildEvolution(admin.initialTests, admin.finalTests, genderById, anonIds),
    [admin.initialTests, admin.finalTests, genderById, anonIds],
  )

  const studentRecords = useMemo(
    () => buildStudentRecords(admin.initialTests, admin.finalTests, anonIds, genderById),
    [admin.initialTests, admin.finalTests, anonIds, genderById],
  )

  const finalImpact = useMemo(() => buildFinalImpact(admin.finalTests), [admin.finalTests])

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
        <h1 className="text-2xl font-bold text-slate-900">
          {publicView ? 'Kairo · Panel de resultados' : 'Panel de administración'}
        </h1>
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
            retentionRows={publicView ? null : retentionRows}
          />
        </div>
      )}

      {tab === 'initial' && <InitialTestStats stats={selfEsteemStats} />}

      {tab === 'final' && (
        <EvolutionPanel
          active={finalTestActive}
          onToggle={publicView ? null : setFinalTestActive}
          initialStats={selfEsteemStats}
          finalStats={finalSelfEsteemStats}
          evolution={evolution}
          impact={finalImpact}
        />
      )}

      {tab === 'students' && (
        <StudentResponses
          students={studentRecords}
          hiddenKeys={publicView ? PUBLIC_EXCLUDED_KEYS : undefined}
          actions={
            !publicView && (
            <button
              type="button"
              onClick={() =>
                downloadJson(buildPublicPanelSnapshot(admin), 'kairo-panel-publico.json')
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              <Download className="h-4 w-4" />
              Exportar copia pública
            </button>
            )
          }
        />
      )}

      {tab === 'surveys' && (
        <SurveyManager
          questions={questions}
          onCreate={publicView ? null : createQuestion}
          onUpdate={updateQuestion}
          onToggle={publicView ? null : toggleQuestion}
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
