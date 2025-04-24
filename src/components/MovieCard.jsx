import React from 'react'
import { FaPlay } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { IMG_CDN_URL } from '../utils/constant'

const MovieCard = ({posterPath}) => {
  console.log(posterPath)

  return (
    <div className="w-48 relative group">
      <div className="rounded-lg overflow-hidden shadow-md transform transition duration-300 group-hover:scale-95 group-hover:z-20 relative">
        <img
          src={IMG_CDN_URL + posterPath}
          alt="Movie Card"
          className="w-full h-auto object-cover"
        />

        {/* Hover Icons Container */}
        <div>
          {/* Play Button - Bottom Left */}
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-70 transition-opacity duration-300">
            <button className="bg-gray-700 bg-opacity-70 text-white rounded-full p-2 shadow-lg hover:scale-110 cursor-pointer transition-transform duration-200">
              <FaPlay size={18} />
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
  );
  
  // return (
  //   <div className = "w-48 pr-4">
  //     <img src={IMG_CDN_URL + posterPath} alt="Movie Card" />
  //   </div>
  // )
}

export default MovieCard