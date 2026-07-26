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
import { IMG_BACKGROUND } from '../../utils/constant'

const Shows = () => {
  const onTheAirShows = useSelector((store) => store.tv?.onTheAirShows)
  useOnTheAirShows()
  usePopularShows()
  useTopRatedShows()
  useAiringTodayShows()

  return (
    <div className='relative w-screen min-h-screen'>
      <Header />
      <div>
        <div className="relative w-full h-full">
          <div className="fixed inset-0 bg-black opacity-90 -z-40"></div>

          <img
            src={IMG_BACKGROUND}
            alt="Background"
            className="fixed inset-0 w-full h-full object-cover -z-50 opacity-100"
          />
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
