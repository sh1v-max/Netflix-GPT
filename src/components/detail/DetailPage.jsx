import React from 'react'
import { useParams } from 'react-router-dom'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import VideoBackground from '../browse/VideoBackground'
import MovieList from '../shared/MovieList'
import CastGrid from './CastGrid'
import useMediaDetails from '../../hooks/useMediaDetails'
import useCredits from '../../hooks/useCredits'
import useSimilarTitles from '../../hooks/useSimilarTitles'
import useWatchProviders from '../../hooks/useWatchProviders'
import RatingControl from '../shared/RatingControl'
import { BACKDROP_CDN_URL, IMG_CDN_URL } from '../../utils/constant'

const DetailPage = () => {
  const { mediaType, id } = useParams()
  const details = useMediaDetails(mediaType, id)
  const credits = useCredits(mediaType, id)
  const similar = useSimilarTitles(mediaType, id)
  const watchProviders = useWatchProviders(mediaType, id)

  if (!details) {
    return (
      <div className="min-h-screen bg-ink">
        <Header />
        <div className="h-[55vh] md:h-[70vh] bg-ink-elevated animate-pulse" />
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
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10 z-20" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-3xl z-20">
          <h1 className="font-display text-2xl md:text-5xl font-semibold mb-2 drop-shadow-lg">
            {title}
          </h1>
          {details.tagline && (
            <p className="text-accent text-sm md:text-base italic mb-3">
              {details.tagline}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-text-dark-muted mb-4">
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
                <span className="text-accent font-medium">
                  ★ {details.vote_average.toFixed(1)}
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

      {/* Overview + where to watch */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-8 md:py-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="font-display text-lg font-semibold mb-3">Overview</h2>
          <p className="text-text-dark-muted text-sm md:text-base leading-relaxed">
            {details.overview || 'No overview available.'}
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold mb-3">
            Where to watch
          </h2>
          {streamProviders?.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {streamProviders.map((provider) => (
                <img
                  key={provider.provider_id}
                  src={IMG_CDN_URL + provider.logo_path}
                  alt={provider.provider_name}
                  title={provider.provider_name}
                  className="w-10 h-10 rounded-[--radius-card]"
                />
              ))}
            </div>
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
