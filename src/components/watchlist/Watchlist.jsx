import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { Bookmark, ChevronRight } from 'lucide-react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import MovieCardHud from '../movies/MovieCardHud'
import { Skeleton } from '@/components/ui/skeleton'
import useWatchlistDetails from '../../hooks/useWatchlistDetails'
import useGenres from '../../hooks/useGenres'
import { getReleaseYear } from '../../utils/constant'
import { EASE } from '@/lib/motion'

const Watchlist = () => {
  const watchlist = useSelector((store) => store.preferences.watchlist)
  const { items, isLoading } = useWatchlistDetails(watchlist)
  // Watchlist mixes movies and tv, so a single mediaType genre map isn't
  // enough — merge both (tv's ids override on overlap, an acceptable
  // simplification for a small badge, not a primary data point).
  const movieGenres = useGenres('movie')
  const tvGenres = useGenres('tv')
  const genreMap = Object.fromEntries(
    [...(movieGenres || []), ...(tvGenres || [])].map((g) => [g.id, g.name])
  )

  return (
    <div className="theme-dark-scope min-h-screen bg-ink text-text-dark flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto pt-24 md:pt-28 pb-12 px-4 md:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 mb-6 font-mono text-[11px] uppercase tracking-wide text-text-dark-muted"
          >
            <Link to="/home" className="hover:text-hud-cyan-strong transition-colors">
              Cinegraph
            </Link>
            <ChevronRight size={12} className="shrink-0" />
            <span className="text-hud-cyan-strong">Watchlist</span>
          </nav>

          <div className="flex items-center gap-2 mb-1 text-hud-cyan">
            <Bookmark size={14} />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em]">
              Saved Records
            </span>
          </div>
          <div className="flex items-baseline gap-3 mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-semibold">Watchlist</h1>
            {!isLoading && (
              <span className="font-mono text-xs text-text-dark-muted">
                {items.length} title{items.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-2/3 w-full rounded-none" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col items-center text-center py-16 md:py-24"
            >
              <div className="hud-panel mb-4 p-4 text-hud-cyan">
                <Bookmark size={26} />
              </div>
              <h3 className="font-mono text-sm uppercase tracking-wide mb-2">
                No records saved
              </h3>
              <p className="text-text-dark-muted text-sm max-w-sm">
                Tap the bookmark icon on any poster or detail page to save it
                here for later.
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
                  <MovieCardHud
                    id={item.id}
                    posterPath={item.poster_path}
                    title={item.title || item.name}
                    mediaType={item.media_type}
                    genreIds={item.genre_ids}
                    releaseYear={getReleaseYear(item)}
                    voteAverage={item.vote_average}
                    genreMap={genreMap}
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
