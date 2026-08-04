import { useRef } from 'react';
import { motion } from 'motion/react'
import MovieCard from './MovieCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EASE } from '@/lib/motion'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

const MovieList = ({ title, movies, mediaType = 'movie' }) => {
  const scrollRef = useRef(null);
  if (!movies || movies.length === 0) return null
  // console.log(movies)

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = 850;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      if (container.scrollLeft <= 0) container.scrollLeft = maxScroll;
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth)
        container.scrollLeft = 0;
    }
  };
  
  return (
    <div className="relative px-6 mb-6 md:mb-12">
      <h1 className="font-display text-sm md:text-3xl py-1 md:py-4 text-text-dark font-semibold">{title}</h1>

      <button
        className="hidden md:block absolute left-0 top-[59%] -translate-y-1/2 bg-surface-glass hover:bg-ink-elevated text-text-dark p-3 rounded-full z-50 transition duration-300 backdrop-blur-[--blur-cg-glass] border border-border-hairline shadow-cg-elevated cursor-pointer"
        onClick={() => scroll("left")}
        aria-label={`Scroll ${title} left`}
      >
        <ChevronLeft size={18} />
      </button>

      <motion.div
        ref={scrollRef}
        initial="hidden"
        animate="show"
        variants={stagger}
        className="flex overflow-x-scroll no-scrollbar scroll-smooth"
      >
        <div className="flex gap-2 md:gap-4">
          {movies.map((movie) => (
            <motion.div key={movie.id} variants={fadeUp}>
              <MovieCard
                id={movie.id}
                posterPath={movie.poster_path}
                title={movie.title || movie.name}
                mediaType={movie.media_type || mediaType}
                genreIds={movie.genre_ids}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <button
        className="hidden md:block absolute right-0 top-[55%] -translate-y-1/2 bg-surface-glass hover:bg-ink-elevated text-text-dark p-3 rounded-full z-50 transition duration-300 backdrop-blur-[--blur-cg-glass] border border-border-hairline shadow-cg-elevated cursor-pointer"
        onClick={() => scroll("right")}
        aria-label={`Scroll ${title} right`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default MovieList
