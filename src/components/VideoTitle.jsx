import React from 'react'
import { FaPlay } from 'react-icons/fa'
import { AiOutlineInfoCircle } from 'react-icons/ai'

const VideoTitle = ({ title, overview }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/50 to-transparent text-white px-10 pt-[20%] z-20">
      {/* Title & Overview */}
      <div className="w-2/5">
        <h1 className="text-5xl font-bold mb-6">{title}</h1>
        <p className="text-base max-w-xl mb-6">{overview}</p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-white text-black py-2 px-6 rounded transition-all duration-100 ease-in-out hover:bg-red-600 hover:text-white cursor-pointer">
            <FaPlay size={18} />
            <span className="font-medium">Play</span>
          </button>
          <button className="flex items-center gap-2 bg-gray-700 text-white py-2 px-6 rounded hover:bg-gray-600 cursor-pointer transition">
            <AiOutlineInfoCircle size={20} />{' '}
            <span className="font-medium">More Info</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoTitle
