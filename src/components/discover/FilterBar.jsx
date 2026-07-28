import React from 'react'
import useGenres from '../../hooks/useGenres'

const MEDIA_TYPES = [
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
]

const FilterBar = ({ mediaType, onMediaTypeChange, filters, onFiltersChange }) => {
  const genres = useGenres(mediaType)
  const dateField = mediaType === 'tv' ? 'first_air_date' : 'primary_release_date'
  const sortOptions = [
    { value: 'popularity.desc', label: 'Popularity' },
    { value: 'vote_average.desc', label: 'Rating' },
    { value: `${dateField}.desc`, label: 'Newest' },
    { value: `${dateField}.asc`, label: 'Oldest' },
  ]

  const toggleGenre = (genreId) => {
    const current = filters.withGenres || []
    const next = current.includes(genreId)
      ? current.filter((id) => id !== genreId)
      : [...current, genreId]
    onFiltersChange({ withGenres: next })
  }

  return (
    <div className="px-4 md:px-8 py-6 flex flex-col gap-4">
      {/* Media type toggle */}
      <div className="inline-flex bg-ink-elevated rounded-[--radius-card] p-1 w-fit">
        {MEDIA_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onMediaTypeChange(type.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-[--radius-card] transition-colors cursor-pointer ${
              mediaType === type.value
                ? 'bg-accent text-on-accent'
                : 'text-text-dark-muted hover:text-text-dark'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Genre chips */}
      {genres?.length > 0 && (
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
      )}

      {/* Year range + rating + sort */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-text-dark-muted mb-1">From year</label>
          <input
            type="number"
            placeholder="1990"
            value={filters.minYear || ''}
            onChange={(e) =>
              onFiltersChange({ minYear: e.target.value ? Number(e.target.value) : null })
            }
            className="w-24 p-2 bg-ink-elevated border border-white/10 text-text-dark text-sm rounded-[--radius-card] focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-text-dark-muted mb-1">To year</label>
          <input
            type="number"
            placeholder="2026"
            value={filters.maxYear || ''}
            onChange={(e) =>
              onFiltersChange({ maxYear: e.target.value ? Number(e.target.value) : null })
            }
            className="w-24 p-2 bg-ink-elevated border border-white/10 text-text-dark text-sm rounded-[--radius-card] focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex-1 min-w-40 max-w-xs">
          <label className="block text-xs text-text-dark-muted mb-1">
            Min rating {filters.minRating ? `— ${filters.minRating}+` : ''}
          </label>
          <input
            type="range"
            min="0"
            max="9"
            step="1"
            value={filters.minRating || 0}
            onChange={(e) => onFiltersChange({ minRating: Number(e.target.value) || null })}
            className="w-full accent-accent cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs text-text-dark-muted mb-1">Sort by</label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ sortBy: e.target.value })}
            className="p-2 bg-ink-elevated border border-white/10 text-text-dark text-sm rounded-[--radius-card] focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
