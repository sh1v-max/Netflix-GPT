import React, { useState } from 'react'
import { FaPlay } from 'react-icons/fa'
import { BsThreeDots } from 'react-icons/bs'
import { IMG_CDN_URL } from '../utils/constant'

const MovieCard = ({ posterPath, title }) => {
  const [imgError, setImgError] = useState(false)

  if (!posterPath || imgError) return null

  return (
    <div
      className="w-24 md:w-48 relative py-2 group"
      title={title}
    >
      <div className="rounded-sm md:rounded-lg overflow-hidden shadow-md transform transition duration-300 group-hover:scale-102 group-hover:shadow-xl group-hover:z-20 relative">
        <img
          src={IMG_CDN_URL + posterPath}
          alt={title ? `${title} poster` : 'Movie poster'}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-auto object-cover"
        />

        {/* Hover Icons Container */}
        <div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity duration-300">
            <button
              className="bg-white/90 text-black rounded-full p-4 shadow-lg hover:scale-110 hover:bg-white cursor-pointer transition-transform duration-300"
              aria-label={title ? `Play ${title}` : 'Play'}
            >
              <FaPlay size={20} />
            </button>
          </div>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-70 transition-opacity duration-300">
            <button
              className="bg-gray-700 bg-opacity-70 text-white rounded-full p-1 px-2 shadow-md hover:bg-opacity-80 cursor-pointer"
              aria-label="More options"
            >
              <BsThreeDots size={18} />
            </button>
          </div>
        </div>

        {title && (
          <div className="hidden md:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-2 pt-6 pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-xs font-medium truncate">{title}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieCard
