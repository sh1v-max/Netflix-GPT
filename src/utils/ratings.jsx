import { setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { ratingDoc } from './firestorePaths'

// The UI layer decides whether to add/switch or remove a rating (it
// already has the current value live via preferencesSlice), these two
// stay simple and unconditional.
export const addRating = (uid, mediaType, mediaId, rating, genreIds = [], releaseYear = null) =>
  setDoc(ratingDoc(uid, mediaType, mediaId), {
    mediaType,
    mediaId,
    rating,
    genreIds,
    releaseYear,
    addedAt: serverTimestamp(),
  })

export const removeRating = (uid, mediaType, mediaId) =>
  deleteDoc(ratingDoc(uid, mediaType, mediaId))
