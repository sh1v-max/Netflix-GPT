import { animate } from 'motion/react'
import { EASE } from '@/lib/motion'

// Uses Framer Motion's imperative `animate()` (same animation engine as
// every other motion in the app) to tween `scrollLeft` directly — NOT the
// native `element.scrollBy({behavior:'smooth'})`, which most browsers
// silently collapse into an instant jump when the OS has "reduce motion"
// enabled. That's a real accessibility feature, but it meant every
// prev/next button in the app had zero animation for anyone with that
// setting on, with no visible sign why. Cancels any in-flight scroll on
// the same container first so rapid clicks don't fight each other.
export const smoothScrollBy = (container, delta, duration = 0.45) => {
  if (!container) return

  container.__scrollAnimation?.stop()

  const from = container.scrollLeft
  const to = from + delta

  container.__scrollAnimation = animate(from, to, {
    duration,
    ease: EASE,
    onUpdate: (value) => {
      container.scrollLeft = value
    },
  })
}
