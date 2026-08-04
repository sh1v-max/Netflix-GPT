import React from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { Compass, AlertCircle } from 'lucide-react'
import MovieList from '../shared/MovieList'
import { Skeleton } from '@/components/ui/skeleton'
import ThinkingDots from './ThinkingDots'

const EASE = [0.16, 1, 0.3, 1]

const ThinkingRow = () => (
  <div className="px-4 md:px-[10%] pt-4">
    <div className="flex items-center gap-2 text-accent2 text-sm font-medium mb-4">
      <ThinkingDots />
      Cinegraph is thinking...
    </div>
    <div className="flex gap-2 md:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="w-24 md:w-48 aspect-2/3 shrink-0 rounded-lg" />
      ))}
    </div>
  </div>
)

const GptMovieSuggestions = ({ isSearching, error }) => {
  const { movieResults, movieNames } = useSelector((store) => store.gpt)

  if (isSearching) return <ThinkingRow />

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-col items-center text-center h-[40vh] justify-center px-4"
      >
        <div className="mb-4 rounded-full bg-ink-elevated border border-border-hairline p-4 text-rust">
          <AlertCircle size={28} />
        </div>
        <p className="text-text-dark text-sm md:text-base max-w-md">{error}</p>
      </motion.div>
    )
  }

  if (!movieNames) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="h-[45vh] flex flex-col items-center justify-center px-4 text-center"
      >
        <div className="mb-4 rounded-full bg-ink-elevated border border-border-hairline p-4 text-accent2">
          <Compass size={28} />
        </div>
        <p className="text-text-dark-muted text-sm md:text-lg max-w-md">
          Describe a mood, a plot, or a title you loved — Cinegraph's AI
          finds real matches, not just what's trending.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="w-full h-full px-1 pt-4 pb-10 md:px-[10%]"
    >
      {movieNames.map((movieName, index) => (
        <motion.div
          key={movieName}
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <MovieList
            title={index === 0 ? `${movieName} — your best match` : movieName}
            movies={movieResults[index]}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default GptMovieSuggestions
