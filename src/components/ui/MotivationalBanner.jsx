import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'

// Frases motivacionales redactadas por el equipo del trabajo.
// Se muestran en la parte superior de la app y van rotando cada cierto tiempo.
const PHRASES = [
  'Cada página que lees hoy es estrés que te ahorras mañana.',
  'No dejes para mañana lo que puedas estudiar hoy.',
  'Sigue ejemplos que te ayuden a crecer, no a compararte.',
  'Ser mejor persona es más importante que parecer superior.',
  'Ser auténtico es más valioso que encajar en un modelo.',
  'La confianza nace del esfuerzo, no de la apariencia.',
  'Tu valor no depende de una nota.',
  'Creer en ti mismo es el primer paso para mejorar.',
  'Cada error es una oportunidad para avanzar.',
  'La confianza se construye con acciones, no con deseos.',
  'Caer es normal; levantarse es lo que marca la diferencia.',
  'Suspender un examen no significa fracasar.',
  'El talento abre puertas; el esfuerzo las mantiene abiertas.',
  'Aprender es una inversión en ti mismo.',
  'Un pequeño esfuerzo cada día crea grandes cambios.',
  'Confía más en tus capacidades que en tus miedos.',
  'Lo que haces cada día define quién eres.',
  'Cambia el "no puedo" por "lo intentaré".',
  'Un mal día no define toda tu historia.',
  'Empieza pensando que es posible.',
  'No puedes controlar todo lo que pasa, pero sí cómo respondes.',
  'La mejor manera de creer en ti es actuar a tu favor cada día.',
  'Háblate como le hablarías a un buen amigo.',
  'No seas el obstáculo de tus propios objetivos.',
  'La constancia le gana a la perfección.',
  'Nadie nace sabiendo; todos aprendemos practicando.',
  'El fracaso es una parada, no el destino.',
  'Que aún no sepa hacerlo no significa que no pueda aprenderlo.',
  'No necesitas ser perfecto para sentirte orgulloso de ti.',
  'Compárate con quien eras ayer, no con los demás.',
  'Piensa por ti mismo: tu vida no es un vídeo de redes sociales.',
]

// Cada cuánto cambia la frase (ms) y cuánto dura la transición de opacidad.
const ROTATION_MS = 10000
const FADE_MS = 500

export default function MotivationalBanner() {
  // Orden aleatorio de las frases al montar, para que no empiece siempre igual.
  const order = useMemo(() => {
    const indices = PHRASES.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices
  }, [])

  const [position, setPosition] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      // Fundido de salida, cambio de frase y fundido de entrada.
      setVisible(false)
      const timeout = setTimeout(() => {
        setPosition((prev) => (prev + 1) % order.length)
        setVisible(true)
      }, FADE_MS)
      return () => clearTimeout(timeout)
    }, ROTATION_MS)

    return () => clearInterval(interval)
  }, [order.length])

  const phrase = PHRASES[order[position]]

  return (
    <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 px-4 py-2">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-400" aria-hidden="true" />
        <p
          className="text-center text-xs font-medium italic text-violet-700 transition-opacity duration-500 sm:text-sm"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {phrase}
        </p>
      </div>
    </div>
  )
}
