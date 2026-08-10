import { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import useTrailer from '../../hooks/useTrailer'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

// Renders nothing until a trailer is confirmed present — same convention
// as the Collection banner / Details panel / Crew section elsewhere on
// this page: optional supplementary content that just appears once ready,
// no reserved loading slot.
//
// The preview is a plain thumbnail image, not a live iframe — an earlier
// version tried a muted/looped "chrome-less" embed here, but YouTube's own
// UI (title card, channel logo, prev/next) isn't reliably suppressable
// once you're using the loop-via-playlist trick, and it read as cluttered.
// A static `<img>` has zero chrome by construction — there's no iframe at
// all until the user actually clicks through to the theater modal, which
// still uses YouTube's normal, full-featured player.
//
// This is meant to sit inside DetailPage's outer HudFrame panel — no
// corner brackets of its own here (that would double up on the parent's),
// just a plain `hud-panel` (bg-elevated + hairline cyan border) rectangle.
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
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`hud-panel group relative shrink-0 w-full sm:w-64 md:w-72 aspect-video overflow-hidden cursor-pointer ${className}`}
        aria-label="Watch trailer"
      >
        <img
          src={`https://img.youtube.com/vi/${trailerVideo.key}/hqdefault.jpg`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/45 group-hover:from-black/80 group-hover:to-black/55 transition-colors" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="flex items-center justify-center w-14 h-14 rounded-full hud-panel border-hud-cyan text-hud-cyan-strong shadow-[0_0_30px_var(--color-hud-cyan-glow)] group-hover:scale-110 transition-transform duration-200">
            <Play size={20} fill="currentColor" className="ml-0.5" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-hud-cyan-strong">
            Watch Trailer
          </span>
        </div>
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
