import { useDispatch } from "react-redux"
import { API_OPTIONS } from "../utils/constant"
import { useEffect } from "react"
import {addPopularMovies } from "../Utils/moviesSlice"

const usePopularMovies = () => {
  // fetching data from TMDB and update store
  const dispatch = useDispatch()
  const getPopularMovies = async () => {
    const data = await fetch(
      'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1',
      API_OPTIONS
    )
    const json = await data.json()
    // console.log(json.results)
    // adding data into the store
    dispatch(addPopularMovies(json.results))
  }

  useEffect(() => {
    getPopularMovies()
  }, [])
}

export default usePopularMovies 