import React from 'react'
import { motion } from 'motion/react'
import { User } from 'lucide-react'
import { PROFILE_CDN_URL } from '../../utils/constant'
import { EASE } from '@/lib/motion'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
}

// Two layouts: collapsed is the original horizontal-scroll row capped at
// `previewCount`; expanded (via the "More" toggle in DetailPage) drops the
// cap and wraps into a flex-wrap grid instead, so the rest of the cast/crew
// becomes visible by scrolling the page down, not by dragging sideways.
const CastGrid = ({
  cast,
  getSubtitle = (member) => member.character,
  expanded = false,
  previewCount = 15,
}) => {
  const list = expanded ? cast : cast.slice(0, previewCount)
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className={
        expanded
          ? 'flex flex-wrap gap-4'
          : 'flex gap-4 overflow-x-scroll no-scrollbar scroll-smooth pb-2'
      }
    >
      {list.map((member) => (
        <motion.div
          key={member.id}
          variants={fadeUp}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="shrink-0 w-24 md:w-28 text-center group"
        >
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-ink-elevated mb-2 flex items-center justify-center border border-transparent transition-colors duration-300 group-hover:border-hud-cyan/50 group-hover:shadow-[0_0_20px_var(--color-hud-cyan-glow)]">
            {member.profile_path ? (
              <img
                src={PROFILE_CDN_URL + member.profile_path}
                alt={member.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="text-text-dark-muted" size={28} />
            )}
          </div>
          <p className="text-xs md:text-sm font-medium text-text-dark truncate">
            {member.name}
          </p>
          <p className="font-mono text-[10px] md:text-[11px] text-text-dark-muted truncate">
            {getSubtitle(member)}
          </p>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default CastGrid
