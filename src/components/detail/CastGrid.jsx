import React from 'react'
import { FaUser } from 'react-icons/fa'
import { PROFILE_CDN_URL } from '../../utils/constant'

const CastGrid = ({ cast }) => {
  return (
    <div className="flex gap-4 overflow-x-scroll no-scrollbar scroll-smooth pb-2">
      {cast.slice(0, 15).map((member) => (
        <div key={member.id} className="shrink-0 w-24 md:w-28 text-center">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-ink-elevated mb-2 flex items-center justify-center">
            {member.profile_path ? (
              <img
                src={PROFILE_CDN_URL + member.profile_path}
                alt={member.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUser className="text-text-dark-muted" size={28} />
            )}
          </div>
          <p className="text-xs md:text-sm font-medium text-text-dark truncate">
            {member.name}
          </p>
          <p className="text-[11px] md:text-xs text-text-dark-muted truncate">
            {member.character}
          </p>
        </div>
      ))}
    </div>
  )
}

export default CastGrid
