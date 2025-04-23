import { onAuthStateChanged, signOut } from 'firebase/auth'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { auth } from '../utils/firebase'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addUser, removeUser } from '../utils/userSlice'
import { LOGO } from '../utils/constant'
import { toggleGptSearchView } from '../utils/gptSlice'

const Header = () => {
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((store) => store.user)
  // console.log(user)
  // console.log(user.photo)
  const handleSignOut = () => {
    // Logic to sign out the user
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        navigate('/')
      })
      .catch((error) => {
        // An error happened.
        navigate('/error')
        console.error('Sign out error:', error)
      })
    console.log('User signed out')
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        // see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        // const uid = user.uid;
        const { uid, email, displayName, photoURL } = user
        dispatch(
          addUser({
            uid: uid,
            email: email,
            name: displayName,
            photo: photoURL,
          })
        )
        // when user sign in, i'm navigating him to the browse page
        navigate('/browse')
      } else {
        // User is signed out
        dispatch(removeUser())
        // when user sign out, navigate him to main page
        navigate('/')
        // this will return an error, why? cause we are using navigate outside the routerProvider
      }
    })

    // this will unsubscribe the event listener when component unmounts
    return () => {
      unsubscribe()
    }
  }, [])

  const handleGptSearchClick = () => {
    //  toggle my gpt result
    dispatch(toggleGptSearchView())
    console.log('toggle called')
  }

  return (
    <header className="absolute top-0 left-0 w-full px-8 py-4 bg-gradient-to-b from-black z-30 flex items-center justify-between">
      {/* Logo */}
      <img className="w-44 object-contain" src={LOGO} alt="Netflix Logo" />

      {/* User Dropdown Container */}
      {user && (
        <div className="flex gap-4">
          <button
            className="bg-white text-black py-2 px-5 cursor-pointer rounded hover:bg-opacity-100"
            onClick={handleGptSearchClick}
          >
            StartGPT
          </button>
          <div className="relative">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
            >
              <img
                className="w-10 h-10 rounded-md object-cover"
                // src="https://wallpapers.com/images/high/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.webp"
                src={user.photo}
                alt="User Icon"
              />

              <svg
                className={`w-4 h-4 text-white transition-transform ${
                  showMenu ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
              <ul className="absolute top-12 right-0 w-40 bg-black bg-opacity-90 text-white shadow-lg rounded-md py-2 z-50">
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
                  Profile
                </li>
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
                  Settings
                </li>
                <li className="border-t border-gray-600 my-1"></li>
                <button
                  className="px-4 w-40 py-2 text-red-400 hover:bg-red-600 cursor-pointer hover:text-black"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </ul>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
