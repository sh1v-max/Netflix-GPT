import React from 'react'
import { FaPlay } from 'react-icons/fa'
import { AiOutlineInfoCircle } from 'react-icons/ai'

const VideoTitle = ({ title, overview }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black to-transparent/10 flex flex-col text-white px-6 pt-[70%] md:pt-[5%] md:px-10 md:pb-0 md:justify-center z-20">
      {/* Title & Overview */}
      <div className="w-full lg:w-2/5 md:w-3/5">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6 drop-shadow-lg">{title}</h1>
        <p className="text-sm md:text-base max-w-xl mb-4 md:mb-6 line-clamp-3 md:line-clamp-none drop-shadow-md">{overview}</p>
  
        {/* Buttons */}
        <div className="flex gap-3 md:gap-4">
          <button className="flex items-center gap-1 md:gap-2 bg-white text-black py-1 md:py-2 px-4 md:px-6 rounded transition-all duration-300 ease-in-out hover:bg-red-600 hover:text-white cursor-pointer">
            <FaPlay size={16} />
            <span className="font-medium text-sm md:text-base">Play</span>
          </button>
          <button className="flex items-center gap-1 md:gap-2 bg-gray-700/80 text-white py-1 md:py-2 px-4 md:px-6 rounded hover:bg-gray-600 cursor-pointer transition-all duration-300">
            <AiOutlineInfoCircle size={18} /> 
            <span className="font-medium text-sm md:text-base">More Info</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoTitle
