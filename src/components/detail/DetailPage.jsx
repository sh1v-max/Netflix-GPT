import React, { useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import {
  Star,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { smoothScrollBy } from '../../utils/smoothScrollBy'
import { EASE } from '@/lib/motion'
import SectionEyebrow from '../shared/SectionEyebrow'

// Prev/next scroll buttons for a horizontal-scroll row (Cast/Crew), placed
// in the section header instead of a "More" toggle.
const RowNavButtons = ({ scrollRef }) => {
  const scroll = (direction) => {
    smoothScrollBy(scrollRef.current, direction === 'left' ? -400 : 400)
  }
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="p-1 text-text-dark-muted hover:text-hud-cyan-strong cursor-pointer transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="p-1 text-text-dark-muted hover:text-hud-cyan-strong cursor-pointer transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// "145 min" → "2h 25m" — matches how runtime reads on a real ticket/listing
// instead of a raw minute count.
const formatRuntime = (mins) => {
  if (!mins) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

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
  const castScrollRef = useRef(null)
  const crewScrollRef = useRef(null)

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
        <Skeleton className="h-dvh w-full rounded-none" />
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
      ? formatRuntime(details.runtime)
      : details.number_of_seasons
      ? `${details.number_of_seasons} season${details.number_of_seasons > 1 ? 's' : ''}`
      : null
  const language = details.original_language ? details.original_language.toUpperCase() : null

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
    return Array.from(byId.values()).sort(
      (a, b) =>
        CREW_JOB_PRIORITY.indexOf(a.job.split(',')[0].trim()) -
        CREW_JOB_PRIORITY.indexOf(b.job.split(',')[0].trim())
    )
  })()

  const collection = mediaType === 'movie' ? details.belongs_to_collection : null
  const budget = mediaType === 'movie' && details.budget > 0 ? currencyFormatter.format(details.budget) : null
  const revenue = mediaType === 'movie' && details.revenue > 0 ? currencyFormatter.format(details.revenue) : null
  const hasDetailsPanel = Boolean(details.status || details.original_language || budget || revenue)

  return (
    <div className="theme-dark-scope min-h-screen bg-ink text-text-dark isolate">
      <div className="relative z-10 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
      {/* Hero — no boxed panel. Title and metadata sit directly on the
          backdrop, readable via a local bottom gradient + text-shadow,
          the way a minimal cinematic hero should read. Backdrop scrolls
          away with the rest of the page (not `fixed`), so it moves up
          along with everything else instead of staying pinned. */}
      <div className="relative w-full h-dvh flex items-end overflow-hidden">
        {details.backdrop_path && (
          <img
            src={BACKDROP_CDN_URL + details.backdrop_path}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-ink/10" />
        <div className="absolute inset-0 bg-linear-to-t from-ink/95 via-ink/25 to-transparent pointer-events-none" />

        <nav
          aria-label="Breadcrumb"
          className="absolute top-0 left-0 right-0 z-10 pt-20 md:pt-24 px-6 md:px-12 lg:px-16 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-text-dark-muted"
        >
          <Link to="/home" className="hover:text-hud-cyan-strong transition-colors">
            Cinegraph
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link
            to={mediaType === 'tv' ? '/shows' : '/movies'}
            className="hover:text-hud-cyan-strong transition-colors"
          >
            {mediaType === 'tv' ? 'TV Shows' : 'Movies'}
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-hud-cyan-strong truncate max-w-[40vw]">{title}</span>
        </nav>

        {/* Centered over the backdrop, like a video player's own play
            affordance, rather than a small icon tucked into the action row.
            `pointer-events-none` on the full-size wrapper (it would
            otherwise sit on top of the entire hero, including the poster
            and action row) + `pointer-events-auto` on the button itself. */}
        <div className="absolute inset-0 flex items-center justify-center pb-24 md:pb-28 z-10 pointer-events-none">
          <TrailerBox mediaType={mediaType} id={id} className="pointer-events-auto" />
        </div>

        <motion.div
          key={id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative z-10 w-full px-6 md:px-12 lg:px-16 pb-14 md:pb-20"
        >
          <div className="max-w-6xl mx-auto flex gap-5 md:gap-8 items-end">
            {details.poster_path && (
              <motion.img
                layoutId={`poster-${mediaType}-${id}`}
                src={IMG_CDN_URL + details.poster_path}
                alt=""
                aria-hidden="true"
                className="hidden sm:block w-28 md:w-36 rounded-md shadow-2xl shrink-0"
              />
            )}

            <div className="max-w-2xl min-w-0">
              {details.tagline && (
                <p className="text-hud-cyan-strong text-sm md:text-base italic mb-2">
                  {details.tagline}
                </p>
              )}
              <h1
                className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold mb-4 leading-[1.05]"
                style={{ textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}
              >
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-sm text-text-dark-muted mb-2">
                {year && <span>{year}</span>}
                {runtime && (
                  <>
                    <span>&middot;</span>
                    <span>{runtime}</span>
                  </>
                )}
                {language && (
                  <>
                    <span>&middot;</span>
                    <span>{language}</span>
                  </>
                )}
                {certification && (
                  <>
                    <span>&middot;</span>
                    <span>[{certification}]</span>
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
                    <span className="inline-flex items-center gap-1 text-hud-cyan-strong font-medium">
                      <Sparkles size={13} />
                      {tasteMatch}% match
                    </span>
                  </>
                )}
              </div>

              {(directorNames.length > 0 || creatorNames.length > 0) && (
                <p className="text-sm text-text-dark-muted mb-1">
                  {mediaType === 'movie' ? 'Directed by ' : 'Created by '}
                  <span className="text-text-dark">
                    {(mediaType === 'movie' ? directorNames : creatorNames).join(', ')}
                  </span>
                </p>
              )}

              {details.genres?.length > 0 && (
                <p className="text-sm text-text-dark-muted mb-5">
                  {details.genres.map((genre) => genre.name).join(' · ')}
                </p>
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
        </motion.div>
      </div>

      {/* Everything below the hero sits on a plain, opaque surface — the
          backdrop photo is a hero device, not full-page wallpaper; reading
          the rest of the record works better on a clean, quiet ground. */}
      <div className="relative bg-ink">
        {collection && (
          <div className="max-w-5xl mx-auto px-6 md:px-12 pt-8 md:pt-10 flex items-center gap-2 text-sm text-text-dark-muted">
            <Layers size={13} className="text-hud-cyan shrink-0" />
            <span>
              Part of <span className="text-hud-cyan-strong">{collection.name}</span>
            </span>
          </div>
        )}

        {/* Overview + where to watch */}
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-14 grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <SectionEyebrow icon={FileText}>Overview</SectionEyebrow>
            <p
              className={`text-text-dark-muted text-sm md:text-base leading-relaxed text-justify transition-all duration-300 ${
                overviewIsLong && !overviewExpanded ? 'line-clamp-4' : ''
              }`}
            >
              {overview}
            </p>
            {overviewIsLong && (
              <button
                onClick={() => setOverviewExpanded((v) => !v)}
                className="mt-2 inline-flex items-center gap-1 text-hud-cyan-strong text-sm font-medium hover:underline cursor-pointer"
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
              <p className="text-xs text-text-dark-muted/70 mt-4 leading-relaxed">
                {keywords.slice(0, 12).map((kw) => kw.name).join(', ')}
              </p>
            )}
          </div>

          <div className="md:border-l md:border-hud-line/20 md:pl-8">
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
                      <dd className="text-hud-cyan-strong text-right">{details.status}</dd>
                    </div>
                  )}
                  {details.original_language && (
                    <div className="flex justify-between gap-4 font-mono text-[11px] uppercase tracking-wide">
                      <dt className="text-text-dark-muted">Original language</dt>
                      <dd className="text-hud-cyan-strong text-right">
                        {details.original_language}
                      </dd>
                    </div>
                  )}
                  {budget && (
                    <div className="flex justify-between gap-4 font-mono text-[11px] uppercase tracking-wide">
                      <dt className="text-text-dark-muted">Budget</dt>
                      <dd className="text-hud-cyan-strong text-right">{budget}</dd>
                    </div>
                  )}
                  {revenue && (
                    <div className="flex justify-between gap-4 font-mono text-[11px] uppercase tracking-wide">
                      <dt className="text-text-dark-muted">Revenue</dt>
                      <dd className="text-hud-cyan-strong text-right">{revenue}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Cast */}
        {credits?.cast?.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 md:px-12 pb-10 md:pb-14">
            <SectionEyebrow icon={Users} action={<RowNavButtons scrollRef={castScrollRef} />}>
              Cast
            </SectionEyebrow>
            <CastGrid ref={castScrollRef} cast={credits.cast} />
          </div>
        )}

        {/* Crew */}
        {crewForGrid.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 md:px-12 pb-10 md:pb-14">
            <SectionEyebrow icon={Clapperboard} action={<RowNavButtons scrollRef={crewScrollRef} />}>
              Crew
            </SectionEyebrow>
            <CastGrid ref={crewScrollRef} cast={crewForGrid} getSubtitle={(member) => member.job} />
          </div>
        )}

        {/* Similar titles */}
        <SimilarTitlesHud movies={similar} mediaType={mediaType} />
      </div>
      </main>

      <Footer />
      </div>
    </div>
  )
}

export default DetailPage
