import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { onSnapshot } from 'firebase/firestore'
import { ratingsCollection, watchlistCollection } from '../utils/firestorePaths'
import { setRatings, setWatchlist, clearPreferences } from '../store/preferencesSlice'

// Keeps preferences.ratings/watchlist live-synced with Firestore for as
// long as someone's logged in — call once, near the root (Header mounts
// on every page, so that's where this lives). Every rating/watchlist
// write anywhere in the app shows up everywhere else instantly, no
// manual refetching.
const usePreferencesSync = () => {
  const dispatch = useDispatch()
  const uid = useSelector((store) => store.user?.uid)

  useEffect(() => {
    if (!uid) {
      dispatch(clearPreferences())
      return
    }

    const unsubscribeRatings = onSnapshot(ratingsCollection(uid), (snapshot) => {
      const ratings = {}
      const ratedGenres = {}
      const ratedYears = {}
      snapshot.forEach((docSnap) => {
        const data = docSnap.data()
        ratings[docSnap.id] = data.rating
        ratedGenres[docSnap.id] = data.genreIds || []
        ratedYears[docSnap.id] = data.releaseYear ?? null
      })
      dispatch(setRatings({ ratings, ratedGenres, ratedYears }))
    })

    const unsubscribeWatchlist = onSnapshot(watchlistCollection(uid), (snapshot) => {
      const watchlist = {}
      snapshot.forEach((docSnap) => {
        watchlist[docSnap.id] = true
      })
      dispatch(setWatchlist(watchlist))
    })

    return () => {
      unsubscribeRatings()
      unsubscribeWatchlist()
    }
  }, [uid, dispatch])
}

export default usePreferencesSync
