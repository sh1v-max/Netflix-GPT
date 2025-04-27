import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import useMovieTrailer from '../hooks/useMovieTrailer'
import { BsFillVolumeUpFill, BsFillVolumeMuteFill } from 'react-icons/bs'

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
    <div className="relative w-full h-full overflow-hidden bg-black z-10">
      {/* Video Background */}
      <iframe
        className="md:w-full md:h-full w-[100%] h-[35%] absolute top-0 left-0 md:scale-[1.5] pointer-events-none" // Disable iframe pointer events to allow button interaction
        src={`https://www.youtube.com/embed/${
          trailerVideo?.key
        }?autoplay=1&mute=${isMuted ? 1 : 0}&showinfo=0&rel=0&loop=1&playlist=${
          trailerVideo?.key
        }`}
        title="Movie Trailer"
        allow="autoplay; fullscreen"
      ></iframe>

      {/* Volume Button */}
      <button
        onClick={toggleMute}
        className="absolute bottom-[50%] right-8 bg-white text-black py-2 px-4 rounded-full shadow-lg cursor-pointer hover:bg-opacity-80 z-100"
      >
        {isMuted ? (
        <BsFillVolumeUpFill className="h-5 w-5 md:h-6 md:w-6" />
      ) : (
        <BsFillVolumeMuteFill className="h-5 w-5 md:h-6 md:w-6" />
      )}
      </button>
    </div>
  )
}

export default VideoBackground
