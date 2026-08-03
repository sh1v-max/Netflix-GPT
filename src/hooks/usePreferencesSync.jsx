import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { onSnapshot } from 'firebase/firestore'
import { ratingsCollection } from '../utils/firestorePaths'
import { setRatings, clearPreferences } from '../store/preferencesSlice'

// Keeps preferences.ratings live-synced with Firestore for as long as
// someone's logged in — call once, near the root (Header mounts on
// every page, so that's where this lives). Every rating write anywhere
// in the app shows up everywhere else instantly, no manual refetching.
const usePreferencesSync = () => {
  const dispatch = useDispatch()
  const uid = useSelector((store) => store.user?.uid)

  useEffect(() => {
    if (!uid) {
      dispatch(clearPreferences())
      return
    }

    const unsubscribe = onSnapshot(ratingsCollection(uid), (snapshot) => {
      const ratings = {}
      snapshot.forEach((docSnap) => {
        ratings[docSnap.id] = docSnap.data().rating
      })
      dispatch(setRatings(ratings))
    })

    return () => unsubscribe()
  }, [uid, dispatch])
}

export default usePreferencesSync
