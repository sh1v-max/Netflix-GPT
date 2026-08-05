import { useEffect, useState } from 'react'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'

// filters: { withGenres: [id, ...], baseGenres: [id, ...], minYear, maxYear,
//            minRating, sortBy, originLanguage }
//
// `baseGenres` is for constraints a page always applies (e.g. the Anime page
// forcing Animation) that the user can't remove — when present, the whole
// genre list is comma-joined (AND — must match all), since a title needs to
// satisfy the mandatory genre *and* any further picks. Without `baseGenres`,
// `withGenres` alone stays pipe-joined (OR — match any), which is what plain
// Discover wants ("show me Action or Comedy").
export const buildDiscoverParams = (filters = {}, page = 1) => {
  const params = new URLSearchParams({
    language: 'en-US',
    page,
    sort_by: filters.sortBy || 'popularity.desc',
  })

  const genreIds = [...(filters.baseGenres || []), ...(filters.withGenres || [])]
  if (genreIds.length) {
    const separator = filters.baseGenres?.length ? ',' : '|'
    params.set('with_genres', genreIds.join(separator))
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
  if (filters.originLanguage) {
    params.set('with_original_language', filters.originLanguage)
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
