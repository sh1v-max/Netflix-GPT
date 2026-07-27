import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import usePopularMovies from '../../hooks/usePopularMovies'
import { IMG_CDN_URL } from '../../utils/constant'
import { FaMagic, FaFilm, FaChartBar } from 'react-icons/fa'

const FeatureSection = ({ icon, badge, title, description, visual, reverse }) => (
  <section
    className={`flex flex-col ${
      reverse ? 'md:flex-row-reverse' : 'md:flex-row'
    } items-center gap-10 md:gap-16 max-w-5xl mx-auto px-6 py-14 md:py-20`}
  >
    <div className="flex-1 text-center md:text-left">
      <div className="inline-flex items-center gap-2 text-accent mb-3">
        {icon}
        {badge && (
          <span className="text-xs font-semibold tracking-wide uppercase bg-accent-soft/15 text-accent px-2.5 py-1 rounded-full">
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
    </div>
    <div className="flex-1 w-full max-w-sm">{visual}</div>
  </section>
)

const Home = () => {
  const popularMovies = useSelector((store) => store.movies?.popularMovies)
  usePopularMovies()

  const posters = (popularMovies || []).filter((m) => m.poster_path).slice(0, 18)

  return (
    <div className="min-h-screen bg-ink text-text-dark">
      <Header />

      {/* Hero */}
      <section className="relative min-h-120 md:min-h-150 flex items-center pt-20 pb-16 overflow-hidden">
        {posters.length > 0 && (
          <div className="absolute inset-0 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2 md:gap-3 px-4 opacity-60">
            {posters.map((movie, i) => (
              <img
                key={movie.id}
                src={IMG_CDN_URL + movie.poster_path}
                alt=""
                aria-hidden="true"
                className="rounded-md w-full h-auto object-cover"
                style={{ marginTop: `${(i % 3) * 24}px` }}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-b from-ink/20 via-ink/60 to-ink" />

        <div className="relative text-center px-6 max-w-2xl mx-auto w-full">
          <h1 className="font-display text-3xl md:text-5xl font-semibold mb-4 leading-tight">
            Movies & shows, recommended by
            <span className="text-accent"> what you actually like.</span>
          </h1>
          <p className="text-text-dark-muted text-sm md:text-lg mb-8">
            Cinegraph is an AI recommendation engine built on your own taste
            graph — not another feed of what's popular this week.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="bg-accent hover:bg-accent-strong text-on-accent font-semibold px-6 py-3 rounded-[--radius-card] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Feature sections */}
      <FeatureSection
        icon={<FaMagic size={18} />}
        title="Ask, don't scroll."
        description="Type what you're in the mood for in plain English — Cinegraph's AI search understands it and finds real matches, instead of a fixed list of the same ten trending titles."
        visual={
          <div className="bg-ink-elevated rounded-[--radius-card] p-5 border border-white/5">
            <p className="text-xs text-text-dark-muted mb-3">You search:</p>
            <p className="text-sm font-medium mb-4">
              "something like Inception, but shorter"
            </p>
            <div className="h-px bg-white/10 mb-4" />
            <p className="text-xs text-text-dark-muted mb-2">Cinegraph finds:</p>
            <div className="flex gap-2">
              {posters.slice(12, 15).map((movie) => (
                <img
                  key={movie.id}
                  src={IMG_CDN_URL + movie.poster_path}
                  alt=""
                  className="flex-1 min-w-0 aspect-2/3 object-cover rounded-sm border border-white/5"
                />
              ))}
            </div>
          </div>
        }
      />

      <FeatureSection
        reverse
        icon={<FaFilm size={18} />}
        title="One database. Movies and shows."
        description="Browse thousands of movies and TV shows in one place — now playing, popular, top rated, on the air — without switching apps for each."
        visual={
          <div className="grid grid-cols-3 gap-2">
            {posters.slice(6, 12).map((movie) => (
              <img
                key={movie.id}
                src={IMG_CDN_URL + movie.poster_path}
                alt=""
                className="rounded-md w-full h-auto object-cover"
              />
            ))}
          </div>
        }
      />

      <FeatureSection
        icon={<FaChartBar size={18} />}
        badge="Coming soon"
        title="Your taste, mapped."
        description="Rate what you watch and Cinegraph builds a visible taste graph — favorite genres, eras, and people — then uses it to explain exactly why each recommendation was picked."
        visual={
          <div className="bg-ink-elevated rounded-[--radius-card] p-5 border border-white/5">
            <p className="text-xs text-text-dark-muted mb-4">Your top genres</p>
            <div className="flex items-end gap-3 h-24">
              {[85, 60, 45, 30].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-accent/70 rounded-t-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        }
      />

      {/* CTA banner */}
      <section className="hero-gradient text-center py-16 md:py-24 px-6">
        <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
          Create your account and start discovering.
        </h2>
        <Link
          to="/login"
          className="inline-block bg-accent hover:bg-accent-strong text-on-accent font-semibold px-8 py-3 rounded-[--radius-card] transition-colors"
        >
          Join Cinegraph
        </Link>
      </section>

      <Footer />
    </div>
  )
}

export default Home
