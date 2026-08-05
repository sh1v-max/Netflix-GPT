import React from 'react'
import { motion } from 'motion/react'
import { Database, Search, Activity } from 'lucide-react'
import { IMG_CDN_URL } from '../../utils/constant'
import HudFrame from './HudFrame'
import { EASE } from '@/lib/motion'

const formatCount = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—')

// Replaces the old full-bleed autoplay-trailer hero — a poster-collage
// backdrop (same technique as Discover's header band, not a video) framed
// as a HUD instrument panel, with a live stat readout and a movie-scoped
// search box.
const ConsoleHeader = ({
  posterPaths = [],
  totalResults,
  activePresetLabel,
  genreCount,
  avgRating,
  searchQuery,
  onSearchChange,
}) => (
  <div className="hud-grid-texture relative w-full pt-20 md:pt-28 pb-6 px-4 md:px-8 overflow-hidden">
    {posterPaths.length > 0 && (
      <div className="absolute inset-0 grid grid-cols-8 md:grid-cols-12 gap-1.5 opacity-[0.12]">
        {posterPaths.map((path, i) => (
          <img
            key={i}
            src={IMG_CDN_URL + path}
            alt=""
            aria-hidden="true"
            className="w-full aspect-2/3 object-cover grayscale"
            style={{ marginTop: `${(i % 4) * 14}px` }}
          />
        ))}
      </div>
    )}
    <div className="absolute inset-0 bg-linear-to-b from-ink/40 via-ink/85 to-ink" />

    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="relative"
    >
      <HudFrame className="max-w-3xl px-5 py-4 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 text-hud-cyan">
            <Database size={14} />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em]">
              Cinegraph // Movie Index
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-hud-cyan-strong">
            <Activity size={12} className="animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wide">Live</span>
          </div>
        </div>

        <h1 className="font-display text-2xl md:text-4xl font-semibold text-text-dark mb-3">
          Movies
        </h1>

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
