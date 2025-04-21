import React from 'react'

const VideoTitle = ({ title, overview }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black to-transparent text-white px-10 pt-[20%] z-20">
      {/* Title */}
      <div className='w-2/5'>
        <h1 className="text-5xl font-bold mb-6">{title}</h1>

        {/* Overview */}
        <p className="text-base max-w-xl mb-6">{overview}</p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button className="bg-white text-black py-2 px-5 cursor-pointer rounded hover:bg-opacity-80">
            ▶️ Play
          </button>
          <button className="bg-gray-700 text-white py-2 px-5 cursor-pointer rounded hover:bg-gray-600">
            ℹ️ More Info
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoTitle
