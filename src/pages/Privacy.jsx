import { ShieldCheck } from 'lucide-react'

// Bloque de sección con título y contenido, para estructurar la política.
function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-900">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  )
}

export default function Privacy() {
  const lastUpdated = 'agost de 2026'

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Política de privacitat</h1>
      </div>

      <div className="space-y-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm leading-relaxed text-slate-600">
          Kairo és una aplicació desenvolupada per a un projecte escolar de Batxillerat sobre els hàbits a l'adolescència i les claus per a l'èxit. Com que la majoria de les persones usuàries sou <strong className="text-slate-900">menors d'edat</strong>, volem ser totalment transparents sobre quines dades recollim, per a què les fem servir i quins drets tens sobre elles.
        </p>

        <Section title="1. Qui és responsable de les teves dades">
          <p>
            Els responsables de l'app són els tres administradors del projecte (estudiants i professorat responsable de l'institut). Les dades s'emmagatzemen de manera segura a Supabase i només es fan servir dins de l'àmbit d'aquest projecte educatiu.
          </p>
        </Section>

        <Section title="2. Quines dades recollim">
          <p>Recollim únicament les dades necessàries per al funcionament de l'app:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-slate-900">Dades del compte:</strong> nom i correu electrònic, que es fan servir per identificar-te en iniciar sessió.
            </li>
            <li>
              <strong className="text-slate-900">Check-ins diaris:</strong> estat d'ànim, hores i qualitat del son, alimentació, gots d'aigua, nivell d'estrès, estudi i exercici.
            </li>
            <li>
              <strong className="text-slate-900">Enquestes setmanals:</strong> les teves respostes sobre estrès acadèmic, relacions socials, motivació, hàbits d'estudi i benestar.
            </li>
            <li>
              <strong className="text-slate-900">Activitat a l'app:</strong> objectius diaris, sessions de concentració i de meditació, ratxes i assoliments.
            </li>
          </ul>
          <p>
            No recollim dades innecessàries ni informació sensible més enllà de la descrita. Tampoc no compartim les teves dades amb tercers ni les fem servir amb finalitats comercials o publicitàries.
          </p>
        </Section>

        <Section title="3. Per a què fem servir les teves dades">
          <p>
            Les teves dades es fan servir <strong className="text-slate-900">exclusivament amb finalitats d'anàlisi educativa</strong> per al projecte de recerca sobre hàbits adolescents. Ens permeten estudiar l'evolució d'hàbits com el son, l'alimentació, l'estrès o l'estudi al llarg del temps.
          </p>
        </Section>

        <Section title="4. Dades agregades i anonimitzades">
          <p>
            Els administradors <strong className="text-slate-900">mai no analitzen les teves respostes individuals de manera identificada</strong>. Al panell d'administració només veuen dades <strong className="text-slate-900">agregades i anonimitzades</strong> del conjunt d'estudiants: per exemple, la mitjana d'hores de son de l'institut o l'evolució mitjana del nivell d'estrès.
          </p>
          <p>
            Quan s'exporten dades per a l'estudi, s'anonimitzen: se substitueixen els noms per identificadors numèrics, de manera que les conclusions s'extreuen del grup i no de persones concretes.
          </p>
        </Section>

        <Section title="5. Els teus drets">
          <p>Tens control total sobre les teves dades. En qualsevol moment pots:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Consultar les teves pròpies dades des de les diferents seccions de l'app.</li>
            <li>Canviar el teu nom i la contrasenya des de Configuració.</li>
            <li>
              <strong className="text-slate-900">Eliminar el teu compte</strong> des de Configuració. En fer-ho s'esborren de manera permanent el teu perfil i totes les teves dades (check-ins, enquestes, objectius, sessions i assoliments).
            </li>
          </ul>
        </Section>

        <Section title="6. Seguretat">
          <p>
            Cada persona usuària només pot accedir a les seves pròpies dades. La base de dades aplica regles de seguretat (Row Level Security) que impedeixen que ningú llegeixi ni modifiqui les dades d'una altra persona. Les contrasenyes es gestionen de manera xifrada mitjançant el sistema d'autenticació de Supabase i mai no són visibles per als administradors.
          </p>
        </Section>

        <Section title="7. Contacte">
          <p>
            Si tens qualsevol dubte sobre el tractament de les teves dades, pots parlar amb el professorat responsable del projecte o amb els administradors de l'app.
          </p>
        </Section>

        <p className="border-t border-slate-100 pt-5 text-xs text-slate-400">
          Última actualització: {lastUpdated}.
        </p>
      </div>
    </div>
  )
}
