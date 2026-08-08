import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'
import { addMediaDetails } from '../store/detailsSlice'

const useMediaDetails = (mediaType, id) => {
  const dispatch = useDispatch()
  const key = `${mediaType}_${id}`
  const details = useSelector((store) => store.details.mediaDetails[key])

  const getMediaDetails = async () => {
    // Ride keywords + certifications along on the same request instead of
    // separate hooks/endpoints — release_dates (movie) / content_ratings
    // (tv) is where TMDB nests age certifications.
    const appendFields =
      mediaType === 'movie' ? 'keywords,release_dates' : 'keywords,content_ratings'
    const data = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}?language=en-US&append_to_response=${appendFields}`,
      API_OPTIONS
    )
    const json = await data.json()
    dispatch(addMediaDetails({ key, data: json }))
  }

  useEffect(() => {
    if (!mediaType || !id) return
    !details && getMediaDetails()
  }, [mediaType, id])

  return details
}

export default useMediaDetails
