import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { smoothScrollBy } from '../../utils/smoothScrollBy'

// Space-theme scroll-row shell — title + horizontal card strip + prev/next
// arrows styled to match the rest of the app (hud-cyan, hairline border,
// real backdrop blur) instead of the plain glass/gray buttons MovieList
// used. Card rendering is left to the caller (children) since different
// rows need different card types (MovieCardHud, etc). `title` is optional
// — omit it when the caller already renders its own heading above (e.g.
// Profile's watchlist preview uses SectionEyebrow) and still wants the
// scroll buttons; `ariaLabel` then substitutes for the button labels that
// would otherwise read off `title`.
const HudScrollRow = ({ title, subtitle, ariaLabel, children }) => {
  const scrollRef = useRef(null)

  // Scrolls by ~85% of the visible width (not a fixed pixel guess — that
  // over/under-shot depending on screen size), animated via
  // smoothScrollBy rather than the native scrollBy({behavior:'smooth'})
  // — see that file for why (OS reduced-motion collapses native smooth
  // scroll to an instant jump with no visible animation at all).
  const scroll = (direction) => {
    const container = scrollRef.current
    if (!container) return
    const amount = container.clientWidth * 0.85
    smoothScrollBy(container, direction === 'left' ? -amount : amount)
  }

  const label = ariaLabel || title || 'row'

  return (
    <div className="relative px-6 mb-6 md:mb-12">
      {title && (
        <h1 className="font-display text-sm md:text-3xl pt-1 md:pt-4 text-text-dark font-semibold">
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="text-xs md:text-sm text-text-dark-muted mb-1 md:mb-2 max-w-2xl">{subtitle}</p>
      )}

      <button
        className="hidden md:flex items-center justify-center absolute left-0 top-[59%] -translate-y-1/2 bg-ink-elevated/80 hover:bg-ink-elevated text-hud-cyan hover:text-hud-cyan-strong p-3 rounded-full z-50 transition-colors duration-300 backdrop-blur-xl border border-hud-line shadow-cg-elevated cursor-pointer"
        onClick={() => scroll('left')}
        aria-label={`Scroll ${label} left`}
      >
        <ChevronLeft size={18} />
      </button>

      <div ref={scrollRef} className="flex overflow-x-scroll no-scrollbar pt-2">
        <div className="flex gap-2 md:gap-4">{children}</div>
      </div>

      <button
        className="hidden md:flex items-center justify-center absolute right-0 top-[55%] -translate-y-1/2 bg-ink-elevated/80 hover:bg-ink-elevated text-hud-cyan hover:text-hud-cyan-strong p-3 rounded-full z-50 transition-colors duration-300 backdrop-blur-xl border border-hud-line shadow-cg-elevated cursor-pointer"
        onClick={() => scroll('right')}
        aria-label={`Scroll ${label} right`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export default HudScrollRow
