import React from 'react'
import { motion } from 'motion/react'
import { MessageCircle, Radar, Layers, RotateCcw } from 'lucide-react'
import HudFrame from '../movies/HudFrame'
import { EASE } from '@/lib/motion'

// Explains the actual mechanism, not marketing copy — each step maps to a
// real shipped feature (3.1 personalization, 3.8 movie+TV+anime coverage,
// 3.5 multi-turn refinement), not a generic "AI-powered!" claim.
const STEPS = [
  {
    icon: MessageCircle,
    title: 'Describe, don’t search',
    description:
      'Type what you’re actually in the mood for, in plain English — "something like Inception but shorter," not a genre dropdown.',
  },
  {
    icon: Radar,
    title: 'Reads your taste graph',
    description:
      'Once you’ve rated 3+ titles, every search factors in your favorite genres, eras, and what you tend to avoid — automatically.',
  },
  {
    icon: Layers,
    title: 'Movies, TV, and anime',
    description:
      'One search covers all three — each result cross-referenced against real TMDB data, not a hallucinated title.',
  },
  {
    icon: RotateCcw,
    title: 'Refine like a conversation',
    description:
      '"More like the third one, but shorter" — follow-ups build on what you already asked, up to 5 turns back.',
  },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

const HowItWorks = () => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}
    variants={stagger}
    className="mx-4 md:mx-[10%] mt-10 mb-4"
  >
    <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-hud-cyan/70 mb-4 px-1">
      How it works
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {STEPS.map((step, i) => (
        <motion.div key={step.title} variants={fadeUp} className="min-w-0">
          <HudFrame className="h-full min-w-0 p-4 md:p-5">
            <span className="font-mono text-[11px] text-hud-cyan/50">
              {String(i + 1).padStart(2, '0')}
            </span>
            <step.icon className="text-hud-cyan mt-2 mb-3" size={20} />
            <h3 className="text-sm md:text-base font-semibold text-text-dark mb-1.5">
              {step.title}
            </h3>
            <p className="text-xs md:text-sm text-text-dark-muted leading-relaxed">
              {step.description}
            </p>
          </HudFrame>
        </motion.div>
      ))}
    </div>
  </motion.div>
)

export default HowItWorks
