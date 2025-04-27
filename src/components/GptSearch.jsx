import React from 'react'
import GptMovieSuggestions from './GptMovieSuggestions'
import GptSearchBar from './GptSearchBar'
import { IMG_BACKGROUND } from '../utils/constant'

const GptSearch = () => {
  return (
    <div className="relative h-screen w-full">
      <div>
        <img
          src={IMG_BACKGROUND}
          alt="Background"
          className="fixed inset-0 w-full h-full object-cover -z-20 opacity-80"
        />
      </div>
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-70 -z-10"></div>
      <div>
        <GptSearchBar />
        <GptMovieSuggestions />
      </div>
    </div>
  )
}

export default GptSearch
