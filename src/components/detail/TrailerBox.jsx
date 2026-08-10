import { useState } from 'react'
import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import useTrailer from '../../hooks/useTrailer'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

// Renders nothing until a trailer is confirmed present — same convention
// as the Collection line / Details list / Crew section elsewhere on this
// page: optional supplementary content that just appears once ready, no
// reserved loading slot.
//
// A large translucent play button meant to be centered over the hero
// backdrop image (positioned by the parent via `className`) — the entry
// point into the trailer reads as "play this scene" rather than a small
// toolbar icon buried in the action row.
const TrailerBox = ({ mediaType, id, className = '' }) => {
  const trailerVideo = useTrailer(mediaType, id)
  const [isTheaterOpen, setIsTheaterOpen] = useState(false)

  if (!trailerVideo?.key) return null

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsTheaterOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        aria-label="Watch trailer"
        className={`flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/40 backdrop-blur-sm border border-white/30 text-white cursor-pointer hover:bg-black/55 transition-colors ${className}`}
      >
        <Play size={26} fill="currentColor" className="ml-1" />
      </motion.button>

      <Dialog open={isTheaterOpen} onOpenChange={setIsTheaterOpen}>
        <DialogContent className="sm:max-w-4xl w-full p-0 aspect-video overflow-hidden bg-black rounded-none border-hud-line">
          <DialogTitle className="sr-only">Trailer</DialogTitle>
          {isTheaterOpen && (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailerVideo.key}?autoplay=1&rel=0`}
              title="Trailer"
              allow="autoplay; fullscreen"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TrailerBox
