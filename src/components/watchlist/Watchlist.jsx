import React from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { Bookmark } from 'lucide-react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import MovieCard from '../shared/MovieCard'
import { Skeleton } from '@/components/ui/skeleton'
import useWatchlistDetails from '../../hooks/useWatchlistDetails'
import { EASE } from '@/lib/motion'

const Watchlist = () => {
  const watchlist = useSelector((store) => store.preferences.watchlist)
  const { items, isLoading } = useWatchlistDetails(watchlist)

  return (
    <div className="min-h-screen bg-ink text-text-dark flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="pt-20 md:pt-28 pb-12 px-4 md:px-8">
          <h1 className="font-display text-2xl md:text-4xl font-semibold mb-2">
            My Watchlist
          </h1>
          <p className="text-text-dark-muted text-sm md:text-base mb-8">
            Everything you've bookmarked to watch later.
          </p>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-2/3 w-full rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col items-center text-center py-16 md:py-24"
            >
              <div className="mb-4 rounded-full bg-ink-elevated border border-border-hairline p-4 text-accent2">
                <Bookmark size={28} />
              </div>
              <h3 className="font-display text-lg md:text-xl font-semibold mb-2">
                Nothing saved yet
              </h3>
              <p className="text-text-dark-muted text-sm max-w-sm">
                Tap the bookmark icon on any poster or detail page to save
                it here for later.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.03 } } }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
            >
              {items.map((item) => (
                <motion.div
                  key={`${item.media_type}-${item.id}`}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <MovieCard
                    id={item.id}
                    posterPath={item.poster_path}
                    title={item.title || item.name}
                    mediaType={item.media_type}
                    genreIds={item.genre_ids}
                    fill
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Watchlist
