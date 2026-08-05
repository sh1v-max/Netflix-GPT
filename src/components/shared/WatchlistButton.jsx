import React from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { Bookmark } from 'lucide-react'
import { addToWatchlist, removeFromWatchlist } from '../../utils/watchlist'
import { mediaDocId } from '../../utils/firestorePaths'

// Mirrors RatingControl's pattern exactly: reads the current saved-state
// live from preferencesSlice (synced via usePreferencesSync) and writes
// straight to Firestore on click — no Redux dispatch here, the onSnapshot
// listener is what updates the store, so every instance anywhere in the
// app reflects a change instantly. Uses the brand accent (not a signal
// color) since "saved for later" isn't a taste signal like/dislike are.
const WatchlistButton = ({ mediaType, id, size = 14 }) => {
  const user = useSelector((store) => store.user)
  const docId = mediaDocId(mediaType, id)
  const isSaved = useSelector((store) => Boolean(store.preferences.watchlist[docId]))

  if (!user) return null

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSaved) {
      removeFromWatchlist(user.uid, mediaType, id)
    } else {
      addToWatchlist(user.uid, mediaType, id)
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      aria-label={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
      className={`rounded-full p-1.5 shadow-cg-elevated cursor-pointer transition-colors ${
        isSaved
          ? 'bg-accent2 text-white'
          : 'bg-ink-elevated/70 text-text-dark hover:bg-ink-elevated'
      }`}
    >
      <Bookmark size={size} fill={isSaved ? 'currentColor' : 'none'} />
    </motion.button>
  )
}

export default WatchlistButton
