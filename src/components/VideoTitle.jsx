import React from 'react'
import { FaPlay } from 'react-icons/fa'
import { AiOutlineInfoCircle } from 'react-icons/ai'

const VideoTitle = ({ title, overview }) => {
  return (
    <div className="absolute p-1 top-70 left-2 right-2 md:top-140 md:left-5 w-[400px] md:w-[600px] md:bg-gradient-to-r text-white md:justify-center z-20">
      <h1 className="text-xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6 drop-shadow-lg">
        {title}
      </h1>
      <p className="text-[12px] md:text-base max-w-xl mb-4 md:mb-6 line-clamp-3 md:line-clamp-none drop-shadow-md">
        {overview}
      </p>

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
  )
}

export default VideoTitle
