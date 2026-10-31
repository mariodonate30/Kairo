// Test inicial de Kairo — configuración de las 19 preguntas.
//
// Se responde una sola vez, al registrarse (ver src/pages/InitialTest.jsx). Cada
// pregunta lleva las hipótesis del TDR que ayuda a contrastar, para que el panel
// de admin pueda analizar los datos por hipótesis. La tabla en Supabase
// (public.initial_test) guarda las respuestas como JSONB { key: valor }.
//
// Hipótesis (ver documento del TDR, sección 2):
//   H1.1 Autoestima ↔ forma de encajar un suspenso.
//   H1.2 Miedo al fracaso / nervios → bloqueo y peores notas.
//   H1.3 Mentalidad de crecimiento (esfuerzo) > talento innato.
//   H2.1 La presión del grupo de amigos afecta a la seguridad.
//   H2.2 Los modelos de éxito de internet bajan la autoestima (comparación).
//   H3.2 Mejorar hábitos + seguridad → mejores notas (baseline para el pre/post).

// Escala de acuerdo 1-5 reutilizando ScaleInput con dígitos como "emojis".
export const SCALE_DIGITS = ['1', '2', '3', '4', '5']
export const SCALE_LOW_LABEL = 'Molt en desacord'
export const SCALE_HIGH_LABEL = 'Molt d\'acord'

export const GENDER_OPTIONS = [
  { value: 'chico', label: 'Noi' },
  { value: 'chica', label: 'Noia' },
]

export const GRADE_OPTIONS = ['<5', '5–6', '6–7', '7–8', '8–9', '9–10']

export const SOCIAL_HOURS_OPTIONS = ['<1 h', '1–2 h', '2–4 h', '4–6 h', '+6 h']

// Bloques del test. `type`:
//   'gender' | 'grade' | 'social_hours' → selectores de opción.
//   'scale' → escala de acuerdo 1-5. `reverse: true` marca puntuación inversa.
// `optional: true` → la pregunta se puede dejar en blanco (solo género).
export const INITIAL_TEST_BLOCKS = [
  {
    key: 'contexto',
    title: 'Sobre tu',
    description: 'Dues dades per poder analitzar els resultats. El gènere és opcional.',
    questions: [
      {
        key: 'gender',
        type: 'gender',
        text: 'Gènere (opcional)',
        optional: true,
        hypotheses: [],
      },
      {
        key: 'grade_last_year',
        type: 'grade',
        text: 'Nota mitjana aproximada del curs passat',
        hypotheses: ['H1.1', 'H3.2'],
      },
    ],
  },
  {
    // Escala de autoestima de Rosenberg (10 ítems, instrumento validado).
    // Se responde en escala 1-4 (sin punto neutro), como en el formulario de la
    // Fase 1. Ítems inversos: rse_03, rse_05, rse_08, rse_09, rse_10.
    key: 'autoestima',
    title: 'Com et veus a tu mateix/a',
    description: 'Escala 1-4: de l\'1 (molt en desacord) al 4 (molt d\'acord).',
    hypotheses: ['H1.1'],
    questions: [
      {
        key: 'rse_01',
        type: 'scale',
        scaleMax: 4,
        text: 'Sento que soc una persona digna d\'estima, almenys tant com les altres.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_02',
        type: 'scale',
        scaleMax: 4,
        text: 'Crec que tinc diverses qualitats bones.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_03',
        type: 'scale',
        scaleMax: 4,
        reverse: true,
        text: 'En general, tendeixo a pensar que soc un fracàs.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_04',
        type: 'scale',
        scaleMax: 4,
        text: 'Soc capaç de fer les coses tan bé com la majoria de la gent.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_05',
        type: 'scale',
        scaleMax: 4,
        reverse: true,
        text: 'Sento que no tinc gaires motius per sentir-me orgullós/osa de mi.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_06',
        type: 'scale',
        scaleMax: 4,
        text: 'Tinc una actitud positiva cap a mi mateix/a.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_07',
        type: 'scale',
        scaleMax: 4,
        text: 'En general, estic satisfet/a amb mi mateix/a.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_08',
        type: 'scale',
        scaleMax: 4,
        reverse: true,
        text: 'M\'agradaria poder tenir més respecte per mi mateix/a.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_09',
        type: 'scale',
        scaleMax: 4,
        reverse: true,
        text: 'De vegades em sento veritablement inútil.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_10',
        type: 'scale',
        scaleMax: 4,
        reverse: true,
        text: 'De vegades penso que no serveixo per a res.',
        hypotheses: ['H1.1'],
      },
    ],
  },
  {
    key: 'fracaso_ansiedad',
    title: 'Davant dels exàmens i els suspensos',
    description: 'Indica fins a quin punt estàs d\'acord amb cada frase.',
    hypotheses: ['H1.1', 'H1.2'],
    questions: [
      {
        key: 'fail_temporary',
        type: 'scale',
        text: 'Quan suspenc, ho veig com una cosa puntual que puc millorar.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'fail_worthless',
        type: 'scale',
        reverse: true,
        text: 'Un suspens em fa sentir que no valc.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'exam_nerves',
        type: 'scale',
        text: 'Abans d\'un examen em poso tan nerviós/osa que em costa concentrar-me.',
        hypotheses: ['H1.2'],
      },
      {
        key: 'exam_block',
        type: 'scale',
        text: 'La por de treure mala nota em bloqueja.',
        hypotheses: ['H1.2'],
      },
    ],
  },
  {
    key: 'mentalidad',
    title: 'Esforç i capacitats',
    description: 'Indica fins a quin punt estàs d\'acord amb cada frase.',
    hypotheses: ['H1.3'],
    questions: [
      {
        key: 'mind_fixed',
        type: 'scale',
        reverse: true,
        text: 'La intel·ligència és una cosa amb què es neix i no es pot canviar gaire.',
        hypotheses: ['H1.3'],
      },
      {
        key: 'mind_effort_improves',
        type: 'scale',
        text: 'Amb esforç, qualsevol persona pot millorar molt les seves notes.',
        hypotheses: ['H1.3'],
      },
      {
        key: 'mind_effort_over_talent',
        type: 'scale',
        text: 'L\'esforç diari importa més que el talent per tenir èxit.',
        hypotheses: ['H1.3'],
      },
    ],
  },
  {
    key: 'presion_amigos',
    title: 'El teu grup d\'amics',
    description: 'Indica fins a quin punt estàs d\'acord amb cada frase.',
    hypotheses: ['H2.1'],
    questions: [
      {
        key: 'peer_criticism',
        type: 'scale',
        text: 'Les crítiques dels meus amics m\'afecten molt.',
        hypotheses: ['H2.1'],
      },
      {
        key: 'peer_negative_confidence',
        type: 'scale',
        text: 'Quan rebo comentaris negatius, perdo confiança en mi mateix/a.',
        hypotheses: ['H2.1'],
      },
    ],
  },
  {
    key: 'redes',
    title: 'Xarxes socials',
    description: 'Sobre el teu ús de les xarxes i com et fan sentir.',
    hypotheses: ['H2.2'],
    questions: [
      {
        key: 'social_hours',
        type: 'social_hours',
        text: 'Quantes hores al dia passes a les xarxes socials?',
        hypotheses: ['H2.2'],
      },
      {
        key: 'social_compare',
        type: 'scale',
        text: 'Comparo la meva vida amb la de persones que veig a les xarxes.',
        hypotheses: ['H2.2'],
      },
      {
        key: 'social_worse',
        type: 'scale',
        text: 'Veure la vida «perfecta» dels altres a les xarxes em fa sentir pitjor amb mi mateix/a.',
        hypotheses: ['H2.2'],
      },
    ],
  },
  {
    key: 'habitos_estudio',
    title: 'Els teus hàbits d\'estudi',
    description: 'Indica fins a quin punt estàs d\'acord amb cada frase.',
    hypotheses: ['H3.2'],
    questions: [
      {
        key: 'study_planning',
        type: 'scale',
        text: 'Planifico el meu estudi amb antelació en lloc de deixar-lo per a l\'últim moment.',
        hypotheses: ['H3.2'],
      },
      {
        key: 'study_phone_distract',
        type: 'scale',
        reverse: true,
        text: 'Em distrec amb el mòbil mentre estudio.',
        hypotheses: ['H3.2'],
      },
    ],
  },
]

// Lista plana de todas las preguntas (útil para validar y para el admin).
export const INITIAL_TEST_QUESTIONS = INITIAL_TEST_BLOCKS.flatMap((block) =>
  block.questions.map((question) => ({ ...question, block: block.key })),
)

// Puntuación de autoestima (Rosenberg) a partir de unas respuestas. Invierte
// los ítems marcados como `reverse` (max+1 − valor) y suma todos. Devuelve null
// si falta alguna respuesta (test incompleto).
export function rosenbergScore(responses) {
  if (!responses) return null
  let total = 0
  for (const item of INITIAL_TEST_QUESTIONS) {
    if (item.block !== 'autoestima') continue
    const raw = Number(responses[item.key])
    if (!raw || Number.isNaN(raw)) return null
    const max = item.scaleMax || 5
    total += item.reverse ? max + 1 - raw : raw
  }
  return total
}

// Claves de las preguntas obligatorias (todas menos las marcadas como opcionales).
export const REQUIRED_KEYS = INITIAL_TEST_QUESTIONS.filter((q) => !q.optional).map(
  (q) => q.key,
)

// Devuelve las preguntas del test inicial correspondientes a unas claves, en ese
// orden. Lo usa la encuesta final para reutilizar preguntas IDÉNTICAS (mismo
// texto, escala e inversión) y poder comparar inicial ↔ final sin desajustes.
export function pickQuestions(keys) {
  const byKey = new Map(INITIAL_TEST_QUESTIONS.map((q) => [q.key, q]))
  return keys.map((key) => byKey.get(key)).filter(Boolean)
}
