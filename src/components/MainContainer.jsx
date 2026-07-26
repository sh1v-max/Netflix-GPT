import React from 'react'
import VideoTitle from './VideoTitle'
import VideoBackground from './VideoBackground'

const MainContainer = ({ movies, mediaType = 'movie' }) => {
  if (!movies) {
    return (
      <div className="relative w-full h-[350px] md:h-screen bg-black animate-pulse" />
    )
  }

  const randomIndex = Math.floor(Math.random() * movies.length);
  const mainMovie = movies[randomIndex];

  const { title, name, overview, id } = mainMovie

  return (
    <div className="relative w-full h-full">
      <VideoTitle title={title || name} overview={overview} />
      <VideoBackground movieId={id} mediaType={mediaType} />
    </div>
  )
}

export default MainContainer