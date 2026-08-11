import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { IMG_CDN_URL } from '../../utils/constant'
import RatingControl from '../shared/RatingControl'
import WatchlistButton from '../shared/WatchlistButton'
import HudFrame from './HudFrame'

// Sibling to MovieCard, not a variant prop on it — MovieCard's hover-gated
// contract is depended on by Discover.jsx and shouldn't be forked with
// conditionals. This card shows its data readout persistently (rating,
// year, genre) instead of hiding it behind hover, since a database
// shouldn't require a hover to prove a row has data. Also adds a
// text-only fallback for missing posters (MovieCard returns null instead —
// that stays as-is, this is scoped to this file only).
const MovieCardHud = ({
  id,
  posterPath,
  title,
  mediaType = 'movie',
  genreIds = [],
  releaseYear = null,
  fill = false,
  layoutId,
  voteAverage = null,
  genreMap = {},
  reason = null,
}) => {
  const [imgError, setImgError] = useState(false)
  const hasPoster = posterPath && !imgError
  const primaryGenre = genreIds?.length ? genreMap[genreIds[0]] : null

  return (
    <motion.div
      className={`${fill ? 'w-full' : 'w-32 md:w-48'} relative group`}
      title={title}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link to={`/title/${mediaType}/${id}`} className="block">
        <HudFrame className="overflow-hidden">
          {hasPoster ? (
            <motion.img
              layoutId={layoutId}
              src={IMG_CDN_URL + posterPath}
              alt={title ? `${title} poster` : 'Movie poster'}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full aspect-2/3 object-cover"
            />
          ) : (
            <div className="w-full aspect-2/3 flex items-center justify-center p-3 bg-bg-muted">
              <p className="font-mono text-xs text-text-dark-muted text-center line-clamp-4">
                {title || 'Untitled record'}
              </p>
            </div>
          )}

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <WatchlistButton mediaType={mediaType} id={id} size={13} />
          </div>
          <div className="absolute top-2 left-2">
            <RatingControl
              mediaType={mediaType}
              id={id}
              genreIds={genreIds}
              releaseYear={releaseYear}
              size={12}
            />
          </div>

          {/* Persistent data readout — not hover-gated */}
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/60 to-transparent px-2 pt-6 pb-1.5">
            {title && (
              <p className="text-text-dark text-xs font-medium truncate mb-0.5">{title}</p>
            )}
            <div className="flex items-center gap-2 font-mono text-[10px]">
              {voteAverage != null && (
                <span className="text-hud-cyan-strong">★ {voteAverage.toFixed(1)}</span>
              )}
              {releaseYear && <span className="text-text-dark-muted">{releaseYear}</span>}
              {primaryGenre && (
                <span className="text-text-dark-muted truncate">{primaryGenre}</span>
              )}
            </div>
          </div>

          {/* GPT "why this was picked" reason — hover-only, replaces the
              poster rather than the persistent readout (which stays
              meaningful even mid-hover on touch devices that can't hover
              at all). */}
          {reason && (
            <div className="absolute inset-0 bg-ink/90 backdrop-blur-sm p-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-hud-cyan-strong text-[11px] leading-snug line-clamp-6">{reason}</p>
            </div>
          )}
        </HudFrame>
      </Link>
    </motion.div>
  )
}

export default MovieCardHud
