import { CalendarCheck, ClipboardCheck, ClipboardList, UserCheck, Users } from 'lucide-react'

// Tarjeta de estadística individual del dashboard de admin.
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

// Fila de tarjetas con las estadísticas generales del instituto.
export default function AdminDashboard({ stats }) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <StatCard
        icon={Users}
        label="Usuaris"
        value={stats.totalStudents}
        hint="Estudiants registrats"
        accent="text-violet-500"
      />
      <StatCard
        icon={UserCheck}
        label="Actius avui"
        value={stats.activeToday}
        hint="Amb activitat avui"
        accent="text-emerald-500"
      />
      <StatCard
        icon={CalendarCheck}
        label="Actius setmana"
        value={stats.activeThisWeek}
        hint="Aquesta setmana"
        accent="text-sky-500"
      />
      <StatCard
        icon={ClipboardCheck}
        label="Check-ins avui"
        value={stats.checkinsToday}
        hint="Completats avui"
        accent="text-indigo-500"
      />
      <StatCard
        icon={ClipboardList}
        label="Enquestes"
        value={stats.surveysThisWeek}
        hint="Completades aquesta setmana"
        accent="text-amber-500"
      />
    </section>
  )
}
