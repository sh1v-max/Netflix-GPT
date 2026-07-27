import MovieList from '../shared/MovieList'
import { useSelector } from 'react-redux'

const ShowsSecondaryContainer = () => {
  const shows = useSelector((store) => store.tv)

  return (
    <div>
      <div className='py-20 md:p-12 relative z-20'>
        <MovieList title={'On The Air'} movies={shows.onTheAirShows} mediaType="tv" />
        <MovieList title={'Popular'} movies={shows.popularShows} mediaType="tv" />
        <MovieList title={'Top Rated'} movies={shows.topRatedShows} mediaType="tv" />
        <MovieList title={'Airing Today'} movies={shows.airingTodayShows} mediaType="tv" />
      </div>
    </div>
  )
}

export default ShowsSecondaryContainer
