import React, { useEffect } from 'react'
import Header from './Header'
import { API_OPTIONS } from '../utils/constant'

const Browse = () => {
  const getNowPlaying = async () => {
    const data = await fetch(
      'https://api.themoviedb.org/3/movie/now_playing?page=1',
      API_OPTIONS
    )
    const json = await data.json()
    console.log(json)
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
