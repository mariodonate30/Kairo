// Copia fija y anónima de los datos del panel de admin, para la web pública de
// resultados (public-panel/). Se genera desde el admin con "Exportar copia
// pública" y se publica como datos.json.
//
// En la copia no hay nombres, emails ni user_id: cada alumno pasa a ser su
// número anónimo (el mismo que en el resto del panel). Tampoco salen los
// comentarios libres de la encuesta final (PUBLIC_EXCLUDED_KEYS).

import { PUBLIC_EXCLUDED_KEYS } from './studentResponses'

function withoutExcluded(responses) {
  const clean = { ...(responses || {}) }
  for (const key of PUBLIC_EXCLUDED_KEYS) delete clean[key]
  return clean
}

export function buildPublicPanelSnapshot(admin) {
  const anon = (userId) => String(admin.anonIds.get(userId) ?? '?')
  const anonRows = (rows) => rows.map((row) => ({ ...row, user_id: anon(row.user_id) }))
  const anonTests = (rows) =>
    rows.map((row) => ({
      user_id: anon(row.user_id),
      completed_at: row.completed_at,
      responses: withoutExcluded(row.responses),
    }))

  return {
    generated_at: new Date().toISOString(),
    profiles: admin.profiles.map((p) => ({
      id: anon(p.id),
      role: p.role,
      created_at: p.created_at,
      gender: p.gender,
    })),
    checkins: anonRows(admin.checkins),
    surveys: anonRows(admin.surveys),
    goals: anonRows(admin.goals),
    focusSessions: anonRows(admin.focusSessions),
    meditationSessions: anonRows(admin.meditationSessions),
    questions: admin.questions,
    initialTests: anonTests(admin.initialTests),
    finalTests: anonTests(admin.finalTests),
    finalTestActive: admin.finalTestActive,
  }
}

// Convierte la copia en el mismo objeto que devuelve useAdminData, para poder
// reutilizar el panel tal cual (sin funciones de edición).
export function snapshotToAdminData(snapshot) {
  const profiles = snapshot.profiles || []
  const anonIds = new Map(profiles.map((p) => [p.id, Number(p.id) || p.id]))
  const genderById = new Map(
    profiles
      .filter((p) => p.gender === 'chico' || p.gender === 'chica')
      .map((p) => [p.id, p.gender]),
  )

  return {
    profiles,
    checkins: snapshot.checkins || [],
    surveys: snapshot.surveys || [],
    goals: snapshot.goals || [],
    focusSessions: snapshot.focusSessions || [],
    meditationSessions: snapshot.meditationSessions || [],
    questions: snapshot.questions || [],
    initialTests: snapshot.initialTests || [],
    finalTests: snapshot.finalTests || [],
    finalTestActive: Boolean(snapshot.finalTestActive),
    anonIds,
    genderById,
    loading: false,
    error: '',
  }
}
