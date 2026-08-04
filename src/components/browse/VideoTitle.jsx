import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Star } from 'lucide-react'
import useGenres from '../../hooks/useGenres'

const EASE = [0.16, 1, 0.3, 1]

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
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-auto md:max-w-sm z-20"
    >
      <div className="bg-surface-glass backdrop-blur-[--blur-cg-glass] border border-border-hairline rounded-panel shadow-cg-elevated p-4 md:p-6">
        <p className="text-accent2 text-[11px] md:text-xs font-semibold tracking-widest uppercase mb-2">
          Featured Now
        </p>
        <h1 className="font-display text-lg md:text-2xl font-semibold mb-2 leading-tight">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
          {voteAverage > 0 && (
            <span className="inline-flex items-center gap-1 text-accent-soft text-xs font-medium">
              <Star size={12} fill="currentColor" />
              {voteAverage.toFixed(1)}
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
          className="group/link inline-flex items-center gap-2 text-accent2 hover:text-accent2-strong text-sm font-medium transition-colors"
        >
          View Details
          <ArrowRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}

export default VideoTitle
