import MovieList from './MovieList'
import { useSelector } from 'react-redux'

const SecondaryContainer = () => {
  const movies = useSelector((store) => store.movies)

  return (
    <div className="bg-black pb-1">
      <div className='-mt-50 pl-12 relative z-20'>
        <MovieList title={'Now Playing'} movies={movies.nowPlayingMovies} />
        <MovieList title={'Popular'} movies={movies.popularMovies} />
        <MovieList title={'Top Rated'} movies={movies.topRatedMovies} />
        <MovieList title={'Upcoming Movies'} movies={movies.upcomingMovies} />
      </div>
    </div>
  )
}

export default SecondaryContainer
