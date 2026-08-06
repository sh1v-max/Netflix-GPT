import React from 'react'
import { motion } from 'motion/react'
import { Database, Search, Activity } from 'lucide-react'
import { BACKDROP_CDN_URL } from '../../utils/constant'
import HudFrame from './HudFrame'
import { EASE } from '@/lib/motion'

const formatCount = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—')

// Continuous right-to-left backdrop ticker, behind the grid texture and
// everything else — the list is rendered twice back-to-back in one flex
// row (`.marquee-track`, index.css), and CSS animates the whole row by
// exactly -50%, which loops seamlessly since the second half mirrors the
// first. No React state/interval needed — it's a pure CSS loop, and
// `.marquee-track`'s own reduced-motion guard makes it static otherwise.
// Uses backdrops (widescreen scene stills), not posters — posters are
// designed as title cards and almost always have the movie's name baked
// into the artwork, which reads as clutter/duplication behind "MOVIES".
const BackdropMarquee = ({ backdropPaths }) => {
  if (!backdropPaths.length) return null
  const doubled = [...backdropPaths, ...backdropPaths]

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="marquee-track h-full">
        {doubled.map((path, i) => (
          <img
            key={`${path}-${i}`}
            src={BACKDROP_CDN_URL + path}
            alt=""
            aria-hidden="true"
            className="h-full aspect-video object-cover shrink-0 mr-2"
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
  backdropPath,
  marqueeBackdrops = [],
  totalResults,
  activePresetLabel,
  genreCount,
  avgRating,
  searchQuery,
  onSearchChange,
}) => (
  <div className="isolate relative w-full pt-16 md:pt-24 pb-8 px-4 md:px-8 overflow-hidden">
    <BackdropMarquee backdropPaths={marqueeBackdrops} />
    <div className="hud-grid-texture absolute inset-0 -z-20" />
    <div className="absolute inset-0 -z-20 bg-linear-to-b from-ink/55 via-ink/70 to-ink" />

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative mb-6"
    >
      <div className="flex items-center gap-2 mb-1 text-hud-cyan">
        <Database size={14} />
        <span className="font-mono text-[11px] uppercase tracking-[0.15em]">
          Cinegraph // Movie Index
        </span>
      </div>

      <h1
        className="font-display font-bold uppercase leading-[0.8] -ml-1 bg-clip-text bg-cover bg-center select-none"
        style={{
          fontSize: 'clamp(5rem, 22vw, 15rem)',
          letterSpacing: '-0.02em',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          WebkitTextStroke: '2px var(--color-hud-cyan)',
          backgroundColor: 'var(--color-hud-cyan)',
          backgroundImage: backdropPath
            ? `linear-gradient(160deg, rgba(0,0,0,0.1), rgba(0,0,0,0.65)), url(${BACKDROP_CDN_URL + backdropPath})`
            : undefined,
        }}
      >
        Movies
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
