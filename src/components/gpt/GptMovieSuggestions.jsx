import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { AlertCircle } from 'lucide-react'
import MovieCardHud from '../movies/MovieCardHud'
import HudScrollRow from '../shared/HudScrollRow'
import useGenres from '../../hooks/useGenres'
import { pickBestGptMatches } from '../../utils/pickBestGptMatches'
import { getReleaseYear } from '../../utils/constant'
import { Skeleton } from '@/components/ui/skeleton'
import ThinkingDots from './ThinkingDots'
import { EASE } from '@/lib/motion'

const ThinkingRow = ({ label = 'Cinegraph is thinking...' }) => (
  <div className="px-4 md:px-[10%] pt-4">
    <div className="flex items-center gap-2 text-hud-cyan-strong text-sm font-medium mb-4">
      <ThinkingDots />
      {label}
    </div>
    <div className="flex gap-2 md:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="w-24 md:w-48 aspect-2/3 shrink-0 rounded-lg" />
      ))}
    </div>
  </div>
)

// One row per turn (not one row per suggested title) — each GPT
// suggestion contributes exactly one card (its best TMDB match, via
// pickBestGptMatches), so a "10 suggestions" turn reliably renders as
// ~10 posters instead of some titles showing 1 and others showing several
// near-duplicate matches. Row heading echoes the query itself, like a
// chat transcript, so scrolling back up still shows which turn is which.
const Turn = ({ turn, genreMap, isLast }) => {
  const items = pickBestGptMatches(turn.movieNames, turn.movieResults, turn.reasons, turn.mediaTypes)
  if (items.length === 0) return null

  return (
    <div>
      <HudScrollRow title={`"${turn.query}"`}>
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
      {!isLast && <div className="h-px bg-hud-line/30 mx-4 md:mx-[10%] mb-6" aria-hidden="true" />}
    </div>
  )
}

// Idle state's messaging now lives in GptSearchBar's hero heading, right
// above the input — this component only renders once there's something to
// show (in-flight, error, or results), so nothing gets said twice.
//
// Renders every turn (3.5, multi-turn refinement), not just the latest —
// a follow-up appends to the conversation instead of replacing it, so a
// failed or in-flight follow-up never wipes out prior results.
const GptMovieSuggestions = ({ isSearching, error }) => {
  const turns = useSelector((store) => store.gpt.turns)
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

  if (turns.length === 0 && isSearching) return <ThinkingRow />

  if (turns.length === 0 && error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-col items-center text-center px-4 pt-6"
      >
        <div className="mb-4 rounded-full bg-ink-elevated border border-hud-line p-4 text-rust">
          <AlertCircle size={28} />
        </div>
        <p className="text-text-dark text-sm md:text-base max-w-md">{error}</p>
      </motion.div>
    )
  }

  if (turns.length === 0) return null

  return (
    <div className="w-full h-full pt-4 pb-10">
      {turns.map((turn, i) => (
        <Turn key={turn.query + i} turn={turn} genreMap={genreMap} isLast={i === turns.length - 1} />
      ))}

      {isSearching && <ThinkingRow label="Refining..." />}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex items-center gap-2 text-rust text-sm px-4 md:px-[10%] pt-6"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}
    </div>
  )
}

export default GptMovieSuggestions
