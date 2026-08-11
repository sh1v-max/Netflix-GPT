// The one easing curve used everywhere in Cinegraph (see DESIGN-SYSTEM.md
// motion language) — mirrors --ease-cg-standard in index.css.
export const EASE = [0.16, 1, 0.3, 1]

// Slow ambient float for background glow orbs — gives them a sense of
// drifting in space instead of sitting static. Shared across every page
// that uses the floating-orb background treatment (Login, AI search home).
export const floatOrb = {
  animate: {
    y: [0, -22, 0],
    x: [0, 14, 0],
    transition: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
  },
}
