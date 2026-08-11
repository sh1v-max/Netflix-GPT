import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useTasteProfile from './useTasteProfile'
import { buildPersonalizedPrompt } from '../utils/buildPersonalizedPrompt'
import { searchTitleTMDB } from '../utils/searchTitleTMDB'
import { GPT_PROXY_URL } from '../utils/constant'
import { setForYouResult } from '../store/forYouSlice'

// Same floor as buildPersonalizedPrompt's own gate — below this there's no
// real taste graph to recommend from. Exported so ForYouRows can show
// "X/N rated" progress instead of just a flat "not eligible yet" message.
export const MIN_RATINGS_FOR_FOR_YOU = 3
// Long enough that opening a few pages in one sitting doesn't refetch;
// short enough that picks feel alive as new ratings come in over days.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

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
              "Recommend movies or TV shows based purely on my taste profile below — I don't have a specific title or mood in mind right now.",
            profileSummary,
          }),
        })
        if (!proxyResponse.ok) throw new Error('For You request failed')
        const { results } = await proxyResponse.json()
        const movieNames = results.map((r) => r.name)
        const mediaTypes = results.map((r) => (r.mediaType === 'tv' ? 'tv' : 'movie'))
        const reasons = results.map((r) => r.reason)
        const movieResults = await Promise.all(
          movieNames.map((name, i) => searchTitleTMDB(name, mediaTypes[i]))
        )
        if (!cancelled) {
          dispatch(
            setForYouResult({
              movieNames,
              mediaTypes,
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

  return { ...cached, isLoading, error, eligible, totalRated: profile.totalRated }
}

export default useForYouRecommendations
