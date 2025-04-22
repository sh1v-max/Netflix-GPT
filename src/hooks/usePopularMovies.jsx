import { useDispatch } from "react-redux"
import { API_OPTIONS } from "../utils/constant"
import { useEffect } from "react"
import {addPopularMovies } from "../Utils/moviesSlice"

const usePopularMovies = () => {
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
    dispatch(addPopularMovies(json.results))
  }

  useEffect(() => {
    getNowPlaying()
  }, [])
}

export default usePopularMovies 