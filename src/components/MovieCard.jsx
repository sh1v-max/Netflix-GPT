import React from 'react'
import { IMG_CDN_URL } from '../utils/constant'

const MovieCard = ({ posterPath }) => {
  // console.log(posterPath)
  return (
    <div className="w-48 pr-4 relative group">
      <div className="rounded-lg overflow-hidden shadow-md transform transition duration-300 group-hover:scale-95 group-hover:z-20 relative">
        <img
          src={IMG_CDN_URL + posterPath}
          alt="Movie Card"
          className="w-full h-auto object-cover"
        />

        {/* Play Button */}
        <div className=''>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-white text-black rounded-full p-2 shadow-lg hover:scale-110  cursor-pointer transition-transform duration-200">
              ▶️
            </button>
          </div>

          {/* Three Dots */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="text-white bg-black bg-opacity-60 rounded-full p-1 px-2 hover:bg-opacity-80  cursor-pointer">
              ⋮
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
