import React from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { Sparkles, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EASE } from '@/lib/motion'
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
  placeholder,
  submitLabel,
}) => {
  const hasResults = useSelector((store) => store.gpt.movieNames)

  const handleSubmit = (e) => {
    e?.preventDefault()
    onSubmit(query)
  }

  return (
    <div className="flex flex-col items-center px-4 md:px-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center gap-2 mb-4 text-accent2"
      >
        <Sparkles size={16} />
        <span className="text-cg-label uppercase tracking-wider font-medium">
          AI-powered search
        </span>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl"
      >
        <div className="flex items-center gap-2 bg-surface-glass backdrop-blur-[--blur-cg-glass] border border-border-hairline focus-within:border-accent2/60 focus-within:shadow-[0_0_0_1px_var(--color-accent2-glow),0_0_32px_var(--color-accent2-glow)] rounded-panel shadow-cg-elevated p-2.5 md:p-3 transition-shadow duration-300">
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            type="text"
            disabled={isSearching}
            className="grow min-w-0 px-3 py-2.5 md:px-5 md:py-3.5 text-sm md:text-lg bg-transparent text-text-dark placeholder-text-dark-muted focus:outline-none disabled:opacity-60"
            placeholder={placeholder}
          />
          <Button
            type="submit"
            disabled={isSearching || !query.trim()}
            variant="glow"
            size="icon-lg"
            className="rounded-xl shrink-0"
            aria-label={submitLabel}
          >
            {isSearching ? (
              <ThinkingDots className="text-white" />
            ) : (
              <ArrowUp className="size-5" />
            )}
          </Button>
        </div>
      </motion.form>

      {!query && !isSearching && !hasResults && (
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
              className="text-xs md:text-sm px-3.5 py-2 rounded-full border border-border-hairline text-text-dark-muted hover:text-text-dark hover:border-accent2/50 bg-ink-elevated/60 transition-colors cursor-pointer"
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
