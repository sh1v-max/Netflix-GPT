import { useDispatch, useSelector } from "react-redux"
import { API_OPTIONS } from "../utils/constant"
import { useEffect } from "react"
import { addTopRatedShows } from "../store/tvSlice"

const useTopRatedShows = () => {
  const dispatch = useDispatch()

  const topRatedShows = useSelector((store) => store.tv.topRatedShows)

  const getTopRatedShows = async () => {
    const data = await fetch(
      'https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1',
      API_OPTIONS
    )
    const json = await data.json()
    dispatch(addTopRatedShows(json.results))
  }

  useEffect(() => {
    !topRatedShows && getTopRatedShows()
  }, [])
}

export default useTopRatedShows
