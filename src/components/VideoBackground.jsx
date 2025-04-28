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
    <div className="relative w-screen h-[350px] md:h-full bg-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
      <iframe
        className="w-full h-full md:h-screen aspect-video scale-[1.2] md:scale-[1.8] xl:scale-[1.2] pointer-events-none -z-20"
        src={`https://www.youtube.com/embed/${
          trailerVideo?.key
        }?autoplay=1&mute=${isMuted ? 1 : 0}&showinfo=0&rel=0&loop=1&playlist=${
          trailerVideo?.key
        }`}
        title="Movie Trailer"
        allow="autoplay; fullscreen"
      ></iframe>
      {/* Volume Button */}
      <div>
        <button
          onClick={toggleMute}
          className="absolute right-3 bottom-20 md:right-10 md:bottom-10 bg-black/10 backdrop-blur-lg text-white py-2 px-2 md:px-3 md:py-3 rounded-full shadow-lg cursor-pointer focus:outline-none hover:bg-opacity-80 z-20"
        >
          {isMuted ? (
            <BsFillVolumeMuteFill className="h-3 w-3 md:h-8 md:w-8" />
          ) : (
            <BsFillVolumeUpFill className="h-3 w-3 md:h-8 md:w-8" />
          )}
        </button>
      </div>
    </div>
  )
}

export default VideoBackground
