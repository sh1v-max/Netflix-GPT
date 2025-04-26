import React from 'react'
import { FaPlay } from 'react-icons/fa'
import { BsThreeDots } from 'react-icons/bs'
import { IMG_CDN_URL } from '../utils/constant'

const MovieCard = ({ posterPath }) => {
  // console.log(posterPath)
  if(!posterPath) return null

  return (
    <div className="w-48 relative py-2 group">
      <div className="rounded-lg overflow-hidden shadow-md transform transition duration-300 group-hover:scale-102 group-hover:z-20 relative">
        <img
          src={IMG_CDN_URL + posterPath}
          alt="Movie Card"
          className="w-full h-auto object-cover"
        />

        {/* Hover Icons Container */}
        <div>
          {/* Play Button - Bottom Left */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-40 transition-opacity duration-300">
            <button className="bg-gray-700 text-white rounded-full p-4 shadow-lg hover:scale-110  cursor-pointer transition-transform duration-300">
              <FaPlay size={30} />
            </button>
          </div>

          {/* Three Dots - Top Right */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-70 transition-opacity duration-300">
            <button className="bg-gray-700 bg-opacity-70 text-white rounded-full p-1 px-2 shadow-md hover:bg-opacity-80 cursor-pointer">
              <BsThreeDots size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

}

export default MovieCard
