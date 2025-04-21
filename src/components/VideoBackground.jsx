import React, { useEffect, useState } from 'react'
import { API_OPTIONS } from '../utils/constant'

export const VideoBackground = ({ movieId }) => {
  const [trailerKey, setTrailerKey] = useState(null)
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
    if (trailer) {
      setTrailerKey(trailer.key)
    }
    console.log(trailer)
  }

  useEffect(() => {
    getMovieVideos()
  }, [])

  return (
    <div>
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${trailerKey}?si=PNj9WG1WzL7MyUGN`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>
  )
}

export default VideoBackground
