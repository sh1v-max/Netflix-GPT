import React from 'react'
import useGenres from '../../hooks/useGenres'

const RATING_MAX = 9

// Pure filter controls — no positioning/chrome of its own, so it can be
// dropped into a permanent sidebar (desktop) or a dropdown (mobile)
// without duplicating the genre/year/rating/sort logic in two places.
const FilterPanel = ({ mediaType, filters, onFiltersChange, excludeGenreIds = [] }) => {
  const allGenres = useGenres(mediaType)
  const genres = allGenres?.filter((genre) => !excludeGenreIds.includes(genre.id))
  const dateField = mediaType === 'tv' ? 'first_air_date' : 'primary_release_date'
  const sortOptions = [
    { value: 'popularity.desc', label: 'Popularity' },
    { value: 'vote_average.desc', label: 'Rating' },
    { value: `${dateField}.desc`, label: 'Newest' },
    { value: `${dateField}.asc`, label: 'Oldest' },
  ]

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

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-[11px] text-text-dark-muted mb-1.5 uppercase tracking-wide">
          Sort by
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFiltersChange({ sortBy: e.target.value })}
          className="w-full p-2.5 bg-ink border border-white/10 text-text-dark text-sm rounded-[--radius-card] focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-px bg-white/5" />

      {genres?.length > 0 && (
        <div>
          <p className="text-[11px] text-text-dark-muted mb-2 uppercase tracking-wide">
            Genres
          </p>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => {
              const isSelected = filters.withGenres?.includes(genre.id)
              return (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-accent text-on-accent border-accent'
                      : 'bg-transparent text-text-dark-muted border-white/10 hover:border-white/30'
                  }`}
                >
                  {genre.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="h-px bg-white/5" />

      <div className="flex items-end gap-3">
        <div>
          <label className="block text-[11px] text-text-dark-muted mb-1 uppercase tracking-wide">
            From year
          </label>
          <input
            type="number"
            placeholder="1990"
            value={filters.minYear || ''}
            onChange={(e) =>
              onFiltersChange({ minYear: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full p-2 bg-ink border border-white/10 text-text-dark text-sm rounded-[--radius-card] focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-[11px] text-text-dark-muted mb-1 uppercase tracking-wide">
            To year
          </label>
          <input
            type="number"
            placeholder="2026"
            value={filters.maxYear || ''}
            onChange={(e) =>
              onFiltersChange({ maxYear: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full p-2 bg-ink border border-white/10 text-text-dark text-sm rounded-[--radius-card] focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-text-dark-muted mb-2 uppercase tracking-wide">
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
            background: `linear-gradient(to right, var(--color-accent) ${ratingPercent}%, var(--color-ink) ${ratingPercent}%)`,
          }}
        />
      </div>

      {activeCount > 0 && (
        <button
          onClick={clearFilters}
          className="self-start text-xs text-accent hover:underline cursor-pointer"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}

export default FilterPanel
