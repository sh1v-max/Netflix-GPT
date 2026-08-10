import React, { forwardRef } from 'react'
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

// A single horizontal-scroll row of the full cast/crew list — navigated via
// prev/next buttons DetailPage renders in the section header (SectionEyebrow's
// `action` slot), not a "More" toggle. `ref` is forwarded to the scrollable
// element so those buttons can call `scrollBy` on it directly.
const CastGrid = forwardRef(({ cast, getSubtitle = (member) => member.character }, ref) => {
  return (
    <div className="relative">
      <motion.div
        ref={ref}
        initial="hidden"
        animate="show"
        variants={stagger}
        className="flex gap-4 overflow-x-scroll no-scrollbar scroll-smooth pt-2 pb-2"
      >
        {cast.map((member) => (
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

      {/* Fades the row out into the page background at the right edge,
          instead of hard-cropping whichever avatar happens to land there. */}
      <div className="pointer-events-none absolute top-0 right-0 bottom-2 w-16 md:w-24 bg-linear-to-l from-ink via-ink/70 to-transparent" />
    </div>
  )
})
CastGrid.displayName = 'CastGrid'

export default CastGrid
