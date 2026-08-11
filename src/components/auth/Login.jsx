import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react'
import { Eye, EyeOff, Sparkles, BarChart3, Loader2 } from 'lucide-react'
import Header from '../layout/Header'
import { checkValidateDate } from '../../utils/validateConfig'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../../utils/firebaseConfig'
import { addUser } from '../../store/userSlice'
import { USER_AVATAR, BACKDROP_CDN_URL } from '../../utils/constant'
import usePopularMovies from '../../hooks/usePopularMovies'
import { Button } from '@/components/ui/button'
import { EASE, floatOrb } from '@/lib/motion'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

// Mouse-tracked 3D tilt — rotates its children in perspective space toward
// the cursor, spring-smoothed so it settles instead of snapping. Used on
// the branding panel's poster wall for real depth, not just a flat image.
const TiltPanel = ({ children, className = '', strength = 10 }) => {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 150, damping: 20, mass: 0.5 })
  const springY = useSpring(rotateY, { stiffness: 150, damping: 20, mass: 0.5 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * strength)
    rotateX.set(py * -strength)
  }
  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ perspective: 1200 }}
    >
      <motion.div
        style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  )
}

const Login = () => {
  const dispatch = useDispatch()
  const popularMovies = useSelector((store) => store.movies?.popularMovies)
  usePopularMovies()
  const backdrops = (popularMovies || []).filter((m) => m.backdrop_path).slice(0, 6)
  const heroBackdrop = backdrops[0]

  const [isSignInForm, setIsSignInForm] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const name = useRef(null)
  const email = useRef(null)
  const password = useRef(null)

  const toggleSighInForm = () => {
    setErrorMessage('')
    setIsSignInForm(!isSignInForm)
  }

  const handleButtonClick = () => {
    const message = checkValidateDate(
      email.current.value,
      password.current.value,
      isSignInForm ? null : name.current?.value
    )
    setErrorMessage(message)

    if (message) return

    setIsSubmitting(true)

    if (!isSignInForm) {
      createUserWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then((userCredential) => {
          const user = userCredential.user

          updateProfile(user, {
            displayName: name.current.value,
            photoURL: USER_AVATAR,
          })
            .then(() => {
              const { uid, email, displayName, photoURL } = auth.currentUser
              dispatch(
                addUser({
                  uid: uid,
                  email: email,
                  name: displayName,
                  photo: photoURL,
                })
              )
            })
            .catch((error) => {
              setErrorMessage(error.message)
              setIsSubmitting(false)
            })
        })
        .catch((error) => {
          const errorCode = error.code
          const errorMessage = error.message
          setErrorMessage(errorCode + ' ' + errorMessage)
          setIsSubmitting(false)
        })
    } else {
      signInWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then(() => {
          // navigation handled by onAuthStateChanged in Header
        })
        .catch((error) => {
          const errorCode = error.code
          const errorMessage = error.message
          setErrorMessage(errorCode + ' ' + errorMessage)
          setIsSubmitting(false)
        })
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-dvh bg-ink text-text-dark relative overflow-hidden">
      <Header />

      {/* Full-bleed cinematic background — single backdrop, slow Ken Burns
          drift, brighter/gentler overlay than a flat dark stripe so the
          image actually reads through. */}
      <div className="fixed inset-0 -z-10">
        {heroBackdrop && (
          <motion.img
            src={BACKDROP_CDN_URL + heroBackdrop.backdrop_path}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 24, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-ink/75 via-ink/35 to-ink/70" />
        <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/10 to-ink/30" />
        <div className="absolute inset-0 aurora-gradient opacity-30 mix-blend-screen pointer-events-none" />
      </div>

      <motion.span
        variants={floatOrb}
        animate="animate"
        className="fixed top-24 left-[8%] w-72 h-72 rounded-full bg-hud-cyan/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <motion.span
        variants={floatOrb}
        animate="animate"
        transition={{ delay: 3 }}
        className="fixed bottom-16 right-[10%] w-80 h-80 rounded-full bg-accent2/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative min-h-dvh flex flex-col lg:flex-row items-center justify-center gap-14 xl:gap-24 px-6 lg:px-16 xl:px-24 py-32">
        {/* Headline — sits directly on the cinematic background */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="flex-1 max-w-xl text-center lg:text-left"
        >
          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-6xl xl:text-7xl font-semibold leading-[1.02] tracking-tight mb-6 text-balance"
          >
            Movies & shows,
            <br />
            recommended by{' '}
            <span className="text-hud-cyan-strong">what you actually like.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-text-dark-muted text-base md:text-lg max-w-md mx-auto lg:mx-0 mb-8">
            An AI recommendation engine built on your own taste graph — not
            another feed of what's popular this week.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-3 text-sm text-text-dark-muted max-w-sm mx-auto lg:mx-0"
          >
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <Sparkles className="text-hud-cyan shrink-0" size={15} />
              AI search that understands plain English, not keywords
            </div>
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <BarChart3 className="text-hud-cyan shrink-0" size={15} />
              A taste graph built from what you actually rate
            </div>
          </motion.div>
        </motion.div>

        {/* Floating glass card — mouse-tracked 3D tilt, no HUD brackets
            here (those read as "data console"; this reads as "premium
            glass," a deliberate contrast on the one page meant to sell
            the product in five seconds). */}
        <TiltPanel className="w-full max-w-sm" strength={5}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative rounded-[28px] bg-surface-glass backdrop-blur-xl border border-white/10 p-8 sm:p-10 shadow-cg-elevated"
          >
            <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-hud-cyan/60 to-transparent" />

            <form onSubmit={(e) => e.preventDefault()}>
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignInForm ? 'signin-heading' : 'signup-heading'}
                initial={{ opacity: 0, rotateX: -40, y: -8 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                exit={{ opacity: 0, rotateX: 40, y: 8 }}
                transition={{ duration: 0.35, ease: EASE }}
                style={{ transformPerspective: 800 }}
              >
                <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-1">
                  {isSignInForm ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-text-dark-muted text-sm mb-8">
                  {isSignInForm
                    ? 'Sign in to keep discovering.'
                    : 'Start building your taste graph.'}
                </p>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {!isSignInForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0, rotateX: -30 }}
                  animate={{ opacity: 1, height: 'auto', rotateX: 0 }}
                  exit={{ opacity: 0, height: 0, rotateX: -30 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  style={{ transformPerspective: 800, transformOrigin: 'top' }}
                  className="overflow-hidden"
                >
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-text-dark-muted mb-1.5">
                      Full name
                    </label>
                    <input
                      ref={name}
                      type="text"
                      autoComplete="name"
                      placeholder="Jane Doe"
                      className="w-full p-3.5 bg-white/5 border border-white/10 text-text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-hud-cyan focus:border-hud-cyan/40 transition-all placeholder:text-text-dark-muted/50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-4">
              <label className="block text-xs font-medium text-text-dark-muted mb-1.5">
                Email
              </label>
              <motion.input
                ref={email}
                type="text"
                autoComplete="email"
                placeholder="you@example.com"
                whileFocus={{ scale: 1.01 }}
                className="w-full p-3.5 bg-white/5 border border-white/10 text-text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-hud-cyan focus:border-hud-cyan/40 transition-all placeholder:text-text-dark-muted/50"
              />
            </div>

            <div className="mb-2">
              <label className="block text-xs font-medium text-text-dark-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <motion.input
                  ref={password}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignInForm ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  whileFocus={{ scale: 1.01 }}
                  className="w-full p-3.5 pr-11 bg-white/5 border border-white/10 text-text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-hud-cyan focus:border-hud-cyan/40 transition-all placeholder:text-text-dark-muted/50"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-dark-muted hover:text-text-dark cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rust text-sm font-medium py-2"
              >
                {errorMessage}
              </motion.p>
            )}

            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 h-auto mt-6 bg-hud-cyan text-ink hover:bg-hud-cyan-strong shadow-[0_0_24px_var(--color-hud-cyan-glow)]"
                onClick={handleButtonClick}
              >
                {isSubmitting && <Loader2 className="animate-spin size-4" />}
                {isSubmitting
                  ? isSignInForm
                    ? 'Signing In...'
                    : 'Signing Up...'
                  : isSignInForm
                  ? 'Sign In'
                  : 'Create Account'}
              </Button>
            </motion.div>

            {isSignInForm && (
              <div className="flex justify-between items-center text-sm text-text-dark-muted mt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="accent-hud-cyan cursor-pointer" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="hover:underline cursor-pointer">
                  Need help?
                </button>
              </div>
            )}

            <p className="text-text-dark-muted mt-8 text-sm text-center">
              {isSignInForm ? "New here? " : 'Already have an account? '}
              <span
                className="text-hud-cyan-strong hover:underline cursor-pointer font-medium"
                onClick={toggleSighInForm}
              >
                {isSignInForm ? 'Sign up now.' : 'Sign in now.'}
              </span>
            </p>
          </form>

          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-dark-muted/60 text-center mt-8">
            Secured with Firebase Auth
          </p>
          </motion.div>
        </TiltPanel>
      </div>
    </div>
  )
}

export default Login
