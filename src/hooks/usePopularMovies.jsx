import { useDispatch, useSelector } from "react-redux"
import { API_OPTIONS } from "../utils/constant"
import { useEffect } from "react"
import {addPopularMovies } from "../store/moviesSlice"

const usePopularMovies = () => {
  // fetching data from TMDB and update store
  const dispatch = useDispatch()

  const popularMovies = useSelector((store) => store.movies.popularMovies)
  
  const getPopularMovies = async () => {
    const data = await fetch(
      'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1',
      API_OPTIONS
    )
    const json = await data.json()
    dispatch(addPopularMovies(json.results))
  }

  useEffect(() => {
    !popularMovies && getPopularMovies()
  }, [])
}

export default usePopularMovies 