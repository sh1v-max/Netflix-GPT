import { useDispatch, useSelector } from "react-redux"
import { API_OPTIONS } from "../utils/constant"
import { useEffect } from "react"
import { addOnTheAirShows } from "../store/tvSlice"

const useOnTheAirShows = () => {
  const dispatch = useDispatch()

  const onTheAirShows = useSelector((store) => store.tv.onTheAirShows)

  const getOnTheAirShows = async () => {
    const data = await fetch(
      'https://api.themoviedb.org/3/tv/on_the_air?language=en-US&page=1',
      API_OPTIONS
    )
    const json = await data.json()
    dispatch(addOnTheAirShows(json.results))
  }

  useEffect(() => {
    !onTheAirShows && getOnTheAirShows()
  }, [])
}

export default useOnTheAirShows
