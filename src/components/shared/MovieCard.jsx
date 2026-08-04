import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Play, MoreHorizontal } from 'lucide-react'
import { IMG_CDN_URL } from '../../utils/constant'
import RatingControl from './RatingControl'

const MovieCard = ({ id, posterPath, title, mediaType = 'movie', genreIds = [], fill = false, layoutId }) => {
  const [imgError, setImgError] = useState(false)

  if (!posterPath || imgError) return null

  return (
    <motion.div
      className={`${fill ? 'w-full' : 'w-24 md:w-48'} relative py-2 group`}
      title={title}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link
        to={`/title/${mediaType}/${id}`}
        className="block rounded-md md:rounded-lg overflow-hidden border border-transparent shadow-cg-card transition-[box-shadow,border-color] duration-300 ease-cg-standard group-hover:border-border-hairline group-hover:shadow-cg-elevated group-hover:z-20 relative"
      >
        <motion.img
          layoutId={layoutId}
          src={IMG_CDN_URL + posterPath}
          alt={title ? `${title} poster` : 'Movie poster'}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-auto object-cover"
        />

        {/* Hover Icons Container */}
        <div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-ink/40 transition-opacity duration-300">
            <button
              className="bg-accent2 text-white rounded-full p-4 shadow-cg-glow hover:scale-110 hover:bg-accent2-strong cursor-pointer transition-transform duration-300"
              aria-label={title ? `Play ${title}` : 'Play'}
            >
              <Play size={20} fill="currentColor" />
            </button>
          </div>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-70 transition-opacity duration-300">
            <button
              className="bg-ink-elevated/70 text-text-dark rounded-full p-1 px-2 shadow-md hover:bg-ink-elevated cursor-pointer"
              aria-label="More options"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="absolute top-2 left-2">
            <RatingControl mediaType={mediaType} id={id} genreIds={genreIds} size={12} />
          </div>
        </div>

        {title && (
          <div className="hidden md:block absolute bottom-0 left-0 right-0 bg-linear-to-t from-ink/90 to-transparent px-2 pt-6 pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-text-dark text-xs font-medium truncate">{title}</p>
          </div>
        )}
      </Link>
    </motion.div>
  )
}

export default MovieCard
