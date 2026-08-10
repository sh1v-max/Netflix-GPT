import { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import useTrailer from '../../hooks/useTrailer'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

// Renders nothing until a trailer is confirmed present — same convention
// as the Collection line / Details list / Crew section elsewhere on this
// page: optional supplementary content that just appears once ready, no
// reserved loading slot.
//
// A small circular icon button, same size/weight as RatingControl's and
// WatchlistButton's — sits in the hero's action row rather than being its
// own card/panel. Two earlier versions (a live ambient-loop iframe, then a
// static thumbnail card) both added a second visual block competing with
// the title for attention; a minimal page doesn't need a dedicated trailer
// panel, just an entry point into the same real, full-featured player.
const TrailerBox = ({ mediaType, id, className = '' }) => {
  useTrailer(mediaType, id)
  const trailerVideo = useSelector((store) =>
    mediaType === 'tv' ? store.tv?.trailerVideo : store.movies?.trailerVideo
  )
  const [isTheaterOpen, setIsTheaterOpen] = useState(false)

  if (!trailerVideo?.key) return null

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsTheaterOpen(true)}
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        aria-label="Watch trailer"
        className={`rounded-full p-1.5 shadow-cg-elevated cursor-pointer transition-colors bg-ink-elevated/70 text-hud-cyan hover:bg-ink-elevated hover:text-hud-cyan-strong ${className}`}
      >
        <Play size={16} fill="currentColor" />
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
