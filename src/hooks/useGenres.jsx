import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { API_OPTIONS, TMDB_BASE_URL } from '../utils/constant'
import { addGenres } from '../store/detailsSlice'

const useGenres = (mediaType) => {
  const dispatch = useDispatch()
  const genres = useSelector((store) => store.details.genres[mediaType])

  const getGenres = async () => {
    const data = await fetch(
      `${TMDB_BASE_URL}/genre/${mediaType}/list?language=en-US`,
      API_OPTIONS
    )
    const json = await data.json()
    dispatch(addGenres({ mediaType, data: json.genres }))
  }

  useEffect(() => {
    if (!mediaType) return
    !genres && getGenres()
  }, [mediaType])

  return genres
}

export default useGenres
