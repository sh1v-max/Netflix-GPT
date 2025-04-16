import { signOut } from 'firebase/auth'
import React from 'react'
import { useState } from 'react'
import { auth } from '../utils/firebase'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()
  const handleSignOut = () => {
    // Logic to sign out the user
    signOut(auth).then(() => {
      // Sign-out successful.
      navigate('/')
    }).catch((error) => {
      // An error happened.
      navigate('/error')
      console.error('Sign out error:', error)
    });
    console.log('User signed out')
  }

  return (
    <header className="absolute top-0 left-0 w-full px-8 py-4 bg-gradient-to-b from-black z-30 flex items-center justify-between">
      {/* Logo */}
      <img
        className="w-44 object-contain"
        src="https://cdn.cookielaw.org/logos/dd6b162f-1a32-456a-9cfe-897231c7763c/4345ea78-053c-46d2-b11e-09adaef973dc/Netflix_Logo_PMS.png"
        alt="Netflix Logo"
      />

      {/* User Dropdown Container */}
      <div className="relative">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setShowMenu(!showMenu)}
        >
          <img
            className="w-10 h-10 rounded-md object-cover"
            src="https://wallpapers.com/images/high/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.webp"
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
    </header>
  )
}

export default Header
