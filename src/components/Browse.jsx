import React from 'react'
import Header from './Header'
import Footer from './Footer'
import MainContainer from './mainContainer'
import SecondaryContainer from './secondaryContainer'
import useNowPlayingMovies from '../hooks/useNowPlayingMovies'
import usePopularMovies from '../hooks/usePopularMovies'
import useTopRatedMovies from '../hooks/useTopRatedMovies'
import useUpcomingMovies from '../hooks/useUpcomingMovies'

const Browse = () => {

  useNowPlayingMovies()
  usePopularMovies()
  useTopRatedMovies()
  useUpcomingMovies()
  
  return (
    <div>
      <Header />
      <MainContainer />
      <SecondaryContainer />
      <Footer/>
    </div>
  )
}

export default Browse
