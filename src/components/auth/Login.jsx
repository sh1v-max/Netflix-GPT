import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'motion/react'
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
import { USER_AVATAR, IMG_CDN_URL } from '../../utils/constant'
import usePopularMovies from '../../hooks/usePopularMovies'
import { Button } from '@/components/ui/button'
import { EASE } from '@/lib/motion'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

const Login = () => {
  const dispatch = useDispatch()
  const popularMovies = useSelector((store) => store.movies?.popularMovies)
  usePopularMovies()
  const posters = (popularMovies || []).filter((m) => m.poster_path).slice(0, 12)

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
    <div className="min-h-screen bg-ink text-text-dark flex">
      <Header />

      {/* Branding panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-border-hairline aurora-gradient">
        {posters.length > 0 && (
          <div className="absolute inset-0 grid grid-cols-4 gap-3 p-4 opacity-30">
            {posters.map((movie, i) => (
              <img
                key={movie.id}
                src={IMG_CDN_URL + movie.poster_path}
                alt=""
                aria-hidden="true"
                className="rounded-lg w-full aspect-2/3 object-cover"
                style={{ marginTop: `${(i % 3) * 28}px` }}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-bg-deep via-bg-deep/70 to-bg-deep/30" />

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative flex flex-col justify-end p-12 xl:p-16"
        >
          <motion.h1
            variants={fadeUp}
            className="font-display text-3xl xl:text-4xl font-semibold leading-tight mb-4"
          >
            Movies & shows, recommended by
            <span className="text-accent2"> what you actually like.</span>
          </motion.h1>
          <motion.div variants={fadeUp} className="flex flex-col gap-3 text-sm text-text-dark-muted mt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-accent2 shrink-0" size={14} />
              AI search that understands plain English, not keywords
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="text-accent2 shrink-0" size={14} />
              A taste graph built from what you actually rate
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-28 lg:py-16">
        <motion.form
          initial="hidden"
          animate="show"
          variants={stagger}
          onSubmit={(e) => e.preventDefault()}
          className="w-full max-w-sm"
        >
          <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-3xl font-semibold mb-1">
            {isSignInForm ? 'Welcome back' : 'Create your account'}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-text-dark-muted text-sm mb-8">
            {isSignInForm
              ? 'Sign in to keep discovering.'
              : 'Start building your taste graph.'}
          </motion.p>

          {!isSignInForm && (
            <motion.div variants={fadeUp} className="mb-4">
              <label className="block text-xs font-medium text-text-dark-muted mb-1.5">
                Full name
              </label>
              <input
                ref={name}
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                className="w-full p-3 bg-ink-elevated border border-border-hairline text-text-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2 transition-shadow placeholder:text-text-dark-muted/60"
              />
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="mb-4">
            <label className="block text-xs font-medium text-text-dark-muted mb-1.5">
              Email
            </label>
            <input
              ref={email}
              type="text"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full p-3 bg-ink-elevated border border-border-hairline text-text-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2 transition-shadow placeholder:text-text-dark-muted/60"
            />
          </motion.div>

          <motion.div variants={fadeUp} className="mb-2">
            <label className="block text-xs font-medium text-text-dark-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                ref={password}
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignInForm ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="w-full p-3 pr-11 bg-ink-elevated border border-border-hairline text-text-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2 transition-shadow placeholder:text-text-dark-muted/60"
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
          </motion.div>

          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rust text-sm font-medium py-2"
            >
              {errorMessage}
            </motion.p>
          )}

          <motion.div variants={fadeUp}>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="glow"
              className="w-full py-3 h-auto mt-6"
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
            <motion.div variants={fadeUp} className="flex justify-between items-center text-sm text-text-dark-muted mt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="accent-accent2 cursor-pointer" />
                <span>Remember me</span>
              </label>
              <button type="button" className="hover:underline cursor-pointer">
                Need help?
              </button>
            </motion.div>
          )}

          <motion.p variants={fadeUp} className="text-text-dark-muted mt-8 text-sm text-center">
            {isSignInForm ? "New here? " : 'Already have an account? '}
            <span
              className="text-accent2 hover:underline cursor-pointer font-medium"
              onClick={toggleSighInForm}
            >
              {isSignInForm ? 'Sign up now.' : 'Sign in now.'}
            </span>
          </motion.p>
        </motion.form>
      </div>
    </div>
  )
}

export default Login
