import React, { useMemo } from 'react'
import { motion } from 'motion/react'
import { Radar, Heart } from 'lucide-react'
import MovieCardHud from '../movies/MovieCardHud'
import HudScrollRow from '../shared/HudScrollRow'
import HudBadge from '../shared/HudBadge'
import useGenres from '../../hooks/useGenres'
import { pickBestGptMatches } from '../../utils/pickBestGptMatches'
import { getReleaseYear } from '../../utils/constant'
import ThinkingDots from './ThinkingDots'
import useForYouRecommendations, { MIN_RATINGS_FOR_FOR_YOU } from '../../hooks/useForYouRecommendations'
import { EASE } from '@/lib/motion'

// A persistent, always-mounted panel — never conditionally absent, so the
// AI page never has a section that flashes in and out depending on state.
// Three states inside the same shell: not enough ratings yet, waiting on
// the model, or the actual picks (error is a quiet fourth, same shell).
const ForYouRows = () => {
  const { movieNames, mediaTypes, movieResults, reasons, isLoading, error, eligible, totalRated } =
    useForYouRecommendations()
  const movieGenres = useGenres('movie')
  const tvGenres = useGenres('tv')
  const genreMap = useMemo(
    () =>
      Object.fromEntries([
        ...(movieGenres || []).map((g) => [g.id, g.name]),
        ...(tvGenres || []).map((g) => [g.id, g.name]),
      ]),
    [movieGenres, tvGenres]
  )

  const items =
    eligible && movieNames ? pickBestGptMatches(movieNames, movieResults, reasons, mediaTypes) : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="hud-panel relative mx-4 md:mx-[10%] mt-10 mb-10 p-5 md:p-6"
    >
      <span className="hud-corner hud-corner--tl" aria-hidden="true" />
      <span className="hud-corner hud-corner--tr" aria-hidden="true" />
      <span className="hud-corner hud-corner--bl" aria-hidden="true" />
      <span className="hud-corner hud-corner--br" aria-hidden="true" />

      <HudBadge icon={Radar}>For You — Recommended by AI</HudBadge>

      {!eligible && (
        <div className="flex flex-col items-center text-center py-6">
          <div className="mb-3 rounded-full bg-ink-elevated border border-hud-line p-3 text-hud-cyan">
            <Heart size={20} />
          </div>
          <p className="text-text-dark-muted text-sm md:text-base max-w-sm">
            Like at least {MIN_RATINGS_FOR_FOR_YOU} movies or shows to unlock
            personalized AI picks.
          </p>
          <p className="font-mono text-xs text-hud-cyan-strong mt-2 tracking-wider">
            {totalRated}/{MIN_RATINGS_FOR_FOR_YOU} rated
          </p>
        </div>
      )}

      {eligible && isLoading && !movieNames && (
        <div className="flex flex-col items-center text-center py-6">
          <ThinkingDots className="text-hud-cyan-strong mb-3" />
          <p className="text-text-dark-muted text-sm md:text-base">
            Waiting for AI to generate your picks — shouldn't take more than
            10 seconds.
          </p>
        </div>
      )}

      {eligible && !isLoading && (error || items.length === 0) && (
        <div className="flex flex-col items-center text-center py-6">
          <p className="text-text-dark-muted text-sm max-w-sm">
            {error || 'No personalized picks available right now — try again later.'}
          </p>
        </div>
      )}

      {eligible && items.length > 0 && (
        <div className="-mx-5 md:-mx-6 -mb-5 md:-mb-6">
          <HudScrollRow title="Picked from your taste graph">
            {items.map(({ movie, reason, mediaType }) => (
              <MovieCardHud
                key={`${mediaType}-${movie.id}`}
                id={movie.id}
                posterPath={movie.poster_path}
                title={movie.title || movie.name}
                mediaType={mediaType}
                genreIds={movie.genre_ids}
                releaseYear={getReleaseYear(movie)}
                voteAverage={movie.vote_average}
                genreMap={genreMap}
                reason={reason}
              />
            ))}
          </HudScrollRow>
        </div>
      )}
    </motion.div>
  )
}

export default ForYouRows
