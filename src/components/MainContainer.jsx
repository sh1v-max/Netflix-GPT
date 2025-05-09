import React from 'react'
import { useSelector } from 'react-redux'
import VideoTitle from './VideoTitle'
import VideoBackground from './VideoBackground'

const MainContainer = () => {
  const movies = useSelector(store => store.movies?.nowPlayingMovies);
  if (!movies) return;
  const randomIndex = Math.floor(Math.random() * movies.length);
  const mainMovie = movies[randomIndex];

  const {title, overview, id} = mainMovie
  
  return (
    <div className="relative w-full h-full">
      <VideoTitle title = {title} overview = {overview}/>
      <VideoBackground movieId={id}/>
    </div>
  )
}

export default MainContainer