import React from 'react'
import { useSelector } from 'react-redux'
import MovieList from '../shared/MovieList'

const GptMovieSuggestions = () => {
  const { movieResults, movieNames } = useSelector((store) => store.gpt)

  if (!movieNames) {
    return (
      <div className="h-[60vh] flex items-center justify-center px-4">
        <p className="text-text-dark-muted text-sm md:text-lg text-center max-w-md">
          Search for a movie, mood, or genre above to get GPT-powered
          recommendations.
        </p>
      </div>
    )
  }

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
