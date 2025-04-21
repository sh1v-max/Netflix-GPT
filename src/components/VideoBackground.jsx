import React from 'react'

export const VideoBackground = ({movieId}) => {
  console.log(movieId)
  //  fetch trailer video

  const getMovieVideos = async () => {
    const data = await fetch('https://api.themoviedb.org/3/movie/1197306/videos?language=en-US', options)

  }
  
  return (
    <div>VideoBackground</div>
  )
}

export default VideoBackground 