// Traducción al catalán de los textos que no están en el código sino en la base
// de datos: logros, preguntas de la encuesta semanal y las opciones de la
// encuesta final, que se guardan tal cual (en castellano) en las respuestas.
// Los valores guardados no se cambian, para no romper el histórico ni las
// estadísticas: solo se traduce lo que se muestra.

const ACHIEVEMENTS = {
  first_checkin: ['Primer check-in', 'Has completat el teu primer check-in diari.'],
  streak_3: ['3 dies seguits', 'Tres check-ins en dies consecutius.'],
  streak_7: ['7 dies seguits', 'Una setmana sencera registrant el teu dia.'],
  streak_30: ['30 dies seguits', 'Un mes complet sense fallar cap check-in.'],
  checkin_10: ['10 check-ins', 'Has registrat 10 check-ins en total.'],
  first_survey: ['Primera enquesta', 'Has completat la teva primera enquesta setmanal.'],
  survey_4: ['Un mes d\'enquestes', 'Quatre enquestes setmanals completades.'],
  first_focus: ['Primera concentració', 'Has completat la teva primera sessió de concentració.'],
  focus_10: ['10 sessions de concentració', 'Deu sessions de concentració a l\'esquena.'],
  focus_600: ['10 hores de concentració', 'Has acumulat 600 minuts de concentració.'],
  first_meditation: ['Primera meditació', 'Has completat la teva primera sessió de meditació.'],
  meditation_10: ['10 meditacions', 'Deu sessions de meditació completades.'],
  water_100: ['100 gots d\'aigua', 'Has registrat 100 gots d\'aigua als teus check-ins.'],
  goals_perfect_day: ['Dia rodó', 'Vas complir tots els objectius que t\'havies marcat en un dia.'],
  goals_10: ['10 objectius complerts', 'Has completat 10 objectius diaris en total.'],
}

const TEXTS = {
  // Preguntas de la encuesta semanal (survey_questions).
  'He sentido estrés por los exámenes, entregas o notas.':
    'He sentit estrès pels exàmens, les entregues o les notes.',
  'Me ha costado desconectar de las tareas del instituto.':
    'M\'ha costat desconnectar de les tasques de l\'institut.',
  'He notado síntomas de agobio (dolor de cabeza, nervios, no dormir bien) por el estudio.':
    'He notat símptomes d\'angoixa (mal de cap, nervis, no dormir bé) per l\'estudi.',
  'Me he sentido apoyado/a por mis amigos y mi familia.':
    'M\'he sentit recolzat/da pels meus amics i la meva família.',
  'He pasado tiempo de calidad con otras personas esta semana.':
    'He passat temps de qualitat amb altres persones aquesta setmana.',
  'Me he sentido a gusto y aceptado/a en mi entorno social.':
    'M\'he sentit a gust i acceptat/da en el meu entorn social.',
  'Me he sentido motivado/a para asistir a clase y estudiar.':
    'M\'he sentit motivat/da per anar a classe i estudiar.',
  'He tenido claros mis objetivos personales o académicos.':
    'He tingut clars els meus objectius personals o acadèmics.',
  'He organizado mi tiempo de estudio de forma eficaz.':
    'He organitzat el meu temps d\'estudi de manera eficaç.',
  'He evitado dejar las tareas para el último momento.':
    'He evitat deixar les tasques per a l\'últim moment.',
  'He conseguido concentrarme al estudiar sin distraerme con el móvil.':
    'He aconseguit concentrar-me en estudiar sense distreure\'m amb el mòbil.',
  'En general, me he sentido bien conmigo mismo/a.':
    'En general, m\'he sentit bé amb mi mateix/a.',
  'He descansado y he tenido energía para el día a día.':
    'He descansat i he tingut energia per al dia a dia.',

  // Opciones de la encuesta final (se guardan en castellano).
  'Menos de 5': 'Menys de 5',
  'Meditación / audios de relajación': 'Meditació / àudios de relaxació',
  'Temporizadores de concentración': 'Temporitzadors de concentració',
  'Calendario de organización': 'Calendari d\'organització',
  'Apartado de salud': 'Apartat de salut',
  'Frases motivacionales': 'Frases motivacionals',
  'Un poco': 'Una mica',
}

// Texto en catalán si lo conocemos; si no (p. ej. una pregunta nueva escrita
// por un admin), el original.
export function toCatalan(text) {
  return TEXTS[text] ?? text
}

export function translateAchievement(achievement) {
  const translated = ACHIEVEMENTS[achievement.key]
  if (!translated) return achievement
  return { ...achievement, title: translated[0], description: translated[1] }
}

export function translateQuestion(question) {
  return { ...question, question_text: toCatalan(question.question_text) }
}
