import React, { useRef, useState } from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import { checkValidateDate } from '../../utils/validateConfig'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../../utils/firebaseConfig'
import { useDispatch } from 'react-redux'
import { addUser } from '../../store/userSlice'
import { IMG_BACKGROUND, USER_AVATAR } from '../../utils/constant'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { ImSpinner8 } from 'react-icons/im'

const Login = () => {
  const dispatch = useDispatch()
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
    <div>
      <Header />
  
      <div className="relative h-screen w-full">
        <img
          src={IMG_BACKGROUND}
          alt="Background"
          className="fixed w-full h-full object-cover inset-0 -z-10"
        />
      </div>
  
      <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-[350px] sm:w-[500px] p-6 sm:p-12 bg-black bg-opacity-80 text-white rounded-md shadow-lg z-10"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
            {isSignInForm ? 'Sign In' : 'Sign Up'}
          </h2>

          {!isSignInForm && (
            <input
              ref={name}
              type="text"
              autoComplete="name"
              placeholder="Full Name"
              className="w-full p-3 mb-4 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow"
            />
          )}
          <input
            ref={email}
            type="text"
            autoComplete="email"
            placeholder="Email or phone number"
            className="w-full p-3 mb-4 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow"
          />
          <div className="relative mb-8">
            <input
              ref={password}
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignInForm ? 'current-password' : 'new-password'}
              placeholder="Password"
              className="w-full p-3 pr-11 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600 transition-shadow"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer transition-colors"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm font-medium py-2 -mt-4 mb-2">
              {errorMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800/70 disabled:cursor-not-allowed font-semibold py-3 rounded transition-colors"
            onClick={handleButtonClick}
          >
            {isSubmitting && <ImSpinner8 className="animate-spin" size={16} />}
            {isSubmitting
              ? isSignInForm
                ? 'Signing In...'
                : 'Signing Up...'
              : isSignInForm
              ? 'Sign In'
              : 'Sign Up'}
          </button>

          <div className="flex justify-between items-center text-sm text-gray-400 mt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-red-600 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="hover:underline cursor-pointer">
              Need help?
            </button>
          </div>

          <p className="text-gray-400 mt-6 text-sm">
            {isSignInForm ? 'New to Netflix? ' : 'Already have an account? '}
            <span
              className="text-white hover:underline cursor-pointer"
              onClick={toggleSighInForm}
            >
              {isSignInForm ? 'Sign up now.' : 'Sign in now.'}
            </span>
          </p>
        </form>
      </div>

      <Footer />
    </div>
  )
  
}

export default Login
