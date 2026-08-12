import React from 'react'
import { motion } from 'motion/react'
import { Sparkles, ArrowUp, Radar, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EASE } from '@/lib/motion'
import HudBadge from '../shared/HudBadge'
import ThinkingDots from './ThinkingDots'

const EXAMPLE_PROMPTS = [
  'Something like Inception, but shorter',
  'Cozy comfort movies for a rainy day',
  'Underrated 90s thrillers',
  'Mind-bending sci-fi with a twist ending',
]

const GptSearchBar = ({
  query,
  onQueryChange,
  onSubmit,
  isSearching,
  isFollowUp,
  onStartOver,
  placeholder,
  submitLabel,
}) => {
  const isIdle = !query && !isSearching && !isFollowUp

  const handleSubmit = (e) => {
    e?.preventDefault()
    onSubmit(query)
  }

  return (
    <div className="flex flex-col items-center px-4 md:px-6 w-full">
      {isIdle && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col items-center text-center mb-8"
        >
          <HudBadge icon={Radar}>AI-Powered Recommendation Engine</HudBadge>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold leading-[0.95] tracking-tighter text-balance mb-5 drop-shadow-[0_4px_32px_rgba(0,0,0,0.7)]">
            Ask,
            <br />
            <span className="text-hud-cyan-strong [text-shadow:0_0_50px_var(--color-hud-cyan-glow)]">
              and discover.
            </span>
          </h1>
          <p className="text-text-dark-muted text-base md:text-xl max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Describe a mood, a plot, or a title you loved — Cinegraph's AI
            finds real matches, not just what's trending.
          </p>

          <div className="flex items-center justify-center gap-8 md:gap-14 mt-10 font-mono">
            {[
              ['3', 'Turn Refinement'],
              ['Movies + TV', 'Every Category'],
              ['Live', 'Taste Graph'],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <p className="text-xl md:text-3xl font-semibold text-hud-cyan-strong tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                  {value}
                </p>
                <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-text-dark-muted mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {isFollowUp && (
        <div className="flex items-center justify-between w-full max-w-3xl mb-2 px-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-hud-cyan">
            Ask a follow-up
          </span>
          <button
            type="button"
            onClick={onStartOver}
            className="flex items-center gap-1.5 text-xs text-text-dark-muted hover:text-hud-cyan-strong transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            Start over
          </button>
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl"
      >
        {/* Ambient breathing glow behind the bar while idle — invites the
            first interaction instead of sitting inert. */}
        {isIdle && (
          <motion.div
            aria-hidden="true"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-1 rounded-panel bg-hud-cyan/20 blur-xl -z-10"
          />
        )}
        <div className="relative flex items-center gap-2 bg-surface-glass backdrop-blur-xl border border-hud-line focus-within:border-hud-cyan/60 focus-within:shadow-[0_0_0_1px_var(--color-hud-cyan-glow),0_0_32px_var(--color-hud-cyan-glow)] rounded-panel shadow-cg-elevated p-2.5 md:p-3 transition-shadow duration-300">
          <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-hud-cyan/60 to-transparent" aria-hidden="true" />
          <Sparkles className="text-hud-cyan shrink-0 ml-2 hidden sm:block" size={18} />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            type="text"
            disabled={isSearching}
            className="grow min-w-0 px-3 py-2.5 md:px-3 md:py-3.5 text-sm md:text-lg bg-transparent text-text-dark placeholder-text-dark-muted focus:outline-none disabled:opacity-60"
            placeholder={isFollowUp ? 'More like the third one but shorter…' : placeholder}
          />
          <Button
            type="submit"
            disabled={isSearching || !query.trim()}
            size="icon-lg"
            className="rounded-xl shrink-0 bg-hud-cyan text-ink hover:bg-hud-cyan-strong"
            aria-label={submitLabel}
          >
            {isSearching ? (
              <ThinkingDots className="text-ink" />
            ) : (
              <ArrowUp className="size-5" />
            )}
          </Button>
        </div>
      </motion.form>

      {isIdle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mt-5 max-w-2xl"
        >
          {EXAMPLE_PROMPTS.map((prompt) => (
            <motion.button
              key={prompt}
              type="button"
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => onSubmit(prompt)}
              className="text-xs md:text-sm px-3.5 py-2 rounded-full border border-hud-line text-text-dark-muted hover:text-hud-cyan-strong hover:border-hud-cyan/50 bg-ink-elevated/60 transition-colors cursor-pointer"
            >
              {prompt}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default GptSearchBar
