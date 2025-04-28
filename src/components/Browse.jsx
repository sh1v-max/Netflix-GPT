import React from 'react'
import Header from './Header'
import Footer from './Footer'
import SecondaryContainer from './SecondaryContainer'
import useNowPlayingMovies from '../hooks/useNowPlayingMovies'
import usePopularMovies from '../hooks/usePopularMovies'
import useTopRatedMovies from '../hooks/useTopRatedMovies'
import useUpcomingMovies from '../hooks/useUpcomingMovies'
import GptSearch from './GptSearch'
import { useSelector } from 'react-redux'
import MainContainer from './MainContainer'
import { IMG_BACKGROUND } from '../utils/constant'

const Browse = () => {
  const showGptSearch = useSelector((store) => store.gpt.showGptSearch)
  useNowPlayingMovies()
  usePopularMovies()
  useTopRatedMovies()
  useUpcomingMovies()

  return (
    <div className='relative w-screen min-h-screen'>
      <Header />
      <div>
        <div className="relative w-full h-full">
          <div className="fixed inset-0 bg-black opacity-50 -z-40"></div>

          <img
            src={IMG_BACKGROUND}
            alt="Background"
            className="fixed inset-0 w-full h-full object-cover -z-50 opacity-100"
          />
          <div className="relative h-full">
            {showGptSearch ? (
              <GptSearch />
            ) : (
              <>
                <MainContainer />
                <SecondaryContainer />
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Browse
