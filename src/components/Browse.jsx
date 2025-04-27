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
    <div>
      <Header />
      <div>
        <div className="relative">
          <div className="fixed inset-0 bg-black opacity-85 -z-20"></div>

          <img
            src={IMG_BACKGROUND}
            alt="Background"
            className="fixed inset-0 w-full h-full object-cover -z-50 opacity-100"
          />
          <div className="relative z-20">
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
