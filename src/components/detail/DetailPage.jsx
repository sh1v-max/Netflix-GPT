import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import {
  Star,
  Sparkles,
  ChevronDown,
  FileText,
  Tv,
  Info,
  Users,
  Clapperboard,
  Layers,
} from 'lucide-react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import TrailerBox from './TrailerBox'
import SimilarTitlesHud from './SimilarTitlesHud'
import CastGrid from './CastGrid'
import { Skeleton } from '@/components/ui/skeleton'
import useMediaDetails from '../../hooks/useMediaDetails'
import useCredits from '../../hooks/useCredits'
import useSimilarTitles from '../../hooks/useSimilarTitles'
import useWatchProviders from '../../hooks/useWatchProviders'
import RatingControl from '../shared/RatingControl'
import WatchlistButton from '../shared/WatchlistButton'
import { mediaDocId } from '../../utils/firestorePaths'
import { BACKDROP_CDN_URL, IMG_CDN_URL } from '../../utils/constant'
import { EASE } from '@/lib/motion'

// Small reusable HUD section eyebrow — icon + font-mono uppercase label,
// same visual family as ConsoleHeader's own eyebrow (Database icon +
// eyebrowLabel). Used for every section heading on this page instead of
// the old plain `font-display text-lg font-semibold` headers.
const SectionEyebrow = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-3 text-accent2-strong">
    <Icon size={14} />
    <span className="font-mono text-[11px] uppercase tracking-[0.15em]">{children}</span>
  </div>
)

const OVERVIEW_TRUNCATE_LENGTH = 260
// Curated, priority-ordered job list for the Crew section — the full
// credits.crew array includes dozens of minor roles (foley, gaffer, etc.)
// that aren't useful to surface here.
const CREW_JOB_PRIORITY = [
  'Director',
  'Writer',
  'Screenplay',
  'Story',
  'Producer',
  'Director of Photography',
  'Original Music Composer',
  'Editor',
]
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
})

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
      <div className="theme-dark-scope min-h-screen bg-ink">
        <Header />
        <Skeleton className="h-[60vh] md:h-[75vh] w-full rounded-none" />
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

  const certification =
    mediaType === 'movie'
      ? details.release_dates?.results
          ?.find((r) => r.iso_3166_1 === 'US')
          ?.release_dates?.find((rd) => rd.certification)?.certification || null
      : details.content_ratings?.results?.find((r) => r.iso_3166_1 === 'US')
          ?.rating || null

  const keywords =
    (mediaType === 'movie' ? details.keywords?.keywords : details.keywords?.results) || []

  const directorNames =
    mediaType === 'movie'
      ? credits?.crew?.filter((m) => m.job === 'Director').map((m) => m.name) || []
      : []
  const creatorNames = mediaType === 'tv' ? (details.created_by || []).map((c) => c.name) : []

  const crewForGrid = (() => {
    if (!credits?.crew?.length) return []
    const byId = new Map()
    credits.crew.forEach((member) => {
      if (!CREW_JOB_PRIORITY.includes(member.job)) return
      const existing = byId.get(member.id)
      if (existing) {
        existing.job = `${existing.job}, ${member.job}`
      } else {
        byId.set(member.id, { ...member })
      }
    })
    return Array.from(byId.values())
      .sort(
        (a, b) =>
          CREW_JOB_PRIORITY.indexOf(a.job.split(',')[0].trim()) -
          CREW_JOB_PRIORITY.indexOf(b.job.split(',')[0].trim())
      )
      .slice(0, 12)
  })()

  const collection = mediaType === 'movie' ? details.belongs_to_collection : null
  const budget = mediaType === 'movie' && details.budget > 0 ? currencyFormatter.format(details.budget) : null
  const revenue = mediaType === 'movie' && details.revenue > 0 ? currencyFormatter.format(details.revenue) : null
  const hasDetailsPanel = Boolean(details.status || details.original_language || budget || revenue)

  return (
    <div className="theme-dark-scope min-h-screen bg-ink text-text-dark flex flex-col">
      <Header />

      <main className="flex-1">
      {/* Hero */}
      <div className="relative w-full h-[60vh] md:h-[75vh] bg-ink">
        {/* Backdrop — clipped to the hero's fixed height. The floating
            content below is a sibling, NOT inside this clipped box, so
            it's free to grow taller without ever being cut off. */}
        <div className="absolute inset-0 overflow-hidden">
          {details.backdrop_path && (
            <img
              src={BACKDROP_CDN_URL + details.backdrop_path}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* One strong gradient plus a light full-frame tint does the
              legibility work a bordered card used to — text sits directly
              on the image, readable regardless of how busy the photo is. */}
          <div className="absolute inset-0 bg-ink/25" />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/70 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-ink/60 via-transparent to-transparent" />
        </div>

        {/* Metadata + trailer — plain typography over the gradient, not
            boxed in a panel; a single supporting trailer card sits beside
            it rather than a second competing panel. */}
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="absolute bottom-0 left-0 right-0 p-5 md:p-10 lg:p-12 z-20"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-10">
            <div className="flex gap-4 md:gap-6 items-end min-w-0">
              {details.poster_path && (
                <motion.img
                  layoutId={`poster-${mediaType}-${id}`}
                  src={IMG_CDN_URL + details.poster_path}
                  alt=""
                  aria-hidden="true"
                  className="hidden sm:block w-24 md:w-32 rounded-lg shadow-cg-elevated border border-border-hairline shrink-0"
                />
              )}

              <div className="max-w-2xl min-w-0">
                {details.tagline && (
                  <p className="text-accent2-strong text-sm md:text-base italic mb-2">
                    {details.tagline}
                  </p>
                )}
                <h1
                  className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold mb-3 leading-[1.05]"
                  style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
                >
                  {title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-text-dark-muted mb-3">
                  {year && <span>{year}</span>}
                  {runtime && (
                    <>
                      <span>&middot;</span>
                      <span>{runtime}</span>
                    </>
                  )}
                  {certification && (
                    <>
                      <span>&middot;</span>
                      <span className="text-xs bg-white/10 rounded px-1.5 py-0.5 font-medium">
                        {certification}
                      </span>
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
                      <span className="inline-flex items-center gap-1 text-accent2-strong font-medium">
                        <Sparkles size={13} />
                        {tasteMatch}% match for you
                      </span>
                    </>
                  )}
                </div>

                {(directorNames.length > 0 || creatorNames.length > 0) && (
                  <p className="text-sm text-text-dark-muted mb-3">
                    {mediaType === 'movie' ? 'Directed by ' : 'Created by '}
                    <span className="text-text-dark font-medium">
                      {(mediaType === 'movie' ? directorNames : creatorNames).join(', ')}
                    </span>
                  </p>
                )}

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

                <div className="flex items-center gap-2">
                  <RatingControl
                    mediaType={mediaType}
                    id={id}
                    genreIds={details.genres?.map((genre) => genre.id) || []}
                    releaseYear={year ? Number(year) : null}
                    size={16}
                  />
                  <WatchlistButton mediaType={mediaType} id={id} size={16} />
                </div>
              </div>
            </div>

            <TrailerBox mediaType={mediaType} id={id} />
          </div>
        </motion.div>
      </div>

      {/* Collection banner */}
      {collection && (
        <div className="relative w-full h-20 md:h-28 overflow-hidden border-y border-border-hairline">
          {collection.backdrop_path && (
            <img
              src={BACKDROP_CDN_URL + collection.backdrop_path}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-ink/70" />
          <div className="relative max-w-5xl mx-auto px-6 md:px-12 h-full flex flex-col justify-center gap-1">
            <div className="flex items-center gap-2 text-accent2-strong">
              <Layers size={12} />
              <span className="font-mono text-[10px] uppercase tracking-[0.15em]">
                Part of Collection
              </span>
            </div>
            <p className="font-display text-sm md:text-base text-text-dark">{collection.name}</p>
          </div>
        </div>
      )}

      {/* Overview + where to watch */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-8 md:py-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <SectionEyebrow icon={FileText}>Overview</SectionEyebrow>
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
              className="mt-2 inline-flex items-center gap-1 text-accent2-strong text-sm font-medium hover:underline cursor-pointer"
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

          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {keywords.slice(0, 12).map((kw) => (
                <span
                  key={kw.id}
                  className="text-xs text-text-dark-muted bg-white/5 px-3 py-1 rounded-full"
                >
                  {kw.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="md:border-l md:border-border-hairline md:pl-8">
          <SectionEyebrow icon={Tv}>Where to Watch</SectionEyebrow>
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
                  loading="lazy"
                  className="w-10 h-10 rounded-lg border border-border-hairline"
                />
              ))}
            </motion.div>
          ) : (
            <p className="text-text-dark-muted text-sm">
              Not currently available to stream.
            </p>
          )}

          {hasDetailsPanel && (
            <div className="mt-8">
              <SectionEyebrow icon={Info}>Details</SectionEyebrow>
              <dl className="space-y-2">
                {details.status && (
                  <div className="flex justify-between gap-4 font-mono text-[11px] uppercase tracking-wide">
                    <dt className="text-text-dark-muted">Status</dt>
                    <dd className="text-accent2-strong text-right">{details.status}</dd>
                  </div>
                )}
                {details.original_language && (
                  <div className="flex justify-between gap-4 font-mono text-[11px] uppercase tracking-wide">
                    <dt className="text-text-dark-muted">Original language</dt>
                    <dd className="text-accent2-strong text-right">
                      {details.original_language}
                    </dd>
                  </div>
                )}
                {budget && (
                  <div className="flex justify-between gap-4 font-mono text-[11px] uppercase tracking-wide">
                    <dt className="text-text-dark-muted">Budget</dt>
                    <dd className="text-accent2-strong text-right">{budget}</dd>
                  </div>
                )}
                {revenue && (
                  <div className="flex justify-between gap-4 font-mono text-[11px] uppercase tracking-wide">
                    <dt className="text-text-dark-muted">Revenue</dt>
                    <dd className="text-accent2-strong text-right">{revenue}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Cast */}
      {credits?.cast?.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 md:px-12 pb-8 md:pb-12">
          <SectionEyebrow icon={Users}>Cast</SectionEyebrow>
          <CastGrid cast={credits.cast} />
        </div>
      )}

      {/* Crew */}
      {crewForGrid.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 md:px-12 pb-8 md:pb-12">
          <SectionEyebrow icon={Clapperboard}>Crew</SectionEyebrow>
          <CastGrid cast={crewForGrid} getSubtitle={(member) => member.job} />
        </div>
      )}

      {/* Similar titles */}
      <SimilarTitlesHud movies={similar} mediaType={mediaType} />
      </main>

      <Footer />
    </div>
  )
}

export default DetailPage
