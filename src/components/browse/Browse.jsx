import React from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import SecondaryContainer from './SecondaryContainer'
import useNowPlayingMovies from '../../hooks/useNowPlayingMovies'
import usePopularMovies from '../../hooks/usePopularMovies'
import useTopRatedMovies from '../../hooks/useTopRatedMovies'
import useUpcomingMovies from '../../hooks/useUpcomingMovies'
import GptSearch from '../gpt/GptSearch'
import { useSelector } from 'react-redux'
import MainContainer from './MainContainer'

const Browse = () => {
  const showGptSearch = useSelector((store) => store.gpt.showGptSearch)
  const nowPlayingMovies = useSelector((store) => store.movies?.nowPlayingMovies)
  useNowPlayingMovies()
  usePopularMovies()
  useTopRatedMovies()
  useUpcomingMovies()

  return (
    <div className='relative w-screen min-h-screen flex flex-col'>
      <Header />
      <div className="flex-1">
        <div className="relative w-full h-full">
          <div
            className={`fixed inset-0 -z-40 ${
              showGptSearch ? 'aurora-gradient' : 'hero-gradient'
            }`}
          />
          <div className={`relative h-full ${showGptSearch ? 'theme-dark-scope' : ''}`}>
            {showGptSearch ? (
              <GptSearch />
            ) : (
              <>
                <MainContainer movies={nowPlayingMovies} mediaType="movie" />
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
