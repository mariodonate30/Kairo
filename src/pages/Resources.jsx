import {
  Apple,
  BookOpen,
  ExternalLink,
  LifeBuoy,
  Moon,
  Phone,
  Sparkles,
  Wind,
} from 'lucide-react'

// Encabezado de sección con icono de color.
function SectionHeader({ icon: Icon, title, tone }) {
  const tones = {
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    sky: 'bg-sky-50 text-sky-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  }
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className={['flex h-10 w-10 items-center justify-center rounded-2xl', tones[tone]].join(' ')}>
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
    </div>
  )
}

function Card({ children }) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      {children}
    </section>
  )
}

// Ítem con título en negrita y descripción, para técnicas y consejos.
function TipItem({ title, children }) {
  return (
    <li className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{children}</p>
    </li>
  )
}

function ExternalLinkItem({ name, description, href }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-violet-200 hover:bg-violet-50/40"
      >
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            {name}
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-violet-500" />
          </p>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </a>
    </li>
  )
}

export default function Resources() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recursos</h1>
        <p className="mt-1 text-slate-500">
          Técnicas, guías y ayuda para cuidar tus hábitos y tu bienestar.
        </p>
      </div>

      {/* Técnicas de estudio */}
      <Card>
        <SectionHeader icon={BookOpen} title="Técnicas de estudio" tone="violet" />
        <ul className="grid gap-3 sm:grid-cols-2">
          <TipItem title="Técnica Pomodoro">
            Estudia en bloques de 25 minutos con descansos de 5. Cada 4 bloques, descansa 15-30
            minutos. Ayuda a mantener la concentración y evitar el agotamiento. Puedes usar el
            Temporizador de enfoque de la app.
          </TipItem>
          <TipItem title="Active recall (recuerdo activo)">
            En lugar de releer, cierra los apuntes e intenta recordar la información de memoria.
            Hazte preguntas o explícate el tema en voz alta. Recordar activamente fija mucho mejor
            el conocimiento.
          </TipItem>
          <TipItem title="Spaced repetition (repaso espaciado)">
            Repasa el material en intervalos crecientes (al día siguiente, a los 3 días, a la
            semana…). Combatir el olvido justo antes de que ocurra hace el estudio mucho más
            eficiente.
          </TipItem>
          <TipItem title="Regla de los dos minutos">
            Si algo te cuesta empezar, comprométete a hacerlo solo 2 minutos. Arrancar es lo más
            difícil; una vez empiezas, suele ser fácil continuar.
          </TipItem>
        </ul>
      </Card>

      {/* Alimentación saludable */}
      <Card>
        <SectionHeader icon={Apple} title="Alimentación saludable para estudiantes" tone="emerald" />
        <ul className="grid gap-3 sm:grid-cols-2">
          <TipItem title="No te saltes el desayuno">
            Un buen desayuno con proteína, fruta y cereales integrales te da energía estable para
            las primeras horas de clase y mejora la concentración.
          </TipItem>
          <TipItem title="Hidrátate bien">
            El agua es clave para el rendimiento mental. Lleva una botella y bebe a lo largo del
            día; registra tus vasos en el check-in diario.
          </TipItem>
          <TipItem title="Snacks inteligentes">
            Cambia la bollería y las bebidas azucaradas por fruta, frutos secos o yogur. Evitan los
            picos de azúcar que luego provocan bajones de energía.
          </TipItem>
          <TipItem title="Cuida el azúcar y la cafeína">
            Demasiadas bebidas energéticas o refrescos alteran el sueño y aumentan la ansiedad.
            Modéralos, sobre todo por la tarde.
          </TipItem>
        </ul>
      </Card>

      {/* Meditación y respiración */}
      <Card>
        <SectionHeader icon={Wind} title="Meditación y respiración" tone="sky" />
        <ul className="grid gap-3 sm:grid-cols-2">
          <TipItem title="Respiración 4-7-8">
            Inspira por la nariz durante 4 segundos, mantén el aire 7 segundos y suelta lentamente
            por la boca durante 8. Repite 4 veces. Ideal para calmar los nervios antes de un examen.
          </TipItem>
          <TipItem title="Respiración cuadrada (box breathing)">
            Inspira 4 s, mantén 4 s, espira 4 s, mantén 4 s. Visualiza un cuadrado mientras lo
            haces. Reduce el estrés y ayuda a recuperar la concentración.
          </TipItem>
          <TipItem title="Atención plena de 5 minutos">
            Siéntate cómodo, cierra los ojos y centra la atención en tu respiración. Cuando tu mente
            se distraiga, vuelve a ella sin juzgarte. Usa el temporizador de Meditación de la app.
          </TipItem>
          <TipItem title="Escaneo corporal">
            Recorre mentalmente tu cuerpo de los pies a la cabeza, notando y relajando cada zona.
            Muy útil para soltar la tensión acumulada al final del día.
          </TipItem>
        </ul>
      </Card>

      {/* Consejos para el sueño */}
      <Card>
        <SectionHeader icon={Moon} title="Consejos para mejorar el sueño" tone="indigo" />
        <ul className="grid gap-3 sm:grid-cols-2">
          <TipItem title="Horario regular">
            Acuéstate y levántate a horas parecidas, también los fines de semana. Tu cuerpo funciona
            mejor con una rutina estable de sueño.
          </TipItem>
          <TipItem title="Menos pantallas antes de dormir">
            La luz azul del móvil retrasa el sueño. Intenta apagar las pantallas al menos 30-60
            minutos antes de acostarte.
          </TipItem>
          <TipItem title="Cuida el ambiente">
            Duerme en una habitación oscura, fresca y silenciosa. Un buen entorno mejora mucho la
            calidad del descanso.
          </TipItem>
          <TipItem title="Evita estimulantes por la tarde">
            La cafeína puede tardar horas en desaparecer. Evita café, té o bebidas energéticas a
            partir de media tarde.
          </TipItem>
        </ul>
      </Card>

      {/* Apps recomendadas */}
      <Card>
        <SectionHeader icon={Sparkles} title="Apps recomendadas" tone="amber" />
        <ul className="flex flex-col gap-3">
          <ExternalLinkItem
            name="Forest"
            description="Planta árboles virtuales mientras estudias sin tocar el móvil."
            href="https://www.forestapp.cc/"
          />
          <ExternalLinkItem
            name="Insight Timer"
            description="Miles de meditaciones guiadas y sonidos para relajarte o dormir."
            href="https://insighttimer.com/"
          />
          <ExternalLinkItem
            name="Anki"
            description="Tarjetas de repaso espaciado para memorizar de forma eficiente."
            href="https://apps.ankiweb.net/"
          />
          <ExternalLinkItem
            name="Sleep Cycle"
            description="Analiza tu sueño y te despierta en el momento más ligero."
            href="https://www.sleepcycle.com/"
          />
        </ul>
        <p className="mt-4 text-xs text-slate-400">
          Estas apps son externas y no forman parte de Kairo. Revisa siempre sus condiciones de uso.
        </p>
      </Card>

      {/* Líneas de ayuda */}
      <Card>
        <SectionHeader icon={LifeBuoy} title="Líneas de ayuda y apoyo" tone="rose" />
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Si te sientes mal, estás pasando por un momento difícil o necesitas hablar con alguien, no
          estás solo/a. Pedir ayuda es un signo de fortaleza. Aquí tienes recursos gratuitos y
          confidenciales:
        </p>
        <ul className="flex flex-col gap-3">
          <li className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                024 — Atención a la conducta suicida
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                Línea gratuita y confidencial, disponible las 24 horas, para quien pasa por un
                momento de crisis emocional.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Fundación ANAR — 900 20 20 10
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                Teléfono de ayuda a niños, niñas y adolescentes. Gratuito, anónimo y confidencial.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Teléfono de la Esperanza — 717 003 717
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                Apoyo emocional para cualquier tipo de crisis o malestar, atendido por profesionales
                y voluntariado.
              </p>
            </div>
          </li>
        </ul>
        <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm leading-relaxed text-rose-700">
          En una emergencia con riesgo para tu vida o la de otra persona, llama al{' '}
          <strong>112</strong>. Y recuerda: siempre puedes hablar con tu familia, un profesor de
          confianza o el orientador del instituto.
        </p>
      </Card>
    </div>
  )
}
