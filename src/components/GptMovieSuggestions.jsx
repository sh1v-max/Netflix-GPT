import React from 'react'
import { useSelector } from 'react-redux'
import MovieList from './MovieList'

const GptMovieSuggestions = () => {
  const { movieResults, movieNames } = useSelector((store) => store.gpt)
  console.log(movieResults)
  console.log(movieNames)
  if (!movieNames) return <div className='h-full'></div>

  return (
    <div className="w-full h-full px-1 pt-4 pb-10 md:px-[10%]">
      {movieNames.map((movieName, index) => (
        <MovieList
          key={movieName}
          title={movieName}
          movies={movieResults[index]}
        />
      ))}
    </div>
  )
}

export default GptMovieSuggestions
