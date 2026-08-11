import React, { useMemo } from 'react'
import { motion } from 'motion/react'
import { Radar } from 'lucide-react'
import MovieCardHud from '../movies/MovieCardHud'
import HudScrollRow from '../shared/HudScrollRow'
import HudBadge from '../shared/HudBadge'
import useGenres from '../../hooks/useGenres'
import { pickBestGptMatches } from '../../utils/pickBestGptMatches'
import { getReleaseYear } from '../../utils/constant'
import { Skeleton } from '@/components/ui/skeleton'
import ThinkingDots from './ThinkingDots'
import useForYouRecommendations from '../../hooks/useForYouRecommendations'
import { EASE } from '@/lib/motion'

// Idle-state personalization for the AI home (3.3) — no query needed, just
// the taste graph. Renders nothing until there's a real profile to work
// from (useForYouRecommendations gates on a minimum rating count).
//
// One card per suggestion (best TMDB match via pickBestGptMatches) in a
// single HudScrollRow, same as GptMovieSuggestions — not one row per
// suggested title showing every near-duplicate TMDB match.
const ForYouRows = () => {
  const { movieNames, movieResults, reasons, isLoading, error, eligible } = useForYouRecommendations()
  const movieGenres = useGenres('movie')
  const genreMap = useMemo(
    () => Object.fromEntries((movieGenres || []).map((g) => [g.id, g.name])),
    [movieGenres]
  )

  if (!eligible) return null

  if (isLoading && !movieNames) {
    return (
      <div className="px-4 md:px-[10%] pt-10 w-full">
        <div className="flex items-center gap-2 text-hud-cyan-strong text-sm font-medium mb-4">
          <ThinkingDots />
          Building your picks...
        </div>
        <div className="flex gap-2 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-24 md:w-48 aspect-2/3 shrink-0 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Fails silently-ish by design (this is a secondary section, not the
  // main search flow) but not *invisibly* — a quiet note beats the
  // section just flashing a skeleton and vanishing with no explanation.
  if (error || !movieNames) {
    return error ? (
      <p className="px-4 md:px-[10%] pt-10 text-xs text-text-dark-muted">{error}</p>
    ) : null
  }

  const items = pickBestGptMatches(movieNames, movieResults, reasons)
  if (items.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="w-full pt-10"
    >
      <div className="px-4 md:px-[10%] mb-2">
        <HudBadge icon={Radar}>Personalized for you</HudBadge>
      </div>
      <HudScrollRow title="Picked from your taste graph">
        {items.map(({ movie, reason }) => (
          <MovieCardHud
            key={movie.id}
            id={movie.id}
            posterPath={movie.poster_path}
            title={movie.title || movie.name}
            mediaType={movie.media_type || 'movie'}
            genreIds={movie.genre_ids}
            releaseYear={getReleaseYear(movie)}
            voteAverage={movie.vote_average}
            genreMap={genreMap}
            reason={reason}
          />
        ))}
      </HudScrollRow>
    </motion.div>
  )
}

export default ForYouRows
