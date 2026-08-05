import { setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { watchlistDoc } from './firestorePaths'

// Mirrors ratings.jsx's shape exactly — unconditional add/remove, the UI
// layer decides which to call since it already has the current
// saved-state live via preferencesSlice.
export const addToWatchlist = (uid, mediaType, mediaId) =>
  setDoc(watchlistDoc(uid, mediaType, mediaId), {
    mediaType,
    mediaId,
    addedAt: serverTimestamp(),
  })

export const removeFromWatchlist = (uid, mediaType, mediaId) =>
  deleteDoc(watchlistDoc(uid, mediaType, mediaId))
