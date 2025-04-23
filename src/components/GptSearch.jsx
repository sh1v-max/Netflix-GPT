import React from 'react'
import GptMovieSuggestions from './GptMovieSuggestions'
import GptSearchBar from './GptSearchBar'

const GptSearch = () => {
  return (
    // this will have gpt search bar and movies suggestions
    <div>
      <GptSearchBar />
      <GptMovieSuggestions />
    </div>
  )
}

export default GptSearch
