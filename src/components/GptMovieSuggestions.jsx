import React from 'react'
import { useSelector } from 'react-redux'
import MovieList from './MovieList'

const GptMovieSuggestions = () => {
  const { movieResults, movieNames } = useSelector((store) => store.gpt)
  console.log(movieResults)
  console.log(movieNames)
  if (!movieNames) return <div className="text-white">Loading...</div>

  return (
    <div className="p-4 m-4 bg-black text-white opacity-90">
      <div className="">
        <div>
          {movieNames.map((movieName, index) => (
            <MovieList
              key={movieName}
              title={movieName}
              movies={movieResults[index]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default GptMovieSuggestions
