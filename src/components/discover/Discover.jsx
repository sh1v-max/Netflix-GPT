import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import FilterPanel from './FilterPanel'
import MovieCard from '../shared/MovieCard'
import { Skeleton } from '@/components/ui/skeleton'
import useDiscover from '../../hooks/useDiscover'
import useMultiSearch from '../../hooks/useMultiSearch'
import { IMG_CDN_URL } from '../../utils/constant'
import { Search, X, SlidersHorizontal, Loader2, Compass, SearchX } from 'lucide-react'
import { EASE } from '@/lib/motion'

const MEDIA_TYPES = [
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
]

const ResultsSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
    {Array.from({ length: 10 }).map((_, i) => (
      <Skeleton key={i} className="aspect-2/3 w-full rounded-lg" />
    ))}
  </div>
)

const EmptyState = ({ icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: EASE }}
    className="flex flex-col items-center text-center py-16 md:py-24 px-6"
  >
    <div className="mb-4 rounded-full bg-ink-elevated border border-border-hairline p-4 text-accent2">
      {icon}
    </div>
    <h3 className="font-display text-lg md:text-xl font-semibold mb-2">{title}</h3>
    <p className="text-text-dark-muted text-sm max-w-sm mb-5">{description}</p>
    {action}
  </motion.div>
)

const Discover = ({
  title = 'Discover',
  subtitle = 'Browse the full catalog — filter by genre, year, and rating, or search for something specific.',
  baseGenres = [],
  originLanguage = null,
  excludeGenreIds = [],
}) => {
  const defaultFilters = {
    withGenres: [],
    baseGenres,
    originLanguage,
    minYear: null,
    maxYear: null,
    minRating: null,
    sortBy: 'popularity.desc',
  }

  const [mediaType, setMediaType] = useState('movie')
  const [filters, setFilters] = useState(defaultFilters)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const sentinelRef = useRef(null)
  const mobileFilterRef = useRef(null)

  const isSearching = searchQuery.trim().length > 0

  const { results, isLoading, error, loadMore, hasMore, retry } = useDiscover(
    mediaType,
    filters
  )
  const {
    results: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
  } = useMultiSearch(searchQuery)

  const activeFilterCount =
    (filters.withGenres?.length || 0) +
    (filters.minYear ? 1 : 0) +
    (filters.maxYear ? 1 : 0) +
    (filters.minRating ? 1 : 0)

  const handleMediaTypeChange = (type) => {
    setMediaType(type)
    // Genre ids differ between movie/tv, so a movie genre selection
    // wouldn't mean anything once switched to TV — reset clean (but keep
    // this page's own fixed constraints, e.g. Anime's baseGenres).
    setFilters(defaultFilters)
  }

  const handleFiltersChange = (partial) => {
    setFilters((prev) => ({ ...prev, ...partial }))
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
    // isSearching is included so the observer re-attaches to the sentinel
    // when it remounts after switching back from search mode to browse mode.
  }, [hasMore, isLoading, loadMore, isSearching])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileFilterRef.current && !mobileFilterRef.current.contains(e.target)) {
        setShowMobileFilters(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const backdropPosters = results.filter((item) => item.poster_path).slice(0, 20)

  return (
    <div className="min-h-screen bg-ink text-text-dark flex flex-col">
      <Header />

      <main className="flex-1">
      {/* Header band */}
      <div className="relative pt-20 md:pt-28 pb-8 overflow-hidden">
        {backdropPosters.length > 0 && (
          <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-10 gap-2 px-2 opacity-20">
            {backdropPosters.map((movie, i) => (
              <img
                key={movie.id}
                src={IMG_CDN_URL + movie.poster_path}
                alt=""
                aria-hidden="true"
                className="rounded-md w-full aspect-2/3 object-cover"
                style={{ marginTop: `${(i % 3) * 20}px` }}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-b from-ink/20 via-ink/80 to-ink" />

        <div className="relative px-4 md:px-8">
          <h1 className="font-display text-2xl md:text-4xl font-semibold mb-2">{title}</h1>
          <p className="text-text-dark-muted text-sm md:text-base mb-6 max-w-lg">
            {subtitle}
          </p>

          <div className="relative max-w-xl">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dark-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a title..."
              className="w-full pl-11 pr-10 py-3 bg-ink-elevated border border-border-hairline text-text-dark text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2 transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dark-muted hover:text-text-dark cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {isSearching ? (
        <div className="pt-4">
          {searchError && (
            <EmptyState
              icon={<SearchX size={28} />}
              title="Search hiccup"
              description={searchError}
              action={
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-accent2 text-sm font-medium hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              }
            />
          )}

          {!isSearchLoading && !searchError && searchResults?.length === 0 && (
            <EmptyState
              icon={<SearchX size={28} />}
              title={`Nothing found for "${searchQuery}"`}
              description="Try a different title, or clear your search to keep exploring the full catalog."
              action={
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-accent2 text-sm font-medium hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              }
            />
          )}

          {isSearchLoading ? (
            <div className="px-4 md:px-8 pb-12">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-2/3 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.03 } } }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 px-4 md:px-8 pb-12"
            >
              {searchResults?.map((item) => (
                <motion.div
                  key={item.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <MovieCard
                    id={item.id}
                    posterPath={item.poster_path}
                    title={item.title || item.name}
                    mediaType={item.media_type}
                    genreIds={item.genre_ids}
                    fill
                    layoutId={`poster-${item.media_type}-${item.id}`}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      ) : (
        <div className="px-4 md:px-8 pb-12">
          {/* Media type tabs + mobile filter trigger */}
          <div className="flex items-center justify-between gap-4 mb-6 border-b border-border-hairline pb-3">
            <div className="flex items-center gap-6">
              {MEDIA_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleMediaTypeChange(type.value)}
                  className={`relative pb-3 -mb-3 text-sm font-medium cursor-pointer transition-colors ${
                    mediaType === type.value
                      ? 'text-text-dark'
                      : 'text-text-dark-muted hover:text-text-dark'
                  }`}
                >
                  {type.label}
                  {mediaType === type.value && (
                    <motion.span
                      layoutId="discover-tab-underline"
                      className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent2 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="relative lg:hidden" ref={mobileFilterRef}>
              <button
                onClick={() => setShowMobileFilters((v) => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm cursor-pointer transition-colors ${
                  showMobileFilters || activeFilterCount > 0
                    ? 'bg-ink-elevated border-accent2/50 text-text-dark'
                    : 'bg-ink-elevated border-border-hairline text-text-dark-muted hover:border-white/30'
                }`}
              >
                <SlidersHorizontal size={13} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-accent2 text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showMobileFilters && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15, ease: EASE }}
                    className="absolute top-full right-0 mt-2 w-[min(90vw,360px)] max-h-[70vh] overflow-y-auto bg-surface-glass backdrop-blur-[--blur-cg-glass] border border-border-hairline rounded-panel shadow-cg-elevated p-4 z-30 origin-top-right"
                  >
                    <FilterPanel
                      mediaType={mediaType}
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      excludeGenreIds={excludeGenreIds}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Grid */}
            <div className="flex-1 min-w-0">
              {error && (
                <EmptyState
                  icon={<SearchX size={28} />}
                  title="Couldn't load results"
                  description={error}
                  action={
                    <button
                      onClick={retry}
                      className="text-accent2 text-sm font-medium hover:underline cursor-pointer"
                    >
                      Try again
                    </button>
                  }
                />
              )}

              {!error && !isLoading && results.length === 0 && (
                <EmptyState
                  icon={<Compass size={28} />}
                  title="Nothing matches these filters yet"
                  description="Try loosening a filter or two — or clear them all and start browsing fresh."
                  action={
                    <button
                      onClick={() => setFilters(defaultFilters)}
                      className="text-accent2 text-sm font-medium hover:underline cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  }
                />
              )}

              {isLoading && results.length === 0 ? (
                <ResultsSkeleton />
              ) : (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.03 } } }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
                >
                  {results.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      <MovieCard
                        id={item.id}
                        posterPath={item.poster_path}
                        title={item.title || item.name}
                        mediaType={mediaType}
                        genreIds={item.genre_ids}
                        fill
                        layoutId={`poster-${mediaType}-${item.id}`}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {isLoading && results.length > 0 && (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-accent2" size={24} />
                </div>
              )}

              <div ref={sentinelRef} className="h-1" />
            </div>

            {/* Sidebar filters — desktop only */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-ink-elevated/60 border border-border-hairline rounded-panel p-5">
                <FilterPanel
                  mediaType={mediaType}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  excludeGenreIds={excludeGenreIds}
                />
              </div>
            </aside>
          </div>
        </div>
      )}
      </main>

      <Footer />
    </div>
  )
}

export default Discover
