import React from 'react'
import Header from './Header'
import Footer from './Footer'
import MainContainer from './mainContainer'
import SecondaryContainer from './secondaryContainer'
import useNowPlayingMovies from '../hooks/useNowPlayingMovies'
import usePopularMovies from '../hooks/usePopularMovies'
import useTopRatedMovies from '../hooks/useTopRatedMovies'
import useUpcomingMovies from '../hooks/useUpcomingMovies'
import GptSearch from './GptSearch'

const Browse = () => {

  useNowPlayingMovies()
  usePopularMovies()
  useTopRatedMovies()
  useUpcomingMovies()
  
  return (
    <div>
      <Header />
      <GptSearch/>
      <MainContainer />
      <SecondaryContainer />
      <Footer/>
    </div>
  )
}

export default Browse
