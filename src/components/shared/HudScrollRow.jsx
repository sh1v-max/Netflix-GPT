import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Space-theme scroll-row shell — title + horizontal card strip + prev/next
// arrows styled to match the rest of the app (hud-cyan, hairline border,
// real backdrop blur) instead of the plain glass/gray buttons MovieList
// used. Card rendering is left to the caller (children) since different
// rows need different card types (MovieCardHud, etc).
const HudScrollRow = ({ title, subtitle, children }) => {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    const container = scrollRef.current
    if (!container) return
    const scrollAmount = 850
    const maxScroll = container.scrollWidth - container.clientWidth
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      if (container.scrollLeft <= 0) container.scrollLeft = maxScroll
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
        container.scrollLeft = 0
      }
    }
  }

  return (
    <div className="relative px-6 mb-6 md:mb-12">
      <h1 className="font-display text-sm md:text-3xl pt-1 md:pt-4 text-text-dark font-semibold">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xs md:text-sm text-text-dark-muted mb-1 md:mb-2 max-w-2xl">{subtitle}</p>
      )}

      <button
        className="hidden md:flex items-center justify-center absolute left-0 top-[59%] -translate-y-1/2 bg-ink-elevated/80 hover:bg-ink-elevated text-hud-cyan hover:text-hud-cyan-strong p-3 rounded-full z-50 transition-colors duration-300 backdrop-blur-xl border border-hud-line shadow-cg-elevated cursor-pointer"
        onClick={() => scroll('left')}
        aria-label={`Scroll ${title} left`}
      >
        <ChevronLeft size={18} />
      </button>

      <div ref={scrollRef} className="flex overflow-x-scroll no-scrollbar scroll-smooth pt-2">
        <div className="flex gap-2 md:gap-4">{children}</div>
      </div>

      <button
        className="hidden md:flex items-center justify-center absolute right-0 top-[55%] -translate-y-1/2 bg-ink-elevated/80 hover:bg-ink-elevated text-hud-cyan hover:text-hud-cyan-strong p-3 rounded-full z-50 transition-colors duration-300 backdrop-blur-xl border border-hud-line shadow-cg-elevated cursor-pointer"
        onClick={() => scroll('right')}
        aria-label={`Scroll ${title} right`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export default HudScrollRow
