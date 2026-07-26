import { useDispatch, useSelector } from "react-redux"
import { API_OPTIONS } from "../utils/constant"
import { useEffect } from "react"
import { addPopularShows } from "../store/tvSlice"

const usePopularShows = () => {
  const dispatch = useDispatch()

  const popularShows = useSelector((store) => store.tv.popularShows)

  const getPopularShows = async () => {
    const data = await fetch(
      'https://api.themoviedb.org/3/tv/popular?language=en-US&page=1',
      API_OPTIONS
    )
    const json = await data.json()
    dispatch(addPopularShows(json.results))
  }

  useEffect(() => {
    !popularShows && getPopularShows()
  }, [])
}

export default usePopularShows
