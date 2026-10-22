// Contraste de las hipótesis del TDR a partir de los tests inicial y final.
//
// Todas las funciones son puras y trabajan solo con agregados (medias,
// porcentajes y correlaciones). A propósito NO devuelven cuántos alumnos han
// participado: el panel de conclusiones solo muestra resultados.
//
// Los textos visibles van en catalán porque el panel se usa para redactar las
// conclusiones del trabajo.

import { INITIAL_TEST_QUESTIONS } from './initialTest'
import { rosenbergScore } from './adminStats'

// Muestra mínima para poder sacar una conclusión de una hipótesis.
const MIN_SAMPLE = 5

// Umbrales de la correlación de Pearson: |r| ≥ 0.3 relación clara,
// 0.1-0.3 relación débil, < 0.1 sin relación.
const STRONG_R = 0.3
const WEAK_R = 0.1

const QUESTION_BY_KEY = new Map(INITIAL_TEST_QUESTIONS.map((q) => [q.key, q]))

// Nota media del curso pasado (test inicial) → valor numérico (marca de clase).
const BASELINE_GRADE_VALUES = {
  '<5': 4,
  '5–6': 5.5,
  '6–7': 6.5,
  '7–8': 7.5,
  '8–9': 8.5,
  '9–10': 9.5,
}

// Nota del examen (encuesta final) → valor numérico.
const EXAM_GRADE_VALUES = {
  'Menos de 5': 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
}

// Horas diarias en redes → valor numérico aproximado.
const SOCIAL_HOURS_VALUES = {
  '<1 h': 0.5,
  '1–2 h': 1.5,
  '2–4 h': 3,
  '4–6 h': 5,
  '+6 h': 7,
}

// Nombres de las herramientas en catalán (las opciones se guardan en castellano).
const TOOL_LABELS_CA = {
  'Meditación / audios de relajación': 'Meditació / àudios de relaxació',
  'Temporizadores de concentración': 'Temporitzadors de concentració',
  'Calendario de organización': "Calendari d'organització",
  'Apartado de salud': 'Apartat de salut',
  'Frases motivacionales': 'Frases motivacionals',
}

// Valor de una pregunta de escala. Con `invert` aplica la puntuación inversa
// definida en el test (max+1 − valor), para que "más alto" signifique siempre
// lo mismo dentro de un índice.
function scaleValue(responses, key, invert = false) {
  const raw = Number(responses?.[key])
  if (!raw || Number.isNaN(raw)) return null
  const max = QUESTION_BY_KEY.get(key)?.scaleMax || 5
  return invert ? max + 1 - raw : raw
}

// Media de varios valores; null si falta alguno.
function meanOf(values) {
  if (values.some((v) => v == null)) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

function average(values) {
  const clean = values.filter((v) => v != null)
  if (!clean.length) return null
  return clean.reduce((a, b) => a + b, 0) / clean.length
}

// Correlación de Pearson entre pares [x, y]. null si no hay muestra suficiente
// o alguna variable no varía.
function pearson(pairs) {
  const valid = pairs.filter(([x, y]) => x != null && y != null)
  if (valid.length < MIN_SAMPLE) return null
  const n = valid.length
  const mx = valid.reduce((s, [x]) => s + x, 0) / n
  const my = valid.reduce((s, [, y]) => s + y, 0) / n
  let num = 0
  let dx = 0
  let dy = 0
  for (const [x, y] of valid) {
    num += (x - mx) * (y - my)
    dx += (x - mx) ** 2
    dy += (y - my) ** 2
  }
  if (!dx || !dy) return null
  return num / Math.sqrt(dx * dy)
}

// Porcentaje de valores que cumplen una condición.
function percentWhere(values, predicate) {
  const clean = values.filter((v) => v != null)
  if (!clean.length) return null
  return Math.round((clean.filter(predicate).length / clean.length) * 100)
}

const fmtR = (r) => (r == null ? '—' : r.toFixed(2).replace('.', ','))
const fmtNum = (v, digits = 1) => (v == null ? '—' : v.toFixed(digits).replace('.', ','))
const fmtPct = (v) => (v == null ? '—' : `${v} %`)

// Fuerza de una correlación en palabras.
function strengthLabel(r) {
  const a = Math.abs(r)
  if (a >= 0.5) return 'forta'
  if (a >= STRONG_R) return 'moderada'
  if (a >= WEAK_R) return 'feble'
  return 'pràcticament nul·la'
}

// Veredicto de una hipótesis que predice una correlación con un signo dado.
function verdictFromR(r, expectedSign) {
  if (r == null) return 'insuficient'
  const signed = r * expectedSign
  if (signed >= STRONG_R) return 'confirmada'
  if (signed >= WEAK_R) return 'parcial'
  return 'refutada'
}

// ---- Índices por alumno a partir del test inicial ----
function studentIndices(responses) {
  return {
    selfEsteem: rosenbergScore(responses),
    // Forma de encajar un suspenso: alto = lo vive como algo puntual.
    failCoping: meanOf([
      scaleValue(responses, 'fail_temporary'),
      scaleValue(responses, 'fail_worthless', true),
    ]),
    // Miedo al fracaso / nervios: alto = más ansiedad.
    examAnxiety: meanOf([scaleValue(responses, 'exam_nerves'), scaleValue(responses, 'exam_block')]),
    // Mentalidad de crecimiento: alto = cree más en el esfuerzo.
    growth: meanOf([
      scaleValue(responses, 'mind_fixed', true),
      scaleValue(responses, 'mind_effort_improves'),
      scaleValue(responses, 'mind_effort_over_talent'),
    ]),
    // Presión del grupo: alto = le afectan más las críticas.
    peerPressure: meanOf([
      scaleValue(responses, 'peer_criticism'),
      scaleValue(responses, 'peer_negative_confidence'),
    ]),
    // Comparación en redes: alto = se compara más y se siente peor.
    socialCompare: meanOf([
      scaleValue(responses, 'social_compare'),
      scaleValue(responses, 'social_worse'),
    ]),
    socialHours: SOCIAL_HOURS_VALUES[responses?.social_hours] ?? null,
    grade: BASELINE_GRADE_VALUES[responses?.grade_last_year] ?? null,
  }
}

// ---- Hipótesis ----

function h11(students) {
  const r = pearson(students.map((s) => [s.selfEsteem, s.failCoping]))
  const verdict = verdictFromR(r, 1)
  const conclusions = {
    confirmada: `Hi ha una relació ${strengthLabel(r ?? 0)} i positiva: els alumnes amb més autoestima viuen els suspensos com una cosa puntual que poden millorar, mentre que els que tenen l'autoestima més baixa els viuen com un judici sobre el seu valor.`,
    parcial: `La relació apunta en la direcció esperada però és ${strengthLabel(r ?? 0)}: l'autoestima influeix en com s'encaixa un suspens, però no és l'únic factor.`,
    refutada: "Les dades no mostren que l'autoestima determini la manera d'encaixar un suspens: alumnes amb nivells d'autoestima molt diferents reaccionen de manera semblant.",
  }
  return {
    metrics: [
      { label: 'Correlació autoestima ↔ gestió del suspens', value: fmtR(r) },
      {
        label: 'Viuen el suspens com una cosa puntual',
        value: fmtPct(percentWhere(students.map((s) => s.failCoping), (v) => v >= 4)),
      },
    ],
    verdict,
    conclusion: conclusions[verdict],
  }
}

function h12(students) {
  const r = pearson(students.map((s) => [s.examAnxiety, s.grade]))
  const verdict = verdictFromR(r, -1)
  const anxious = percentWhere(students.map((s) => s.examAnxiety), (v) => v >= 4)
  const conclusions = {
    confirmada: `La por al fracàs i els nervis van associats a notes més baixes (relació ${strengthLabel(r ?? 0)}). Un ${anxious ?? 0} % dels alumnes declara nervis o bloqueig alts abans dels exàmens.`,
    parcial: `Els alumnes més nerviosos tendeixen a treure notes una mica més baixes, però la relació és ${strengthLabel(r ?? 0)}: l'ansietat afecta el rendiment, però no explica per si sola les notes.`,
    refutada: "No s'observa que els alumnes amb més por al fracàs tinguin pitjors notes: l'ansietat davant dels exàmens està present a tots els nivells de rendiment.",
  }
  return {
    metrics: [
      { label: 'Correlació ansietat ↔ nota', value: fmtR(r) },
      { label: 'Alumnes amb nervis o bloqueig alts', value: fmtPct(anxious) },
    ],
    verdict,
    conclusion: conclusions[verdict],
  }
}

function h13(students) {
  const values = students.map((s) => s.growth)
  const mean = average(values)
  const agree = percentWhere(values, (v) => v >= 4)
  const r = pearson(students.map((s) => [s.growth, s.grade]))
  const sample = values.filter((v) => v != null).length
  let verdict = 'insuficient'
  if (sample >= MIN_SAMPLE) {
    if (mean >= 3.5) verdict = 'confirmada'
    else if (mean >= 3) verdict = 'parcial'
    else verdict = 'refutada'
  }
  const conclusions = {
    confirmada: `La majoria dels alumnes pensa que l'esforç diari pesa més que el talent innat (mitjana de ${fmtNum(mean)} sobre 5). Predomina una mentalitat de creixement.`,
    parcial: `Els alumnes es mostren dividits: valoren l'esforç (mitjana de ${fmtNum(mean)} sobre 5), però una part important encara creu que la intel·ligència és bàsicament innata.`,
    refutada: `Predomina la idea que la intel·ligència és innata (mitjana de ${fmtNum(mean)} sobre 5): els alumnes no creuen que l'esforç pesi més que el talent.`,
  }
  return {
    metrics: [
      { label: 'Mentalitat de creixement (1-5)', value: fmtNum(mean) },
      { label: "Prioritzen l'esforç sobre el talent", value: fmtPct(agree) },
      { label: 'Correlació mentalitat ↔ nota', value: fmtR(r) },
    ],
    verdict,
    conclusion: conclusions[verdict],
  }
}

function h21(students) {
  const r = pearson(students.map((s) => [s.peerPressure, s.selfEsteem]))
  const verdict = verdictFromR(r, -1)
  const affected = percentWhere(students.map((s) => s.peerPressure), (v) => v >= 4)
  const conclusions = {
    confirmada: `Els alumnes a qui més afecten les crítiques dels amics tenen una autoestima més baixa (relació ${strengthLabel(r ?? 0)}). Al ${affected ?? 0} % li afecten molt els comentaris negatius del grup.`,
    parcial: `La pressió del grup d'amics té un efecte ${strengthLabel(r ?? 0)} sobre la seguretat: hi és, però pesa menys del que esperàvem.`,
    refutada: "No es veu una relació entre la pressió del grup d'amics i la seguretat en un mateix: la valoració pròpia no depèn tant de les crítiques dels amics.",
  }
  return {
    metrics: [
      { label: 'Correlació pressió del grup ↔ autoestima', value: fmtR(r) },
      { label: 'Els afecten molt les crítiques', value: fmtPct(affected) },
    ],
    verdict,
    conclusion: conclusions[verdict],
  }
}

function h22(students) {
  const rCompare = pearson(students.map((s) => [s.socialCompare, s.selfEsteem]))
  const rHours = pearson(students.map((s) => [s.socialHours, s.selfEsteem]))
  const meanHours = average(students.map((s) => s.socialHours))
  const compare = percentWhere(students.map((s) => s.socialCompare), (v) => v >= 4)

  let verdict = verdictFromR(rCompare, -1)
  // Si la comparación no sale pero las horas sí bajan la autoestima, es parcial.
  if (verdict === 'refutada' && rHours != null && -rHours >= WEAK_R) verdict = 'parcial'

  const conclusions = {
    confirmada: `Comparar-se amb els models d'èxit de les xarxes va lligat a una autoestima més baixa (relació ${strengthLabel(rCompare ?? 0)}). No és tant el temps que s'hi passa com la comparació el que fa mal.`,
    parcial: `Les xarxes tenen un efecte ${strengthLabel(rCompare ?? rHours ?? 0)} sobre l'autoestima: l'impacte existeix, però no és tan clar com plantejàvem.`,
    refutada: "No es pot afirmar que els models d'èxit d'internet baixin l'autoestima: els alumnes que més es comparen no tenen una autoestima més baixa.",
  }
  return {
    metrics: [
      { label: 'Correlació comparació a xarxes ↔ autoestima', value: fmtR(rCompare) },
      { label: 'Correlació hores a xarxes ↔ autoestima', value: fmtR(rHours) },
      { label: 'Hores diàries a xarxes (mitjana)', value: meanHours == null ? '—' : `${fmtNum(meanHours)} h` },
      { label: 'Es comparen sovint amb les xarxes', value: fmtPct(compare) },
    ],
    verdict,
    conclusion: conclusions[verdict],
  }
}

function h31(finalTests) {
  const counts = new Map()
  for (const test of finalTests) {
    const tool = test.responses?.most_useful_tool
    if (tool) counts.set(tool, (counts.get(tool) || 0) + 1)
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0)
  const ranking = Array.from(counts.entries())
    .map(([tool, count]) => ({
      tool: TOOL_LABELS_CA[tool] || tool,
      percent: total ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.percent - a.percent)

  const top = ranking[0]
  let verdict = 'insuficient'
  // Con 5 herramientas, un reparto uniforme daría un 20 % a cada una.
  if (total >= MIN_SAMPLE) {
    if (top.percent >= 35) verdict = 'confirmada'
    else if (top.percent >= 25) verdict = 'parcial'
    else verdict = 'refutada'
  }

  const conclusions = {
    confirmada: `Hi ha una eina que destaca clarament: «${top?.tool}» és la que més ha ajudat a preparar l'examen (${top?.percent} % de les respostes).`,
    parcial: `«${top?.tool}» és l'eina més valorada (${top?.percent} %), però les preferències estan bastant repartides entre diverses eines.`,
    refutada: "Cap eina destaca per sobre de les altres: cada alumne ha trobat útil una eina diferent, cosa que justifica oferir-ne diverses.",
  }

  return {
    metrics: ranking.map((r) => ({ label: r.tool, value: `${r.percent} %` })),
    verdict,
    conclusion: conclusions[verdict],
    pendingFinal: !finalTests.length,
  }
}

function h32(initialTests, finalTests) {
  const initialByUser = new Map(initialTests.map((t) => [t.user_id, t]))
  const gradeDeltas = []
  const esteemDeltas = []
  const habitDeltas = []
  const improvement = []

  for (const finalTest of finalTests) {
    const fr = finalTest.responses || {}
    const ir = initialByUser.get(finalTest.user_id)?.responses
    if (fr.perceived_improvement) improvement.push(fr.perceived_improvement)
    if (!ir) continue

    const before = BASELINE_GRADE_VALUES[ir.grade_last_year]
    const after = EXAM_GRADE_VALUES[fr.final_grade]
    if (before != null && after != null) gradeDeltas.push(after - before)

    const e0 = rosenbergScore(ir)
    const e1 = rosenbergScore(fr)
    if (e0 != null && e1 != null) esteemDeltas.push(e1 - e0)

    const habits = (r) =>
      meanOf([scaleValue(r, 'study_planning'), scaleValue(r, 'study_phone_distract', true)])
    const h0 = habits(ir)
    const h1 = habits(fr)
    if (h0 != null && h1 != null) habitDeltas.push(h1 - h0)
  }

  const gradeDelta = average(gradeDeltas)
  const esteemDelta = average(esteemDeltas)
  const habitDelta = average(habitDeltas)
  const perceived = improvement.length
    ? Math.round((improvement.filter((v) => v !== 'No').length / improvement.length) * 100)
    : null

  let verdict = 'insuficient'
  if (gradeDeltas.length >= MIN_SAMPLE) {
    const signals = [
      gradeDelta > 0,
      (habitDelta ?? 0) > 0 || (esteemDelta ?? 0) > 0,
      (perceived ?? 0) >= 50,
    ].filter(Boolean).length
    verdict = signals === 3 ? 'confirmada' : signals >= 1 ? 'parcial' : 'refutada'
  }

  const signed = (v, digits = 1) => (v == null ? '—' : `${v > 0 ? '+' : ''}${fmtNum(v, digits)}`)

  const conclusions = {
    confirmada: `Després d'utilitzar l'app, els alumnes milloren (hàbits ${signed(habitDelta, 2)}, autoestima ${signed(esteemDelta)}) i les notes pugen de mitjana ${signed(gradeDelta)} punts. A més, el ${perceived} % percep que ha millorat els hàbits i la confiança.`,
    parcial: `Hi ha senyals de millora (nota ${signed(gradeDelta)} punts, autoestima ${signed(esteemDelta)}, hàbits ${signed(habitDelta, 2)}), però no en tots els aspectes alhora: millorar hàbits i seguretat ajuda, però no garanteix per si sol millors notes.`,
    refutada: "No s'observa una millora de les notes ni dels hàbits després del període d'ús de l'app; caldria un període més llarg per veure'n l'efecte.",
  }

  return {
    metrics: [
      { label: 'Variació de la nota (examen − curs passat)', value: signed(gradeDelta) },
      { label: "Variació de l'autoestima (/40)", value: signed(esteemDelta) },
      { label: "Variació dels hàbits d'estudi (1-5)", value: signed(habitDelta, 2) },
      { label: 'Perceben que han millorat', value: fmtPct(perceived) },
    ],
    verdict,
    conclusion: conclusions[verdict],
    pendingFinal: !finalTests.length,
  }
}

// Definición de las hipótesis (textos en catalán) agrupadas por bloque del TDR.
export const HYPOTHESIS_GROUPS = [
  {
    key: 'h1',
    title: 'Bloc 1 · Autoestima, por al fracàs i mentalitat',
    items: [
      {
        id: 'H1.1',
        title: 'Autoestima i suspensos',
        statement:
          "Els adolescents amb més autoestima encaixen millor un suspens: el veuen com una cosa puntual i no com una prova que no valen.",
      },
      {
        id: 'H1.2',
        title: 'Por al fracàs',
        statement:
          'La por al fracàs i els nervis abans dels exàmens provoquen bloquejos i fan treure pitjors notes.',
      },
      {
        id: 'H1.3',
        title: 'Esforç o talent',
        statement:
          "Els adolescents consideren que l'esforç diari és més important que el talent innat per tenir èxit (mentalitat de creixement).",
      },
    ],
  },
  {
    key: 'h2',
    title: "Bloc 2 · L'entorn: amics i xarxes socials",
    items: [
      {
        id: 'H2.1',
        title: "Pressió del grup d'amics",
        statement:
          "Les crítiques i la pressió del grup d'amics afecten la seguretat que els adolescents tenen en ells mateixos.",
      },
      {
        id: 'H2.2',
        title: "Models d'èxit a internet",
        statement:
          "Comparar-se amb els models d'èxit que apareixen a les xarxes socials fa baixar l'autoestima.",
      },
    ],
  },
  {
    key: 'h3',
    title: "Bloc 3 · L'impacte de l'app Kairo",
    items: [
      {
        id: 'H3.1',
        title: 'Eina més útil',
        statement:
          "Algunes eines de la web (meditació, temporitzadors, calendari...) ajuden més que d'altres a preparar els exàmens.",
      },
      {
        id: 'H3.2',
        title: 'Hàbits, seguretat i notes',
        statement:
          'Millorar els hàbits d\'estudi i la seguretat en un mateix amb l\'ajuda de l\'app porta a treure millors notes.',
      },
    ],
  },
]

// Calcula el resultado de todas las hipótesis. Devuelve un objeto id → resultado
// { metrics, verdict, conclusion, pendingFinal? } y un resumen de veredictos.
export function buildHypothesisResults(initialTests, finalTests) {
  const students = initialTests.map((t) => studentIndices(t.responses))

  const results = {
    'H1.1': h11(students),
    'H1.2': h12(students),
    'H1.3': h13(students),
    'H2.1': h21(students),
    'H2.2': h22(students),
    'H3.1': h31(finalTests),
    'H3.2': h32(initialTests, finalTests),
  }

  const summary = { confirmada: 0, parcial: 0, refutada: 0, insuficient: 0 }
  for (const result of Object.values(results)) summary[result.verdict] += 1

  return { results, summary }
}
