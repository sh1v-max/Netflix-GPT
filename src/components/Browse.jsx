import React, { useEffect } from 'react'
import Header from './Header'
import { API_OPTIONS } from '../utils/constant'
import { useDispatch } from 'react-redux'
import {addNowPlayingMovies} from '../Utils/movieSlice'

const Browse = () => {
  const dispatch = useDispatch()
  const getNowPlaying = async () => {
    const data = await fetch(
      'https://api.themoviedb.org/3/movie/now_playing?page=1',
      API_OPTIONS
    )
    const json = await data.json()
    console.log(json.results)
    // adding data into the store
    dispatch(addNowPlayingMovies(json.results))
  }

  useEffect(() => {
    getNowPlaying()
  }, [])

  return (
    <>
      <Header />
      <div>Browse</div>
    </>
  )
}

export default Browse
