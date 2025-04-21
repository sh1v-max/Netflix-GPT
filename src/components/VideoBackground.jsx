import React, { useEffect } from 'react'
import { API_OPTIONS } from '../utils/constant'

export const VideoBackground = ({ movieId }) => {
  console.log(movieId)
  //  fetch trailer video

  const getMovieVideos = async () => {
    const data = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`,
      API_OPTIONS
    )
    const json = await data.json()
    console.log(json)
    // Filter for trailer type
    const filterData = json.results.filter((video) => video.type === 'Trailer')
    // if no trailer found
    const trailer = filterData.length ? filterData[0] : json.results[0]
    console.log(trailer)
  }

  useEffect(() => {
    getMovieVideos()
  }, [])

  return <div>VideoBackground</div>
}

export default VideoBackground
