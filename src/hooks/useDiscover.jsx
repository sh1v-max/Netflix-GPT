import { useEffect, useState } from 'react'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'

// filters: { withGenres: [id, ...], minYear, maxYear, minRating, sortBy }
const buildDiscoverParams = (filters = {}, page = 1) => {
  const params = new URLSearchParams({
    language: 'en-US',
    page,
    sort_by: filters.sortBy || 'popularity.desc',
  })
  if (filters.withGenres?.length) {
    // Pipe-separated = "any of these genres" (OR), not "all of these" (AND)
    params.set('with_genres', filters.withGenres.join('|'))
  }
  const dateField = filters.mediaType === 'tv' ? 'first_air_date' : 'primary_release_date'
  if (filters.minYear) {
    params.set(`${dateField}.gte`, `${filters.minYear}-01-01`)
  }
  if (filters.maxYear) {
    params.set(`${dateField}.lte`, `${filters.maxYear}-12-31`)
  }
  if (filters.minRating) {
    params.set('vote_average.gte', filters.minRating)
  }
  return params.toString()
}

const useDiscover = (mediaType, filters) => {
  const [results, setResults] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryToken, setRetryToken] = useState(0)

  const filtersKey = JSON.stringify(filters)

  // Any filter (or media type) change restarts from page 1
  useEffect(() => {
    setPage(1)
  }, [mediaType, filtersKey])

  useEffect(() => {
    if (!mediaType) return
    let cancelled = false

    const getDiscoverResults = async () => {
      setIsLoading(true)
      setError('')
      try {
        const query = buildDiscoverParams({ ...filters, mediaType }, page)
        const data = await fetch(
          `${TMDB_BASE_URL}/discover/${mediaType}?${query}`,
          API_OPTIONS
        )
        const json = await data.json()
        if (cancelled) return
        setResults((prev) => (page === 1 ? json.results : [...prev, ...json.results]))
        setTotalPages(json.total_pages)
      } catch {
        if (!cancelled) setError('Could not load results. Please try again.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    getDiscoverResults()
    return () => {
      cancelled = true
    }
  }, [mediaType, filtersKey, page, retryToken])

  const hasMore = page < totalPages

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((p) => p + 1)
    }
  }

  const retry = () => setRetryToken((t) => t + 1)

  return { results, isLoading, error, loadMore, hasMore, retry }
}

export default useDiscover
