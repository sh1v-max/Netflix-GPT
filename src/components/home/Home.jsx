import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import HudFrame from '../movies/HudFrame'
import usePopularMovies from '../../hooks/usePopularMovies'
import { IMG_CDN_URL, BACKDROP_CDN_URL } from '../../utils/constant'
import { Button } from '@/components/ui/button'
import { Sparkles, Film, BarChart3, ArrowRight, Radar } from 'lucide-react'
import { EASE } from '@/lib/motion'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

// Small bracket-cornered pill — the hero/section equivalent of
// SectionEyebrow, used where the label needs to read as a standalone tag
// rather than a header for content directly below it.
const Eyebrow = ({ icon: Icon, children }) => (
  <div className="hud-panel relative inline-flex items-center gap-2 px-3 py-1.5 mb-6">
    <span className="hud-corner hud-corner--tl" aria-hidden="true" />
    <span className="hud-corner hud-corner--tr" aria-hidden="true" />
    <span className="hud-corner hud-corner--bl" aria-hidden="true" />
    <span className="hud-corner hud-corner--br" aria-hidden="true" />
    <Icon size={13} className="text-hud-cyan" />
    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-hud-cyan-strong">
      {children}
    </span>
  </div>
)

const FeatureSection = ({ icon, badge, title, description, visual, reverse }) => {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={stagger}
      className={`flex flex-col ${
        reverse ? 'md:flex-row-reverse' : 'md:flex-row'
      } items-center gap-10 md:gap-20 max-w-6xl mx-auto px-6 py-16 md:py-28`}
    >
      <motion.div variants={fadeUp} className="flex-1 text-center md:text-left">
        <div className="inline-flex items-center gap-2 text-hud-cyan mb-4">
          {icon}
          {badge && (
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] bg-hud-cyan/10 text-hud-cyan-strong px-2.5 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <h2 className="font-display text-4xl md:text-6xl font-semibold mb-4 leading-[1.05] tracking-tight">
          {title}
        </h2>
        <p className="text-text-dark-muted text-base md:text-lg max-w-md mx-auto md:mx-0">
          {description}
        </p>
      </motion.div>
      <motion.div variants={fadeUp} className="flex-1 w-full max-w-md">
        {visual}
      </motion.div>
    </motion.section>
  )
}

const Home = () => {
  const popularMovies = useSelector((store) => store.movies?.popularMovies)
  usePopularMovies()

  const posters = (popularMovies || []).filter((m) => m.poster_path).slice(0, 18)
  const backdrops = (popularMovies || []).filter((m) => m.backdrop_path).slice(0, 8)

  return (
    <div className="min-h-screen bg-ink text-text-dark flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-dvh flex items-center pt-28 pb-20 overflow-hidden aurora-gradient">
          {backdrops.length > 0 && (
            <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 p-3 md:p-4 opacity-30">
              {backdrops.map((movie, i) => (
                <img
                  key={movie.id}
                  src={BACKDROP_CDN_URL + movie.backdrop_path}
                  alt=""
                  aria-hidden="true"
                  className="rounded-xl w-full aspect-video object-cover"
                  style={{ marginTop: `${(i % 2) * 32}px` }}
                />
              ))}
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-b from-ink/60 via-ink/80 to-ink" />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-transparent to-transparent" />

          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="relative text-center px-6 max-w-4xl mx-auto w-full"
          >
            <motion.div variants={fadeUp} className="flex justify-center">
              <Eyebrow icon={Radar}>AI-Powered Recommendation Engine</Eyebrow>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold mb-6 leading-[0.95] tracking-tighter"
            >
              Movies & shows,
              <br />
              <span className="text-hud-cyan-strong">picked for you.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-text-dark-muted text-lg md:text-2xl mb-10 max-w-2xl mx-auto"
            >
              Cinegraph is an AI recommendation engine built on your own taste
              graph — not another feed of what's popular this week.
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
              <Button
                asChild
                size="xl"
                className="bg-hud-cyan text-ink hover:bg-hud-cyan-strong text-base md:text-lg px-8 py-6"
              >
                <Link to="/login">
                  Get Started
                  <ArrowRight className="size-5" data-icon="inline-end" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex items-center justify-center gap-8 md:gap-14 mt-16 font-mono"
            >
              {[
                ['1M+', 'Titles Indexed'],
                ['AI', 'Natural Search'],
                ['Live', 'Taste Graph'],
              ].map(([value, label]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl md:text-4xl font-semibold text-hud-cyan-strong tracking-tight">
                    {value}
                  </p>
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-text-dark-muted mt-1">
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Feature sections */}
        <FeatureSection
          icon={<Sparkles size={18} />}
          title="Ask, don't scroll."
          description="Type what you're in the mood for in plain English — Cinegraph's AI search understands it and finds real matches, instead of a fixed list of the same ten trending titles."
          visual={
            <HudFrame className="p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-dark-muted mb-3">
                You search
              </p>
              <p className="text-base md:text-lg font-medium mb-5">
                "something like Inception, but shorter"
              </p>
              <div className="h-px bg-hud-line mb-5" />
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-dark-muted mb-3">
                Cinegraph finds
              </p>
              <div className="flex gap-2">
                {posters.slice(12, 15).map((movie) => (
                  <img
                    key={movie.id}
                    src={IMG_CDN_URL + movie.poster_path}
                    alt=""
                    loading="lazy"
                    className="flex-1 min-w-0 aspect-2/3 object-cover rounded-lg border border-hud-line"
                  />
                ))}
              </div>
            </HudFrame>
          }
        />

        <FeatureSection
          reverse
          icon={<Film size={18} />}
          title="One database. Movies and shows."
          description="Browse thousands of movies and TV shows in one place — now playing, popular, top rated, on the air — without switching apps for each."
          visual={
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {posters.slice(6, 12).map((movie) => (
                <img
                  key={movie.id}
                  src={IMG_CDN_URL + movie.poster_path}
                  alt=""
                  loading="lazy"
                  className="rounded-xl w-full aspect-2/3 object-cover border border-hud-line"
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
            <HudFrame className="p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-dark-muted mb-5">
                Your top genres
              </p>
              <div className="flex items-end gap-3 h-32">
                {[85, 60, 45, 30].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-hud-cyan/70 rounded-t-md"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </HudFrame>
          }
        />

        {/* CTA banner */}
        <section className="relative text-center py-24 md:py-36 px-6 overflow-hidden">
          {backdrops.length > 0 && (
            <img
              src={BACKDROP_CDN_URL + backdrops[0].backdrop_path}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 aurora-gradient" />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/70 to-ink/40" />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative"
          >
            <h2 className="font-display text-4xl md:text-6xl font-semibold mb-8 leading-[1.05] tracking-tight max-w-3xl mx-auto">
              Create your account and start discovering.
            </h2>
            <Button
              asChild
              size="xl"
              className="bg-hud-cyan text-ink hover:bg-hud-cyan-strong text-base md:text-lg px-8 py-6"
            >
              <Link to="/login">
                Join Cinegraph
                <ArrowRight className="size-5" data-icon="inline-end" />
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
