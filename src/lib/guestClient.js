import { addDays, daysAgo, startOfWeek, todayDate } from '../utils/dateHelpers'

// Modo invitado: un sustituto del cliente de Supabase que guarda todo en el
// navegador (sessionStorage). Sirve para que cualquiera pueda probar la app
// desde el QR sin registrarse, sin hacer el test inicial ni la encuesta final y
// sin que sus datos acaben mezclados con los del estudio real.
//
// Solo implementa la parte de la API de supabase-js que usa la app:
// from().select/insert/upsert/update/delete con filtros eq/neq/gte/lte/not,
// order, limit, single/maybeSingle y conteos con { count, head }.

const MODE_KEY = 'kairo-guest-mode'
const DB_KEY = 'kairo-guest-db'
const GUEST_ID = '00000000-0000-4000-8000-000000000001'

function readStorage(key) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key, value) {
  try {
    if (value === null) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, value)
  } catch {
    // Sin almacenamiento (ventana privada estricta): el modo invitado sigue
    // funcionando en memoria hasta que se recargue la página.
  }
}

export function isGuestMode() {
  return readStorage(MODE_KEY) === '1'
}

// Entra en modo invitado y recarga: el cliente se elige al cargar la app.
export function enterGuestMode() {
  writeStorage(MODE_KEY, '1')
  writeStorage(DB_KEY, null)
  window.location.assign('/')
}

export function exitGuestMode() {
  writeStorage(MODE_KEY, null)
  writeStorage(DB_KEY, null)
  window.location.assign('/login')
}

function uuid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
}

// Generador pseudoaleatorio con semilla, para que los datos de ejemplo sean
// siempre parecidos y creíbles.
function seededRandom(seed) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const ACHIEVEMENTS = [
  ['first_checkin', 'Primer check-in', 'Has completado tu primer check-in diario.', '🌱'],
  ['streak_3', '3 días seguidos', 'Tres check-ins en días consecutivos.', '🔥'],
  ['streak_7', '7 días seguidos', 'Una semana entera registrando tu día.', '🔥'],
  ['streak_30', '30 días seguidos', 'Un mes completo sin fallar un check-in.', '🏆'],
  ['checkin_10', '10 check-ins', 'Has registrado 10 check-ins en total.', '✅'],
  ['first_survey', 'Primera encuesta', 'Has completado tu primera encuesta semanal.', '📋'],
  ['survey_4', 'Un mes de encuestas', 'Cuatro encuestas semanales completadas.', '🗓️'],
  ['first_focus', 'Primer enfoque', 'Has completado tu primera sesión de enfoque.', '⏱️'],
  ['focus_10', '10 sesiones de enfoque', 'Diez sesiones de enfoque a tus espaldas.', '🎯'],
  ['focus_600', '10 horas de enfoque', 'Has acumulado 600 minutos de enfoque.', '🧠'],
  ['first_meditation', 'Primera meditación', 'Has completado tu primera sesión de meditación.', '🧘'],
  ['meditation_10', '10 meditaciones', 'Diez sesiones de meditación completadas.', '☮️'],
  ['water_100', '100 vasos de agua', 'Has registrado 100 vasos de agua en tus check-ins.', '💧'],
  ['goals_perfect_day', 'Día redondo', 'Cumpliste todos los objetivos que te marcaste en un día.', '🎯'],
  ['goals_10', '10 objetivos cumplidos', 'Has completado 10 objetivos diarios en total.', '📝'],
]

const SURVEY_QUESTIONS = [
  ['He sentido estrés por los exámenes, entregas o notas.', 'stress'],
  ['Me ha costado desconectar de las tareas del instituto.', 'stress'],
  ['He notado síntomas de agobio (dolor de cabeza, nervios, no dormir bien) por el estudio.', 'stress'],
  ['Me he sentido apoyado/a por mis amigos y mi familia.', 'social'],
  ['He pasado tiempo de calidad con otras personas esta semana.', 'social'],
  ['Me he sentido a gusto y aceptado/a en mi entorno social.', 'social'],
  ['Me he sentido motivado/a para asistir a clase y estudiar.', 'motivation'],
  ['He tenido claros mis objetivos personales o académicos.', 'motivation'],
  ['He organizado mi tiempo de estudio de forma eficaz.', 'study_habits'],
  ['He evitado dejar las tareas para el último momento.', 'study_habits'],
  ['He conseguido concentrarme al estudiar sin distraerme con el móvil.', 'study_habits'],
  ['En general, me he sentido bien conmigo mismo/a.', 'wellbeing'],
  ['He descansado y he tenido energía para el día a día.', 'wellbeing'],
]

const GOAL_EXAMPLES = [
  'Repasar matemáticas 30 min',
  'Beber 8 vasos de agua',
  'Acostarme antes de las 23:00',
  'Leer 20 páginas',
  'Salir a caminar',
  'Terminar los deberes de historia',
]

// Base de datos inicial del invitado: dos semanas de uso de ejemplo para que
// "Mi progresión" y el perfil no salgan vacíos. El check-in de hoy queda
// pendiente para que el visitante pueda probarlo.
function buildSeed() {
  const rand = seededRandom(42)
  const pick = (min, max) => min + Math.floor(rand() * (max - min + 1))
  const now = new Date().toISOString()
  const created = (date) => `${date}T18:00:00.000Z`
  const DAYS = 14

  const questions = SURVEY_QUESTIONS.map(([text, category], i) => ({
    id: uuid(),
    question_text: text,
    category,
    scale_min: 1,
    scale_max: 5,
    active: true,
    sort_order: (i + 1) * 10,
    created_at: now,
  }))

  const daily_checkins = []
  const daily_goals = []
  const focus_sessions = []
  const meditation_sessions = []

  for (let n = DAYS; n >= 1; n -= 1) {
    const date = daysAgo(n)
    const studied = rand() > 0.25
    const exercised = rand() > 0.5
    daily_checkins.push({
      id: uuid(),
      user_id: GUEST_ID,
      date,
      mood: pick(3, 5),
      sleep_hours: pick(12, 18) / 2,
      sleep_quality: pick(2, 5),
      nutrition: pick(2, 5),
      water_glasses: pick(4, 9),
      stress: pick(1, 4),
      studied,
      study_minutes: studied ? pick(2, 9) * 15 : 0,
      exercised,
      exercise_type: exercised ? ['Correr', 'Fútbol', 'Gimnasio', 'Baile'][pick(0, 3)] : null,
      created_at: created(date),
    })

    const goalCount = pick(2, 3)
    for (let i = 0; i < goalCount; i += 1) {
      daily_goals.push({
        id: uuid(),
        user_id: GUEST_ID,
        date,
        goal_text: GOAL_EXAMPLES[(n + i) % GOAL_EXAMPLES.length],
        completed: rand() > 0.3,
        sort_order: i + 1,
        created_at: created(date),
      })
    }

    if (rand() > 0.45) {
      const planned = [25, 45, 25, 60][pick(0, 3)]
      const completed = rand() > 0.2
      focus_sessions.push({
        id: uuid(),
        user_id: GUEST_ID,
        date,
        planned_minutes: planned,
        actual_minutes: completed ? planned : pick(5, planned - 1),
        completed,
        created_at: created(date),
      })
    }

    if (rand() > 0.6) {
      meditation_sessions.push({
        id: uuid(),
        user_id: GUEST_ID,
        date,
        duration_minutes: [5, 10, 15][pick(0, 2)],
        created_at: created(date),
      })
    }
  }

  // Encuestas de las dos semanas anteriores; la de esta semana queda pendiente.
  const thisWeek = startOfWeek(todayDate())
  const weekly_surveys = [14, 7].map((offset) => {
    const weekStart = addDays(thisWeek, -offset)
    const responses = {}
    for (const q of questions) responses[q.id] = pick(2, 5)
    return {
      id: uuid(),
      user_id: GUEST_ID,
      week_start: weekStart,
      responses,
      completed_at: created(addDays(weekStart, 4)),
      created_at: created(addDays(weekStart, 4)),
    }
  })

  return {
    profiles: [
      {
        id: GUEST_ID,
        email: 'invitado@kairo',
        full_name: 'Invitado',
        role: 'student',
        avatar_url: null,
        gender: null,
        created_at: created(daysAgo(DAYS)),
        current_streak: 0,
        longest_streak: 0,
      },
    ],
    // El invitado se salta el test inicial y la encuesta final: se le da el
    // test inicial por hecho y la encuesta final como desactivada.
    initial_test: [
      { id: uuid(), user_id: GUEST_ID, responses: {}, completed_at: now, created_at: now },
    ],
    final_test: [],
    app_settings: [{ key: 'final_test_active', value: false, updated_at: now }],
    achievements: ACHIEVEMENTS.map(([key, title, description, icon], i) => ({
      id: uuid(),
      key,
      title,
      description,
      icon,
      sort_order: (i + 1) * 10,
    })),
    user_achievements: [],
    survey_questions: questions,
    weekly_surveys,
    daily_checkins,
    daily_goals,
    focus_sessions,
    meditation_sessions,
    tasks: [
      {
        id: uuid(),
        user_id: GUEST_ID,
        title: 'Examen de biología',
        description: 'Temas 4 y 5',
        subject: 'Biología',
        due_date: addDays(todayDate(), 3),
        priority: 'alta',
        completed: false,
        completed_at: null,
        created_at: now,
      },
      {
        id: uuid(),
        user_id: GUEST_ID,
        title: 'Entregar redacción',
        description: null,
        subject: 'Lengua',
        due_date: addDays(todayDate(), 1),
        priority: 'media',
        completed: false,
        completed_at: null,
        created_at: now,
      },
    ],
  }
}

function loadDb() {
  const raw = readStorage(DB_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      // Copia corrupta: se regenera.
    }
  }
  const seed = buildSeed()
  writeStorage(DB_KEY, JSON.stringify(seed))
  return seed
}

// Filas que reciben id y created_at por defecto al insertar (como en Postgres).
function withDefaults(table, row) {
  if (table === 'app_settings') return { ...row }
  return { id: uuid(), created_at: new Date().toISOString(), ...row }
}

const MATCHERS = {
  eq: (value, expected) => value === expected,
  neq: (value, expected) => value !== expected,
  gt: (value, expected) => value > expected,
  gte: (value, expected) => value >= expected,
  lt: (value, expected) => value < expected,
  lte: (value, expected) => value <= expected,
  in: (value, list) => list.includes(value),
}

class GuestQuery {
  constructor(client, table) {
    this.client = client
    this.table = table
    this.op = 'select'
    this.payload = null
    this.options = {}
    this.filters = []
    this.orders = []
    this.limitCount = null
    this.returning = false
    this.mode = 'many'
    this.countHead = false
  }

  select(_columns, options = {}) {
    if (this.op === 'select') {
      this.countHead = Boolean(options.head)
    } else {
      this.returning = true
    }
    return this
  }

  insert(rows) {
    this.op = 'insert'
    this.payload = rows
    return this
  }

  upsert(rows, options = {}) {
    this.op = 'upsert'
    this.payload = rows
    this.options = options
    return this
  }

  update(patch) {
    this.op = 'update'
    this.payload = patch
    return this
  }

  delete() {
    this.op = 'delete'
    return this
  }

  not(column, operator, value) {
    if (operator === 'is' && value === null) {
      this.filters.push((row) => row[column] !== null && row[column] !== undefined)
    }
    return this
  }

  is(column, value) {
    this.filters.push((row) => (row[column] ?? null) === value)
    return this
  }

  order(column, { ascending = true } = {}) {
    this.orders.push({ column, ascending })
    return this
  }

  limit(count) {
    this.limitCount = count
    return this
  }

  single() {
    this.mode = 'single'
    return this
  }

  maybeSingle() {
    this.mode = 'maybe'
    return this
  }

  matches(row) {
    return this.filters.every((filter) => filter(row))
  }

  execute() {
    const db = this.client.db
    const rows = db[this.table] || (db[this.table] = [])
    let result = []

    if (this.op === 'select') {
      result = rows.filter((row) => this.matches(row))
      for (const { column, ascending } of [...this.orders].reverse()) {
        result = [...result].sort((a, b) => {
          if (a[column] === b[column]) return 0
          return (a[column] > b[column] ? 1 : -1) * (ascending ? 1 : -1)
        })
      }
      if (this.limitCount !== null) result = result.slice(0, this.limitCount)
      if (this.countHead) return { data: null, count: result.length, error: null }
    } else if (this.op === 'insert') {
      const list = Array.isArray(this.payload) ? this.payload : [this.payload]
      result = list.map((row) => withDefaults(this.table, row))
      rows.push(...result)
    } else if (this.op === 'upsert') {
      const list = Array.isArray(this.payload) ? this.payload : [this.payload]
      const keys = (this.options.onConflict || 'id').split(',').map((k) => k.trim())
      for (const row of list) {
        const existing = rows.find((r) => keys.every((k) => r[k] === row[k]))
        if (existing) {
          if (!this.options.ignoreDuplicates) Object.assign(existing, row)
          result.push(existing)
        } else {
          const created = withDefaults(this.table, row)
          rows.push(created)
          result.push(created)
        }
      }
    } else if (this.op === 'update') {
      result = rows.filter((row) => this.matches(row))
      for (const row of result) Object.assign(row, this.payload)
    } else if (this.op === 'delete') {
      result = rows.filter((row) => this.matches(row))
      db[this.table] = rows.filter((row) => !this.matches(row))
    }

    if (this.op !== 'select') {
      this.client.persist()
      if (!this.returning && this.mode === 'many') return { data: null, error: null }
    }

    // Copias, para que nadie modifique la "base de datos" por referencia.
    const data = result.map((row) => structuredClone(row))

    if (this.mode === 'many') return { data, error: null }
    if (data.length === 0) {
      return this.mode === 'maybe'
        ? { data: null, error: null }
        : { data: null, error: { message: 'No se ha encontrado el registro.' } }
    }
    return { data: data[0], error: null }
  }

  then(resolve, reject) {
    return Promise.resolve()
      .then(() => this.execute())
      .then(resolve, reject)
  }
}

for (const [name, matcher] of Object.entries(MATCHERS)) {
  GuestQuery.prototype[name] = function filter(column, expected) {
    this.filters.push((row) => matcher(row[column], expected))
    return this
  }
}

const UNAVAILABLE = { message: 'Esta opción no está disponible en modo invitado.' }

export function createGuestClient() {
  const client = {
    db: loadDb(),
    persist() {
      writeStorage(DB_KEY, JSON.stringify(client.db))
    },
    from(table) {
      return new GuestQuery(client, table)
    },
    async rpc() {
      return { data: null, error: UNAVAILABLE }
    },
  }

  const user = { id: GUEST_ID, email: 'invitado@kairo', is_guest: true }
  const session = { user }

  client.auth = {
    async getSession() {
      return { data: { session }, error: null }
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } }
    },
    async signInWithPassword() {
      return { data: null, error: UNAVAILABLE }
    },
    async signUp() {
      return { data: null, error: UNAVAILABLE }
    },
    async updateUser() {
      return { data: null, error: UNAVAILABLE }
    },
    async signOut() {
      exitGuestMode()
      return { error: null }
    },
  }

  return client
}
