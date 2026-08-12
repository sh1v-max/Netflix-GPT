import React from 'react'
import { motion } from 'motion/react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import GptSearch from '../gpt/GptSearch'
import { floatOrb } from '@/lib/motion'

// The logged-in "home base" — AI search first, per the original
// search-first-landing design decision. Lives at its own /home route
// (previously a Redux view-state toggle sharing one URL with the movie
// grid, which meant "Home" and "Movies" pointed at the same address).
const AiSearchHome = () => (
  <div className="relative w-full min-h-screen overflow-x-hidden flex flex-col">
    <Header />
    <div className="flex-1">
      <div className="relative w-full h-full">
        <div className="fixed inset-0 -z-40 aurora-gradient" />
        <motion.span
          variants={floatOrb}
          animate="animate"
          className="fixed top-1/4 left-[10%] w-72 h-72 rounded-full bg-hud-cyan/15 blur-3xl pointer-events-none -z-30"
          aria-hidden="true"
        />
        <motion.span
          variants={floatOrb}
          animate="animate"
          transition={{ delay: 3 }}
          className="fixed bottom-1/4 right-[8%] w-80 h-80 rounded-full bg-accent2/10 blur-3xl pointer-events-none -z-30"
          aria-hidden="true"
        />
        <div className="relative h-full theme-dark-scope">
          <GptSearch />
        </div>
      </div>
    </div>
    <Footer />
  </div>
)

export default AiSearchHome
