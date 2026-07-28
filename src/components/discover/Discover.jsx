import React, { useEffect, useRef, useState } from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import FilterBar from './FilterBar'
import MovieCard from '../shared/MovieCard'
import useDiscover from '../../hooks/useDiscover'
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
  const sentinelRef = useRef(null)

  const { results, isLoading, error, loadMore, hasMore, retry } = useDiscover(
    mediaType,
    filters
  )

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
  }, [hasMore, isLoading, loadMore])

  return (
    <div className="min-h-screen bg-ink text-text-dark">
      <Header />
      <div className="pt-20 md:pt-28">
        <h1 className="font-display text-2xl md:text-3xl font-semibold px-4 md:px-8">
          Discover
        </h1>

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
      </div>
      <Footer />
    </div>
  )
}

export default Discover
