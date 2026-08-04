import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import usePopularMovies from '../../hooks/usePopularMovies'
import { IMG_CDN_URL } from '../../utils/constant'
import { Button } from '@/components/ui/button'
import { Sparkles, Film, BarChart3, ArrowRight } from 'lucide-react'
import { EASE } from '@/lib/motion'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const FeatureSection = ({ icon, badge, title, description, visual, reverse }) => {
  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={stagger}
      className={`flex flex-col ${
        reverse ? 'md:flex-row-reverse' : 'md:flex-row'
      } items-center gap-10 md:gap-16 max-w-5xl mx-auto px-6 py-14 md:py-20`}
    >
      <motion.div variants={fadeUp} className="flex-1 text-center md:text-left">
        <div className="inline-flex items-center gap-2 text-accent2 mb-3">
          {icon}
          {badge && (
            <span className="text-cg-label font-medium uppercase tracking-wider bg-accent2/15 text-accent2 px-2.5 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <h2 className="font-display text-2xl md:text-4xl font-semibold mb-3">
          {title}
        </h2>
        <p className="text-text-dark-muted text-sm md:text-base max-w-md mx-auto md:mx-0">
          {description}
        </p>
      </motion.div>
      <motion.div variants={fadeUp} className="flex-1 w-full max-w-sm">
        {visual}
      </motion.div>
    </motion.section>
  )
}

const Home = () => {
  const popularMovies = useSelector((store) => store.movies?.popularMovies)
  usePopularMovies()

  const posters = (popularMovies || []).filter((m) => m.poster_path).slice(0, 18)

  return (
    <div className="min-h-screen bg-ink text-text-dark flex flex-col">
      <Header />

      <main className="flex-1">
      {/* Hero */}
      <section className="relative min-h-120 md:min-h-150 flex items-center pt-20 pb-16 overflow-hidden aurora-gradient">
        {posters.length > 0 && (
          <div className="absolute inset-0 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2 md:gap-3 px-4 opacity-25">
            {posters.map((movie, i) => (
              <img
                key={movie.id}
                src={IMG_CDN_URL + movie.poster_path}
                alt=""
                aria-hidden="true"
                className="rounded-lg w-full aspect-2/3 object-cover"
                style={{ marginTop: `${(i % 3) * 24}px` }}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-b from-bg-deep/30 via-bg-deep/70 to-ink" />

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative text-center px-6 max-w-2xl mx-auto w-full"
        >
          <motion.h1
            variants={fadeUp}
            className="font-display text-3xl md:text-5xl font-semibold mb-4 leading-tight tracking-tight"
          >
            Movies & shows, recommended by
            <span className="text-accent2"> what you actually like.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-text-dark-muted text-sm md:text-lg mb-8"
          >
            Cinegraph is an AI recommendation engine built on your own taste
            graph — not another feed of what's popular this week.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
            <Button asChild variant="glow" size="xl">
              <Link to="/login">
                Get Started
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature sections */}
      <FeatureSection
        icon={<Sparkles size={18} />}
        title="Ask, don't scroll."
        description="Type what you're in the mood for in plain English — Cinegraph's AI search understands it and finds real matches, instead of a fixed list of the same ten trending titles."
        visual={
          <div className="bg-ink-elevated rounded-panel p-5 border border-border-hairline shadow-cg-card">
            <p className="text-xs text-text-dark-muted mb-3">You search:</p>
            <p className="text-sm font-medium mb-4">
              "something like Inception, but shorter"
            </p>
            <div className="h-px bg-border-hairline mb-4" />
            <p className="text-xs text-text-dark-muted mb-2">Cinegraph finds:</p>
            <div className="flex gap-2">
              {posters.slice(12, 15).map((movie) => (
                <img
                  key={movie.id}
                  src={IMG_CDN_URL + movie.poster_path}
                  alt=""
                  loading="lazy"
                  className="flex-1 min-w-0 aspect-2/3 object-cover rounded-lg border border-border-hairline"
                />
              ))}
            </div>
          </div>
        }
      />

      <FeatureSection
        reverse
        icon={<Film size={18} />}
        title="One database. Movies and shows."
        description="Browse thousands of movies and TV shows in one place — now playing, popular, top rated, on the air — without switching apps for each."
        visual={
          <div className="grid grid-cols-3 gap-2">
            {posters.slice(6, 12).map((movie) => (
              <img
                key={movie.id}
                src={IMG_CDN_URL + movie.poster_path}
                alt=""
                loading="lazy"
                className="rounded-lg w-full aspect-2/3 object-cover"
              />
            ))}
          </div>
        }
      />

      <FeatureSection
        icon={<BarChart3 size={18} />}
        badge="Coming soon"
        title="Your taste, mapped."
        description="Rate what you watch and Cinegraph builds a visible taste graph — favorite genres, eras, and people — then uses it to explain exactly why each recommendation was picked."
        visual={
          <div className="bg-ink-elevated rounded-panel p-5 border border-border-hairline shadow-cg-card">
            <p className="text-xs text-text-dark-muted mb-4">Your top genres</p>
            <div className="flex items-end gap-3 h-24">
              {[85, 60, 45, 30].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-accent2/70 rounded-t-md"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        }
      />

      {/* CTA banner */}
      <section className="relative aurora-gradient text-center py-16 md:py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-bg-deep/40" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative"
        >
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
            Create your account and start discovering.
          </h2>
          <Button asChild variant="glow" size="xl">
            <Link to="/login">
              Join Cinegraph
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Link>
          </Button>
        </motion.div>
      </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home
