import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'
import { addCredits } from '../store/detailsSlice'

const useCredits = (mediaType, id) => {
  const dispatch = useDispatch()
  const key = `${mediaType}_${id}`
  const credits = useSelector((store) => store.details.credits[key])

  const getCredits = async () => {
    const data = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}/credits?language=en-US`,
      API_OPTIONS
    )
    const json = await data.json()
    dispatch(addCredits({ key, data: json }))
  }

  useEffect(() => {
    if (!mediaType || !id) return
    !credits && getCredits()
  }, [mediaType, id])

  return credits
}

export default useCredits
