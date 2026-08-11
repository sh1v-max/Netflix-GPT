import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useTasteProfile from './useTasteProfile'
import { buildPersonalizedPrompt } from '../utils/buildPersonalizedPrompt'
import { API_OPTIONS, GPT_PROXY_URL } from '../utils/constant'
import { setForYouResult } from '../store/forYouSlice'

// Same floor as buildPersonalizedPrompt's own gate — below this there's no
// real taste graph to recommend from, so the section just doesn't render
// (see 3.3 in re-do.md: "needs a profile to personalize against").
const MIN_RATINGS_FOR_FOR_YOU = 3
// Long enough that opening a few pages in one sitting doesn't refetch;
// short enough that picks feel alive as new ratings come in over days.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

const searchMovieTMDB = async (movie) => {
  const data = await fetch(
    'https://api.themoviedb.org/3/search/movie?query=' +
      encodeURIComponent(movie) +
      '&include_adult=false&language=en-US&page=1',
    API_OPTIONS
  )
  const json = await data.json()
  return json.results
}

// No-query recommendations for the AI home's idle state — reuses the same
// gpt-proxy-worker endpoint as a real search (no separate worker route),
// just with a generic "no specific title in mind" query so the existing
// system prompt's personalization still applies. Cached in Redux
// (forYouSlice) keyed by a cheap profile signature so it only refetches
// when the taste graph actually changed or the cache goes stale.
const useForYouRecommendations = () => {
  const dispatch = useDispatch()
  const { profile, genreNameById } = useTasteProfile()
  const cached = useSelector((store) => store.forYou)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const eligible = profile.totalRated >= MIN_RATINGS_FOR_FOR_YOU
  const profileSignature = JSON.stringify({
    topGenres: profile.topGenres,
    avoidGenres: profile.avoidGenres,
    favoriteDecade: profile.favoriteDecade,
  })

  useEffect(() => {
    if (!eligible) return

    const isFresh =
      cached.fetchedAt &&
      cached.profileSignature === profileSignature &&
      Date.now() - cached.fetchedAt < CACHE_TTL_MS
    if (isFresh) return

    let cancelled = false

    const run = async () => {
      setIsLoading(true)
      setError('')
      try {
        const profileSummary = buildPersonalizedPrompt(profile, genreNameById)
        const proxyResponse = await fetch(GPT_PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query:
              "Recommend movies based purely on my taste profile below — I don't have a specific title or mood in mind right now.",
            profileSummary,
          }),
        })
        if (!proxyResponse.ok) throw new Error('For You request failed')
        const { results } = await proxyResponse.json()
        const movieNames = results.map((r) => r.name)
        const reasons = results.map((r) => r.reason)
        const movieResults = await Promise.all(movieNames.map((m) => searchMovieTMDB(m)))
        if (!cancelled) {
          dispatch(
            setForYouResult({
              movieNames,
              movieResults,
              reasons,
              fetchedAt: Date.now(),
              profileSignature,
            })
          )
        }
      } catch (err) {
        console.error('For You recommendations error:', err)
        if (!cancelled) setError('Personalized picks are unavailable right now.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
    // profile/genreNameById intentionally excluded — profileSignature is
    // the derived value that should actually trigger a refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible, profileSignature])

  return { ...cached, isLoading, error, eligible }
}

export default useForYouRecommendations
