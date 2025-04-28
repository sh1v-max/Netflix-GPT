import React from 'react'
import GptMovieSuggestions from './GptMovieSuggestions'
import GptSearchBar from './GptSearchBar'
import { IMG_BACKGROUND } from '../utils/constant'
import Header from './Header'

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
