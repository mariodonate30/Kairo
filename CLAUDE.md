# Kairo — App de Hábitos para Adolescentes

## Visión del proyecto

App web escolar para un proyecto de Batxillerat sobre hábitos en la adolescencia y claves para el éxito. Los estudiantes de un instituto usan la app durante un período determinado, registrando hábitos diarios y completando encuestas semanales. Tres administradores extraen conclusiones de los datos agregados.

**Objetivo principal:** Recoger datos reales sobre hábitos de adolescentes (sueño, alimentación, estrés, estudio, hidratación) y analizar su evolución.

**Usuarios:** Estudiantes de instituto (~50-150 usuarios) + 3 administradores.

---

## Stack tecnológico

- **Frontend:** React 18 + Vite
- **Routing:** React Router v6
- **Estilos:** Tailwind CSS
- **Backend/Auth/DB:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Gráficos:** Recharts
- **Despliegue:** Vercel (frontend) + Supabase Cloud (backend)
- **Idioma de la app:** Español

---

## Estructura de la app

### Layout general

- **Sidebar izquierdo** (colapsable en móvil → hamburger menu):
  - Logo / nombre de la app
  - Navegación principal (las secciones de abajo)
  - Separador
  - Perfil del usuario
  - Configuración
  - Políticas de privacidad
  - Cerrar sesión

### Secciones principales

#### 1. CHECK-IN DIARIO (pantalla principal tras login)
La sección más importante de la app. Un formulario rápido (~2 min) que el usuario completa cada día.

Campos:
- Estado de ánimo (escala 1-5 con emojis)
- Horas de sueño (selector numérico)
- Calidad del sueño (escala 1-5)
- Alimentación (escala 1-5: "¿Cómo de saludable has comido hoy?")
- Vasos de agua (contador)
- Nivel de estrés (escala 1-5)
- ¿Has estudiado hoy? (sí/no + minutos aproximados)
- ¿Has hecho ejercicio? (sí/no + tipo)

Comportamiento:
- Solo se puede hacer 1 check-in por día
- Si ya lo completó, mostrar resumen del día con estado "✓ Completado"
- Indicador visual claro de pendiente/completado al entrar en la app

#### 2. ENCUESTAS SEMANALES
Cuestionarios más largos y reflexivos que se desbloquean cada lunes.

Estructura:
- Preguntas de valoración (escala 1-5 o 1-10)
- Categorías: estrés académico, relaciones sociales, motivación, hábitos de estudio, bienestar general
- ~10-15 preguntas por encuesta
- Se puede completar en cualquier momento de la semana
- Si no se completó, queda marcada como "No respondida"

Comportamiento:
- Cada semana se genera automáticamente una nueva encuesta
- Las preguntas pueden ser fijas (las mismas cada semana para medir evolución) o variables (definidas por los admins)
- Historial de encuestas pasadas visible para el usuario

#### 3. MIS OBJETIVOS
Sección de planificación diaria simple.

Funcionalidad:
- El usuario escribe hasta 3 objetivos/prioridades para hoy
- Checkbox para marcar como completados
- Al final del día se registra cuántos se cumplieron
- Vista de historial: calendario con porcentaje de cumplimiento por día
- Estadísticas: tasa de cumplimiento semanal/mensual

#### 4. TEMPORIZADOR DE ENFOQUE
Alternativa web al bloqueo de móvil. Timer para sesiones de estudio tipo Pomodoro.

Funcionalidad:
- Selector de duración (25, 45, 60 min o personalizado)
- Botón de iniciar/pausar/cancelar
- Sonido o alerta visual al terminar
- Registro automático: fecha, duración configurada, duración real, completada sí/no
- Historial de sesiones
- Estadísticas: total de minutos de enfoque por semana, racha de días consecutivos

#### 5. MEDITACIÓN
Sección minimalista para fomentar la práctica de meditación.

Funcionalidad:
- Temporizador de meditación (5, 10, 15 min)
- Sonido ambiental opcional (lluvia, naturaleza — usar archivos de audio libres de derechos)
- Registro de sesiones completadas
- Estadísticas básicas: sesiones esta semana, minutos totales, racha

#### 6. MI PROGRESIÓN
Dashboard personal con gráficos de evolución del usuario.

Gráficos:
- Evolución del estado de ánimo (línea temporal)
- Horas de sueño por día (barras)
- Nivel de estrés semanal (línea temporal)
- Vasos de agua por día (barras)
- Minutos de estudio por día (barras)
- Tasa de cumplimiento de objetivos (línea temporal)
- Resultados de encuestas semanales por categoría (radar o barras agrupadas)

Filtros:
- Última semana / último mes / todo el historial

#### 7. RECURSOS
Página estática con contenido curado.

Secciones:
- Técnicas de estudio (Pomodoro, active recall, spaced repetition)
- Guía de alimentación saludable para estudiantes
- Ejercicios de meditación y respiración
- Consejos para mejorar el sueño
- Apps recomendadas (externas)
- Líneas de ayuda y recursos de apoyo

#### 8. PERFIL
- Nombre, email, avatar (iniciales generadas)
- Estadísticas generales: días usando la app, check-ins completados, racha actual
- Logros desbloqueados

#### 9. CONFIGURACIÓN
- Cambiar nombre
- Cambiar contraseña
- Tema (claro/oscuro) — si da tiempo
- Eliminar cuenta

#### 10. POLÍTICAS DE PRIVACIDAD
- Página estática con texto legal
- Explicar qué datos se recogen, cómo se usan, que los admins ven datos agregados
- Importante: los usuarios son menores de edad, hay que ser transparentes

---

## Sistema de gamificación

### Rachas
- Racha de check-in diario (días consecutivos)
- Racha de objetivos cumplidos
- Racha de sesiones de enfoque

### Logros (badges)
- "Primer check-in"
- "7 días seguidos"
- "30 días seguidos"
- "Primera encuesta completada"
- "10 sesiones de enfoque"
- "100 vasos de agua registrados"
- Etc.

Los logros se muestran en el perfil y se notifican con un toast al desbloquearlos.

---

## Panel de administración

Accesible solo para los 3 admins (role = 'admin' en la tabla de usuarios).

### Dashboard admin
- Número total de usuarios registrados
- Usuarios activos hoy / esta semana
- Check-ins completados hoy
- Encuestas completadas esta semana

### Datos agregados (ANONIMIZADOS)
- Media de estado de ánimo del instituto por día (gráfico temporal)
- Media de horas de sueño
- Media de estrés
- Distribución de respuestas por categoría de encuesta
- Secciones más usadas
- Tasa de retención (usuarios que vuelven cada día)

### Exportación
- Botón para descargar datos en CSV
- Datos anonimizados (sin nombres, solo IDs numéricos)
- Filtros por fecha

### Gestión de encuestas
- Crear/editar preguntas para las encuestas semanales
- Ver resultados por pregunta con gráficos

---

## Esquema de base de datos (Supabase/PostgreSQL)

### Tabla: profiles
```sql
id UUID (FK → auth.users.id, PK)
email TEXT
full_name TEXT
role TEXT DEFAULT 'student' -- 'student' | 'admin'
avatar_url TEXT
created_at TIMESTAMPTZ DEFAULT now()
current_streak INT DEFAULT 0
longest_streak INT DEFAULT 0
```

### Tabla: daily_checkins
```sql
id UUID (PK, DEFAULT gen_random_uuid())
user_id UUID (FK → profiles.id)
date DATE
mood INT (1-5)
sleep_hours NUMERIC(3,1)
sleep_quality INT (1-5)
nutrition INT (1-5)
water_glasses INT
stress INT (1-5)
studied BOOLEAN
study_minutes INT
exercised BOOLEAN
exercise_type TEXT
created_at TIMESTAMPTZ DEFAULT now()
UNIQUE(user_id, date)
```

### Tabla: weekly_surveys
```sql
id UUID (PK)
user_id UUID (FK → profiles.id)
week_start DATE
responses JSONB -- { question_id: answer_value }
completed_at TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT now()
UNIQUE(user_id, week_start)
```

### Tabla: survey_questions
```sql
id UUID (PK)
question_text TEXT
category TEXT -- 'stress', 'motivation', 'social', 'study_habits', 'wellbeing'
scale_min INT DEFAULT 1
scale_max INT DEFAULT 5
active BOOLEAN DEFAULT true
sort_order INT
created_at TIMESTAMPTZ DEFAULT now()
```

### Tabla: daily_goals
```sql
id UUID (PK)
user_id UUID (FK → profiles.id)
date DATE
goal_text TEXT
completed BOOLEAN DEFAULT false
sort_order INT (1-3)
created_at TIMESTAMPTZ DEFAULT now()
```

### Tabla: focus_sessions
```sql
id UUID (PK)
user_id UUID (FK → profiles.id)
date DATE
planned_minutes INT
actual_minutes INT
completed BOOLEAN
created_at TIMESTAMPTZ DEFAULT now()
```

### Tabla: meditation_sessions
```sql
id UUID (PK)
user_id UUID (FK → profiles.id)
date DATE
duration_minutes INT
created_at TIMESTAMPTZ DEFAULT now()
```

### Tabla: achievements
```sql
id UUID (PK)
key TEXT UNIQUE -- 'first_checkin', 'streak_7', 'streak_30', etc.
title TEXT
description TEXT
icon TEXT -- emoji
```

### Tabla: user_achievements
```sql
id UUID (PK)
user_id UUID (FK → profiles.id)
achievement_id UUID (FK → achievements.id)
unlocked_at TIMESTAMPTZ DEFAULT now()
UNIQUE(user_id, achievement_id)
```

### Row Level Security (RLS)
- Cada usuario solo puede leer/escribir SUS propios datos
- Los admins pueden leer TODOS los datos (para el panel de admin)
- Nadie puede modificar datos de otros usuarios
- Las survey_questions son legibles por todos, editables solo por admins

---

## Estructura de archivos

```
src/
├── main.jsx
├── App.jsx
├── index.css
├── lib/
│   └── supabase.js              # Cliente de Supabase
├── contexts/
│   └── AuthContext.jsx           # Contexto de autenticación
├── hooks/
│   ├── useAuth.js
│   ├── useCheckin.js
│   ├── useGoals.js
│   ├── useSurveys.js
│   ├── useFocusTimer.js
│   ├── useMeditation.js
│   ├── useAchievements.js
│   └── useAdminData.js
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── MobileNav.jsx
│   │   └── AppLayout.jsx
│   ├── ui/
│   │   ├── ScaleInput.jsx        # Selector 1-5 reutilizable
│   │   ├── StatCard.jsx
│   │   ├── StreakBadge.jsx
│   │   ├── AchievementToast.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── EmptyState.jsx
│   ├── charts/
│   │   ├── MoodChart.jsx
│   │   ├── SleepChart.jsx
│   │   ├── StressChart.jsx
│   │   ├── GoalCompletionChart.jsx
│   │   └── SurveyRadarChart.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── AggregateCharts.jsx
│       ├── SurveyManager.jsx
│       └── DataExport.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Checkin.jsx               # Check-in diario (página principal)
│   ├── Surveys.jsx
│   ├── Goals.jsx
│   ├── FocusTimer.jsx
│   ├── Meditation.jsx
│   ├── Progress.jsx
│   ├── Resources.jsx
│   ├── Profile.jsx
│   ├── Settings.jsx
│   ├── Privacy.jsx
│   └── Admin.jsx                 # Panel de administración
└── utils/
    ├── streaks.js                # Lógica de cálculo de rachas
    ├── achievements.js           # Lógica de desbloqueo de logros
    ├── dateHelpers.js
    └── exportCsv.js
```

---

## Plan de construcción por fases

### FASE 0 — Setup (~30 min)
1. Crear proyecto con Vite + React
2. Instalar dependencias: react-router-dom, @supabase/supabase-js, tailwindcss, recharts, lucide-react
3. Configurar Tailwind
4. Crear proyecto en Supabase, copiar URL y anon key
5. Crear archivo supabase.js con el cliente

### FASE 1 — Auth + Layout (~2-3 horas)
1. Configurar Supabase Auth (email/password)
2. Crear tabla profiles con trigger para crear perfil al registrarse
3. Crear AuthContext
4. Crear páginas Login y Register
5. Crear AppLayout con Sidebar
6. Configurar React Router con rutas protegidas
7. Crear la lógica de roles (student/admin)

### FASE 2 — Check-in diario (~2-3 horas)
1. Crear tabla daily_checkins en Supabase con RLS
2. Crear página Checkin con el formulario
3. Componente ScaleInput reutilizable
4. Lógica de "solo 1 por día"
5. Estado visual de completado/pendiente
6. Guardar en Supabase

### FASE 3 — Objetivos diarios (~1-2 horas)
1. Crear tabla daily_goals con RLS
2. Página Goals: escribir 3 objetivos, checkboxes
3. Historial de días anteriores

### FASE 4 — Temporizador de enfoque (~2 horas)
1. Crear tabla focus_sessions con RLS
2. Timer funcional con useEffect/useRef
3. Registro automático al completar
4. Historial de sesiones

### FASE 5 — Meditación (~1-2 horas)
1. Crear tabla meditation_sessions con RLS
2. Timer de meditación
3. Sonidos ambientales (archivos .mp3 libres)
4. Historial

### FASE 6 — Encuestas semanales (~3-4 horas)
1. Crear tablas survey_questions y weekly_surveys con RLS
2. Insertar preguntas iniciales
3. Página de encuesta con formulario dinámico
4. Lógica de desbloqueo semanal
5. Historial de encuestas pasadas

### FASE 7 — Progresión y gráficos (~3-4 horas)
1. Página Progress con todos los gráficos
2. Componentes de gráficos con Recharts
3. Filtros temporales (semana/mes/todo)

### FASE 8 — Gamificación (~2 horas)
1. Crear tablas achievements y user_achievements
2. Insertar logros predefinidos
3. Lógica de cálculo de rachas en check-ins
4. Sistema de detección y desbloqueo de logros
5. Toast de notificación
6. Mostrar en perfil

### FASE 9 — Panel de admin (~3-4 horas)
1. Página Admin con acceso restringido a role='admin'
2. Dashboard con estadísticas generales
3. Gráficos de datos agregados
4. Gestión de preguntas de encuestas
5. Exportación a CSV

### FASE 10 — Páginas secundarias (~1-2 horas)
1. Perfil del usuario
2. Configuración
3. Políticas de privacidad
4. Recursos

### FASE 11 — Pulido final (~2-3 horas)
1. Responsive (móvil primero)
2. Estados vacíos y de carga
3. Manejo de errores
4. Tema visual coherente
5. Testing manual de todos los flujos

---

## Convenciones de código

- Componentes: PascalCase (MoodChart.jsx)
- Hooks: camelCase con prefijo use (useCheckin.js)
- Funciones y variables: camelCase
- Constantes: UPPER_SNAKE_CASE
- Archivos CSS: usar Tailwind classes directamente
- Idioma del código: inglés (variables, funciones, componentes)
- Idioma del UI: español (textos visibles al usuario)
- Cada componente en su propio archivo
- Custom hooks para toda la lógica de datos/Supabase
- No usar any en TypeScript si se migra a TS

---

## Variables de entorno

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
```

Nunca commitear estas claves. Usar .env.local (incluido en .gitignore).

---

## Notas importantes

- Los usuarios son MENORES DE EDAD. No recoger datos innecesarios. Ser transparente.
- Los datos del panel admin deben ser AGREGADOS y ANONIMIZADOS.
- La app debe funcionar bien en MÓVIL (la mayoría de estudiantes la usarán desde el teléfono).
- El check-in diario es la pantalla principal — debe ser rápida y fácil de completar.
- Priorizar que funcione bien sobre que se vea espectacular.
- Si algo no es imprescindible, dejarlo para después. Mejor menos features bien hechas que muchas a medias.
