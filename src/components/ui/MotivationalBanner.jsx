import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'

// Frases motivacionales redactadas por el equipo del trabajo.
// Se muestran en la parte superior de la app y van rotando cada cierto tiempo.
const PHRASES = [
  'Cada pàgina que llegeixes avui és estrès que t\'estalvies demà.',
  'No deixis per a demà el que puguis estudiar avui.',
  'Segueix exemples que t\'ajudin a créixer, no a comparar-te.',
  'Ser millor persona és més important que semblar superior.',
  'Ser autèntic és més valuós que encaixar en un model.',
  'La confiança neix de l\'esforç, no de l\'aparença.',
  'El teu valor no depèn d\'una nota.',
  'Creure en tu mateix és el primer pas per millorar.',
  'Cada error és una oportunitat per avançar.',
  'La confiança es construeix amb accions, no amb desitjos.',
  'Caure és normal; aixecar-se és el que marca la diferència.',
  'Suspendre un examen no vol dir fracassar.',
  'El talent obre portes; l\'esforç les manté obertes.',
  'Aprendre és una inversió en tu mateix.',
  'Un petit esforç cada dia crea grans canvis.',
  'Confia més en les teves capacitats que en les teves pors.',
  'El que fas cada dia defineix qui ets.',
  'Canvia el «no puc» per «ho intentaré».',
  'Un mal dia no defineix tota la teva història.',
  'Comença pensant que és possible.',
  'No pots controlar tot el que passa, però sí com respons.',
  'La millor manera de creure en tu és actuar a favor teu cada dia.',
  'Parla\'t com li parlaries a un bon amic.',
  'No siguis l\'obstacle dels teus propis objectius.',
  'La constància guanya la perfecció.',
  'Ningú neix ensenyat; tots aprenem practicant.',
  'El fracàs és una parada, no el destí.',
  'Que encara no en sàpiga no vol dir que no en pugui aprendre.',
  'No cal ser perfecte per sentir-te orgullós de tu.',
  'Compara\'t amb qui eres ahir, no amb els altres.',
  'Pensa per tu mateix: la teva vida no és un vídeo de xarxes socials.',
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
