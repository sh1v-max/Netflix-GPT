import React from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import useOnTheAirShows from '../../hooks/useOnTheAirShows'
import usePopularShows from '../../hooks/usePopularShows'
import useTopRatedShows from '../../hooks/useTopRatedShows'
import useAiringTodayShows from '../../hooks/useAiringTodayShows'
import { useSelector } from 'react-redux'
import MainContainer from '../browse/MainContainer'
import ShowsSecondaryContainer from './ShowsSecondaryContainer'

const Shows = () => {
  const onTheAirShows = useSelector((store) => store.tv?.onTheAirShows)
  useOnTheAirShows()
  usePopularShows()
  useTopRatedShows()
  useAiringTodayShows()

  return (
    <div className='relative w-screen min-h-screen flex flex-col'>
      <Header />
      <div className="flex-1">
        <div className="relative w-full h-full">
          <div className="hero-gradient fixed inset-0 -z-40" />
          <div className="relative h-full">
            <MainContainer movies={onTheAirShows} mediaType="tv" />
            <ShowsSecondaryContainer />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Shows
