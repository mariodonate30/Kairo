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
          Tècniques, guies i ajuda per cuidar els teus hàbits i el teu benestar.
        </p>
      </div>

      {/* Técnicas de estudio */}
      <Card>
        <SectionHeader icon={BookOpen} title="Tècniques d'estudi" tone="violet" />
        <ul className="grid gap-3 sm:grid-cols-2">
          <TipItem title="Tècnica Pomodoro">
            Estudia en blocs de 25 minuts amb descansos de 5. Cada 4 blocs, descansa 15-30 minuts. Ajuda a mantenir la concentració i a evitar l'esgotament. Pots fer servir el Temporitzador de concentració de l'app.
          </TipItem>
          <TipItem title="Active recall (record actiu)">
            En lloc de rellegir, tanca els apunts i intenta recordar la informació de memòria. Fes-te preguntes o explica't el tema en veu alta. Recordar activament fixa molt millor el coneixement.
          </TipItem>
          <TipItem title="Spaced repetition (repàs espaiat)">
            Repassa el material en intervals creixents (l'endemà, al cap de 3 dies, al cap d'una setmana…). Combatre l'oblit just abans que passi fa l'estudi molt més eficient.
          </TipItem>
          <TipItem title="Regla dels dos minuts">
            Si et costa començar alguna cosa, comprometa't a fer-la només 2 minuts. Arrencar és el més difícil; un cop comences, sol ser fàcil continuar.
          </TipItem>
        </ul>
      </Card>

      {/* Alimentación saludable */}
      <Card>
        <SectionHeader icon={Apple} title="Alimentació saludable per a estudiants" tone="emerald" />
        <ul className="grid gap-3 sm:grid-cols-2">
          <TipItem title="No et saltis l'esmorzar">
            Un bon esmorzar amb proteïna, fruita i cereals integrals et dona energia estable per a les primeres hores de classe i millora la concentració.
          </TipItem>
          <TipItem title="Hidrata't bé">
            L'aigua és clau per al rendiment mental. Porta una ampolla i beu al llarg del dia; registra els teus gots al check-in diari.
          </TipItem>
          <TipItem title="Snacks intel·ligents">
            Canvia la brioixeria i les begudes ensucrades per fruita, fruits secs o iogurt. Eviten els pics de sucre que després provoquen baixades d'energia.
          </TipItem>
          <TipItem title="Vigila el sucre i la cafeïna">
            Massa begudes energètiques o refrescos alteren el son i augmenten l'ansietat. Modera'ls, sobretot a la tarda.
          </TipItem>
        </ul>
      </Card>

      {/* Meditación y respiración */}
      <Card>
        <SectionHeader icon={Wind} title="Meditació i respiració" tone="sky" />
        <ul className="grid gap-3 sm:grid-cols-2">
          <TipItem title="Respiració 4-7-8">
            Inspira pel nas durant 4 segons, aguanta l'aire 7 segons i deixa'l anar lentament per la boca durant 8. Repeteix-ho 4 vegades. Ideal per calmar els nervis abans d'un examen.
          </TipItem>
          <TipItem title="Respiració quadrada (box breathing)">
            Inspira 4 s, aguanta 4 s, expira 4 s, aguanta 4 s. Visualitza un quadrat mentre ho fas. Redueix l'estrès i ajuda a recuperar la concentració.
          </TipItem>
          <TipItem title="Atenció plena de 5 minuts">
            Asseu-te còmodament, tanca els ulls i centra l'atenció en la respiració. Quan la ment es distregui, torna-hi sense jutjar-te. Fes servir el temporitzador de Meditació de l'app.
          </TipItem>
          <TipItem title="Escaneig corporal">
            Recorre mentalment el teu cos dels peus al cap, notant i relaxant cada zona. Molt útil per alliberar la tensió acumulada al final del dia.
          </TipItem>
        </ul>
      </Card>

      {/* Consejos para el sueño */}
      <Card>
        <SectionHeader icon={Moon} title="Consells per millorar el son" tone="indigo" />
        <ul className="grid gap-3 sm:grid-cols-2">
          <TipItem title="Horari regular">
            Ves a dormir i lleva't a hores semblants, també els caps de setmana. El teu cos funciona millor amb una rutina de son estable.
          </TipItem>
          <TipItem title="Menys pantalles abans de dormir">
            La llum blava del mòbil endarrereix el son. Intenta apagar les pantalles almenys 30-60 minuts abans d'anar a dormir.
          </TipItem>
          <TipItem title="Cuida l'ambient">
            Dorm en una habitació fosca, fresca i silenciosa. Un bon entorn millora molt la qualitat del descans.
          </TipItem>
          <TipItem title="Evita estimulants a la tarda">
            La cafeïna pot trigar hores a desaparèixer. Evita el cafè, el te o les begudes energètiques a partir de mitja tarda.
          </TipItem>
        </ul>
      </Card>

      {/* Apps recomendadas */}
      <Card>
        <SectionHeader icon={Sparkles} title="Apps recomanades" tone="amber" />
        <ul className="flex flex-col gap-3">
          <ExternalLinkItem
            name="Forest"
            description="Planta arbres virtuals mentre estudies sense tocar el mòbil."
            href="https://www.forestapp.cc/"
          />
          <ExternalLinkItem
            name="Insight Timer"
            description="Milers de meditacions guiades i sons per relaxar-te o dormir."
            href="https://insighttimer.com/"
          />
          <ExternalLinkItem
            name="Anki"
            description="Targetes de repàs espaiat per memoritzar de manera eficient."
            href="https://apps.ankiweb.net/"
          />
          <ExternalLinkItem
            name="Sleep Cycle"
            description="Analitza el teu son i et desperta en el moment més lleuger."
            href="https://www.sleepcycle.com/"
          />
        </ul>
        <p className="mt-4 text-xs text-slate-400">
          Aquestes apps són externes i no formen part de Kairo. Revisa sempre les seves condicions d'ús.
        </p>
      </Card>

      {/* Líneas de ayuda */}
      <Card>
        <SectionHeader icon={LifeBuoy} title="Línies d'ajuda i suport" tone="rose" />
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Si et trobes malament, estàs passant per un moment difícil o necessites parlar amb algú, no estàs sol/a. Demanar ajuda és un signe de fortalesa. Aquí tens recursos gratuïts i confidencials:
        </p>
        <ul className="flex flex-col gap-3">
          <li className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                024 — Atenció a la conducta suïcida
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                Línia gratuïta i confidencial, disponible les 24 hores, per a qui passa per un moment de crisi emocional.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Fundació ANAR — 900 20 20 10
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                Telèfon d'ajuda a nens, nenes i adolescents. Gratuït, anònim i confidencial.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Telèfon de l'Esperança — 717 003 717
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                Suport emocional per a qualsevol tipus de crisi o malestar, atès per professionals i voluntariat.
              </p>
            </div>
          </li>
        </ul>
        <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm leading-relaxed text-rose-700">
          En una emergència amb risc per a la teva vida o la d'una altra persona, truca al{' '}
          <strong>112</strong>. I recorda: sempre pots parlar amb la teva família, un professor de confiança o l'orientador de l'institut.
        </p>
      </Card>
    </div>
  )
}
