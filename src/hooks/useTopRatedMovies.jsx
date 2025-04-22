import { useDispatch } from "react-redux"
import { API_OPTIONS } from "../utils/constant"
import { useEffect } from "react"
import { addTopRatedMovies } from "../Utils/moviesSlice"

const useTopRatedMovies = () => {
  // fetching data from TMDB and update store
  const dispatch = useDispatch()
  const getTopRatedMovies = async () => {
    const data = await fetch(
      'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1',
      API_OPTIONS
    )
    const json = await data.json()
    // console.log(json.results)
    // adding data into the store
    dispatch(addTopRatedMovies(json.results))
  }

  useEffect(() => {
    getTopRatedMovies()
  }, [])
}

export default useTopRatedMovies 