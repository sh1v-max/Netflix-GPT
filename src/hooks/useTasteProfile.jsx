import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import useGenres from './useGenres'
import { computeTasteProfile } from '../utils/computeTasteProfile'

// Movie and TV genre ids mostly overlap in meaning where they collide
// (Comedy/Drama/etc share the same id in both TMDB lists) — the handful
// that don't (e.g. TV's "Sci-Fi & Fantasy") sit in disjoint id ranges, so
// a flat merge is safe.
const useTasteProfile = () => {
  const ratings = useSelector((store) => store.preferences.ratings)
  const ratedGenres = useSelector((store) => store.preferences.ratedGenres)
  const ratedYears = useSelector((store) => store.preferences.ratedYears)
  const movieGenres = useGenres('movie')
  const tvGenres = useGenres('tv')

  const genreNameById = useMemo(() => {
    const map = {}
    ;(movieGenres || []).forEach((g) => { map[g.id] = g.name })
    ;(tvGenres || []).forEach((g) => { map[g.id] = g.name })
    return map
  }, [movieGenres, tvGenres])

  const profile = useMemo(
    () => computeTasteProfile(ratings, ratedGenres, ratedYears),
    [ratings, ratedGenres, ratedYears]
  )

  return { profile, genreNameById }
}

export default useTasteProfile
