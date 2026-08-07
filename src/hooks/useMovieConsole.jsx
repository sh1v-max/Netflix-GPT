import { useEffect, useState } from 'react'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'
import { buildDiscoverParams } from './useDiscover'

// Fixed TMDB list endpoints that have no /discover equivalent (or whose
// equivalent isn't worth reproducing exactly) — "Trending" in particular
// has no discover param at all. TV has no "upcoming" equivalent endpoint,
// so that preset simply doesn't exist for mediaType 'tv'.
const PRESET_ENDPOINTS = {
  movie: {
    now_playing: '/movie/now_playing',
    popular: '/movie/popular',
    top_rated: '/movie/top_rated',
    upcoming: '/movie/upcoming',
    trending: '/trending/movie/day',
  },
  tv: {
    on_the_air: '/tv/on_the_air',
    popular: '/tv/popular',
    top_rated: '/tv/top_rated',
    airing_today: '/tv/airing_today',
    trending: '/trending/tv/day',
  },
}

// Same shape as useDiscover, plus a `preset` field on filters and a
// `totalResults` return value (for the console header's stat readout).
// preset set -> hits the matching fixed TMDB list endpoint (paginated via
// that endpoint's own page/total_pages). preset null -> falls through to
// /discover/{mediaType} via the same buildDiscoverParams useDiscover uses,
// so both paths share one loading/pagination state machine.
const useMovieConsole = (mediaType, filters) => {
  const [results, setResults] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryToken, setRetryToken] = useState(0)

  const preset = filters?.preset || null
  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    setPage(1)
  }, [mediaType, filtersKey])

  useEffect(() => {
    if (!mediaType) return
    let cancelled = false

    const getResults = async () => {
      setIsLoading(true)
      setError('')
      try {
        const presetPath = preset && PRESET_ENDPOINTS[mediaType]?.[preset]
        const url = presetPath
          ? `${TMDB_BASE_URL}${presetPath}?language=en-US&page=${page}`
          : `${TMDB_BASE_URL}/discover/${mediaType}?${buildDiscoverParams({ ...filters, mediaType }, page)}`
        const data = await fetch(url, API_OPTIONS)
        const json = await data.json()
        if (cancelled) return
        setResults((prev) => (page === 1 ? json.results : [...prev, ...json.results]))
        setTotalPages(json.total_pages || 1)
        setTotalResults(json.total_results || 0)
      } catch {
        if (!cancelled) setError('Could not load results. Please try again.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    getResults()
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

  return { results, isLoading, error, loadMore, hasMore, retry, totalResults }
}

export default useMovieConsole
