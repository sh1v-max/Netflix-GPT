import React from 'react'
import GptMovieSuggestions from './GptMovieSuggestions'
import GptSearchBar from './GptSearchBar'
import { IMG_BACKGROUND } from '../utils/constant'

const GptSearch = () => {
  return (
    <div className="relative h-screen w-full">
      <div>
        <GptSearchBar />
        <GptMovieSuggestions />
      </div>
    </div>
  )
}

export default GptSearch
