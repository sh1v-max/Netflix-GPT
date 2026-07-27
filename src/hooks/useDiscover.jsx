import { useEffect, useState } from 'react'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'

// filters: { withGenres: [id, ...], year, minRating, sortBy, page }
const buildDiscoverParams = (filters = {}) => {
  const params = new URLSearchParams({
    language: 'en-US',
    page: filters.page || 1,
    sort_by: filters.sortBy || 'popularity.desc',
  })
  if (filters.withGenres?.length) {
    params.set('with_genres', filters.withGenres.join(','))
  }
  if (filters.year) {
    params.set(
      filters.mediaType === 'tv' ? 'first_air_date_year' : 'primary_release_year',
      filters.year
    )
  }
  if (filters.minRating) {
    params.set('vote_average.gte', filters.minRating)
  }
  return params.toString()
}

const useDiscover = (mediaType, filters) => {
  const [results, setResults] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    if (!mediaType) return
    let cancelled = false

    const getDiscoverResults = async () => {
      setIsLoading(true)
      setError('')
      try {
        const query = buildDiscoverParams({ ...filters, mediaType })
        const data = await fetch(
          `${TMDB_BASE_URL}/discover/${mediaType}?${query}`,
          API_OPTIONS
        )
        const json = await data.json()
        if (cancelled) return
        setResults(json.results)
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
  }, [mediaType, filtersKey])

  return { results, totalPages, isLoading, error }
}

export default useDiscover
