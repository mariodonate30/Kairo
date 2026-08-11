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
  const lastUpdated = 'agosto de 2026'

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Políticas de privacidad</h1>
      </div>

      <div className="space-y-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm leading-relaxed text-slate-600">
          Kairo es una aplicación desarrollada para un proyecto escolar de Batxillerat sobre los
          hábitos en la adolescencia y las claves para el éxito. Como la mayoría de las personas
          usuarias sois <strong className="text-slate-900">menores de edad</strong>, queremos ser
          totalmente transparentes sobre qué datos recogemos, para qué los usamos y qué derechos
          tienes sobre ellos.
        </p>

        <Section title="1. Quién es responsable de tus datos">
          <p>
            Los responsables de la app son los tres administradores del proyecto (estudiantes y
            profesorado responsable del instituto). Los datos se almacenan de forma segura en
            Supabase y solo se utilizan dentro del ámbito de este proyecto educativo.
          </p>
        </Section>

        <Section title="2. Qué datos recogemos">
          <p>Recogemos únicamente los datos necesarios para el funcionamiento de la app:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-slate-900">Datos de cuenta:</strong> nombre y correo
              electrónico, usados para identificarte al iniciar sesión.
            </li>
            <li>
              <strong className="text-slate-900">Check-ins diarios:</strong> estado de ánimo, horas
              y calidad del sueño, alimentación, vasos de agua, nivel de estrés, estudio y
              ejercicio.
            </li>
            <li>
              <strong className="text-slate-900">Encuestas semanales:</strong> tus respuestas sobre
              estrés académico, relaciones sociales, motivación, hábitos de estudio y bienestar.
            </li>
            <li>
              <strong className="text-slate-900">Actividad en la app:</strong> objetivos diarios,
              sesiones de enfoque y de meditación, rachas y logros.
            </li>
          </ul>
          <p>
            No recogemos datos innecesarios ni información sensible más allá de la descrita.
            Tampoco compartimos tus datos con terceros ni los usamos con fines comerciales o
            publicitarios.
          </p>
        </Section>

        <Section title="3. Para qué usamos tus datos">
          <p>
            Tus datos se usan <strong className="text-slate-900">exclusivamente con fines de
            análisis educativo</strong> para el proyecto de investigación sobre hábitos
            adolescentes. Nos permiten estudiar la evolución de hábitos como el sueño, la
            alimentación, el estrés o el estudio a lo largo del tiempo.
          </p>
        </Section>

        <Section title="4. Datos agregados y anonimizados">
          <p>
            Los administradores <strong className="text-slate-900">nunca analizan tus respuestas
            individuales de forma identificada</strong>. En el panel de administración solo ven
            datos <strong className="text-slate-900">agregados y anonimizados</strong> del conjunto
            de estudiantes: por ejemplo, la media de horas de sueño del instituto o la evolución
            media del nivel de estrés.
          </p>
          <p>
            Cuando se exportan datos para el estudio, estos se anonimizan: se sustituyen los
            nombres por identificadores numéricos, de modo que las conclusiones se extraen del
            grupo y no de personas concretas.
          </p>
        </Section>

        <Section title="5. Tus derechos">
          <p>Tienes control total sobre tus datos. En cualquier momento puedes:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Consultar tus propios datos desde las distintas secciones de la app.</li>
            <li>Cambiar tu nombre y tu contraseña desde Configuración.</li>
            <li>
              <strong className="text-slate-900">Eliminar tu cuenta</strong> desde Configuración.
              Al hacerlo se borran de forma permanente tu perfil y todos tus datos (check-ins,
              encuestas, objetivos, sesiones y logros).
            </li>
          </ul>
        </Section>

        <Section title="6. Seguridad">
          <p>
            Cada persona usuaria solo puede acceder a sus propios datos. La base de datos aplica
            reglas de seguridad (Row Level Security) que impiden que nadie lea ni modifique los
            datos de otra persona. Las contraseñas se gestionan de forma cifrada mediante el
            sistema de autenticación de Supabase y nunca son visibles para los administradores.
          </p>
        </Section>

        <Section title="7. Contacto">
          <p>
            Si tienes cualquier duda sobre el tratamiento de tus datos, puedes hablar con el
            profesorado responsable del proyecto o con los administradores de la app.
          </p>
        </Section>

        <p className="border-t border-slate-100 pt-5 text-xs text-slate-400">
          Última actualización: {lastUpdated}.
        </p>
      </div>
    </div>
  )
}
