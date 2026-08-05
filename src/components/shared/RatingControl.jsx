import React from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { addRating, removeRating } from '../../utils/ratings'
import { mediaDocId } from '../../utils/firestorePaths'

// Reused on MovieCard's hover overlay and on the detail page — reads the
// current rating live from preferencesSlice (synced via usePreferencesSync)
// and writes straight to Firestore on click. No Redux dispatch here: the
// onSnapshot listener is what updates the store, so every instance of this
// control anywhere in the app reflects a change instantly.
const RatingControl = ({ mediaType, id, genreIds = [], releaseYear = null, size = 14 }) => {
  const user = useSelector((store) => store.user)
  const docId = mediaDocId(mediaType, id)
  const currentRating = useSelector((store) => store.preferences.ratings[docId])

  if (!user) return null

  const handleClick = (e, rating) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentRating === rating) {
      removeRating(user.uid, mediaType, id)
    } else {
      addRating(user.uid, mediaType, id, rating, genreIds, releaseYear)
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <motion.button
        onClick={(e) => handleClick(e, 'like')}
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        aria-label={currentRating === 'like' ? 'Remove like' : 'Like'}
        className={`rounded-full p-1.5 shadow-cg-elevated cursor-pointer transition-colors ${
          currentRating === 'like'
            ? 'bg-accent text-on-accent'
            : 'bg-ink-elevated/70 text-text-dark hover:bg-ink-elevated'
        }`}
      >
        <ThumbsUp size={size} />
      </motion.button>
      <motion.button
        onClick={(e) => handleClick(e, 'dislike')}
        whileTap={{ scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        aria-label={currentRating === 'dislike' ? 'Remove dislike' : 'Dislike'}
        className={`rounded-full p-1.5 shadow-cg-elevated cursor-pointer transition-colors ${
          currentRating === 'dislike'
            ? 'bg-rust text-text-dark'
            : 'bg-ink-elevated/70 text-text-dark hover:bg-ink-elevated'
        }`}
      >
        <ThumbsDown size={size} />
      </motion.button>
    </div>
  )
}

export default RatingControl
