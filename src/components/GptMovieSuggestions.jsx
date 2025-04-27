import React from 'react'
import { useSelector } from 'react-redux'
import MovieList from './MovieList'

const GptMovieSuggestions = () => {
  const { movieResults, movieNames } = useSelector((store) => store.gpt)
  console.log(movieResults)
  console.log(movieNames)
  if (!movieNames) return

  return (
    <div className="w-full h-full p-[10%]">
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
