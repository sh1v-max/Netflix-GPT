import React, { useMemo, useEffect, useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import ConsoleHeader from './ConsoleHeader'
import PresetChips from './PresetChips'
import FilterPanelHud from './FilterPanelHud'
import MovieGridHud from './MovieGridHud'
import useMovieConsole from '../../hooks/useMovieConsole'
import useMultiSearch from '../../hooks/useMultiSearch'
import useGenres from '../../hooks/useGenres'
import useMarqueeBackdrops from '../../hooks/useMarqueeBackdrops'

// Fisher-Yates — used once (useMemo) to randomize the marquee's order so
// it doesn't always play back in the same sequence on every visit.
const shuffle = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const PRESET_LABELS = {
  null: 'All Titles',
  trending: 'Trending',
  now_playing: 'Now Playing',
  popular: 'Popular',
  top_rated: 'Top Rated',
  upcoming: 'Upcoming',
}

const defaultFilters = {
  preset: null,
  withGenres: [],
  baseGenres: [],
  originLanguage: null,
  minYear: null,
  maxYear: null,
  minRating: null,
  sortBy: 'popularity.desc',
}

// Rebuilt as a dense, filterable "data console" instead of a streaming-style
// hero + horizontal shelves — see re-do.md for the full rationale. Movies
// only this round; /shows keeps its existing MainContainer/VideoBackground
// hero untouched.
const Movies = () => {
  const [filters, setFilters] = useState(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const sentinelRef = useRef(null)

  const isSearching = searchQuery.trim().length > 0

  const { results, isLoading, error, loadMore, hasMore, retry, totalResults } =
    useMovieConsole('movie', filters)
  const {
    results: multiSearchResults,
    isLoading: isSearchLoading,
    error: searchError,
  } = useMultiSearch(searchQuery)
  // The index is movie-only — useMultiSearch also returns TV, so narrow it.
  const searchResults = (multiSearchResults || []).filter((r) => r.media_type === 'movie')

  const allGenres = useGenres('movie')
  const genreMap = Object.fromEntries((allGenres || []).map((g) => [g.id, g.name]))

  // Marquee is deliberately a separate, larger data source from `results`
  // — using the same list the grid renders would just replay the first
  // row as ambient background, which read as a bug, not a design choice.
  const rawMarqueeBackdrops = useMarqueeBackdrops()
  const marqueeBackdrops = useMemo(() => shuffle(rawMarqueeBackdrops), [rawMarqueeBackdrops])

  const avgRating = results.length
    ? (results.reduce((sum, item) => sum + (item.vote_average || 0), 0) / results.length).toFixed(1)
    : null

  const selectPreset = (preset) => {
    setFilters((prev) => ({ ...prev, preset }))
  }

  // Touching any filter control drops the active preset — a preset is a
  // fixed TMDB list endpoint that ignores filters entirely, so the moment
  // the user wants to filter, this silently converts to a /discover query
  // (pre-filled with whatever filters were already set).
  const handleFiltersChange = (partial) => {
    setFilters((prev) => ({ ...prev, ...partial, preset: null }))
  }

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { rootMargin: '150px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, isLoading, loadMore])

  const activeFilterCount =
    (filters.withGenres?.length || 0) +
    (filters.minYear ? 1 : 0) +
    (filters.maxYear ? 1 : 0) +
    (filters.minRating ? 1 : 0)

  return (
    <div className="theme-dark-scope min-h-screen bg-ink text-text-dark flex flex-col">
      <Header />
      <main className="flex-1">
        <ConsoleHeader
          marqueeBackdrops={marqueeBackdrops}
          totalResults={isSearching ? searchResults.length : totalResults}
          activePresetLabel={isSearching ? 'Search' : PRESET_LABELS[filters.preset]}
          genreCount={allGenres?.length}
          avgRating={isSearching ? null : avgRating}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {isSearching ? (
          <div className="px-4 md:px-8 pb-12 pt-2">
            <MovieGridHud
              results={searchResults}
              isLoading={isSearchLoading}
              error={searchError}
              hasMore={false}
              sentinelRef={sentinelRef}
              genreMap={genreMap}
            />
          </div>
        ) : (
          <>
            <PresetChips activePreset={filters.preset} onSelect={selectPreset} />

            <div className="px-4 md:px-8 pb-12">
              <div className="flex items-center justify-between gap-4 mb-4 lg:hidden">
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-xs uppercase tracking-wide cursor-pointer transition-colors ${
                    showFilters || activeFilterCount > 0
                      ? 'border-hud-cyan text-hud-cyan'
                      : 'border-border-hairline text-text-dark-muted hover:border-hud-line'
                  }`}
                >
                  <SlidersHorizontal size={13} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-hud-cyan text-black text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="mb-6 lg:hidden">
                  <FilterPanelHud filters={filters} onFiltersChange={handleFiltersChange} />
                </div>
              )}

              <div className="flex gap-6">
                <div className="flex-1 min-w-0">
                  <MovieGridHud
                    results={results}
                    isLoading={isLoading}
                    error={error}
                    hasMore={hasMore}
                    sentinelRef={sentinelRef}
                    genreMap={genreMap}
                    onRetry={retry}
                  />
                </div>

                <aside className="hidden lg:block w-64 shrink-0">
                  <div className="sticky top-24">
                    <FilterPanelHud filters={filters} onFiltersChange={handleFiltersChange} />
                  </div>
                </aside>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Movies
