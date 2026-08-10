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

// A fixed-list preset has no direct /discover equivalent, but most of them
// have an obvious *sort order* equivalent — when a filter touch converts
// "Top Rated" into a /discover query, the query should still be sorted by
// rating, not silently fall back to whatever sortBy happened to be sitting
// in state (popularity.desc, the default). "Trending" has no equivalent at
// all (no discover sort approximates a trending algorithm), so it's simply
// omitted — that preset just drops to the default sort like before.
//
// `minVoteCount` matters specifically for `vote_average.desc`: sorting by
// raw rating alone surfaces obscure titles with a single 10/10 vote ahead
// of anything genuinely well-regarded (TMDB's own /top_rated endpoints
// apply a similar weighting internally, which a plain vote_average sort
// doesn't reproduce) — it's not user-facing in FilterPanel, purely an
// internal floor applied only while approximating a rating-sorted preset.
const PRESET_SORT_FALLBACK = {
  movie: {
    popular: { sortBy: 'popularity.desc' },
    top_rated: { sortBy: 'vote_average.desc', minVoteCount: 200 },
    now_playing: { sortBy: 'primary_release_date.desc' },
    upcoming: { sortBy: 'primary_release_date.desc' },
  },
  tv: {
    popular: { sortBy: 'popularity.desc' },
    top_rated: { sortBy: 'vote_average.desc', minVoteCount: 100 },
    on_the_air: { sortBy: 'first_air_date.desc' },
    airing_today: { sortBy: 'first_air_date.desc' },
  },
}

// Small bracket-corner tab pair for pages that span both media types
// (Anime) — visually distinct from PresetChips (query-mode switches) since
// this instead changes *what catalog* is being queried entirely.
const MediaTypeTabs = ({ mediaTypes, mediaType, onSelect }) => (
  <div className="flex gap-2 px-4 md:px-8 pb-3">
    {mediaTypes.map((type) => {
      const isActive = mediaType === type.value
      return (
        <button
          key={type.value}
          onClick={() => onSelect(type.value)}
          className={`relative font-mono text-[11px] uppercase tracking-wide px-3.5 py-1.5 cursor-pointer transition-colors duration-200 ${
            isActive
              ? 'hud-panel text-hud-cyan border-hud-cyan'
              : 'bg-transparent text-text-dark-muted border border-border-hairline hover:border-hud-line hover:text-text-dark'
          }`}
        >
          {isActive && (
            <>
              <span className="hud-corner hud-corner--tl" aria-hidden="true" />
              <span className="hud-corner hud-corner--tr" aria-hidden="true" />
              <span className="hud-corner hud-corner--bl" aria-hidden="true" />
              <span className="hud-corner hud-corner--br" aria-hidden="true" />
            </>
          )}
          {type.label}
        </button>
      )
    })}
  </div>
)

// The "Sci-Fi HUD / Data Console" catalog page, shared by Movies.jsx,
// Shows.jsx, and Anime.jsx — a dense, filterable data console instead of a
// streaming-style hero + horizontal shelves. See re-do.md Phase 2.8 for the
// full rationale, 2.9 for the movie-only → also-TV generalization, and 2.10
// for the baseGenres/originLanguage/mediaTypes additions Anime needed.
//
// `presets` (fixed TMDB list shortcuts) intentionally has no /discover
// equivalent for a constrained catalog — TMDB's fixed lists don't accept
// genre/language params — so a page with `baseGenres`/`originLanguage` set
// should simply pass `presets={[]}`, which hides the whole chip row rather
// than offering presets that would silently ignore the constraint.
const MediaConsole = ({
  mediaType: initialMediaType,
  mediaTypes,
  title,
  presets = [],
  baseGenres = [],
  originLanguage = null,
  excludeGenreIds = [],
}) => {
  const [mediaType, setMediaType] = useState(initialMediaType || mediaTypes?.[0]?.value)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const sentinelRef = useRef(null)

  const defaultFilters = useMemo(
    () => ({
      preset: null,
      withGenres: [],
      baseGenres,
      originLanguage,
      minYear: null,
      maxYear: null,
      minRating: null,
      minVoteCount: null,
      sortBy: 'popularity.desc',
    }),
    [baseGenres, originLanguage]
  )
  const [filters, setFilters] = useState(defaultFilters)
  // Separate from filters.preset (which drives the actual query — it must
  // become null the moment a filter is touched, since a fixed TMDB list
  // endpoint can't be filtered further). This one only reflects what the
  // user last clicked, so the chip stays highlighted and the header still
  // reads "TOP RATED" (etc.) after adding a genre filter on top of it,
  // instead of misleadingly flipping to "All Titles" — even though under
  // the hood the query has switched to a /discover call by that point.
  const [displayPreset, setDisplayPreset] = useState(null)

  const presetLabels = useMemo(
    () => ({ null: 'All Titles', ...Object.fromEntries(presets.map((p) => [p.value, p.label])) }),
    [presets]
  )

  const isSearching = searchQuery.trim().length > 0

  const { results, isLoading, error, loadMore, hasMore, retry, totalResults } =
    useMovieConsole(mediaType, filters)
  const {
    results: multiSearchResults,
    isLoading: isSearchLoading,
    error: searchError,
  } = useMultiSearch(searchQuery)
  // useMultiSearch always returns both movie + tv — narrow to this page's type.
  const searchResults = (multiSearchResults || []).filter((r) => r.media_type === mediaType)

  const allGenres = useGenres(mediaType)
  const genreMap = Object.fromEntries((allGenres || []).map((g) => [g.id, g.name]))
  const visibleGenreCount = allGenres
    ? allGenres.filter((g) => !excludeGenreIds.includes(g.id)).length
    : null

  // Marquee is deliberately a separate, larger data source from `results`
  // — using the same list the grid renders would just replay the first
  // row as ambient background, which read as a bug, not a design choice.
  const rawMarqueeBackdrops = useMarqueeBackdrops(mediaType, { baseGenres, originLanguage })
  const marqueeBackdrops = useMemo(() => shuffle(rawMarqueeBackdrops), [rawMarqueeBackdrops])

  const avgRating = results.length
    ? (results.reduce((sum, item) => sum + (item.vote_average || 0), 0) / results.length).toFixed(1)
    : null

  const selectPreset = (preset) => {
    setDisplayPreset(preset)
    setFilters((prev) => ({ ...prev, preset }))
  }

  const selectMediaType = (type) => {
    setMediaType(type)
    setDisplayPreset(null)
    // Genre ids differ between movie/tv, so reset to this page's own
    // constraints rather than carrying over a now-meaningless selection.
    setFilters(defaultFilters)
  }

  // Touching any filter control drops the active preset — a preset is a
  // fixed TMDB list endpoint that ignores filters entirely, so the moment
  // the user wants to filter, this silently converts to a /discover query
  // (pre-filled with whatever filters were already set). If the preset had
  // an obvious sort-order equivalent (e.g. Top Rated → vote_average.desc
  // + a minVoteCount floor), carry that over instead of reverting to the
  // default popularity sort — unless the filter touch itself was a manual
  // sort change, which always wins over the injected fallback.
  //
  // If the result of this change has NO active constraints left (e.g. the
  // user clicked "Clear all filters," or manually deselected the one genre
  // chip they'd picked) and a preset was active before all this started
  // (`displayPreset`), snap back to the *real* preset — re-fetching the
  // actual TMDB list — instead of sitting in a filterless discover query
  // sorted by our injected fallback. Without this, clearing filters while
  // "Top Rated" was active left the query as "all ~1M titles sorted by
  // rating," which is a completely different (and far larger, far
  // lower-quality) result set than the real Top Rated list.
  const handleFiltersChange = (partial) => {
    setFilters((prev) => {
      const merged = { ...prev, ...partial }
      const hasActiveConstraint = Boolean(
        merged.withGenres?.length || merged.minYear || merged.maxYear || merged.minRating
      )
      const isManualSortChange = Object.prototype.hasOwnProperty.call(partial, 'sortBy')

      if (!hasActiveConstraint && !isManualSortChange && displayPreset) {
        return { ...merged, preset: displayPreset, sortBy: defaultFilters.sortBy, minVoteCount: null }
      }

      const fallback = prev.preset && PRESET_SORT_FALLBACK[mediaType]?.[prev.preset]
      return {
        ...merged,
        preset: null,
        sortBy: partial.sortBy || fallback?.sortBy || prev.sortBy,
        minVoteCount: isManualSortChange ? null : fallback?.minVoteCount ?? prev.minVoteCount,
      }
    })
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
          title={title}
          marqueeBackdrops={marqueeBackdrops}
          totalResults={isSearching ? searchResults.length : totalResults}
          activePresetLabel={isSearching ? 'Search' : presetLabels[displayPreset]}
          genreCount={visibleGenreCount}
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
              mediaType={mediaType}
            />
          </div>
        ) : (
          <>
            {mediaTypes && (
              <MediaTypeTabs mediaTypes={mediaTypes} mediaType={mediaType} onSelect={selectMediaType} />
            )}
            {presets.length > 0 && (
              <PresetChips presets={presets} activePreset={displayPreset} onSelect={selectPreset} />
            )}

            <div className="px-4 md:px-8 pb-12 pt-2">
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
                  <FilterPanelHud
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    mediaType={mediaType}
                    excludeGenreIds={excludeGenreIds}
                  />
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
                    mediaType={mediaType}
                  />
                </div>

                <aside className="hidden lg:block w-64 shrink-0">
                  <div className="sticky top-24">
                    <FilterPanelHud
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      mediaType={mediaType}
                      excludeGenreIds={excludeGenreIds}
                    />
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

export default MediaConsole
