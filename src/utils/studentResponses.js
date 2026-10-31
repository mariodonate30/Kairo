// Respuestas individuales (anónimas) del test inicial y la encuesta final.
//
// Lo usa la pestaña "Respuestas por alumno" del admin, también en la web
// pública de resultados (public-panel/).

// Preguntas que nunca salen en la copia pública: texto libre que podría
// identificar al alumno.
export const PUBLIC_EXCLUDED_KEYS = ['experience_comment']

// Un registro por alumno que haya hecho al menos uno de los dos tests,
// ordenados por su número anónimo.
export function buildStudentRecords(initialTests, finalTests, anonIds, genderById) {
  const initialByUser = new Map(initialTests.map((t) => [t.user_id, t]))
  const finalByUser = new Map(finalTests.map((t) => [t.user_id, t]))
  const userIds = new Set([...initialByUser.keys(), ...finalByUser.keys()])

  return Array.from(userIds)
    .map((userId) => {
      const initial = initialByUser.get(userId)
      const final = finalByUser.get(userId)
      return {
        anonId: anonIds.get(userId) ?? '?',
        gender: genderById.get(userId) || '',
        initial: initial ? { completed_at: initial.completed_at, responses: initial.responses || {} } : null,
        final: final ? { completed_at: final.completed_at, responses: final.responses || {} } : null,
      }
    })
    .sort((a, b) => {
      if (typeof a.anonId === 'number' && typeof b.anonId === 'number') return a.anonId - b.anonId
      return String(a.anonId).localeCompare(String(b.anonId))
    })
}

export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
