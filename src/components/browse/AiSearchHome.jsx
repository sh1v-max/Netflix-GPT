import React from 'react'
import { motion } from 'motion/react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import GptSearch from '../gpt/GptSearch'
import bgHome from '../../assets/bg-home.jpg'
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
        {/* Single curated hero image (assets/bg-home.jpg) — replaces the
            earlier TMDB backdrop mosaic per explicit request. Slow Ken
            Burns drift for a living background, same technique
            Login.jsx's hero uses. */}
        <motion.img
          src={bgHome}
          alt=""
          aria-hidden="true"
          className="fixed inset-0 -z-50 w-full h-full object-cover"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 40, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
        <div className="fixed inset-0 -z-46 bg-[#050b14]/70" />
        <div className="fixed inset-0 -z-45 bg-linear-to-b from-ink via-ink/70 to-ink" />
        <div className="fixed inset-0 -z-40 aurora-gradient opacity-40 mix-blend-screen" />

        {/* HUD data-console texture — a faint cyan grid, same visual
            vocabulary as the bracket-corner cards/panels everywhere else
            in the app. */}
        <div
          className="fixed inset-0 -z-38 opacity-[0.05] bg-[linear-gradient(rgba(0,229,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.6)_1px,transparent_1px)] bg-[size:56px_56px]"
          aria-hidden="true"
        />

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
        <motion.span
          variants={floatOrb}
          animate="animate"
          transition={{ delay: 1.5 }}
          className="fixed top-[12%] right-[18%] w-48 h-48 rounded-full bg-hud-cyan/10 blur-3xl pointer-events-none -z-30"
          aria-hidden="true"
        />
        <motion.span
          variants={floatOrb}
          animate="animate"
          transition={{ delay: 4.5 }}
          className="fixed bottom-[10%] left-[20%] w-56 h-56 rounded-full bg-accent2/10 blur-3xl pointer-events-none -z-30"
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
