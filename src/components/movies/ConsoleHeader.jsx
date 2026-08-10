import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Search, Activity, ChevronRight } from 'lucide-react'
import { BACKDROP_CDN_URL } from '../../utils/constant'
import HudFrame from './HudFrame'
import { EASE } from '@/lib/motion'

const formatCount = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—')

const VISIBLE_COUNT = 6

// Continuous right-to-left backdrop carousel — always exactly VISIBLE_COUNT
// tiles fill the header width (each sized to 1/VISIBLE_COUNT of the
// container via percentage, not a fixed px value, so it stays exactly 6
// wide at any viewport size), and the whole strip glides left forever.
//
// Driven by a plain CSS `@keyframes` animation (`.marquee-track` in
// index.css) — deliberately, on purpose, NOT wrapped in this app's usual
// `prefers-reduced-motion` guard. Two earlier attempts both silently never
// moved for the same user: a CSS version gated behind that exact media
// query, and a Framer Motion `animate()` version (Framer's app-root
// `MotionConfig reducedMotion="user"` disables its transform animations
// under the same OS setting). Both point to the same cause — this one
// bypasses it entirely by not touching either mechanism. It's a slow,
// linear, single-direction pan (not flashing/zooming/parallax), a
// deliberately gentler tradeoff than this app's other motion.
//
// Math: the track holds the backdrop list twice back-to-back (`doubled`).
// Each tile is sized to `100 / doubled.length`% of the TRACK's own width,
// and the track itself is sized to `(doubled.length / VISIBLE_COUNT) * 100`%
// of the container — those percentages cancel out to exactly
// `container-width / VISIBLE_COUNT` per tile, regardless of container size.
// The CSS animation moves the track from 0% to -50%, i.e. exactly one full
// backdrop list's width, so the loop point is seamless (the second half is
// identical to the first).
const BackdropCarousel = ({ backdropPaths }) => {
  if (!backdropPaths.length) return null

  // Pad up to VISIBLE_COUNT by repeating if there aren't enough backdrops
  // yet (e.g. still loading), so there's always a full width of content —
  // never fewer than 6 tiles on screen.
  const base =
    backdropPaths.length >= VISIBLE_COUNT
      ? backdropPaths
      : Array.from({ length: VISIBLE_COUNT }, (_, i) => backdropPaths[i % backdropPaths.length])
  const doubled = [...base, ...base]

  return (
    <div className="absolute inset-0 -z-30 overflow-hidden">
      <div
        className="marquee-track flex h-full"
        style={{ width: `${(doubled.length / VISIBLE_COUNT) * 100}%` }}
      >
        {doubled.map((path, i) => (
          <img
            key={`${path}-${i}`}
            src={BACKDROP_CDN_URL + path}
            alt=""
            aria-hidden="true"
            style={{ width: `${100 / doubled.length}%` }}
            className="h-full object-cover shrink-0"
          />
        ))}
      </div>
    </div>
  )
}

// Replaces the old full-bleed autoplay-trailer hero. The headline itself
// carries a single backdrop image (background-clip: text) instead of it
// sitting behind the panel — the huge "MOVIES" wordmark is the hero now.
// A cyan text-stroke keeps every letter legible regardless of how bright
// or dark the underlying image is (a checkerboard multi-poster mosaic was
// tried first and looked broken/glitchy — one coherent photo reads far
// cleaner through bold letterforms than a jigsaw of mismatched posters).
const ConsoleHeader = ({
  title,
  marqueeBackdrops = [],
  totalResults,
  activePresetLabel,
  genreCount,
  avgRating,
  searchQuery,
  onSearchChange,
}) => (
  <div className="isolate relative w-full pt-16 md:pt-24 pb-8 px-4 md:px-8 overflow-hidden">
    <BackdropCarousel backdropPaths={marqueeBackdrops} />
    {/* Vignette — darkens all four edges, bright in the middle. Two
        independent linear gradients (left/right, top/bottom) instead of
        a single radial ellipse: this header is much wider than it is
        tall, and an ellipse sized as a % of the box's own dimensions
        barely reached the left/right edges in a box that wide — these
        two gradients darken each pair of edges by a fixed % of their
        own axis, so it's correct regardless of the box's aspect ratio. */}
    <div
      className="absolute inset-0 -z-20"
      style={{
        background:
          'linear-gradient(to right, var(--color-ink) 0%, transparent 26%, transparent 74%, var(--color-ink) 100%), linear-gradient(to bottom, color-mix(in srgb, var(--color-ink) 65%, transparent) 0%, transparent 25%, transparent 50%, var(--color-ink) 100%)',
      }}
    />

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative mb-6"
    >
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 mb-1 font-mono text-[11px] uppercase tracking-[0.15em]"
      >
        <Link to="/home" className="text-hud-cyan hover:text-hud-cyan-strong transition-colors">
          Cinegraph
        </Link>
        <ChevronRight size={12} className="shrink-0 text-hud-cyan" />
        <span className="text-hud-cyan-strong">{title}</span>
      </nav>

      <h1
        className="font-display font-bold uppercase leading-[0.8] -ml-1 select-none text-white"
        style={{
          fontSize: 'clamp(5rem, 22vw, 15rem)',
          letterSpacing: '-0.02em',
          mixBlendMode: 'difference',
        }}
      >
        {title}
      </h1>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
      className="relative"
    >
      <HudFrame className="max-w-3xl px-5 py-4 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-[11px] text-text-dark-muted uppercase tracking-wide">
            Full catalog search &amp; filters
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-hud-cyan-strong">
            <Activity size={12} className="animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wide">Live</span>
          </div>
        </div>

        <div className="relative mb-4">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hud-cyan"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Query the index..."
            className="w-full pl-10 pr-4 py-2.5 bg-ink border border-hud-line font-mono text-sm text-text-dark placeholder-text-dark-muted focus:outline-none focus:ring-2 focus:ring-hud-cyan transition-shadow"
          />
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-text-dark-muted uppercase tracking-wide">
          <span>
            Results: <span className="text-hud-cyan-strong">{formatCount(totalResults)}</span>
          </span>
          <span>
            Mode: <span className="text-hud-cyan-strong">{activePresetLabel}</span>
          </span>
          {genreCount != null && (
            <span>
              Genres tracked: <span className="text-hud-cyan-strong">{genreCount}</span>
            </span>
          )}
          {avgRating != null && (
            <span>
              Avg rating: <span className="text-hud-cyan-strong">★ {avgRating}</span>
            </span>
          )}
        </div>
      </HudFrame>
    </motion.div>
  </div>
)

export default ConsoleHeader
