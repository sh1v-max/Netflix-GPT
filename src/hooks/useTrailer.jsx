import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { API_OPTIONS } from "../utils/constant"
import { addTrailerVideo } from "../store/detailsSlice"

// Cached per `${mediaType}_${id}` in the shared `details` slice, same as
// useMediaDetails/useCredits — previously this lived in moviesSlice/tvSlice
// as a single global value per mediaType, so once any title's trailer was
// fetched, every other title reused it instead of fetching its own (the
// dispatch only ever wrote one shared field, and the effect's `!trailerVideo`
// guard then skipped refetching it for the next title too).
const useTrailer = (mediaType, id) => {
  const dispatch = useDispatch()
  const key = `${mediaType}_${id}`
  const trailerVideo = useSelector((store) => store.details.trailerVideo[key])

  const getVideos = async () => {
    const data = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${id}/videos?language=en-US`,
      API_OPTIONS
    )
    const json = await data.json()
    const filterData = json.results.filter((video) => video.type === 'Trailer')
    const trailer = filterData.length ? filterData[0] : json.results[0]
    dispatch(addTrailerVideo({ key, data: trailer }))
  }

  useEffect(() => {
    if (!mediaType || !id) return
    !trailerVideo && getVideos()
  }, [mediaType, id])

  return trailerVideo
}

export default useTrailer
