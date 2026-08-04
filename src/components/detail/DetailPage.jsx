import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'motion/react'
import { Star, Sparkles, ChevronDown } from 'lucide-react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import VideoBackground from '../browse/VideoBackground'
import MovieList from '../shared/MovieList'
import CastGrid from './CastGrid'
import { Skeleton } from '@/components/ui/skeleton'
import useMediaDetails from '../../hooks/useMediaDetails'
import useCredits from '../../hooks/useCredits'
import useSimilarTitles from '../../hooks/useSimilarTitles'
import useWatchProviders from '../../hooks/useWatchProviders'
import RatingControl from '../shared/RatingControl'
import { mediaDocId } from '../../utils/firestorePaths'
import { BACKDROP_CDN_URL, IMG_CDN_URL } from '../../utils/constant'

const EASE = [0.16, 1, 0.3, 1]
const OVERVIEW_TRUNCATE_LENGTH = 260

const DetailPage = () => {
  const { mediaType, id } = useParams()
  const details = useMediaDetails(mediaType, id)
  const credits = useCredits(mediaType, id)
  const similar = useSimilarTitles(mediaType, id)
  const watchProviders = useWatchProviders(mediaType, id)
  const [overviewExpanded, setOverviewExpanded] = useState(false)

  const currentDocId = mediaDocId(mediaType, id)
  const ratings = useSelector((store) => store.preferences.ratings)
  const ratedGenres = useSelector((store) => store.preferences.ratedGenres)

  // Taste compatibility — a real read of the user's own rating history,
  // not a fabricated number: needs at least a few other rated titles and
  // an actual genre overlap (positive or negative) with this one before
  // it renders anything at all.
  const tasteMatch = useMemo(() => {
    if (!details?.genres?.length) return null
    const likedGenreCounts = {}
    const dislikedGenreSet = new Set()
    let ratedCount = 0

    Object.entries(ratings || {}).forEach(([docId, rating]) => {
      if (docId === currentDocId) return
      ratedCount++
      const genres = ratedGenres?.[docId] || []
      if (rating === 'like') {
        genres.forEach((g) => {
          likedGenreCounts[g] = (likedGenreCounts[g] || 0) + 1
        })
      } else if (rating === 'dislike') {
        genres.forEach((g) => dislikedGenreSet.add(g))
      }
    })

    if (ratedCount < 3) return null

    const thisGenres = details.genres.map((g) => g.id)
    const likedHits = thisGenres.filter((g) => likedGenreCounts[g]).length
    const dislikedHits = thisGenres.filter((g) => dislikedGenreSet.has(g)).length
    if (likedHits === 0 && dislikedHits === 0) return null

    const raw = (likedHits - dislikedHits * 0.5) / thisGenres.length
    return Math.round(Math.min(1, Math.max(0.1, 0.5 + raw * 0.6)) * 100)
  }, [details, ratings, ratedGenres, currentDocId])

  if (!details) {
    return (
      <div className="min-h-screen bg-ink">
        <Header />
        <Skeleton className="h-[55vh] md:h-[70vh] w-full rounded-none" />
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-8 md:py-12 space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    )
  }

  const title = details.title || details.name
  const releaseDate = details.release_date || details.first_air_date
  const year = releaseDate ? releaseDate.slice(0, 4) : null
  const runtime =
    mediaType === 'movie'
      ? details.runtime
        ? `${details.runtime} min`
        : null
      : details.number_of_seasons
      ? `${details.number_of_seasons} season${details.number_of_seasons > 1 ? 's' : ''}`
      : null

  const usProviders = watchProviders?.US
  const streamProviders =
    usProviders?.flatrate || usProviders?.buy || usProviders?.rent

  const overview = details.overview || 'No overview available.'
  const overviewIsLong = overview.length > OVERVIEW_TRUNCATE_LENGTH

  return (
    <div className="min-h-screen bg-ink text-text-dark">
      <Header />

      {/* Hero */}
      <div className="relative w-full h-[55vh] md:h-[70vh] bg-ink overflow-hidden">
        {details.backdrop_path && (
          <img
            src={BACKDROP_CDN_URL + details.backdrop_path}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <VideoBackground movieId={id} mediaType={mediaType} />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/60 to-ink/10 z-20" />
        <div className="absolute inset-0 bg-linear-to-r from-ink/70 via-transparent to-transparent z-20" />

        {/* Floating metadata card */}
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-20"
        >
          <div className="max-w-4xl mx-auto md:mx-0 md:ml-8 flex gap-4 md:gap-6 items-end">
            {details.poster_path && (
              <motion.img
                layoutId={`poster-${mediaType}-${id}`}
                src={IMG_CDN_URL + details.poster_path}
                alt=""
                aria-hidden="true"
                className="hidden sm:block w-24 md:w-36 rounded-lg shadow-cg-elevated border border-border-hairline shrink-0"
              />
            )}

            <div className="bg-surface-glass backdrop-blur-[--blur-cg-glass] border border-border-hairline rounded-panel shadow-cg-elevated p-4 md:p-6 max-w-2xl">
              {details.tagline && (
                <p className="text-accent2 text-sm md:text-base italic mb-2">
                  {details.tagline}
                </p>
              )}
              <h1 className="font-display text-2xl md:text-5xl font-semibold mb-2 leading-tight">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-text-dark-muted mb-3">
                {year && <span>{year}</span>}
                {runtime && (
                  <>
                    <span>&middot;</span>
                    <span>{runtime}</span>
                  </>
                )}
                {details.vote_average > 0 && (
                  <>
                    <span>&middot;</span>
                    <span className="inline-flex items-center gap-1 text-accent-soft font-medium">
                      <Star size={13} fill="currentColor" />
                      {details.vote_average.toFixed(1)}
                    </span>
                  </>
                )}
                {tasteMatch !== null && (
                  <>
                    <span>&middot;</span>
                    <span className="inline-flex items-center gap-1 text-accent2 font-medium">
                      <Sparkles size={13} />
                      {tasteMatch}% match for you
                    </span>
                  </>
                )}
              </div>

              {details.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {details.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="text-xs bg-white/10 text-text-dark px-3 py-1 rounded-full"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              <RatingControl
                mediaType={mediaType}
                id={id}
                genreIds={details.genres?.map((genre) => genre.id) || []}
                size={16}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Overview + where to watch */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-8 md:py-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="font-display text-lg font-semibold mb-3">Overview</h2>
          <p
            className={`text-text-dark-muted text-sm md:text-base leading-relaxed transition-all duration-300 ${
              overviewIsLong && !overviewExpanded ? 'line-clamp-4' : ''
            }`}
          >
            {overview}
          </p>
          {overviewIsLong && (
            <button
              onClick={() => setOverviewExpanded((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-accent2 text-sm font-medium hover:underline cursor-pointer"
            >
              {overviewExpanded ? 'Show less' : 'Read more'}
              <motion.span
                animate={{ rotate: overviewExpanded ? 180 : 0 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                <ChevronDown size={14} />
              </motion.span>
            </button>
          )}
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold mb-3">
            Where to watch
          </h2>
          {streamProviders?.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.04 } } }}
              className="flex flex-wrap gap-3"
            >
              {streamProviders.map((provider) => (
                <motion.img
                  key={provider.provider_id}
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -3 }}
                  src={IMG_CDN_URL + provider.logo_path}
                  alt={provider.provider_name}
                  title={provider.provider_name}
                  className="w-10 h-10 rounded-lg border border-border-hairline"
                />
              ))}
            </motion.div>
          ) : (
            <p className="text-text-dark-muted text-sm">
              Not currently available to stream.
            </p>
          )}
        </div>
      </div>

      {/* Cast */}
      {credits?.cast?.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 md:px-12 pb-8 md:pb-12">
          <h2 className="font-display text-lg font-semibold mb-4">Cast</h2>
          <CastGrid cast={credits.cast} />
        </div>
      )}

      {/* Similar titles */}
      {similar?.length > 0 && (
        <div className="pb-12">
          <MovieList title="More Like This" movies={similar} mediaType={mediaType} />
        </div>
      )}

      <Footer />
    </div>
  )
}

export default DetailPage
