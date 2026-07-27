import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import { FaEye, FaEyeSlash, FaMagic, FaChartBar } from 'react-icons/fa'
import { ImSpinner8 } from 'react-icons/im'

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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/5">
        {posters.length > 0 && (
          <div className="absolute inset-0 grid grid-cols-4 gap-3 p-4 opacity-50">
            {posters.map((movie, i) => (
              <img
                key={movie.id}
                src={IMG_CDN_URL + movie.poster_path}
                alt=""
                aria-hidden="true"
                className="rounded-md w-full h-auto object-cover"
                style={{ marginTop: `${(i % 3) * 28}px` }}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/70 to-ink/30" />

        <div className="relative flex flex-col justify-end p-12 xl:p-16">
          <h1 className="font-display text-3xl xl:text-4xl font-semibold leading-tight mb-4">
            Movies & shows, recommended by
            <span className="text-accent"> what you actually like.</span>
          </h1>
          <div className="flex flex-col gap-3 text-sm text-text-dark-muted mt-2">
            <div className="flex items-center gap-2">
              <FaMagic className="text-accent shrink-0" size={14} />
              AI search that understands plain English, not keywords
            </div>
            <div className="flex items-center gap-2">
              <FaChartBar className="text-accent shrink-0" size={14} />
              A taste graph built from what you actually rate
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-28 lg:py-16">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full max-w-sm"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-1">
            {isSignInForm ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-text-dark-muted text-sm mb-8">
            {isSignInForm
              ? 'Sign in to keep discovering.'
              : 'Start building your taste graph.'}
          </p>

          {!isSignInForm && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-text-dark-muted mb-1.5">
                Full name
              </label>
              <input
                ref={name}
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                className="w-full p-3 bg-ink-elevated border border-white/5 text-text-dark rounded-[--radius-card] focus:outline-none focus:ring-2 focus:ring-accent transition-shadow placeholder:text-text-dark-muted/60"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-medium text-text-dark-muted mb-1.5">
              Email
            </label>
            <input
              ref={email}
              type="text"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full p-3 bg-ink-elevated border border-white/5 text-text-dark rounded-[--radius-card] focus:outline-none focus:ring-2 focus:ring-accent transition-shadow placeholder:text-text-dark-muted/60"
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs font-medium text-text-dark-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                ref={password}
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignInForm ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="w-full p-3 pr-11 bg-ink-elevated border border-white/5 text-text-dark rounded-[--radius-card] focus:outline-none focus:ring-2 focus:ring-accent transition-shadow placeholder:text-text-dark-muted/60"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-dark-muted hover:text-text-dark cursor-pointer transition-colors"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className="text-rust text-sm font-medium py-2">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-strong disabled:bg-accent/50 disabled:cursor-not-allowed text-on-accent font-semibold py-3 rounded-[--radius-card] transition-colors mt-6"
            onClick={handleButtonClick}
          >
            {isSubmitting && <ImSpinner8 className="animate-spin" size={16} />}
            {isSubmitting
              ? isSignInForm
                ? 'Signing In...'
                : 'Signing Up...'
              : isSignInForm
              ? 'Sign In'
              : 'Create Account'}
          </button>

          {isSignInForm && (
            <div className="flex justify-between items-center text-sm text-text-dark-muted mt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="accent-accent cursor-pointer" />
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
              className="text-accent hover:underline cursor-pointer font-medium"
              onClick={toggleSighInForm}
            >
              {isSignInForm ? 'Sign up now.' : 'Sign in now.'}
            </span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
