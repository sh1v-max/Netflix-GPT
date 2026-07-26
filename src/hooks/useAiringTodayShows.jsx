import { useDispatch, useSelector } from "react-redux"
import { API_OPTIONS } from "../utils/constant"
import { useEffect } from "react"
import { addAiringTodayShows } from "../store/tvSlice"

const useAiringTodayShows = () => {
  const dispatch = useDispatch()

  const airingTodayShows = useSelector((store) => store.tv.airingTodayShows)

  const getAiringTodayShows = async () => {
    const data = await fetch(
      'https://api.themoviedb.org/3/tv/airing_today?language=en-US&page=1',
      API_OPTIONS
    )
    const json = await data.json()
    dispatch(addAiringTodayShows(json.results))
  }

  useEffect(() => {
    !airingTodayShows && getAiringTodayShows()
  }, [])
}

export default useAiringTodayShows
