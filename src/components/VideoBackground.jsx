import React, { useEffect } from 'react'
import { API_OPTIONS } from '../utils/constant'

export const VideoBackground = ({ movieId }) => {
  console.log(movieId)
  //  fetch trailer video

  const getMovieVideos = async () => {
    const data = await fetch(
      'https://api.themoviedb.org/3/movie/1197306/videos?language=en-US',
      API_OPTIONS
    )
    const json = await data.json()
    console.log(json)
    // Filter for trailer type
    const trailers = json.results.filter((video) => video.type === 'Trailer')
    console.log(trailers)
  }

  useEffect(() => {
    getMovieVideos()
  }, [])

  return <div>VideoBackground</div>
}

export default VideoBackground
