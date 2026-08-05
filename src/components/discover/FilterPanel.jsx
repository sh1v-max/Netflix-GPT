import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { EASE } from '@/lib/motion'
import useGenres from '../../hooks/useGenres'

const RATING_MAX = 9

// Pure filter controls — no positioning/chrome of its own, so it can be
// dropped into a permanent sidebar (desktop) or a dropdown (mobile)
// without duplicating the genre/year/rating/sort logic in two places.
// `variant="hud"` swaps the accent2 (indigo) classes for hud-cyan ones, for
// the Movies HUD page — default variant is pixel-identical to before.
const FilterPanel = ({ mediaType, filters, onFiltersChange, excludeGenreIds = [], variant = 'default' }) => {
  const isHud = variant === 'hud'
  const allGenres = useGenres(mediaType)
  const genres = allGenres?.filter((genre) => !excludeGenreIds.includes(genre.id))
  const dateField = mediaType === 'tv' ? 'first_air_date' : 'primary_release_date'
  const sortOptions = [
    { value: 'popularity.desc', label: 'Popularity' },
    { value: 'vote_average.desc', label: 'Rating' },
    { value: `${dateField}.desc`, label: 'Newest' },
    { value: `${dateField}.asc`, label: 'Oldest' },
  ]

  // Year range + min rating are secondary refinements — collapsed by
  // default so the panel doesn't front-load every control at once.
  const [showAdvanced, setShowAdvanced] = useState(
    () => Boolean(filters.minYear || filters.maxYear || filters.minRating)
  )

  const activeCount =
    (filters.withGenres?.length || 0) +
    (filters.minYear ? 1 : 0) +
    (filters.maxYear ? 1 : 0) +
    (filters.minRating ? 1 : 0)

  const toggleGenre = (genreId) => {
    const current = filters.withGenres || []
    const next = current.includes(genreId)
      ? current.filter((id) => id !== genreId)
      : [...current, genreId]
    onFiltersChange({ withGenres: next })
  }

  const clearFilters = () => {
    onFiltersChange({ withGenres: [], minYear: null, maxYear: null, minRating: null })
  }

  const ratingValue = filters.minRating || 0
  const ratingPercent = (ratingValue / RATING_MAX) * 100

  const accentText = isHud ? 'text-hud-cyan' : 'text-accent2'
  const accentRing = isHud ? 'focus:ring-hud-cyan' : 'focus:ring-accent2'
  const rangeFillVar = isHud ? '--color-hud-cyan' : '--color-accent2'

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-cg-label text-text-dark-muted mb-1.5 uppercase tracking-wide">
          Sort by
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFiltersChange({ sortBy: e.target.value })}
          className={`w-full p-2.5 bg-ink border border-border-hairline text-text-dark text-sm rounded-lg focus:outline-none focus:ring-2 ${accentRing} cursor-pointer`}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-px bg-border-hairline" />

      {genres?.length > 0 && (
        <div>
          <p className="text-cg-label text-text-dark-muted mb-2 uppercase tracking-wide">
            Genres
          </p>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => {
              const isSelected = filters.withGenres?.includes(genre.id)
              return (
                <motion.button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? isHud
                        ? 'bg-hud-cyan text-black border-hud-cyan shadow-[0_0_16px_var(--color-hud-cyan-glow)]'
                        : 'bg-accent2 text-white border-accent2 shadow-[0_0_16px_var(--color-accent2-glow)]'
                      : 'bg-transparent text-text-dark-muted border-border-hairline hover:border-white/30 hover:text-text-dark'
                  }`}
                >
                  {genre.name}
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      <div className="h-px bg-border-hairline" />

      <div>
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center justify-between w-full text-xs text-text-dark-muted hover:text-text-dark cursor-pointer transition-colors"
          aria-expanded={showAdvanced}
        >
          <span className="uppercase tracking-wide text-cg-label">More filters</span>
          <motion.span
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <ChevronDown size={14} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="flex items-end gap-3 pt-4">
                <div>
                  <label className="block text-cg-label text-text-dark-muted mb-1 uppercase tracking-wide">
                    From year
                  </label>
                  <input
                    type="number"
                    placeholder="1990"
                    value={filters.minYear || ''}
                    onChange={(e) =>
                      onFiltersChange({ minYear: e.target.value ? Number(e.target.value) : null })
                    }
                    className={`w-full p-2 bg-ink border border-border-hairline text-text-dark text-sm rounded-lg focus:outline-none focus:ring-2 ${accentRing}`}
                  />
                </div>
                <div>
                  <label className="block text-cg-label text-text-dark-muted mb-1 uppercase tracking-wide">
                    To year
                  </label>
                  <input
                    type="number"
                    placeholder="2026"
                    value={filters.maxYear || ''}
                    onChange={(e) =>
                      onFiltersChange({ maxYear: e.target.value ? Number(e.target.value) : null })
                    }
                    className={`w-full p-2 bg-ink border border-border-hairline text-text-dark text-sm rounded-lg focus:outline-none focus:ring-2 ${accentRing}`}
                  />
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-cg-label text-text-dark-muted mb-2 uppercase tracking-wide">
                  Min rating {ratingValue > 0 ? `— ★ ${ratingValue}+` : '— any'}
                </label>
                <input
                  type="range"
                  min="0"
                  max={RATING_MAX}
                  step="1"
                  value={ratingValue}
                  onChange={(e) => onFiltersChange({ minRating: Number(e.target.value) || null })}
                  className="styled-range w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(${rangeFillVar}) ${ratingPercent}%, var(--color-ink) ${ratingPercent}%)`,
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {activeCount > 0 && (
        <button
          onClick={clearFilters}
          className={`self-start text-xs ${accentText} hover:underline cursor-pointer`}
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}

export default FilterPanel
