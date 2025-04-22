import React from 'react'
import Header from './Header'
import useNowPlayingMovies from '../hooks/useNowPlayingMovies'
import MainContainer from './mainContainer'
import SecondaryContainer from './secondaryContainer'
import Footer from './Footer'

const Browse = () => {

  useNowPlayingMovies()
  
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
