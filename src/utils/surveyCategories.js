// Metadatos de las categorías de encuesta: etiqueta visible y orden de aparición.
// El `key` coincide con la columna `category` de survey_questions.
// (Va aparte de useSurveys para que la web pública no cargue Supabase.)
export const SURVEY_CATEGORIES = [
  { key: 'stress', label: 'Estrés académico', emoji: '📚' },
  { key: 'social', label: 'Relaciones sociales', emoji: '🤝' },
  { key: 'motivation', label: 'Motivación', emoji: '🎯' },
  { key: 'study_habits', label: 'Hábitos de estudio', emoji: '⏱️' },
  { key: 'wellbeing', label: 'Bienestar general', emoji: '🌱' },
]
