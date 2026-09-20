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
export const SCALE_LOW_LABEL = 'Muy en desacuerdo'
export const SCALE_HIGH_LABEL = 'Muy de acuerdo'

export const GENDER_OPTIONS = [
  { value: 'chico', label: 'Chico' },
  { value: 'chica', label: 'Chica' },
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
    title: 'Sobre ti',
    description: 'Dos datos para poder analizar los resultados. El género es opcional.',
    questions: [
      {
        key: 'gender',
        type: 'gender',
        text: 'Género (opcional)',
        optional: true,
        hypotheses: [],
      },
      {
        key: 'grade_last_year',
        type: 'grade',
        text: 'Nota media aproximada del curso pasado',
        hypotheses: ['H1.1', 'H3.2'],
      },
    ],
  },
  {
    // Escala de autoestima de Rosenberg (10 ítems, instrumento validado).
    // Se responde en escala 1-4 (sin punto neutro), como en el formulario de la
    // Fase 1. Ítems inversos: rse_03, rse_05, rse_08, rse_09, rse_10.
    key: 'autoestima',
    title: 'Cómo te ves a ti mismo/a',
    description: 'Escala 1-4: del 1 (muy en desacuerdo) al 4 (muy de acuerdo).',
    hypotheses: ['H1.1'],
    questions: [
      {
        key: 'rse_01',
        type: 'scale',
        scaleMax: 4,
        text: 'Siento que soy una persona digna de aprecio, al menos tanto como las demás.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_02',
        type: 'scale',
        scaleMax: 4,
        text: 'Creo que tengo varias cualidades buenas.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_03',
        type: 'scale',
        scaleMax: 4,
        reverse: true,
        text: 'En general, me inclino a pensar que soy un fracaso.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_04',
        type: 'scale',
        scaleMax: 4,
        text: 'Soy capaz de hacer las cosas tan bien como la mayoría de la gente.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_05',
        type: 'scale',
        scaleMax: 4,
        reverse: true,
        text: 'Siento que no tengo muchos motivos para sentirme orgulloso/a de mí.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_06',
        type: 'scale',
        scaleMax: 4,
        text: 'Tengo una actitud positiva hacia mí mismo/a.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_07',
        type: 'scale',
        scaleMax: 4,
        text: 'En general, estoy satisfecho/a conmigo mismo/a.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_08',
        type: 'scale',
        scaleMax: 4,
        reverse: true,
        text: 'Me gustaría poder tener más respeto por mí mismo/a.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_09',
        type: 'scale',
        scaleMax: 4,
        reverse: true,
        text: 'A veces me siento verdaderamente inútil.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'rse_10',
        type: 'scale',
        scaleMax: 4,
        reverse: true,
        text: 'A veces pienso que no sirvo para nada.',
        hypotheses: ['H1.1'],
      },
    ],
  },
  {
    key: 'fracaso_ansiedad',
    title: 'Ante los exámenes y los suspensos',
    description: 'Indica cuánto estás de acuerdo con cada frase.',
    hypotheses: ['H1.1', 'H1.2'],
    questions: [
      {
        key: 'fail_temporary',
        type: 'scale',
        text: 'Cuando suspendo, lo veo como algo puntual que puedo mejorar.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'fail_worthless',
        type: 'scale',
        reverse: true,
        text: 'Un suspenso me hace sentir que no valgo.',
        hypotheses: ['H1.1'],
      },
      {
        key: 'exam_nerves',
        type: 'scale',
        text: 'Antes de un examen me pongo tan nervioso/a que me cuesta concentrarme.',
        hypotheses: ['H1.2'],
      },
      {
        key: 'exam_block',
        type: 'scale',
        text: 'El miedo a sacar mala nota me bloquea.',
        hypotheses: ['H1.2'],
      },
    ],
  },
  {
    key: 'mentalidad',
    title: 'Esfuerzo y capacidades',
    description: 'Indica cuánto estás de acuerdo con cada frase.',
    hypotheses: ['H1.3'],
    questions: [
      {
        key: 'mind_fixed',
        type: 'scale',
        reverse: true,
        text: 'La inteligencia es algo con lo que se nace y no se puede cambiar mucho.',
        hypotheses: ['H1.3'],
      },
      {
        key: 'mind_effort_improves',
        type: 'scale',
        text: 'Con esfuerzo, cualquier persona puede mejorar mucho sus notas.',
        hypotheses: ['H1.3'],
      },
      {
        key: 'mind_effort_over_talent',
        type: 'scale',
        text: 'El esfuerzo diario importa más que el talento para tener éxito.',
        hypotheses: ['H1.3'],
      },
    ],
  },
  {
    key: 'presion_amigos',
    title: 'Tu grupo de amigos',
    description: 'Indica cuánto estás de acuerdo con cada frase.',
    hypotheses: ['H2.1'],
    questions: [
      {
        key: 'peer_criticism',
        type: 'scale',
        text: 'Las críticas de mis amigos me afectan mucho.',
        hypotheses: ['H2.1'],
      },
      {
        key: 'peer_negative_confidence',
        type: 'scale',
        text: 'Cuando recibo comentarios negativos, pierdo confianza en mí mismo/a.',
        hypotheses: ['H2.1'],
      },
    ],
  },
  {
    key: 'redes',
    title: 'Redes sociales',
    description: 'Sobre tu uso de las redes y cómo te hacen sentir.',
    hypotheses: ['H2.2'],
    questions: [
      {
        key: 'social_hours',
        type: 'social_hours',
        text: '¿Cuántas horas al día pasas en redes sociales?',
        hypotheses: ['H2.2'],
      },
      {
        key: 'social_compare',
        type: 'scale',
        text: 'Comparo mi vida con la de personas que veo en redes.',
        hypotheses: ['H2.2'],
      },
      {
        key: 'social_worse',
        type: 'scale',
        text: 'Ver la vida "perfecta" de otros en redes me hace sentir peor conmigo mismo/a.',
        hypotheses: ['H2.2'],
      },
    ],
  },
  {
    key: 'habitos_estudio',
    title: 'Tus hábitos de estudio',
    description: 'Indica cuánto estás de acuerdo con cada frase.',
    hypotheses: ['H3.2'],
    questions: [
      {
        key: 'study_planning',
        type: 'scale',
        text: 'Planifico mi estudio con antelación en vez de dejarlo para el último momento.',
        hypotheses: ['H3.2'],
      },
      {
        key: 'study_phone_distract',
        type: 'scale',
        reverse: true,
        text: 'Me distraigo con el móvil mientras estudio.',
        hypotheses: ['H3.2'],
      },
    ],
  },
]

// Lista plana de todas las preguntas (útil para validar y para el admin).
export const INITIAL_TEST_QUESTIONS = INITIAL_TEST_BLOCKS.flatMap((block) =>
  block.questions.map((question) => ({ ...question, block: block.key })),
)

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
