import React from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'
import useGenres from '../../hooks/useGenres'

const VideoTitle = ({ id, mediaType = 'movie', title, overview, genreIds, voteAverage }) => {
  const genres = useGenres(mediaType)
  const genreNames = genres && genreIds
    ? genreIds
        .map((genreId) => genres.find((genre) => genre.id === genreId)?.name)
        .filter(Boolean)
        .slice(0, 3)
    : []

  const detailHref = `/title/${mediaType}/${id}`

  return (
    <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-auto md:max-w-sm z-20">
      <div className="bg-ink-elevated/90 backdrop-blur-md border border-white/10 rounded-[--radius-card] shadow-lg p-4 md:p-6">
        <p className="text-accent text-[11px] md:text-xs font-semibold tracking-widest uppercase mb-2">
          Featured Now
        </p>
        <h1 className="font-display text-lg md:text-2xl font-semibold mb-2 leading-tight">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
          {voteAverage > 0 && (
            <span className="text-accent text-xs font-medium">
              ★ {voteAverage.toFixed(1)}
            </span>
          )}
          {genreNames.map((name) => (
            <span
              key={name}
              className="text-[11px] bg-white/10 text-text-dark px-2.5 py-1 rounded-full"
            >
              {name}
            </span>
          ))}
        </div>

        <p className="hidden md:block text-sm text-text-dark-muted line-clamp-3 mb-4">
          {overview}
        </p>

        <Link
          to={detailHref}
          className="inline-flex items-center gap-2 text-accent hover:text-accent-strong text-sm font-medium transition-colors"
        >
          View Details
          <FaArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export default VideoTitle
