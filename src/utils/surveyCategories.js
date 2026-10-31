// Metadatos de las categorías de encuesta: etiqueta visible y orden de aparición.
// El `key` coincide con la columna `category` de survey_questions.
// (Va aparte de useSurveys para que la web pública no cargue Supabase.)
export const SURVEY_CATEGORIES = [
  { key: 'stress', label: 'Estrès acadèmic', emoji: '📚' },
  { key: 'social', label: 'Relacions socials', emoji: '🤝' },
  { key: 'motivation', label: 'Motivació', emoji: '🎯' },
  { key: 'study_habits', label: 'Hàbits d\'estudi', emoji: '⏱️' },
  { key: 'wellbeing', label: 'Benestar general', emoji: '🌱' },
]
