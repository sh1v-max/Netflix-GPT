import React from 'react'
import Header from './Header'
import useNowPlayingMovies from '../hooks/useNowPlayingMovies'

const Browse = () => {

  useNowPlayingMovies()
  
  return (
    <>
      <Header />
      <div>Browse</div>
    </>
  )
}

export default Browse
