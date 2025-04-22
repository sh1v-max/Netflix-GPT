import React, { useRef, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import { checkValidateDate } from '../utils/validate'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../utils/firebase'
import { useDispatch } from 'react-redux'
import { addUser } from '../utils/userSlice'
import { USER_AVATAR } from '../utils/constant'

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const dispatch = useDispatch()
  // creating useRef for email and password
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
    if (!isSignInForm) {
      // Sign up logic

      createUserWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        // this is basically email and password we need to pass
        .then((userCredential) => {
          //? Signed up
          const user = userCredential.user

          // will update user using user api from firebase
          updateProfile(user, {
            displayName: name.current.value,
            photoURL: USER_AVATAR
          })
            .then(() => {
              const { uid, email, displayName, photoURL } = auth.currentUser;
              // auth.currentUser is the updated user
              dispatch(
                addUser({
                  uid: uid,
                  email: email,
                  name: displayName,
                  photo: photoURL,
                })
              )
              // Profile updated!
              // and once out profile is updated, we can navigate
              // navigate('/browse')
              // now we are navigating from header, by checking auth state
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

      <div className="absolute inset-0">
        <img
          src="https://assets.nflxext.com/ffe/siteui/vlv3/fc164b4b-f085-44ee-bb7f-ec7df8539eff/d23a1608-7d90-4da1-93d6-bae2fe60a69b/IN-en-20230814-popsignuptwoweeks-perspective_alpha_website_large.jpg"
          alt="Background Image"
          className="w-full h-full object-cover"
        />
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        action=""
        className="w-4/12 absolute p-12 bg-black my-50 mx-auto right-0 left-0 text-white rounded-md shadow-lg"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      >
        <h2 className="text-3xl font-semibold mb-6">
          {isSignInForm ? 'Sign In' : 'Sign Up'}
        </h2>
        {!isSignInForm && (
          <input
            ref={name}
            type="text"
            placeholder="Full Name"
            className="w-full p-3 mb-4 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        )}
        <input
          ref={email}
          type="text"
          placeholder="Email or phone number"
          className="w-full p-3 mb-4 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <div className="relative mb-8">
          <input
            ref={password}
            type={showPassword ? 'text' : 'password'}
            placeholder="password"
            className="w-full p-3 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600"
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
              alt={showPassword ? 'Hide password' : 'Show password'}
              className="w-5 h-5 cursor-pointer filter invert"
            />
          </button>
        </div>

        <p className="text-red-600 font-bold text-lg py-2">{errorMessage}</p>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 transition-colors duration-300 font-semibold py-3 rounded"
          onClick={handleButtonClick}
        >
          {isSignInForm ? 'Sign In' : 'Sign Up'}
        </button>

        <div className="flex justify-between items-center text-sm text-gray-400 mt-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="accent-red-600 cursor-pointer" />
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

      {/* <form
        className="w-11/12 sm:w-9/12 md:w-7/12 lg:w-5/12 xl:w-4/12 p-6 sm:p-8 md:p-10 lg:p-12 bg-black text-white rounded-md shadow-lg"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      >
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
          {isSignInForm ? 'Sign In' : 'Sign Up'}
        </h2>

        {!isSignInForm && (
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 mb-4 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        )}

        <input
          type="text"
          placeholder="Email or phone number"
          className="w-full p-3 mb-4 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600"
        />

        <div className="relative mb-8">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full p-3 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600"
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
              alt={showPassword ? 'Hide password' : 'Show password'}
              className="w-5 h-5 cursor-pointer filter invert"
            />
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 transition-colors duration-300 font-semibold py-3 rounded"
        >
          {isSignInForm ? 'Sign In' : 'Sign Up'}
        </button>

        <div className="flex justify-between items-center text-sm text-gray-400 mt-4 flex-wrap gap-2 sm:gap-0">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="accent-red-600 cursor-pointer" />
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
      </form> */}

      <div>
        <Footer />
      </div>
    </div>
  )
}

export default Login
