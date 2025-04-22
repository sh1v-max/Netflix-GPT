import { useDispatch } from "react-redux"
import { API_OPTIONS } from "../utils/constant"
import { useEffect } from "react"
import { addUpcomingMovies } from "../Utils/moviesSlice"

const useUpcomingMovies = () => {
  // fetching data from TMDB and update store
  const dispatch = useDispatch()
  const getUpcomingMovies = async () => {
    const data = await fetch(
      'https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1',
      API_OPTIONS
    )
    const json = await data.json()
    // console.log(json.results)
    // adding data into the store
    dispatch(addUpcomingMovies(json.results))
  }

  useEffect(() => {
    getUpcomingMovies()
  }, [])
}

export default useUpcomingMovies 