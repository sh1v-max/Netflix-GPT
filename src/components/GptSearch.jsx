import React from 'react'
import GptMovieSuggestions from './GptMovieSuggestions'
import GptSearchBar from './GptSearchBar'

const GptSearch = () => {
  return (
    <div className="relative h-full w-full">
      <div>
        <GptSearchBar />
        <GptMovieSuggestions />
      </div>
    </div>
  )
}

export default GptSearch
