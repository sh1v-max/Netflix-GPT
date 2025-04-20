import { useDispatch } from "react-redux"
import { API_OPTIONS } from "../utils/constant"
import { addNowPlayingMovies } from "../Utils/moviesSlice"
import { useEffect } from "react"

const useNowPlayingMovies = () => {
  // fetching data from TMDB and update store
  const dispatch = useDispatch()
  const getNowPlaying = async () => {
    const data = await fetch(
      'https://api.themoviedb.org/3/movie/now_playing?page=1',
      API_OPTIONS
    )
    const json = await data.json()
    // console.log(json.results)
    // adding data into the store
    dispatch(addNowPlayingMovies(json.results))
  }

  useEffect(() => {
    getNowPlaying()
  }, [])
}

export default useNowPlayingMovies 