// Encuesta final de Kairo — configuración.
//
// Se responde una sola vez, al terminar el estudio, y solo cuando un admin la
// activa (app_settings.final_test_active). Va emparejada con el test inicial por
// user_id para poder medir la EVOLUCIÓN de cada alumno.
//
// Reutiliza preguntas idénticas del test inicial (autoestima de Rosenberg,
// ansiedad ante exámenes y hábitos de estudio) para poder comparar inicial ↔
// final, y añade las preguntas propias de impacto de la app (herramienta más
// útil, mejora percibida y comentario), que contrastan las hipótesis H3.1 y H3.2.

import { pickQuestions, SCALE_HIGH_LABEL, SCALE_LOW_LABEL } from './initialTest'

export { SCALE_HIGH_LABEL, SCALE_LOW_LABEL }

// Nota del examen (valores sueltos, como en el formulario de la Fase 2).
export const FINAL_GRADE_OPTIONS = ['Menos de 5', '5', '6', '7', '8', '9', '10']

// Herramientas de la web (para la H3.1: cuál ayuda más).
export const TOOL_OPTIONS = [
  'Meditación / audios de relajación',
  'Temporizadores de concentración',
  'Calendario de organización',
  'Apartado de salud',
  'Frases motivacionales',
]

export const IMPROVEMENT_OPTIONS = ['Sí', 'Un poco', 'No']

export const FINAL_TEST_BLOCKS = [
  {
    key: 'resultado',
    title: 'Tu examen',
    description: 'El resultado del examen para el que te has preparado con la app.',
    hypotheses: ['H3.2'],
    questions: [
      {
        key: 'final_grade',
        type: 'choice',
        options: FINAL_GRADE_OPTIONS,
        text: '¿Qué nota has sacado aproximadamente en el examen?',
        hypotheses: ['H3.2'],
      },
    ],
  },
  {
    // Autoestima de Rosenberg (idéntica al test inicial, escala 1-4) → evolución.
    key: 'autoestima',
    title: 'Cómo te ves a ti mismo/a',
    description: 'Escala 1-4: del 1 (muy en desacuerdo) al 4 (muy de acuerdo).',
    hypotheses: ['H1.1'],
    questions: pickQuestions([
      'rse_01',
      'rse_02',
      'rse_03',
      'rse_04',
      'rse_05',
      'rse_06',
      'rse_07',
      'rse_08',
      'rse_09',
      'rse_10',
    ]),
  },
  {
    key: 'fracaso_ansiedad',
    title: 'Ante los exámenes',
    description: 'Indica cuánto estás de acuerdo con cada frase.',
    hypotheses: ['H1.2'],
    questions: pickQuestions(['exam_nerves', 'exam_block']),
  },
  {
    key: 'habitos_estudio',
    title: 'Tus hábitos de estudio',
    description: 'Indica cuánto estás de acuerdo con cada frase.',
    hypotheses: ['H3.2'],
    questions: pickQuestions(['study_planning', 'study_phone_distract']),
  },
  {
    key: 'impacto_app',
    title: 'Tu experiencia con la app',
    description: 'Cuéntanos cómo te ha ido usando Kairo.',
    hypotheses: ['H3.1', 'H3.2'],
    questions: [
      {
        key: 'most_useful_tool',
        type: 'choice',
        options: TOOL_OPTIONS,
        text: '¿Qué herramienta de la app te ha ayudado más al preparar el examen?',
        hypotheses: ['H3.1'],
      },
      {
        key: 'perceived_improvement',
        type: 'choice',
        options: IMPROVEMENT_OPTIONS,
        text: 'Gracias a la app, ¿has mejorado tus hábitos de estudio y confías más en tus capacidades?',
        hypotheses: ['H3.2'],
      },
      {
        key: 'experience_comment',
        type: 'text',
        optional: true,
        text: 'Deja un comentario sobre tu experiencia usando la app (opcional).',
        hypotheses: ['H3.2'],
      },
    ],
  },
]

export const FINAL_TEST_QUESTIONS = FINAL_TEST_BLOCKS.flatMap((block) =>
  block.questions.map((question) => ({ ...question, block: block.key })),
)

export const FINAL_REQUIRED_KEYS = FINAL_TEST_QUESTIONS.filter((q) => !q.optional).map(
  (q) => q.key,
)
