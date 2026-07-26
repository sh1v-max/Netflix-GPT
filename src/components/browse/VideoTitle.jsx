import React from 'react'
import { FaPlay } from 'react-icons/fa'
import { AiOutlineInfoCircle } from 'react-icons/ai'

const VideoTitle = ({ title, overview }) => {
  return ( 
    <div className="absolute px-4 pb-4 md:px-0 md:pb-0 top-70 md:top-140 md:left-5 w-full md:w-[800px] bg-ink md:bg-transparent text-text-dark z-20">
      <h1 className="font-display text-xl md:text-4xl lg:text-5xl font-semibold mb-3 md:mb-6 drop-shadow-lg">
        {title}
      </h1>

      {/* Scrollable Overview with consistent height */}
      <div className="h-10 md:h-24 mb-4 md:mb-6 overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-ink-elevated/50">
        <p className="text-[12px] md:text-base drop-shadow-md pr-2 text-text-dark-muted">
          {overview}
        </p>
      </div>

      <div className="flex gap-3 md:gap-4">
        <button className="flex items-center gap-1 md:gap-2 bg-accent text-on-accent py-1 md:py-2 px-4 md:px-6 rounded-[--radius-card] transition-all duration-300 hover:bg-accent-strong cursor-pointer">
          <FaPlay />
          <span className="font-medium text-sm md:text-base">Play</span>
        </button>
        <button className="flex items-center gap-1 md:gap-2 bg-white/10 text-text-dark py-1 md:py-2 px-4 md:px-6 rounded-[--radius-card] hover:bg-white/20 cursor-pointer transition-all duration-300">
          <AiOutlineInfoCircle size={18} />
          <span className="font-medium text-sm md:text-base">More Info</span>
        </button>
      </div>
    </div>
  );
}

export default VideoTitle
