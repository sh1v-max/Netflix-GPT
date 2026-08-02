import { collection, doc } from 'firebase/firestore'
import { db } from './firestoreConfig'

// The preference-graph data model:
//
//   users/{uid}                         profile fields, merged onto the user
//                                        doc itself: { topGenres, favoriteDecade,
//                                        avoidGenres, updatedAt }
//   users/{uid}/ratings/{mediaType_id}  { mediaType, mediaId, rating: 'like' | 'dislike',
//                                        genreIds: [...], addedAt }
//   users/{uid}/watchlist/{mediaType_id}  { mediaType, mediaId, addedAt }
//
// Every doc/collection reference Phase 2 needs goes through these helpers
// so the path structure and doc-id convention only ever live in one place.

// `${mediaType}_${mediaId}` keeps one rating/watchlist entry per title,
// addressable directly (no query needed to check "have I rated this?").
export const mediaDocId = (mediaType, mediaId) => `${mediaType}_${mediaId}`

export const userDoc = (uid) => doc(db, 'users', uid)

export const ratingsCollection = (uid) => collection(db, 'users', uid, 'ratings')

export const ratingDoc = (uid, mediaType, mediaId) =>
  doc(db, 'users', uid, 'ratings', mediaDocId(mediaType, mediaId))

export const watchlistCollection = (uid) => collection(db, 'users', uid, 'watchlist')

export const watchlistDoc = (uid, mediaType, mediaId) =>
  doc(db, 'users', uid, 'watchlist', mediaDocId(mediaType, mediaId))
