import { useEffect, useState } from 'react'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'

// Searches movies, TV shows, and people in one call — we only keep
// movie/tv results since MovieCard/MovieList expect that shape.
const useMultiSearch = (query) => {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!query || !query.trim()) {
      setResults(null)
      return
    }

    let cancelled = false

    const getSearchResults = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await fetch(
          `${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(
            query
          )}&include_adult=false&language=en-US&page=1`,
          API_OPTIONS
        )
        const json = await data.json()
        if (cancelled) return
        setResults(
          json.results.filter(
            (result) => result.media_type === 'movie' || result.media_type === 'tv'
          )
        )
      } catch {
        if (!cancelled) setError('Search failed. Please try again.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    getSearchResults()
    return () => {
      cancelled = true
    }
  }, [query])

  return { results, isLoading, error }
}

export default useMultiSearch
