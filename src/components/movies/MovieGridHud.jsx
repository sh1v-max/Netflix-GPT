import React from 'react'
import { motion } from 'motion/react'
import { Loader2, DatabaseZap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import MovieCardHud from './MovieCardHud'
import { getReleaseYear } from '../../utils/constant'
import { EASE } from '@/lib/motion'

const GridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
    {Array.from({ length: 12 }).map((_, i) => (
      <Skeleton key={i} className="aspect-2/3 w-full" />
    ))}
  </div>
)

const EmptyState = ({ title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: EASE }}
    className="flex flex-col items-center text-center py-16 md:py-24 px-6"
  >
    <div className="hud-panel mb-4 p-4 text-hud-cyan">
      <DatabaseZap size={26} />
    </div>
    <h3 className="font-mono text-sm uppercase tracking-wide mb-2">{title}</h3>
    <p className="text-text-dark-muted text-sm max-w-sm mb-5">{description}</p>
    {action}
  </motion.div>
)

const MovieGridHud = ({
  results,
  isLoading,
  error,
  hasMore,
  sentinelRef,
  genreMap,
  onRetry,
  mediaType = 'movie',
}) => {
  if (error) {
    return (
      <EmptyState
        title="Connection error"
        description={error}
        action={
          onRetry && (
            <button
              onClick={onRetry}
              className="font-mono text-xs text-hud-cyan hover:underline cursor-pointer"
            >
              Retry query
            </button>
          )
        }
      />
    )
  }

  if (!isLoading && results.length === 0) {
    return (
      <EmptyState
        title="No records match query"
        description="Try a different preset, or loosen a filter and search again."
      />
    )
  }

  if (isLoading && results.length === 0) {
    return <GridSkeleton />
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.03 } } }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
      >
        {results.map((item) => (
          <motion.div
            key={item.id}
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <MovieCardHud
              id={item.id}
              posterPath={item.poster_path}
              title={item.title || item.name}
              mediaType={item.media_type || mediaType}
              genreIds={item.genre_ids}
              releaseYear={getReleaseYear(item)}
              voteAverage={item.vote_average}
              genreMap={genreMap}
              fill
              layoutId={`hud-poster-${mediaType}-${item.id}`}
            />
          </motion.div>
        ))}
      </motion.div>

      {isLoading && results.length > 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-hud-cyan" size={22} />
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-1" />}
    </>
  )
}

export default MovieGridHud
