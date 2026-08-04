import React, { useEffect, useState } from 'react'
import VideoTitle from './VideoTitle'
import VideoBackground from './VideoBackground'
import { Skeleton } from '@/components/ui/skeleton'

const MainContainer = ({ movies, mediaType = 'movie' }) => {
  // Pick a random hero once, the moment the list first arrives — not on
  // every render (that was the old bug: recomputing Math.random() directly
  // in the render body reshuffled the hero on any unrelated state change
  // elsewhere in the app). Once picked, it stays put for the session.
  const [heroIndex, setHeroIndex] = useState(null)

  useEffect(() => {
    if (movies && heroIndex === null) {
      setHeroIndex(Math.floor(Math.random() * movies.length))
    }
  }, [movies, heroIndex])

  if (!movies || heroIndex === null) {
    return <Skeleton className="relative w-full h-87.5 md:h-screen rounded-none" />
  }

  const mainMovie = movies[heroIndex]

  const { title, name, overview, id, genre_ids, vote_average } = mainMovie

  return (
    <div className="relative w-full h-full">
      <VideoTitle
        id={id}
        mediaType={mediaType}
        title={title || name}
        overview={overview}
        genreIds={genre_ids}
        voteAverage={vote_average}
      />
      <VideoBackground movieId={id} mediaType={mediaType} />
    </div>
  )
}

export default MainContainer