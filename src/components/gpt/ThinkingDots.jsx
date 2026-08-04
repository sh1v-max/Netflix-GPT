import React from 'react'
import { motion } from 'motion/react'

// Research-backed pattern (ui-ux-pro-max, AI-Native UI style + GSAP loader
// data): 3-dot bounce, ~0.4s per dot, 0.15s stagger, capped under ~1.5s so
// it never reads as "frozen" the way a static spinner can.
const ThinkingDots = ({ className = '' }) => (
  <div className={`flex items-center gap-1 ${className}`}>
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-current"
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: i * 0.15,
        }}
      />
    ))}
  </div>
)

export default ThinkingDots
