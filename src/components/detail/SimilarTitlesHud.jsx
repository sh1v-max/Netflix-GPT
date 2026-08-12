import { useRef } from 'react'
import { motion } from 'motion/react'
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react'
import MovieCardHud from '../movies/MovieCardHud'
import useGenres from '../../hooks/useGenres'
import { getReleaseYear } from '../../utils/constant'
import { smoothScrollBy } from '../../utils/smoothScrollBy'
import { EASE } from '@/lib/motion'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

// HUD-styled sibling to MovieList — reuses MovieCardHud (same bracket-corner
// tile every catalog page uses) instead of MovieList's MovieCard, so a
// title's "More Like This" row reads as more database records, not a
// Netflix-style hover shelf. MovieList/MovieCard stay untouched (still
// depended on by Home.jsx's marketing grid).
const SimilarTitlesHud = ({ movies, mediaType = 'movie' }) => {
  const scrollRef = useRef(null)
  const genres = useGenres(mediaType)
  const genreMap = Object.fromEntries((genres || []).map((g) => [g.id, g.name]))

  if (!movies || movies.length === 0) return null

  const scroll = (direction) => {
    smoothScrollBy(scrollRef.current, direction === 'left' ? -700 : 700)
  }

  return (
    <div className="relative max-w-5xl mx-auto px-6 md:px-12 pb-10 md:pb-14">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-hud-line/25 text-hud-cyan">
        <Layers size={13} />
        <span className="font-mono text-[11px] uppercase tracking-[0.15em]">
          More Like This
        </span>
      </div>

      <button
        className="hidden md:flex items-center justify-center absolute left-2 top-[58%] -translate-y-1/2 hud-panel text-hud-cyan p-2 z-10 cursor-pointer hover:text-hud-cyan-strong transition-colors"
        onClick={() => scroll('left')}
        aria-label="Scroll similar titles left"
      >
        <ChevronLeft size={16} />
      </button>

      <motion.div
        ref={scrollRef}
        initial="hidden"
        animate="show"
        variants={stagger}
        className="flex gap-3 md:gap-4 overflow-x-scroll no-scrollbar pt-2"
      >
        {movies.map((movie) => (
          <motion.div key={movie.id} variants={fadeUp} className="shrink-0">
            <MovieCardHud
              id={movie.id}
              posterPath={movie.poster_path}
              title={movie.title || movie.name}
              mediaType={movie.media_type || mediaType}
              genreIds={movie.genre_ids}
              releaseYear={getReleaseYear(movie)}
              voteAverage={movie.vote_average}
              genreMap={genreMap}
            />
          </motion.div>
        ))}
      </motion.div>

      <button
        className="hidden md:flex items-center justify-center absolute right-2 top-[58%] -translate-y-1/2 hud-panel text-hud-cyan p-2 z-10 cursor-pointer hover:text-hud-cyan-strong transition-colors"
        onClick={() => scroll('right')}
        aria-label="Scroll similar titles right"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

export default SimilarTitlesHud
