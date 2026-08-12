import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useGenres from './useGenres'
import { computeTasteProfile } from '../utils/computeTasteProfile'
import { splitRatingsByCategory } from '../utils/splitRatingsByCategory'
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

const CATEGORY_QUERY = {
  movie:
    "Recommend movies based purely on my taste profile below — I don't have a specific title or mood in mind right now.",
  tv:
    "Recommend TV shows based purely on my taste profile below — I don't have a specific title or mood in mind right now.",
  anime:
    "Recommend anime based purely on my taste profile below — I don't have a specific title or mood in mind right now.",
}

// No-query recommendations for one category (movie/tv/anime) of the AI
// home's "For You" section — reuses the same gpt-proxy-worker endpoint as
// a real search (no separate worker route), just with a generic "no
// specific title in mind" query plus a strict `category` constraint so
// this row can't come back as a different category (see
// CATEGORY_CONSTRAINTS in gpt-proxy-worker/src/index.js — without it, a
// profile skewed toward one category made every row's suggestions come
// back as that category). The taste profile itself is computed from only
// that category's ratings (splitRatingsByCategory), not the full mixed
// history, so "Movies" genuinely reflects movie likes and not anime likes
// bleeding across.
const useForYouRecommendations = (category) => {
  const dispatch = useDispatch()
  const ratings = useSelector((store) => store.preferences.ratings)
  const ratedGenres = useSelector((store) => store.preferences.ratedGenres)
  const ratedYears = useSelector((store) => store.preferences.ratedYears)
  const movieGenres = useGenres('movie')
  const tvGenres = useGenres('tv')
  const cached = useSelector((store) => store.forYou[category])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const genreNameById = useMemo(() => {
    const map = {}
    ;(movieGenres || []).forEach((g) => { map[g.id] = g.name })
    ;(tvGenres || []).forEach((g) => { map[g.id] = g.name })
    return map
  }, [movieGenres, tvGenres])

  const profile = useMemo(() => {
    const buckets = splitRatingsByCategory(ratings, ratedGenres, ratedYears)
    const bucket = buckets[category]
    return computeTasteProfile(bucket.ratings, bucket.ratedGenres, bucket.ratedYears)
  }, [ratings, ratedGenres, ratedYears, category])

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
          body: JSON.stringify({ query: CATEGORY_QUERY[category], profileSummary, category }),
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
              category,
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
        console.error(`For You (${category}) recommendations error:`, err)
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
  }, [eligible, profileSignature, category])

  return { ...cached, isLoading, error, eligible, totalRated: profile.totalRated }
}

export default useForYouRecommendations
