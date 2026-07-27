import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'
import { addSimilar } from '../store/detailsSlice'

const useSimilarTitles = (mediaType, id) => {
  const dispatch = useDispatch()
  const key = `${mediaType}_${id}`
  const similar = useSelector((store) => store.details.similar[key])

  const getSimilar = async () => {
    const data = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}/similar?language=en-US&page=1`,
      API_OPTIONS
    )
    const json = await data.json()
    dispatch(addSimilar({ key, data: json.results }))
  }

  useEffect(() => {
    if (!mediaType || !id) return
    !similar && getSimilar()
  }, [mediaType, id])

  return similar
}

export default useSimilarTitles
