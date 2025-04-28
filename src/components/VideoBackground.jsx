import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import useMovieTrailer from '../hooks/useMovieTrailer'
import { BsFillVolumeUpFill, BsFillVolumeMuteFill } from 'react-icons/bs'
import { IMG_BACKGROUND } from '../utils/constant'

export const VideoBackground = ({ movieId }) => {
  const trailerVideo = useSelector((store) => store.movies?.trailerVideo)
  useMovieTrailer(movieId)

  const [isMuted, setIsMuted] = useState(true) // State to control volume (muted or not)

  if (!trailerVideo) return null

  // Toggle mute state
  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  return (
    <div className='relative w-screen h-full bg-black overflow-hidden -z-30'>
      <iframe
      className='w-full h-full md:h-screen aspect-video scale-[1.2] md:scale-[1.8] lg:scale-[1.2]'
        src={`https://www.youtube.com/embed/${
          trailerVideo?.key
        }?autoplay=1&mute=${isMuted ? 1 : 0}&showinfo=0&rel=0&loop=1&playlist=${
          trailerVideo?.key
        }`}
        title="Movie Trailer"
        allow="autoplay; fullscreen"
      ></iframe>
    </div>
  )
}

export default VideoBackground
