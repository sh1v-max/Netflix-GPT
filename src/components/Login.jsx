import React, { useRef, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import { checkValidateDate } from '../utils/validateConfig'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../utils/firebaseConfig'
import { useDispatch } from 'react-redux'
import { addUser } from '../store/userSlice'
import { IMG_BACKGROUND, USER_AVATAR } from '../utils/constant'

const Login = () => {
  const dispatch = useDispatch()
  const [isSignInForm, setIsSignInForm] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const name = useRef(null)
  const email = useRef(null)
  const password = useRef(null)

  const toggleSighInForm = () => {
    setIsSignInForm(!isSignInForm)
  }

  const handleButtonClick = () => {
    // form validations
    // where to get email and password?
    // we can either use state variables or we can use state reference
    //? we can use useRef() to do that
    // we need reference to the input fields to do so
    const message = checkValidateDate(
      email.current.value,
      password.current.value,
      isSignInForm ? null : name.current?.value
    )
    setErrorMessage(message)

    if (message) return

    // checking if it's for sign up or sign in
    if (!isSignInForm) {
      // continuing with the logic... sign in
      createUserWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        // this is basically email and password we need to pass
        .then((userCredential) => {
          //? Signed up
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
            })

          console.log(user) // user
        })
        .catch((error) => {
          const errorCode = error.code
          const errorMessage = error.message
          setErrorMessage(errorCode + ' ' + errorMessage)
        })
    } else {
      //? Sign in logic
      signInWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then(() => {
          // Signed in
          // log to the home page
        })
        .catch((error) => {
          const errorCode = error.code
          const errorMessage = error.message
          setErrorMessage(errorCode + ' ' + errorMessage)
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
              placeholder="Full Name"
              className="w-full p-3 mb-4 bg-gray-800 text-white rounded"
            />
          )}
          <input
            ref={email}
            type="text"
            placeholder="Email or phone number"
            className="w-full p-3 mb-4 bg-gray-800 text-white rounded"
          />
          <div className="relative mb-8">
            <input
              ref={password}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full p-3 bg-gray-800 text-white rounded"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <img
                src={
                  showPassword
                    ? 'https://cdn-icons-png.flaticon.com/512/709/709612.png'
                    : 'https://cdn-icons-png.flaticon.com/512/2767/2767146.png'
                }
                alt="Toggle Password"
                className="w-5 h-5 cursor-pointer filter invert"
              />
            </button>
          </div>
  
          <p className="text-red-600 font-bold text-lg py-2">{errorMessage}</p>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 font-semibold py-3 rounded"
            onClick={handleButtonClick}
          >
            {isSignInForm ? 'Sign In' : 'Sign Up'}
          </button>
  
          <div className="flex justify-between items-center text-sm text-gray-400 mt-4">
            <label className="flex items-center space-x-2">
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
