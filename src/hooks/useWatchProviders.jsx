import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'
import { addWatchProviders } from '../store/detailsSlice'

// TMDB returns providers grouped by country code, e.g. { results: { US: {...}, IN: {...} } }
const useWatchProviders = (mediaType, id) => {
  const dispatch = useDispatch()
  const key = `${mediaType}_${id}`
  const watchProviders = useSelector((store) => store.details.watchProviders[key])

  const getWatchProviders = async () => {
    const data = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}/watch/providers`,
      API_OPTIONS
    )
    const json = await data.json()
    dispatch(addWatchProviders({ key, data: json.results }))
  }

  useEffect(() => {
    if (!mediaType || !id) return
    !watchProviders && getWatchProviders()
  }, [mediaType, id])

  return watchProviders
}

export default useWatchProviders
