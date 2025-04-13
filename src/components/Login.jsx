import React, { useState } from 'react'
import Header from './Header'
import { Footer } from './Footer'

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(true)

  const toggleSighInForm = () => {
    setIsSignInForm(!isSignInForm)
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
        action=""
        className="w-4/12 absolute p-12 bg-black my-50 mx-auto right-0 left-0 text-white rounded-md shadow-lg"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      >
        <h2 className="text-3xl font-semibold mb-6">
          {isSignInForm ? 'Sign In' : 'Sign Up'}
        </h2>
        <input
          type="text"
          placeholder="Email or phone number"
          className="w-full p-3 mb-4 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 transition-colors duration-300 font-semibold py-3 rounded"
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
          {isSignInForm
            ? "New to Netflix? "
            : 'Already have an account? '}
          <span
            className="text-white hover:underline cursor-pointer"
            onClick={toggleSighInForm}
          >
            {isSignInForm ? 'Sign up now.' : 'Sign in now.'}
          </span>
        </p>
      </form>

      <div>
        <Footer />
      </div>
    </div>
  )
}

export default Login
