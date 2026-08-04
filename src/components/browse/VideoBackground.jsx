import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import useTrailer from '../../hooks/useTrailer'
import { Volume2, VolumeX } from 'lucide-react'

export const VideoBackground = ({ movieId, mediaType = 'movie' }) => {
  const trailerVideo = useSelector((store) =>
    mediaType === 'tv' ? store.tv?.trailerVideo : store.movies?.trailerVideo
  )
  useTrailer(mediaType, movieId)

  const [isMuted, setIsMuted] = useState(true) // State to control volume (muted or not)

  if (!trailerVideo) return null

  // Toggle mute state
  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  return (
    <div className="relative w-screen h-87.5 md:h-full bg-ink overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-ink to-transparent z-10"></div>
      <div className="absolute inset-0 bg-linear-to-t from-ink via-transparent to-transparent z-10"></div>
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
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'}
          className="absolute right-3 bottom-20 md:right-10 md:bottom-37 bg-surface-glass backdrop-blur-[--blur-cg-glass] border border-border-hairline text-text-dark p-2 md:p-3 rounded-full shadow-lg cursor-pointer focus:outline-none hover:bg-ink-elevated/70 z-20"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 md:h-6 md:w-6" />
          ) : (
            <Volume2 className="h-4 w-4 md:h-6 md:w-6" />
          )}
        </motion.button>
      </div>
    </div>
  )
}

export default VideoBackground
