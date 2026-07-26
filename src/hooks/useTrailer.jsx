import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { API_OPTIONS } from "../utils/constant"
import { addTrailerVideo } from "../store/moviesSlice"
import { addTvTrailerVideo } from "../store/tvSlice"

const useTrailer = (mediaType, id) => {
  const dispatch = useDispatch()
  const isTv = mediaType === 'tv'

  const trailerVideo = useSelector((store) =>
    isTv ? store.tv?.trailerVideo : store.movies?.trailerVideo
  )

  const getVideos = async () => {
    const data = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${id}/videos?language=en-US`,
      API_OPTIONS
    )
    const json = await data.json()
    const filterData = json.results.filter((video) => video.type === 'Trailer')
    const trailer = filterData.length ? filterData[0] : json.results[0]
    dispatch(isTv ? addTvTrailerVideo(trailer) : addTrailerVideo(trailer))
  }

  useEffect(() => {
    !trailerVideo && getVideos()
  }, [])
}

export default useTrailer
