import React, { useEffect, useRef, useState } from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import FilterBar from './FilterBar'
import MovieCard from '../shared/MovieCard'
import useDiscover from '../../hooks/useDiscover'
import useMultiSearch from '../../hooks/useMultiSearch'
import { FaSearch, FaTimes } from 'react-icons/fa'
import { ImSpinner8 } from 'react-icons/im'

const DEFAULT_FILTERS = {
  withGenres: [],
  minYear: null,
  maxYear: null,
  minRating: null,
  sortBy: 'popularity.desc',
}

const Discover = () => {
  const [mediaType, setMediaType] = useState('movie')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [searchQuery, setSearchQuery] = useState('')
  const sentinelRef = useRef(null)

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

  const handleMediaTypeChange = (type) => {
    setMediaType(type)
    // Genre ids differ between movie/tv, so a movie genre selection
    // wouldn't mean anything once switched to TV — reset clean.
    setFilters(DEFAULT_FILTERS)
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

  return (
    <div className="min-h-screen bg-ink text-text-dark">
      <Header />
      <div className="pt-20 md:pt-28">
        <h1 className="font-display text-2xl md:text-3xl font-semibold px-4 md:px-8 mb-4">
          Discover
        </h1>

        <div className="px-4 md:px-8 mb-2">
          <div className="relative max-w-xl">
            <FaSearch
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dark-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a title..."
              className="w-full pl-11 pr-10 py-3 bg-ink-elevated border border-white/10 text-text-dark text-sm rounded-[--radius-card] focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dark-muted hover:text-text-dark cursor-pointer"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>
        </div>

        {isSearching ? (
          <div className="pt-4">
            {searchError && (
              <p className="text-rust text-sm px-4 md:px-8 py-6 text-center">
                {searchError}
              </p>
            )}

            {!isSearchLoading && !searchError && searchResults?.length === 0 && (
              <p className="text-text-dark-muted text-sm text-center py-12">
                No titles match "{searchQuery}".
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 px-4 md:px-8 pb-12">
              {searchResults?.map((item) => (
                <MovieCard
                  key={item.id}
                  id={item.id}
                  posterPath={item.poster_path}
                  title={item.title || item.name}
                  mediaType={item.media_type}
                  fill
                />
              ))}
            </div>

            {isSearchLoading && (
              <div className="flex justify-center pb-12">
                <ImSpinner8 className="animate-spin text-accent" size={24} />
              </div>
            )}
          </div>
        ) : (
          <>
            <FilterBar
              mediaType={mediaType}
              onMediaTypeChange={handleMediaTypeChange}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />

            {error && (
              <div className="px-4 md:px-8 py-6 text-center">
                <p className="text-rust text-sm mb-3">{error}</p>
                <button
                  onClick={retry}
                  className="text-accent text-sm font-medium hover:underline cursor-pointer"
                >
                  Try again
                </button>
              </div>
            )}

            {!error && !isLoading && results.length === 0 && (
              <p className="text-text-dark-muted text-sm text-center py-12">
                No titles match these filters. Try loosening them up.
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 px-4 md:px-8 pb-12">
              {results.map((item) => (
                <MovieCard
                  key={item.id}
                  id={item.id}
                  posterPath={item.poster_path}
                  title={item.title || item.name}
                  mediaType={mediaType}
                  fill
                />
              ))}
            </div>

            {isLoading && (
              <div className="flex justify-center pb-12">
                <ImSpinner8 className="animate-spin text-accent" size={24} />
              </div>
            )}

            <div ref={sentinelRef} className="h-1" />
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Discover
