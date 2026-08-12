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

const CATEGORIES = [
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'TV Shows' },
  { key: 'anime', label: 'Anime' },
]

// One category's row — always renders something inside its own slot (never
// just vanishes): not-eligible progress, loading, a quiet error, or the
// actual picks. Personalized from only that category's rated titles
// (useForYouRecommendations splits history by category internally), so
// Movies/TV Shows/Anime each reflect their own likes instead of one mixed
// profile whose picks skew toward whichever category dominates.
const CategoryRow = ({ category, label, genreMap }) => {
  const { movieNames, mediaTypes, movieResults, reasons, isLoading, error, eligible, totalRated } =
    useForYouRecommendations(category)

  const items = eligible && movieNames ? pickBestGptMatches(movieNames, movieResults, reasons, mediaTypes) : []

  return (
    <div className="mb-6 last:mb-0">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-hud-cyan/70 px-4 md:px-[10%] mb-1">
        {label}
      </p>

      {!eligible && (
        <div className="flex items-center gap-3 px-4 md:px-[10%] py-4">
          <div className="rounded-full bg-ink-elevated border border-hud-line p-2 text-hud-cyan shrink-0">
            <Heart size={16} />
          </div>
          <p className="text-text-dark-muted text-sm">
            Like {MIN_RATINGS_FOR_FOR_YOU} {label.toLowerCase()} to unlock this row —{' '}
            <span className="font-mono text-hud-cyan-strong">
              {totalRated}/{MIN_RATINGS_FOR_FOR_YOU}
            </span>{' '}
            so far.
          </p>
        </div>
      )}

      {eligible && isLoading && !movieNames && (
        <div className="flex items-center gap-3 px-4 md:px-[10%] py-4">
          <ThinkingDots className="text-hud-cyan-strong shrink-0" />
          <p className="text-text-dark-muted text-sm">
            Waiting for AI to generate your {label.toLowerCase()} picks — shouldn't take more
            than 10 seconds.
          </p>
        </div>
      )}

      {eligible && !isLoading && (error || items.length === 0) && (
        <p className="px-4 md:px-[10%] py-4 text-text-dark-muted text-sm">
          {error || `No personalized ${label.toLowerCase()} picks available right now.`}
        </p>
      )}

      {eligible && items.length > 0 && (
        <div className="-mx-5 md:-mx-6">
          <HudScrollRow title={label}>
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
    </div>
  )
}

// A persistent, always-mounted panel — never conditionally absent, so the
// AI page never has a section that flashes in and out depending on state.
// Holds three independent CategoryRows (Movies/TV Shows/Anime), each
// personalized from its own slice of rating history.
const ForYouRows = () => {
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

      {CATEGORIES.map(({ key, label }) => (
        <CategoryRow key={key} category={key} label={label} genreMap={genreMap} />
      ))}
    </motion.div>
  )
}

export default ForYouRows
